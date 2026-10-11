package ch.resona.frequenz.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val Ink = Color(0xFF07070C)
val InkElevated = Color(0xFF121219)
val InkCard = Color(0xFF1A1A24)
val Mist = Color(0xFFEDEAF6)
val MistDim = Color(0xFF9C99AE)
val Accent = Color(0xFFB9A6FF)
val AccentSoft = Color(0xFF6E5DD3)

private val DarkScheme = darkColorScheme(
    primary = Accent,
    onPrimary = Ink,
    primaryContainer = AccentSoft,
    onPrimaryContainer = Mist,
    secondary = Color(0xFF7FE0D0),
    onSecondary = Ink,
    background = Ink,
    onBackground = Mist,
    surface = InkElevated,
    onSurface = Mist,
    surfaceVariant = InkCard,
    onSurfaceVariant = MistDim,
    outline = Color(0xFF3A3A48),
    error = Color(0xFFFF8A80)
)

private val LightScheme = lightColorScheme(
    primary = AccentSoft,
    onPrimary = Color.White,
    background = Color(0xFFF7F5FB),
    onBackground = Color(0xFF16151C),
    surface = Color.White,
    onSurface = Color(0xFF16151C),
    surfaceVariant = Color(0xFFEDEAF6),
    onSurfaceVariant = Color(0xFF5A5768)
)

private val ResonaTypography = Typography(
    displaySmall = TextStyle(fontSize = 34.sp, lineHeight = 40.sp, fontWeight = FontWeight.Light),
    headlineMedium = TextStyle(fontSize = 26.sp, lineHeight = 32.sp, fontWeight = FontWeight.Normal),
    headlineSmall = TextStyle(fontSize = 22.sp, lineHeight = 28.sp, fontWeight = FontWeight.Medium),
    titleMedium = TextStyle(fontSize = 17.sp, lineHeight = 23.sp, fontWeight = FontWeight.SemiBold),
    titleSmall = TextStyle(fontSize = 15.sp, lineHeight = 20.sp, fontWeight = FontWeight.Medium),
    bodyLarge = TextStyle(fontSize = 16.sp, lineHeight = 24.sp),
    bodyMedium = TextStyle(fontSize = 14.sp, lineHeight = 21.sp),
    labelLarge = TextStyle(fontSize = 14.sp, fontWeight = FontWeight.Medium),
    labelSmall = TextStyle(fontSize = 11.sp, fontWeight = FontWeight.Medium)
)

@Composable
fun ResonaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkScheme else LightScheme,
        typography = ResonaTypography,
        content = content
    )
}
