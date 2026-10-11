package ch.resona.frequenz

import android.app.Application
import ch.resona.frequenz.audio.PlaybackController
import ch.resona.frequenz.audio.PlaybackService
import ch.resona.frequenz.data.UserStore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class ResonaApp : Application() {

    lateinit var userStore: UserStore
        private set

    override fun onCreate() {
        super.onCreate()
        userStore = UserStore(this)
        PlaybackService.createChannel(this)

        CoroutineScope(SupervisorJob() + Dispatchers.Main).launch {
            val saved = userStore.state.first()
            PlaybackController.attach(this@ResonaApp, userStore, saved.defaultTimerMinutes)
        }
    }
}
