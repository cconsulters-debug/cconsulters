package ch.resona.frequenz.audio

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.os.Build
import ch.resona.frequenz.data.Catalog
import ch.resona.frequenz.data.SoundSession
import ch.resona.frequenz.data.UserStore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class PlayerState(
    val session: SoundSession? = null,
    val isPlaying: Boolean = false,
    val elapsedSeconds: Int = 0,
    /** 0 = kein Timer. */
    val timerMinutes: Int = 0,
    val volume: Float = 0.7f,
    val extraNoise: Float = 0f
) {
    val remainingSeconds: Int?
        get() = if (timerMinutes <= 0) null else (timerMinutes * 60 - elapsedSeconds).coerceAtLeast(0)
}

/**
 * Zentrale Steuerung der Wiedergabe. Bewusst ein Singleton: UI, Benachrichtigung und
 * Vordergrunddienst greifen auf denselben Zustand zu, ohne Binder-Gebastel.
 */
object PlaybackController {

    private val engine = ToneEngine()
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    private val _state = MutableStateFlow(PlayerState())
    val state: StateFlow<PlayerState> = _state.asStateFlow()

    private var appContext: Context? = null
    private var userStore: UserStore? = null
    private var ticker: Job? = null

    private var audioManager: AudioManager? = null
    private var focusRequest: AudioFocusRequest? = null
    private var pausedByFocusLoss = false

    private var noisyReceiverRegistered = false
    private val noisyReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == AudioManager.ACTION_AUDIO_BECOMING_NOISY) {
                pause()
            }
        }
    }

    private val focusListener = AudioManager.OnAudioFocusChangeListener { change ->
        when (change) {
            AudioManager.AUDIOFOCUS_LOSS -> stop()
            AudioManager.AUDIOFOCUS_LOSS_TRANSIENT -> {
                if (_state.value.isPlaying) {
                    pausedByFocusLoss = true
                    pause()
                }
            }
            AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK ->
                engine.setVolume(_state.value.volume * 0.25f)
            AudioManager.AUDIOFOCUS_GAIN -> {
                engine.setVolume(_state.value.volume)
                if (pausedByFocusLoss) {
                    pausedByFocusLoss = false
                    resume()
                }
            }
        }
    }

    /** Einmalig aus der Application-Klasse aufrufen. */
    fun attach(context: Context, store: UserStore, defaultTimerMinutes: Int) {
        appContext = context.applicationContext
        userStore = store
        audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        _state.value = _state.value.copy(timerMinutes = defaultTimerMinutes)
    }

    fun play(session: SoundSession) {
        val context = appContext ?: return
        if (!requestFocus()) return

        val state = _state.value
        _state.value = state.copy(session = session, isPlaying = true, elapsedSeconds = 0)

        engine.setVolume(state.volume)
        engine.start(recipeFor(session, state.extraNoise), fadeInSeconds = 3.0)

        registerNoisyReceiver(context)
        PlaybackService.start(context)
        startTicker()

        scope.launch { userStore?.markSessionStarted(session.id) }
    }

    fun toggle() {
        if (_state.value.isPlaying) pause() else resume()
    }

    fun pause() {
        if (_state.value.session == null || !_state.value.isPlaying) return
        engine.setPaused(true)
        _state.value = _state.value.copy(isPlaying = false)
        ticker?.cancel()
        ticker = null
        PlaybackService.refresh(appContext)
    }

    fun resume() {
        val session = _state.value.session ?: return
        if (_state.value.isPlaying) return
        if (!requestFocus()) return

        if (!engine.isRunning) {
            engine.setVolume(_state.value.volume)
            engine.start(recipeFor(session, _state.value.extraNoise), fadeInSeconds = 1.0)
        } else {
            engine.setPaused(false)
        }
        _state.value = _state.value.copy(isPlaying = true)
        appContext?.let {
            registerNoisyReceiver(it)
            PlaybackService.start(it)
        }
        startTicker()
    }

    fun stop() {
        val hadSession = _state.value.session != null
        engine.stop()
        ticker?.cancel()
        ticker = null
        commitListenedTime()
        abandonFocus()
        unregisterNoisyReceiver()
        _state.value = _state.value.copy(session = null, isPlaying = false, elapsedSeconds = 0)
        if (hadSession) PlaybackService.stop(appContext)
    }

    fun setVolume(volume: Float) {
        val clamped = volume.coerceIn(0f, 1f)
        _state.value = _state.value.copy(volume = clamped)
        engine.setVolume(clamped)
    }

    fun setExtraNoise(level: Float) {
        val clamped = level.coerceIn(0f, 1f)
        _state.value = _state.value.copy(extraNoise = clamped)
        _state.value.session?.let { engine.updateRecipe(recipeFor(it, clamped)) }
    }

    fun setTimer(minutes: Int) {
        _state.value = _state.value.copy(timerMinutes = minutes)
        PlaybackService.refresh(appContext)
    }

    fun playById(id: String) {
        Catalog.byId[id]?.let { play(it) }
    }

    private fun recipeFor(session: SoundSession, extraNoise: Float): SoundRecipe {
        val base = session.recipe
        return base.copy(noiseLevel = (base.noiseLevel + extraNoise).coerceIn(0f, 1f))
    }

    private fun startTicker() {
        ticker?.cancel()
        ticker = scope.launch {
            while (true) {
                delay(1000)
                val current = _state.value
                if (!current.isPlaying) break
                val elapsed = current.elapsedSeconds + 1
                _state.value = current.copy(elapsedSeconds = elapsed)

                if (elapsed % 30 == 0) {
                    userStore?.addListenedSeconds(30)
                    lastCommittedSeconds = elapsed
                }
                if (current.timerMinutes > 0 && elapsed >= current.timerMinutes * 60) {
                    stop()
                    break
                }
                if (elapsed % 5 == 0) PlaybackService.refresh(appContext)
            }
        }
    }

    private var lastCommittedSeconds = 0

    private fun commitListenedTime() {
        val elapsed = _state.value.elapsedSeconds
        val pending = (elapsed - lastCommittedSeconds).toLong()
        lastCommittedSeconds = 0
        if (pending > 0) {
            scope.launch { userStore?.addListenedSeconds(pending) }
        }
    }

    private fun requestFocus(): Boolean {
        val manager = audioManager ?: return true
        val attributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_MEDIA)
            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
            .build()

        val result = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val request = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                .setAudioAttributes(attributes)
                .setWillPauseWhenDucked(false)
                .setOnAudioFocusChangeListener(focusListener)
                .build()
            focusRequest = request
            manager.requestAudioFocus(request)
        } else {
            @Suppress("DEPRECATION")
            manager.requestAudioFocus(
                focusListener,
                AudioManager.STREAM_MUSIC,
                AudioManager.AUDIOFOCUS_GAIN
            )
        }
        return result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED
    }

    private fun abandonFocus() {
        val manager = audioManager ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            focusRequest?.let { manager.abandonAudioFocusRequest(it) }
            focusRequest = null
        } else {
            @Suppress("DEPRECATION")
            manager.abandonAudioFocus(focusListener)
        }
    }

    private fun registerNoisyReceiver(context: Context) {
        if (noisyReceiverRegistered) return
        context.registerReceiver(
            noisyReceiver,
            IntentFilter(AudioManager.ACTION_AUDIO_BECOMING_NOISY)
        )
        noisyReceiverRegistered = true
    }

    private fun unregisterNoisyReceiver() {
        if (!noisyReceiverRegistered) return
        runCatching { appContext?.unregisterReceiver(noisyReceiver) }
        noisyReceiverRegistered = false
    }
}
