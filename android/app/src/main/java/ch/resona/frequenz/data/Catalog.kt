package ch.resona.frequenz.data

import ch.resona.frequenz.audio.SoundRecipe

/** Stimmungs-Filter auf dem Startbildschirm ("Wie moechtest du entspannen?"). */
enum class Mood(val label: String, val emoji: String) {
    OVERTHINKING("Gedankenkarussell stoppen", "🌀"),
    DEEP_CALM("Tiefe Ruhe", "🌙"),
    ANXIETY("Angst loesen", "🩷"),
    GROUNDING("Erdung", "🌱"),
    BODY("Koerper beruhigen", "⭐"),
    HEART("Herz oeffnen", "🌸"),
    FOCUS("Klarer Fokus", "⚡"),
    SLEEP("Einschlafen", "🛌")
}

enum class Category(val label: String) {
    BRAINWAVE("Gehirnwellen"),
    SOLFEGGIO("Solfeggio"),
    RITUAL("Rituale")
}

data class SoundSession(
    val id: String,
    val title: String,
    val subtitle: String,
    val badge: String,
    val description: String,
    val category: Category,
    val moods: List<Mood>,
    val recipe: SoundRecipe,
    /** Zwei bis drei ARGB-Werte fuer den Farbverlauf der Karte. */
    val gradient: List<Long>,
    val needsHeadphones: Boolean = recipe.isBinaural,
    val suggestedMinutes: Int = 20
)

/**
 * Fester Katalog aller Klaenge. Alles wird synthetisiert, deshalb ist die App
 * winzig und funktioniert komplett offline.
 */
object Catalog {

    private const val ROSE = 0xFFF7A8B8
    private const val PEACH = 0xFFFFC38B
    private const val AMBER = 0xFFFFD98E
    private const val VIOLET = 0xFF9B8CFF
    private const val INDIGO = 0xFF5A4FCF
    private const val TEAL = 0xFF5EE7C7
    private const val AQUA = 0xFF63C7FF
    private const val NIGHT = 0xFF2B2F77
    private const val MOSS = 0xFF8FD68A
    private const val CLAY = 0xFFD9A066
    private const val PLUM = 0xFF7B4B94
    private const val SAND = 0xFFF2E2C4

    val all: List<SoundSession> = listOf(
        SoundSession(
            id = "soothe-anxiety",
            title = "Angst besaenftigen",
            subtitle = "Beruhigt das Nervensystem",
            badge = "Alpha 10 Hz",
            description = "Ein warmer Grundton mit einem Binaural Beat im Alpha-Bereich. " +
                "Alpha-Wellen begleiten den Zustand zwischen wach und entspannt – ideal, " +
                "wenn der Koerper unter Anspannung steht.",
            category = Category.BRAINWAVE,
            moods = listOf(Mood.ANXIETY, Mood.BODY, Mood.DEEP_CALM),
            recipe = SoundRecipe(
                leftHz = 195.0,
                rightHz = 205.0,
                noiseLevel = 0.20f,
                breathHz = 0.09,
                toneLevel = 0.5f
            ),
            gradient = listOf(ROSE, AMBER, PEACH),
            suggestedMinutes = 20
        ),
        SoundSession(
            id = "quiet-overthinking",
            title = "Gedankenkarussell stoppen",
            subtitle = "Weniger Gruebeln, mehr Weite",
            badge = "Theta 6 Hz",
            description = "Theta-Frequenzen entstehen in tiefer Entspannung und kurz vor dem " +
                "Einschlafen. Der langsame Puls gibt den kreisenden Gedanken einen " +
                "ruhigeren Takt.",
            category = Category.BRAINWAVE,
            moods = listOf(Mood.OVERTHINKING, Mood.DEEP_CALM),
            recipe = SoundRecipe(
                leftHz = 147.0,
                rightHz = 153.0,
                noiseLevel = 0.16f,
                breathHz = 0.07,
                toneLevel = 0.5f
            ),
            gradient = listOf(VIOLET, INDIGO, NIGHT),
            suggestedMinutes = 25
        ),
        SoundSession(
            id = "deep-calm",
            title = "Tiefe Ruhe",
            subtitle = "Absinken lassen",
            badge = "Delta 2 Hz",
            description = "Delta-Wellen dominieren den Tiefschlaf. Sehr langsamer Beat auf einem " +
                "tiefen Traeger – gut fuer die letzte halbe Stunde des Tages.",
            category = Category.BRAINWAVE,
            moods = listOf(Mood.DEEP_CALM, Mood.SLEEP),
            recipe = SoundRecipe(
                leftHz = 99.0,
                rightHz = 101.0,
                noiseLevel = 0.28f,
                breathHz = 0.05,
                toneLevel = 0.45f
            ),
            gradient = listOf(NIGHT, INDIGO, 0xFF141833),
            suggestedMinutes = 45
        ),
        SoundSession(
            id = "earth-reset",
            title = "Erdung",
            subtitle = "Schumann-Resonanz 7.83 Hz",
            badge = "7.83 Hz",
            description = "Die Schumann-Resonanz ist die Grundfrequenz des elektromagnetischen " +
                "Feldes zwischen Erdoberflaeche und Ionosphaere. Als Beat gelegt wirkt sie " +
                "wie ein ruhiger Boden unter den Fuessen.",
            category = Category.BRAINWAVE,
            moods = listOf(Mood.GROUNDING, Mood.DEEP_CALM),
            recipe = SoundRecipe(
                leftHz = 132.085,
                rightHz = 139.915,
                noiseLevel = 0.22f,
                breathHz = 0.06,
                toneLevel = 0.5f
            ),
            gradient = listOf(MOSS, TEAL, 0xFF2E6B5E),
            suggestedMinutes = 20
        ),
        SoundSession(
            id = "body-quiet",
            title = "Koerper beruhigen",
            subtitle = "Loesen von Kopf bis Fuss",
            badge = "174 Hz",
            description = "174 Hz gilt in der Solfeggio-Tradition als die tiefste der neun " +
                "Frequenzen und wird mit koerperlicher Entspannung verbunden. Sanfte " +
                "Pulsung, kein Binaural Beat – funktioniert auch ohne Kopfhoerer.",
            category = Category.SOLFEGGIO,
            moods = listOf(Mood.BODY, Mood.ANXIETY),
            recipe = SoundRecipe(
                leftHz = 174.0,
                rightHz = 174.0,
                pulseHz = 0.2,
                noiseLevel = 0.18f,
                toneLevel = 0.5f
            ),
            gradient = listOf(CLAY, PEACH, 0xFF8C5A3C),
            suggestedMinutes = 15
        ),
        SoundSession(
            id = "heart-opening",
            title = "Herz oeffnen",
            subtitle = "Weich werden duerfen",
            badge = "639 Hz",
            description = "639 Hz wird traditionell mit Verbindung und Beziehung assoziiert. " +
                "Ein warmer, offener Klang mit langsamer Atemwelle.",
            category = Category.SOLFEGGIO,
            moods = listOf(Mood.HEART, Mood.ANXIETY),
            recipe = SoundRecipe(
                leftHz = 639.0,
                rightHz = 639.0,
                noiseLevel = 0.12f,
                breathHz = 0.09,
                toneLevel = 0.4f
            ),
            gradient = listOf(ROSE, PLUM, 0xFF4C2A55),
            suggestedMinutes = 15
        ),
        SoundSession(
            id = "clear-focus",
            title = "Klarer Fokus",
            subtitle = "Wach, aber nicht hektisch",
            badge = "Beta 14 Hz",
            description = "Ein Beat im unteren Beta-Bereich begleitet konzentriertes Arbeiten. " +
                "Leises Rauschen deckt Umgebungsgeraeusche ab.",
            category = Category.BRAINWAVE,
            moods = listOf(Mood.FOCUS),
            recipe = SoundRecipe(
                leftHz = 243.0,
                rightHz = 257.0,
                noiseLevel = 0.24f,
                toneLevel = 0.42f
            ),
            gradient = listOf(AQUA, 0xFF3C7BD4, 0xFF1E2C63),
            suggestedMinutes = 45
        ),
        SoundSession(
            id = "gamma-clarity",
            title = "Wache Klarheit",
            subtitle = "Fuer den Nachmittagstiefpunkt",
            badge = "Gamma 40 Hz",
            description = "40 Hz ist die am besten untersuchte Gamma-Frequenz. Kurze Einheiten " +
                "genuegen – 10 bis 15 Minuten reichen voellig.",
            category = Category.BRAINWAVE,
            moods = listOf(Mood.FOCUS),
            recipe = SoundRecipe(
                leftHz = 220.0,
                rightHz = 260.0,
                noiseLevel = 0.10f,
                toneLevel = 0.38f
            ),
            gradient = listOf(AMBER, 0xFFFF8A5B, 0xFF6B2D2D),
            suggestedMinutes = 12
        ),
        SoundSession(
            id = "sleep-drift",
            title = "Einschlafen",
            subtitle = "Langsam wegdaemmern",
            badge = "Delta 1.5 Hz",
            description = "Tiefer Traeger, viel weiches Rauschen, sehr langsamer Beat. Mit " +
                "Einschlaf-Timer kombinieren – die App blendet am Ende von selbst aus.",
            category = Category.RITUAL,
            moods = listOf(Mood.SLEEP, Mood.DEEP_CALM),
            recipe = SoundRecipe(
                leftHz = 82.0,
                rightHz = 83.5,
                noiseLevel = 0.34f,
                breathHz = 0.045,
                toneLevel = 0.42f
            ),
            gradient = listOf(0xFF2A2A5E, 0xFF15173A, 0xFF0B0C1C),
            suggestedMinutes = 60
        ),
        SoundSession(
            id = "solfeggio-396",
            title = "Last abgeben",
            subtitle = "396 Hz",
            badge = "396 Hz",
            description = "In der Solfeggio-Reihe die Frequenz des Loslassens. Reiner Ton mit " +
                "leichter Pulsung.",
            category = Category.SOLFEGGIO,
            moods = listOf(Mood.ANXIETY, Mood.GROUNDING),
            recipe = SoundRecipe(
                leftHz = 396.0,
                rightHz = 396.0,
                pulseHz = 0.14,
                noiseLevel = 0.14f,
                toneLevel = 0.4f
            ),
            gradient = listOf(0xFFB07CC6, PLUM, 0xFF3A1F4B),
            suggestedMinutes = 15
        ),
        SoundSession(
            id = "solfeggio-417",
            title = "Neu anfangen",
            subtitle = "417 Hz",
            badge = "417 Hz",
            description = "417 Hz steht fuer Veraenderung und das Loesen alter Muster.",
            category = Category.SOLFEGGIO,
            moods = listOf(Mood.OVERTHINKING, Mood.GROUNDING),
            recipe = SoundRecipe(
                leftHz = 417.0,
                rightHz = 417.0,
                noiseLevel = 0.14f,
                breathHz = 0.08,
                toneLevel = 0.4f
            ),
            gradient = listOf(TEAL, 0xFF3E9AA8, 0xFF1E3A4C),
            suggestedMinutes = 15
        ),
        SoundSession(
            id = "solfeggio-528",
            title = "528 Hz",
            subtitle = "Die bekannteste Solfeggio-Frequenz",
            badge = "528 Hz",
            description = "528 Hz wird oft als 'Frequenz der Transformation' beschrieben. " +
                "Klanglich ein heller, klarer Ton – angenehm fuer kurze Pausen.",
            category = Category.SOLFEGGIO,
            moods = listOf(Mood.HEART, Mood.FOCUS),
            recipe = SoundRecipe(
                leftHz = 528.0,
                rightHz = 528.0,
                noiseLevel = 0.10f,
                breathHz = 0.1,
                toneLevel = 0.36f
            ),
            gradient = listOf(AMBER, MOSS, 0xFF3E6B3A),
            suggestedMinutes = 12
        ),
        SoundSession(
            id = "solfeggio-741",
            title = "Klaeren",
            subtitle = "741 Hz",
            badge = "741 Hz",
            description = "741 Hz wird mit Ausdruck und innerer Klarheit verbunden.",
            category = Category.SOLFEGGIO,
            moods = listOf(Mood.FOCUS, Mood.OVERTHINKING),
            recipe = SoundRecipe(
                leftHz = 741.0,
                rightHz = 741.0,
                noiseLevel = 0.12f,
                toneLevel = 0.32f
            ),
            gradient = listOf(AQUA, 0xFF4F6BD8, 0xFF23295E),
            suggestedMinutes = 12
        ),
        SoundSession(
            id = "solfeggio-852",
            title = "Stille im Kopf",
            subtitle = "852 Hz",
            badge = "852 Hz",
            description = "Hohe Solfeggio-Frequenz, traditionell der Intuition zugeordnet. " +
                "Bitte leise hoeren.",
            category = Category.SOLFEGGIO,
            moods = listOf(Mood.OVERTHINKING, Mood.DEEP_CALM),
            recipe = SoundRecipe(
                leftHz = 852.0,
                rightHz = 852.0,
                noiseLevel = 0.16f,
                breathHz = 0.07,
                toneLevel = 0.28f
            ),
            gradient = listOf(VIOLET, 0xFF6C63C9, 0xFF262445),
            suggestedMinutes = 10
        ),
        SoundSession(
            id = "432-tuning",
            title = "432 Hz Stimmung",
            subtitle = "Weicher als die Konzertstimmung",
            badge = "432 Hz",
            description = "Manche empfinden die Stimmung auf 432 Hz als waermer als die " +
                "uebliche 440 Hz. Ein ruhiger Dauerton zum Danebenarbeiten.",
            category = Category.RITUAL,
            moods = listOf(Mood.GROUNDING, Mood.FOCUS),
            recipe = SoundRecipe(
                leftHz = 432.0,
                rightHz = 432.0,
                noiseLevel = 0.12f,
                breathHz = 0.06,
                toneLevel = 0.35f
            ),
            gradient = listOf(SAND, CLAY, 0xFF6E4B33),
            suggestedMinutes = 30
        ),
        SoundSession(
            id = "coherent-breathing",
            title = "Atem-Anker",
            subtitle = "5.5 Atemzuege pro Minute",
            badge = "Atemtakt",
            description = "Der Klang schwillt in genau dem Rhythmus an und ab, der als " +
                "kohaerente Atmung bekannt ist: rund 5.5 Atemzuege pro Minute. " +
                "Einfach mit dem Klang mitatmen.",
            category = Category.RITUAL,
            moods = listOf(Mood.ANXIETY, Mood.BODY, Mood.GROUNDING),
            recipe = SoundRecipe(
                leftHz = 128.0,
                rightHz = 128.0,
                noiseLevel = 0.22f,
                breathHz = 0.0917,
                toneLevel = 0.5f
            ),
            gradient = listOf(TEAL, AQUA, 0xFF1F4E63),
            suggestedMinutes = 10
        ),
        SoundSession(
            id = "pink-rain",
            title = "Rosa Rauschen",
            subtitle = "Nur Rauschen, kein Ton",
            badge = "Noise",
            description = "Gleichmaessiges rosa Rauschen deckt Umgebungsgeraeusche ab – " +
                "im Grossraumbuero, im Zug oder neben lauten Nachbarn.",
            category = Category.RITUAL,
            moods = listOf(Mood.FOCUS, Mood.SLEEP, Mood.DEEP_CALM),
            recipe = SoundRecipe(
                leftHz = 60.0,
                rightHz = 60.0,
                noiseLevel = 0.85f,
                toneLevel = 0.05f
            ),
            gradient = listOf(0xFFD8CFE8, 0xFF9A93B8, 0xFF3B3752),
            suggestedMinutes = 60
        ),
        SoundSession(
            id = "evening-wind-down",
            title = "Abend-Ritual",
            subtitle = "Theta absteigend",
            badge = "Theta 4.5 Hz",
            description = "Fuer die letzte Stunde vor dem Schlafen: tiefer Traeger, langsamer " +
                "Beat, viel Waerme.",
            category = Category.RITUAL,
            moods = listOf(Mood.SLEEP, Mood.DEEP_CALM, Mood.OVERTHINKING),
            recipe = SoundRecipe(
                leftHz = 110.0,
                rightHz = 114.5,
                noiseLevel = 0.26f,
                breathHz = 0.055,
                toneLevel = 0.46f
            ),
            gradient = listOf(0xFF6B4E8F, INDIGO, 0xFF191B38),
            suggestedMinutes = 30
        )
    )

    val byId: Map<String, SoundSession> = all.associateBy { it.id }

    fun forMood(mood: Mood): List<SoundSession> = all.filter { mood in it.moods }

    fun forCategory(category: Category): List<SoundSession> = all.filter { it.category == category }

    val featured: List<SoundSession> = listOf(
        "soothe-anxiety",
        "quiet-overthinking",
        "earth-reset",
        "coherent-breathing",
        "deep-calm"
    ).mapNotNull { byId[it] }

    fun search(query: String): List<SoundSession> {
        val q = query.trim().lowercase()
        if (q.isEmpty()) return emptyList()
        return all.filter { session ->
            session.title.lowercase().contains(q) ||
                session.subtitle.lowercase().contains(q) ||
                session.badge.lowercase().contains(q) ||
                session.description.lowercase().contains(q) ||
                session.category.label.lowercase().contains(q) ||
                session.moods.any { it.label.lowercase().contains(q) }
        }
    }
}
