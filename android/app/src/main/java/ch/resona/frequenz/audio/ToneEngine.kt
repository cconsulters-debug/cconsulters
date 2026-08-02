package ch.resona.frequenz.audio

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack

/**
 * Spielt einen [SoundRecipe] ueber [AudioTrack] ab. Die Klangerzeugung selbst
 * steckt in [ToneSynth]; diese Klasse kuemmert sich nur um Thread und Ausgabe.
 */
class ToneEngine {

    private companion object {
        const val SAMPLE_RATE = 44_100
        const val FRAMES_PER_BUFFER = 1024
    }

    @Volatile
    private var recipe: SoundRecipe = SoundRecipe(200.0, 200.0)

    @Volatile
    private var masterVolume: Float = 0.7f

    @Volatile
    private var fadeInSeconds: Double = 3.0

    @Volatile
    private var stopRequested = false

    @Volatile
    private var paused = false

    @Volatile
    var isRunning: Boolean = false
        private set

    private var renderThread: Thread? = null

    fun start(recipe: SoundRecipe, fadeInSeconds: Double = 3.0, onStopped: (() -> Unit)? = null) {
        stop(immediate = true)
        this.recipe = recipe
        this.fadeInSeconds = fadeInSeconds
        this.stopRequested = false
        this.paused = false
        this.isRunning = true

        val thread = Thread({ renderLoop(onStopped) }, "ResonaToneEngine")
        thread.priority = Thread.MAX_PRIORITY
        renderThread = thread
        thread.start()
    }

    fun updateRecipe(recipe: SoundRecipe) {
        this.recipe = recipe
    }

    fun setVolume(volume: Float) {
        masterVolume = volume.coerceIn(0f, 1f)
    }

    fun setPaused(paused: Boolean) {
        this.paused = paused
    }

    /**
     * Beendet die Wiedergabe. Ohne [immediate] wird sanft ausgeblendet, der Thread
     * laeuft dafuer noch gut eine Sekunde weiter.
     */
    fun stop(immediate: Boolean = false) {
        val thread = renderThread ?: return
        stopRequested = true
        if (immediate) {
            thread.interrupt()
            runCatching { thread.join(800) }
            renderThread = null
            isRunning = false
        }
    }

    private fun renderLoop(onStopped: (() -> Unit)?) {
        val minBytes = AudioTrack.getMinBufferSize(
            SAMPLE_RATE,
            AudioFormat.CHANNEL_OUT_STEREO,
            AudioFormat.ENCODING_PCM_FLOAT
        )
        val bufferBytes = maxOf(minBytes, FRAMES_PER_BUFFER * 2 * 4 * 4)

        val track = AudioTrack.Builder()
            .setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build()
            )
            .setAudioFormat(
                AudioFormat.Builder()
                    .setEncoding(AudioFormat.ENCODING_PCM_FLOAT)
                    .setSampleRate(SAMPLE_RATE)
                    .setChannelMask(AudioFormat.CHANNEL_OUT_STEREO)
                    .build()
            )
            .setBufferSizeInBytes(bufferBytes)
            .setTransferMode(AudioTrack.MODE_STREAM)
            .build()

        val synth = ToneSynth(SAMPLE_RATE)
        synth.riseSeconds = fadeInSeconds
        val buffer = FloatArray(FRAMES_PER_BUFFER * 2)

        track.play()

        try {
            while (true) {
                synth.targetGain = when {
                    stopRequested -> 0.0
                    paused -> 0.0
                    else -> masterVolume.toDouble()
                }

                synth.render(buffer, FRAMES_PER_BUFFER, recipe)

                val written = track.write(buffer, 0, buffer.size, AudioTrack.WRITE_BLOCKING)
                if (written < 0) break

                // Nach dem ersten Einblenden darf schneller nachgeregelt werden.
                if (synth.currentGain >= synth.targetGain && synth.targetGain > 0.0) {
                    synth.riseSeconds = 0.4
                }

                if (stopRequested && synth.currentGain <= 0.0) break
                if (Thread.currentThread().isInterrupted) break
            }
        } catch (_: InterruptedException) {
            Thread.currentThread().interrupt()
        } finally {
            runCatching {
                track.pause()
                track.flush()
                track.stop()
            }
            track.release()
            isRunning = false
            renderThread = null
            onStopped?.invoke()
        }
    }
}
