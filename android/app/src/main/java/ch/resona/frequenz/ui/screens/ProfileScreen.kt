package ch.resona.frequenz.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.item
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import ch.resona.frequenz.data.UserState
import ch.resona.frequenz.ui.components.SectionHeader
import ch.resona.frequenz.ui.components.StatTile
import ch.resona.frequenz.ui.formatMinutes

private val TIMER_OPTIONS = listOf(0, 10, 20, 30, 45, 60, 90)

@Composable
fun ProfileScreen(
    user: UserState,
    onTimer: (Int) -> Unit,
    onResetStats: () -> Unit,
    contentPadding: PaddingValues
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = contentPadding
    ) {
        item {
            Text(
                text = "Dein Profil",
                style = MaterialTheme.typography.displaySmall,
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.padding(start = 20.dp, end = 20.dp, top = 20.dp, bottom = 12.dp)
            )
        }

        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                StatTile(
                    value = formatMinutes(user.totalMinutes),
                    label = "gehoert",
                    modifier = Modifier.weight(1f)
                )
                StatTile(
                    value = user.sessionCount.toString(),
                    label = "Sitzungen",
                    modifier = Modifier.weight(1f)
                )
                StatTile(
                    value = user.streakDays.toString(),
                    label = "Tage in Folge",
                    modifier = Modifier.weight(1f)
                )
            }
        }

        item { SectionHeader(title = "Standard-Timer") }
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TIMER_OPTIONS.forEach { minutes ->
                    Column(modifier = Modifier.weight(1f)) {
                        FilterPill(
                            label = if (minutes == 0) "Aus" else "$minutes",
                            selected = user.defaultTimerMinutes == minutes,
                            onClick = { onTimer(minutes) }
                        )
                    }
                }
            }
        }

        item { SectionHeader(title = "Sicherheit und Grenzen") }
        item {
            InfoCard(
                title = "Kein Medizinprodukt",
                body = "Resona erzeugt Klaenge zur Entspannung. Die App stellt keine Diagnose, " +
                    "behandelt keine Krankheit und ersetzt keine aerztliche oder " +
                    "psychotherapeutische Hilfe. Wirkungen von Binaural Beats sind " +
                    "wissenschaftlich nur teilweise belegt und individuell sehr " +
                    "unterschiedlich."
            )
        }
        item {
            InfoCard(
                title = "Wann besser nicht",
                body = "Bei Epilepsie oder Anfallsleiden, Tinnitus, Schwindel, " +
                    "Herzschrittmacher, Hoergeraet mit Implantat sowie bei Kindern bitte " +
                    "vorher fachlich abklaeren. Nicht beim Autofahren, Radfahren oder " +
                    "Bedienen von Maschinen verwenden."
            )
        }
        item {
            InfoCard(
                title = "Lautstaerke",
                body = "Dauertoene wirken leiser, als sie sind. Stelle die Lautstaerke so ein, " +
                    "dass du den Klang gerade eben angenehm hoerst – mehr braucht es nicht."
            )
        }

        item { SectionHeader(title = "Daten") }
        item {
            Column(
                modifier = Modifier
                    .padding(horizontal = 20.dp)
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(18.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .clickable { onResetStats() }
                    .padding(16.dp)
            ) {
                Text(
                    text = "Statistik zuruecksetzen",
                    style = MaterialTheme.typography.titleSmall,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "Alle Daten bleiben ohnehin nur auf diesem Geraet – die App " +
                        "sendet nichts ins Internet und braucht keine Anmeldung.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        item { Spacer(Modifier.height(28.dp)) }
        item {
            Text(
                text = "Resona 1.0 · alle Klaenge werden auf dem Geraet berechnet",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(horizontal = 20.dp)
            )
        }
        item { Spacer(Modifier.height(28.dp)) }
    }
}

@Composable
private fun InfoCard(title: String, body: String) {
    Column(
        modifier = Modifier
            .padding(horizontal = 20.dp, vertical = 5.dp)
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(MaterialTheme.colorScheme.surface)
            .padding(16.dp)
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleSmall,
            color = MaterialTheme.colorScheme.onBackground
        )
        Spacer(Modifier.height(6.dp))
        Text(
            text = body,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
