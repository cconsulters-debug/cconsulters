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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.item
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import ch.resona.frequenz.data.Catalog
import ch.resona.frequenz.data.Category
import ch.resona.frequenz.data.SoundSession
import ch.resona.frequenz.data.UserState
import ch.resona.frequenz.ui.components.SessionRow

@Composable
fun LibraryScreen(
    user: UserState,
    onPlay: (SoundSession) -> Unit,
    onToggleFavorite: (String) -> Unit,
    contentPadding: PaddingValues
) {
    var filter by remember { mutableStateOf<Category?>(null) }
    var onlyFavorites by remember { mutableStateOf(false) }

    val sessions = Catalog.all
        .filter { filter == null || it.category == filter }
        .filter { !onlyFavorites || it.id in user.favorites }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = contentPadding
    ) {
        item {
            Text(
                text = "Bibliothek",
                style = MaterialTheme.typography.displaySmall,
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.padding(start = 20.dp, end = 20.dp, top = 20.dp, bottom = 4.dp)
            )
        }
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterPill(
                    label = "Alle",
                    selected = filter == null && !onlyFavorites,
                    onClick = { filter = null; onlyFavorites = false }
                )
                Category.entries.forEach { category ->
                    FilterPill(
                        label = category.label,
                        selected = filter == category,
                        onClick = {
                            filter = if (filter == category) null else category
                            onlyFavorites = false
                        }
                    )
                }
            }
        }
        item {
            Row(
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 2.dp)
            ) {
                FilterPill(
                    label = "★ Favoriten",
                    selected = onlyFavorites,
                    onClick = { onlyFavorites = !onlyFavorites; if (onlyFavorites) filter = null }
                )
            }
        }
        item { Spacer(Modifier.height(8.dp)) }

        if (sessions.isEmpty()) {
            item {
                Text(
                    text = "Hier ist noch nichts. Markiere Klaenge im Player als Favorit.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 24.dp)
                )
            }
        }

        items(sessions, key = { it.id }) { session ->
            SessionRow(
                session = session,
                onClick = { onPlay(session) },
                trailing = {
                    val isFavorite = session.id in user.favorites
                    Icon(
                        imageVector = if (isFavorite) {
                            Icons.Filled.Favorite
                        } else {
                            Icons.Filled.FavoriteBorder
                        },
                        contentDescription = "Favorit",
                        tint = if (isFavorite) {
                            MaterialTheme.colorScheme.primary
                        } else {
                            MaterialTheme.colorScheme.onSurfaceVariant
                        },
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .clickable { onToggleFavorite(session.id) }
                            .padding(8.dp)
                    )
                }
            )
        }

        item { Spacer(Modifier.height(24.dp)) }
    }
}

@Composable
fun FilterPill(label: String, selected: Boolean, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .clip(CircleShape)
            .background(
                if (selected) {
                    MaterialTheme.colorScheme.primary
                } else {
                    MaterialTheme.colorScheme.surfaceVariant
                }
            )
            .clickable { onClick() }
            .padding(horizontal = 14.dp, vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelLarge,
            color = if (selected) {
                MaterialTheme.colorScheme.onPrimary
            } else {
                MaterialTheme.colorScheme.onSurfaceVariant
            },
            maxLines = 1
        )
    }
}
