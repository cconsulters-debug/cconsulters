package ch.resona.frequenz.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import ch.resona.frequenz.ResonaApp
import ch.resona.frequenz.audio.PlaybackController
import ch.resona.frequenz.data.SoundSession
import ch.resona.frequenz.data.UserStore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

/** Buendelt Benutzerdaten und Wiedergabe-Aktionen fuer die Compose-Ebene. */
class AppActions(
    private val store: UserStore,
    private val scope: CoroutineScope
) {
    fun play(session: SoundSession) = PlaybackController.play(session)
    fun toggle() = PlaybackController.toggle()
    fun stop() = PlaybackController.stop()
    fun setVolume(value: Float) = PlaybackController.setVolume(value)
    fun setExtraNoise(value: Float) = PlaybackController.setExtraNoise(value)

    fun setTimer(minutes: Int) {
        PlaybackController.setTimer(minutes)
        scope.launch { store.setDefaultTimer(minutes) }
    }

    fun toggleFavorite(id: String) {
        scope.launch { store.toggleFavorite(id) }
    }

    fun acceptDisclaimer() {
        scope.launch { store.acceptDisclaimer() }
    }

    fun resetStats() {
        scope.launch { store.resetStats() }
    }
}

@Composable
fun rememberUserStore(): UserStore {
    val context = LocalContext.current
    return remember(context) {
        (context.applicationContext as ResonaApp).userStore
    }
}

fun formatDuration(totalSeconds: Int): String {
    val minutes = totalSeconds / 60
    val seconds = totalSeconds % 60
    return "%d:%02d".format(minutes, seconds)
}

fun formatMinutes(totalMinutes: Int): String = when {
    totalMinutes < 60 -> "$totalMinutes Min"
    else -> {
        val hours = totalMinutes / 60
        val rest = totalMinutes % 60
        if (rest == 0) "$hours Std" else "$hours Std $rest Min"
    }
}
