package ch.resona.frequenz.audio

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import ch.resona.frequenz.MainActivity
import ch.resona.frequenz.R

/**
 * Haelt die Wiedergabe am Leben, wenn die App im Hintergrund ist, und zeigt
 * eine Benachrichtigung mit Play/Pause und Stop.
 */
class PlaybackService : Service() {

    companion object {
        const val CHANNEL_ID = "resona_playback"
        private const val NOTIFICATION_ID = 4711

        private const val ACTION_TOGGLE = "ch.resona.frequenz.TOGGLE"
        private const val ACTION_STOP = "ch.resona.frequenz.STOP"
        private const val ACTION_REFRESH = "ch.resona.frequenz.REFRESH"

        fun start(context: Context) {
            val intent = Intent(context, PlaybackService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun refresh(context: Context?) {
            context ?: return
            if (PlaybackController.state.value.session == null) return
            val intent = Intent(context, PlaybackService::class.java).setAction(ACTION_REFRESH)
            runCatching {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(intent)
                } else {
                    context.startService(intent)
                }
            }
        }

        fun stop(context: Context?) {
            context ?: return
            context.stopService(Intent(context, PlaybackService::class.java))
        }

        fun createChannel(context: Context) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
            val manager = context.getSystemService(NotificationManager::class.java)
            if (manager.getNotificationChannel(CHANNEL_ID) != null) return
            val channel = NotificationChannel(
                CHANNEL_ID,
                context.getString(R.string.channel_playback),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = context.getString(R.string.channel_playback_description)
                setShowBadge(false)
                setSound(null, null)
                enableVibration(false)
            }
            manager.createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createChannel(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_TOGGLE -> PlaybackController.toggle()
            ACTION_STOP -> {
                PlaybackController.stop()
                return START_NOT_STICKY
            }
        }

        val notification = buildNotification()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ServiceCompat.startForeground(
                this,
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
        return START_NOT_STICKY
    }

    override fun onDestroy() {
        ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
        super.onDestroy()
    }

    override fun onTaskRemoved(rootIntent: Intent?) {
        // Klang laeuft weiter, wenn die App aus den letzten Apps gewischt wird –
        // gestoppt wird nur ueber die Benachrichtigung.
        super.onTaskRemoved(rootIntent)
    }

    private fun buildNotification(): Notification {
        val state = PlaybackController.state.value
        val session = state.session

        val contentIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val toggleIntent = PendingIntent.getService(
            this,
            1,
            Intent(this, PlaybackService::class.java).setAction(ACTION_TOGGLE),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val stopIntent = PendingIntent.getService(
            this,
            2,
            Intent(this, PlaybackService::class.java).setAction(ACTION_STOP),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val remaining = state.remainingSeconds
        val subtitle = buildString {
            append(session?.badge ?: "")
            if (remaining != null) {
                if (isNotEmpty()) append(" · ")
                append(getString(R.string.notification_remaining, remaining / 60, remaining % 60))
            }
        }

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_wave)
            .setContentTitle(session?.title ?: getString(R.string.app_name))
            .setContentText(subtitle.ifBlank { getString(R.string.notification_idle) })
            .setContentIntent(contentIntent)
            .setOngoing(state.isPlaying)
            .setSilent(true)
            .setShowWhen(false)
            .setCategory(NotificationCompat.CATEGORY_TRANSPORT)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .addAction(
                if (state.isPlaying) R.drawable.ic_pause else R.drawable.ic_play,
                getString(if (state.isPlaying) R.string.action_pause else R.string.action_play),
                toggleIntent
            )
            .addAction(R.drawable.ic_stop, getString(R.string.action_stop), stopIntent)
            .build()
    }
}
