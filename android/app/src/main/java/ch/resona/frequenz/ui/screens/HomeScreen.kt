package ch.resona.frequenz.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.item
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.unit.dp
import ch.resona.frequenz.audio.PlayerState
import ch.resona.frequenz.data.Catalog
import ch.resona.frequenz.data.Mood
import ch.resona.frequenz.data.SoundSession
import ch.resona.frequenz.data.UserState
import ch.resona.frequenz.ui.components.MoodChip
import ch.resona.frequenz.ui.components.SectionHeader
import ch.resona.frequenz.ui.components.SessionCard
import ch.resona.frequenz.ui.components.SessionRow
import java.time.LocalTime

@Composable
fun HomeScreen(
    user: UserState,
    player: PlayerState,
    onPlay: (SoundSession) -> Unit,
    contentPadding: PaddingValues
) {
    var selectedMood by remember { mutableStateOf<Mood?>(null) }

    val moodSessions = selectedMood?.let { Catalog.forMood(it) } ?: Catalog.featured
    val recents = user.recentIds.mapNotNull { Catalog.byId[it] }.take(4)
    val favorites = user.favorites.mapNotNull { Catalog.byId[it] }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = contentPadding
    ) {
        item { Greeting(user) }

        item {
            Column(modifier = Modifier.padding(top = 8.dp)) {
                Text(
                    text = "Wie moechtest du entspannen?",
                    style = MaterialTheme.typography.headlineSmall,
                    color = MaterialTheme.colorScheme.onBackground,
                    modifier = Modifier.padding(horizontal = 20.dp)
                )
                Text(
                    text = "Waehle einen Klang nach dem, was du gerade brauchst",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 4.dp)
                )
            }
        }

        item {
            MoodGrid(
                selected = selectedMood,
                onSelect = { mood -> selectedMood = if (selectedMood == mood) null else mood }
            )
        }

        item {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(14.dp),
                modifier = Modifier.padding(top = 6.dp)
            ) {
                items(moodSessions, key = { it.id }) { session ->
                    SessionCard(
                        session = session,
                        playing = player.session?.id == session.id && player.isPlaying,
                        onClick = { onPlay(session) },
                        modifier = Modifier
                            .width(200.dp)
                            .height(260.dp)
                    )
                }
            }
        }

        if (recents.isNotEmpty()) {
            item { SectionHeader(title = "Weiter hoeren") }
            items(recents, key = { "recent-${it.id}" }) { session ->
                SessionRow(session = session, onClick = { onPlay(session) })
            }
        }

        item { SectionHeader(title = "Fuer den Abend") }
        item {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                items(
                    Catalog.forMood(Mood.SLEEP) + Catalog.forMood(Mood.DEEP_CALM)
                        .filter { Mood.SLEEP !in it.moods },
                    key = { "evening-${it.id}" }
                ) { session ->
                    SessionCard(
                        session = session,
                        playing = player.session?.id == session.id && player.isPlaying,
                        onClick = { onPlay(session) },
                        modifier = Modifier
                            .width(160.dp)
                            .height(200.dp)
                    )
                }
            }
        }

        if (favorites.isNotEmpty()) {
            item { SectionHeader(title = "Deine Favoriten") }
            items(favorites, key = { "fav-${it.id}" }) { session ->
                SessionRow(session = session, onClick = { onPlay(session) })
            }
        }

        item { Spacer(Modifier.height(12.dp)) }
        item { DisclaimerCard() }
        item { Spacer(Modifier.height(24.dp)) }
    }
}

@Composable
private fun Greeting(user: UserState) {
    val hour = remember { LocalTime.now().hour }
    val greeting = when (hour) {
        in 5..10 -> "Guten Morgen"
        in 11..17 -> "Hallo"
        in 18..22 -> "Guten Abend"
        else -> "Gute Nacht"
    }
    Column(modifier = Modifier.padding(start = 20.dp, end = 20.dp, top = 20.dp)) {
        Text(
            text = greeting,
            style = MaterialTheme.typography.displaySmall,
            color = MaterialTheme.colorScheme.onBackground
        )
        val subtitle = if (user.streakDays > 1) {
            "${user.streakDays} Tage in Folge · ${user.totalMinutes} Minuten gesamt"
        } else {
            "Nimm dir einen Moment fuer dich"
        }
        Text(
            text = subtitle,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun MoodGrid(selected: Mood?, onSelect: (Mood) -> Unit) {
    val moods = Mood.entries
    Column(
        modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        moods.chunked(2).forEach { pair ->
            Row(
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                pair.forEach { mood ->
                    MoodChip(
                        mood = mood,
                        selected = selected == mood,
                        onClick = { onSelect(mood) },
                        modifier = Modifier.weight(1f)
                    )
                }
                if (pair.size == 1) Spacer(Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun DisclaimerCard() {
    Box(
        modifier = Modifier
            .padding(horizontal = 20.dp)
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(
                Brush.horizontalGradient(
                    listOf(
                        MaterialTheme.colorScheme.surfaceVariant,
                        MaterialTheme.colorScheme.surface
                    )
                )
            )
            .padding(16.dp)
    ) {
        Column {
            Text(
                text = "Gut zu wissen",
                style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.onBackground
            )
            Spacer(Modifier.height(6.dp))
            Text(
                text = "Klang und Frequenzen koennen beim Entspannen helfen. Sie sind kein " +
                    "Ersatz fuer medizinische oder psychotherapeutische Behandlung. Bei " +
                    "Epilepsie, Tinnitus, Herzschrittmacher oder anhaltenden Beschwerden " +
                    "bitte vorher aerztlich abklaeren. Nicht beim Autofahren verwenden.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
