package ch.resona.frequenz.audio

import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.exp
import kotlin.math.sin
import kotlin.random.Random

/**
 * Beschreibt einen Klang rein mathematisch – es werden keine Audio-Dateien benoetigt,
 * jeder Ton wird zur Laufzeit synthetisiert.
 *
 * @param leftHz     Traegerfrequenz linkes Ohr
 * @param rightHz    Traegerfrequenz rechtes Ohr (abweichend von [leftHz] entsteht ein Binaural Beat)
 * @param pulseHz    Isochrone Pulsung in Hz, 0.0 = aus
 * @param noiseLevel Anteil rosa Rauschen, 0f..1f
 * @param breathHz   Sehr langsame Lautstaerkewelle (Atemrhythmus) in Hz, 0.0 = aus
 * @param toneLevel  Grundpegel des Tons, 0f..1f
 */
data class SoundRecipe(
    val leftHz: Double,
    val rightHz: Double,
    val pulseHz: Double = 0.0,
    val noiseLevel: Float = 0f,
    val breathHz: Double = 0.0,
    val toneLevel: Float = 0.55f
) {
    /** Differenz beider Ohren – der eigentlich wahrgenommene Beat. */
    val beatHz: Double get() = kotlin.math.abs(rightHz - leftHz)

    val isBinaural: Boolean get() = beatHz > 0.01
}

/**
 * Der eigentliche Synthesizer: additive Sinustoene, optionale isochrone Pulsung,
 * Atemwelle und rosa Rauschen – dazu eine klickfreie Lautstaerke-Huellkurve.
 *
 * Bewusst ohne jede Android-Abhaengigkeit, damit die Klangmathematik als
 * normaler JVM-Test pruefbar bleibt.
 */
class ToneSynth(
    private val sampleRate: Int = 44_100,
    seed: Long = System.nanoTime()
) {

    private companion object {
        const val TWO_PI = 2.0 * PI
        /** Zeitkonstante fuer das Nachfuehren von Frequenz- und Rauschaenderungen. */
        const val SMOOTH_SECONDS = 0.05
    }

    private var phaseLeft = 0.0
    private var phaseRight = 0.0
    private var phasePulse = 0.0
    private var phaseBreath = 0.0

    private var smoothLeftHz = Double.NaN
    private var smoothRightHz = Double.NaN
    private var smoothNoise = Double.NaN

    private val pinkLeft = DoubleArray(3)
    private val pinkRight = DoubleArray(3)
    private val random = Random(seed)

    private val smoothing = 1.0 - exp(-1.0 / (SMOOTH_SECONDS * sampleRate))

    /**
     * Lautstaerke, zu der hin geblendet wird (0.0..1.0). Beim Setzen wird die
     * zu ueberbrueckende Strecke festgehalten, damit eine Blende unabhaengig
     * vom Pegel immer gleich lange dauert.
     */
    var targetGain: Double = 0.0
        set(value) {
            if (value != field) {
                rampReference = maxOf(currentGain, value, 0.05)
                field = value
            }
        }

    private var rampReference = 0.05

    /** Aktueller, geglaetteter Pegel. */
    var currentGain: Double = 0.0
        private set

    /** Dauer eines Einblendens in Sekunden. */
    var riseSeconds: Double = 3.0

    /** Dauer eines Ausblendens in Sekunden. */
    var fallSeconds: Double = 1.2

    /**
     * Fuellt [out] mit [frames] Stereo-Samples (interleaved L,R) im Bereich -1f..1f.
     */
    fun render(out: FloatArray, frames: Int, recipe: SoundRecipe) {
        require(out.size >= frames * 2) { "Puffer zu klein fuer $frames Frames" }

        if (smoothLeftHz.isNaN()) {
            smoothLeftHz = recipe.leftHz
            smoothRightHz = recipe.rightHz
            smoothNoise = recipe.noiseLevel.toDouble()
        }

        val riseStep = if (riseSeconds <= 0.0) 1.0 else rampReference / (riseSeconds * sampleRate)
        val fallStep = if (fallSeconds <= 0.0) 1.0 else rampReference / (fallSeconds * sampleRate)

        for (frame in 0 until frames) {
            currentGain = when {
                currentGain < targetGain -> minOf(targetGain, currentGain + riseStep)
                currentGain > targetGain -> maxOf(targetGain, currentGain - fallStep)
                else -> currentGain
            }

            smoothLeftHz += (recipe.leftHz - smoothLeftHz) * smoothing
            smoothRightHz += (recipe.rightHz - smoothRightHz) * smoothing
            smoothNoise += (recipe.noiseLevel - smoothNoise) * smoothing

            phaseLeft = wrap(phaseLeft + TWO_PI * smoothLeftHz / sampleRate)
            phaseRight = wrap(phaseRight + TWO_PI * smoothRightHz / sampleRate)

            // Leichte Oberwelle macht den Ton weicher und weniger "piepsig".
            var left = sin(phaseLeft) + 0.12 * sin(2.0 * phaseLeft)
            var right = sin(phaseRight) + 0.12 * sin(2.0 * phaseRight)

            var toneGain = recipe.toneLevel.toDouble()

            if (recipe.pulseHz > 0.0) {
                phasePulse = wrap(phasePulse + TWO_PI * recipe.pulseHz / sampleRate)
                // Weiche Kosinus-Huellkurve statt Rechteck – klickfrei.
                toneGain *= 0.25 + 0.75 * (0.5 * (1.0 - cos(phasePulse)))
            }

            if (recipe.breathHz > 0.0) {
                phaseBreath = wrap(phaseBreath + TWO_PI * recipe.breathHz / sampleRate)
                // Deutlich hoerbares An- und Abschwellen, damit man mitatmen kann.
                toneGain *= 0.55 + 0.45 * (0.5 * (1.0 - cos(phaseBreath)))
            }

            left *= toneGain
            right *= toneGain

            if (smoothNoise > 0.0001) {
                left += pinkNoise(pinkLeft) * smoothNoise * 0.35
                right += pinkNoise(pinkRight) * smoothNoise * 0.35
            }

            out[frame * 2] = softClip(left * currentGain)
            out[frame * 2 + 1] = softClip(right * currentGain)
        }
    }

    private fun wrap(phase: Double): Double = if (phase > TWO_PI) phase - TWO_PI else phase

    /** Rosa Rauschen nach der Approximation von Paul Kellet. */
    private fun pinkNoise(state: DoubleArray): Double {
        val white = random.nextDouble() * 2.0 - 1.0
        state[0] = 0.99765 * state[0] + white * 0.0990460
        state[1] = 0.96300 * state[1] + white * 0.2965164
        state[2] = 0.57000 * state[2] + white * 1.0526913
        return (state[0] + state[1] + state[2] + white * 0.1848) * 0.22
    }

    /**
     * Weiche Saettigung statt hartem Clipping – schuetzt vor Uebersteuerung.
     * Die Kennlinie geht bei |x| = 1 stetig in die Begrenzung ueber, deshalb
     * entstehen auch bei lauten Passagen keine Knackser.
     */
    private fun softClip(value: Double): Float {
        val x = value * 0.8
        return when {
            x >= 1.0 -> 1.0f
            x <= -1.0 -> -1.0f
            else -> ((x - (x * x * x) / 3.0) * 1.5).toFloat()
        }
    }
}
