package ch.resona.frequenz.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.time.LocalDate

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "resona_user")

data class UserState(
    val totalSeconds: Long = 0,
    val sessionCount: Int = 0,
    val streakDays: Int = 0,
    val lastListenEpochDay: Long = 0,
    val favorites: Set<String> = emptySet(),
    val recentIds: List<String> = emptyList(),
    val defaultTimerMinutes: Int = 0,
    val disclaimerAccepted: Boolean = false
) {
    val totalMinutes: Int get() = (totalSeconds / 60).toInt()
}

/** Kleiner Key-Value-Speicher fuer Statistik, Favoriten und Einstellungen. */
class UserStore(private val context: Context) {

    private object Keys {
        val TOTAL_SECONDS = longPreferencesKey("total_seconds")
        val SESSION_COUNT = intPreferencesKey("session_count")
        val STREAK = intPreferencesKey("streak_days")
        val LAST_DAY = longPreferencesKey("last_epoch_day")
        val FAVORITES = stringPreferencesKey("favorites")
        val RECENT = stringPreferencesKey("recent")
        val TIMER = intPreferencesKey("default_timer")
        val DISCLAIMER = booleanPreferencesKey("disclaimer_accepted")
    }

    val state: Flow<UserState> = context.dataStore.data.map { prefs ->
        UserState(
            totalSeconds = prefs[Keys.TOTAL_SECONDS] ?: 0L,
            sessionCount = prefs[Keys.SESSION_COUNT] ?: 0,
            streakDays = prefs[Keys.STREAK] ?: 0,
            lastListenEpochDay = prefs[Keys.LAST_DAY] ?: 0L,
            favorites = prefs[Keys.FAVORITES].orEmpty()
                .split(',')
                .filter { it.isNotBlank() }
                .toSet(),
            recentIds = prefs[Keys.RECENT].orEmpty()
                .split(',')
                .filter { it.isNotBlank() },
            defaultTimerMinutes = prefs[Keys.TIMER] ?: 0,
            disclaimerAccepted = prefs[Keys.DISCLAIMER] ?: false
        )
    }

    suspend fun addListenedSeconds(seconds: Long) {
        if (seconds <= 0) return
        val today = LocalDate.now().toEpochDay()
        context.dataStore.edit { prefs ->
            prefs[Keys.TOTAL_SECONDS] = (prefs[Keys.TOTAL_SECONDS] ?: 0L) + seconds
            val lastDay = prefs[Keys.LAST_DAY] ?: 0L
            val streak = prefs[Keys.STREAK] ?: 0
            prefs[Keys.STREAK] = when (lastDay) {
                today -> maxOf(streak, 1)
                today - 1 -> streak + 1
                else -> 1
            }
            prefs[Keys.LAST_DAY] = today
        }
    }

    suspend fun markSessionStarted(id: String) {
        context.dataStore.edit { prefs ->
            prefs[Keys.SESSION_COUNT] = (prefs[Keys.SESSION_COUNT] ?: 0) + 1
            val recent = prefs[Keys.RECENT].orEmpty().split(',').filter { it.isNotBlank() }
            prefs[Keys.RECENT] = (listOf(id) + recent.filter { it != id }).take(8).joinToString(",")
        }
    }

    suspend fun toggleFavorite(id: String) {
        context.dataStore.edit { prefs ->
            val current = prefs[Keys.FAVORITES].orEmpty()
                .split(',')
                .filter { it.isNotBlank() }
                .toMutableSet()
            if (!current.remove(id)) current.add(id)
            prefs[Keys.FAVORITES] = current.joinToString(",")
        }
    }

    suspend fun setDefaultTimer(minutes: Int) {
        context.dataStore.edit { prefs -> prefs[Keys.TIMER] = minutes }
    }

    suspend fun acceptDisclaimer() {
        context.dataStore.edit { prefs -> prefs[Keys.DISCLAIMER] = true }
    }

    suspend fun resetStats() {
        context.dataStore.edit { prefs ->
            prefs[Keys.TOTAL_SECONDS] = 0L
            prefs[Keys.SESSION_COUNT] = 0
            prefs[Keys.STREAK] = 0
            prefs[Keys.LAST_DAY] = 0L
            prefs[Keys.RECENT] = ""
        }
    }
}
