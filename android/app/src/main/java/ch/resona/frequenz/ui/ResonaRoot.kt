package ch.resona.frequenz.ui

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LibraryMusic
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import ch.resona.frequenz.audio.PlaybackController
import ch.resona.frequenz.data.UserState
import ch.resona.frequenz.ui.components.MiniPlayer
import ch.resona.frequenz.ui.screens.HomeScreen
import ch.resona.frequenz.ui.screens.LibraryScreen
import ch.resona.frequenz.ui.screens.PlayerScreen
import ch.resona.frequenz.ui.screens.ProfileScreen
import ch.resona.frequenz.ui.screens.SearchScreen

private enum class Tab(val label: String, val icon: ImageVector) {
    HOME("Start", Icons.Filled.Home),
    SEARCH("Suche", Icons.Filled.Search),
    LIBRARY("Bibliothek", Icons.Filled.LibraryMusic),
    PROFILE("Profil", Icons.Filled.Person)
}

@Composable
fun ResonaRoot() {
    val store = rememberUserStore()
    val scope = rememberCoroutineScope()
    val actions = remember(store, scope) { AppActions(store, scope) }

    val user by store.state.collectAsStateWithLifecycle(initialValue = UserState())
    val player by PlaybackController.state.collectAsStateWithLifecycle()

    var tab by remember { mutableStateOf(Tab.HOME) }
    var playerOpen by remember { mutableStateOf(false) }

    val session = player.session
    LaunchedEffect(session) {
        if (session == null) playerOpen = false
    }

    Surface(color = MaterialTheme.colorScheme.background) {
        Scaffold(
            containerColor = MaterialTheme.colorScheme.background,
            bottomBar = {
                Column {
                    if (session != null && !playerOpen) {
                        MiniPlayer(
                            session = session,
                            isPlaying = player.isPlaying,
                            elapsedLabel = player.remainingSeconds
                                ?.let { "noch ${formatDuration(it)}" }
                                ?: formatDuration(player.elapsedSeconds),
                            onToggle = { actions.toggle() },
                            onOpen = { playerOpen = true },
                            modifier = Modifier.padding(bottom = 6.dp)
                        )
                    }
                    NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                        Tab.entries.forEach { entry ->
                            NavigationBarItem(
                                selected = tab == entry,
                                onClick = { tab = entry },
                                icon = { Icon(entry.icon, contentDescription = entry.label) },
                                label = { Text(entry.label) },
                                alwaysShowLabel = true
                            )
                        }
                    }
                }
            }
        ) { padding ->
            Box(modifier = Modifier.fillMaxSize()) {
                val contentPadding = PaddingValues(
                    top = padding.calculateTopPadding(),
                    bottom = padding.calculateBottomPadding()
                )

                when (tab) {
                    Tab.HOME -> HomeScreen(
                        user = user,
                        player = player,
                        onPlay = { selected ->
                            actions.play(selected)
                            playerOpen = true
                        },
                        contentPadding = contentPadding
                    )

                    Tab.SEARCH -> SearchScreen(
                        onPlay = { selected ->
                            actions.play(selected)
                            playerOpen = true
                        },
                        contentPadding = contentPadding
                    )

                    Tab.LIBRARY -> LibraryScreen(
                        user = user,
                        onPlay = { selected ->
                            actions.play(selected)
                            playerOpen = true
                        },
                        onToggleFavorite = { actions.toggleFavorite(it) },
                        contentPadding = contentPadding
                    )

                    Tab.PROFILE -> ProfileScreen(
                        user = user,
                        onTimer = { actions.setTimer(it) },
                        onResetStats = { actions.resetStats() },
                        contentPadding = contentPadding
                    )
                }
            }
        }

        AnimatedVisibility(
            visible = playerOpen && session != null,
            enter = slideInVertically(initialOffsetY = { it }) + fadeIn(),
            exit = slideOutVertically(targetOffsetY = { it }) + fadeOut()
        ) {
            val current = session
            if (current != null) {
                BackHandler(enabled = true) { playerOpen = false }
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    PlayerScreen(
                        session = current,
                        player = player,
                        isFavorite = current.id in user.favorites,
                        onToggle = { actions.toggle() },
                        onStop = {
                            actions.stop()
                            playerOpen = false
                        },
                        onClose = { playerOpen = false },
                        onVolume = { actions.setVolume(it) },
                        onNoise = { actions.setExtraNoise(it) },
                        onTimer = { actions.setTimer(it) },
                        onFavorite = { actions.toggleFavorite(current.id) }
                    )
                }
            }
        }
    }
}
