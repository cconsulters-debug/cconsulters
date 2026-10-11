package ch.resona.frequenz.ui.screens

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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import ch.resona.frequenz.data.Catalog
import ch.resona.frequenz.data.Mood
import ch.resona.frequenz.data.SoundSession
import ch.resona.frequenz.ui.components.SectionHeader
import ch.resona.frequenz.ui.components.SessionRow

@Composable
fun SearchScreen(
    onPlay: (SoundSession) -> Unit,
    contentPadding: PaddingValues
) {
    var query by remember { mutableStateOf("") }
    var mood by remember { mutableStateOf<Mood?>(null) }

    val results = when {
        query.isNotBlank() -> Catalog.search(query)
        mood != null -> Catalog.forMood(mood!!)
        else -> emptyList()
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = contentPadding
    ) {
        item {
            Text(
                text = "Suche",
                style = MaterialTheme.typography.displaySmall,
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.padding(start = 20.dp, end = 20.dp, top = 20.dp)
            )
        }
        item {
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                singleLine = true,
                shape = RoundedCornerShape(16.dp),
                placeholder = { Text("Frequenz, Stimmung oder Titel") },
                leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null) },
                trailingIcon = {
                    if (query.isNotEmpty()) {
                        IconButton(onClick = { query = "" }) {
                            Icon(Icons.Filled.Close, contentDescription = "Leeren")
                        }
                    }
                },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp)
            )
        }

        if (query.isBlank()) {
            item { SectionHeader(title = "Nach Stimmung") }
            item {
                Column(
                    modifier = Modifier.padding(horizontal = 20.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Mood.entries.chunked(2).forEach { pair ->
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            pair.forEach { entry ->
                                Column(modifier = Modifier.weight(1f)) {
                                    FilterPill(
                                        label = "${entry.emoji} ${entry.label}",
                                        selected = mood == entry,
                                        onClick = { mood = if (mood == entry) null else entry }
                                    )
                                }
                            }
                            if (pair.size == 1) Spacer(Modifier.weight(1f))
                        }
                    }
                }
            }
        }

        if (results.isNotEmpty()) {
            item { SectionHeader(title = "${results.size} Klaenge") }
            items(results, key = { it.id }) { session ->
                SessionRow(session = session, onClick = { onPlay(session) })
            }
        } else if (query.isNotBlank()) {
            item {
                Text(
                    text = "Nichts gefunden. Versuche es mit \"Theta\", \"528\" oder \"Schlaf\".",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 24.dp)
                )
            }
        }

        item { Spacer(Modifier.height(24.dp)) }
    }
}
