package ch.resona.frequenz.audio

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

/**
 * Prueft die Klangmathematik ohne Android – laeuft als normaler JVM-Test
 * ueber `./gradlew :app:testDebugUnitTest`.
 */
class ToneSynthTest {

    private val sampleRate = 44_100

    private fun render(
        recipe: SoundRecipe,
        seconds: Double,
        gain: Double,
        riseSeconds: Double = 0.0,
        fallSeconds: Double = 1.2
    ): Pair<DoubleArray, DoubleArray> {
        val synth = ToneSynth(sampleRate, seed = 42)
        synth.riseSeconds = riseSeconds
        synth.fallSeconds = fallSeconds
        synth.targetGain = gain

        val frames = (sampleRate * seconds).toInt()
        val buffer = FloatArray(2048 * 2)
        val left = DoubleArray(frames)
        val right = DoubleArray(frames)

        var done = 0
        while (done < frames) {
            val block = minOf(2048, frames - done)
            synth.render(buffer, block, recipe)
            for (i in 0 until block) {
                left[done + i] = buffer[i * 2].toDouble()
                right[done + i] = buffer[i * 2 + 1].toDouble()
            }
            done += block
        }
        return left to right
    }

    /** Goertzel-Auswertung: wie viel Energie steckt bei [freq]? */
    private fun magnitudeAt(signal: DoubleArray, freq: Double): Double {
        val w = 2.0 * Math.PI * freq / sampleRate
        var re = 0.0
        var im = 0.0
        for (i in signal.indices) {
            re += signal[i] * cos(w * i)
            im += signal[i] * sin(w * i)
        }
        return sqrt(re * re + im * im) / signal.size
    }

    private fun peak(signal: DoubleArray): Double = signal.maxOf { abs(it) }

    @Test
    fun binauralBeatPutsDifferentFrequenciesOnEachEar() {
        val (left, right) = render(SoundRecipe(195.0, 205.0), seconds = 2.0, gain = 0.7)

        // Jedes Ohr traegt nur seine eigene Frequenz – genau das erzeugt den Beat.
        assertTrue(magnitudeAt(left, 195.0) > 20 * magnitudeAt(left, 205.0))
        assertTrue(magnitudeAt(right, 205.0) > 20 * magnitudeAt(right, 195.0))
    }

    @Test
    fun pureToneKeepsBothEarsIdentical() {
        val (left, right) = render(SoundRecipe(528.0, 528.0), seconds = 1.0, gain = 0.7)
        for (i in left.indices step 97) {
            assertEquals(left[i], right[i], 1e-9)
        }
        assertTrue(magnitudeAt(left, 528.0) > 50 * magnitudeAt(left, 400.0))
    }

    @Test
    fun outputStaysInsideValidRangeEvenAtFullLevel() {
        val (left, right) = render(
            SoundRecipe(174.0, 174.0, noiseLevel = 1f, toneLevel = 1f),
            seconds = 2.0,
            gain = 1.0
        )
        assertTrue(left.none { it.isNaN() || it.isInfinite() })
        assertTrue(right.none { it.isNaN() || it.isInfinite() })
        assertTrue(peak(left) <= 1.0)
        assertTrue(peak(right) <= 1.0)
    }

    @Test
    fun fadeInTakesTheConfiguredTimeRegardlessOfVolume() {
        for (volume in listOf(0.3, 0.7, 1.0)) {
            val synth = ToneSynth(sampleRate, seed = 7)
            synth.riseSeconds = 2.0
            synth.targetGain = volume

            val buffer = FloatArray(2048 * 2)
            var frames = 0
            while (synth.currentGain < volume - 1e-9 && frames < sampleRate * 10) {
                synth.render(buffer, 2048, SoundRecipe(200.0, 210.0))
                frames += 2048
            }
            val seconds = frames.toDouble() / sampleRate
            assertEquals("Einblenden bei Lautstaerke $volume", 2.0, seconds, 0.1)
        }
    }

    @Test
    fun fadeOutReachesSilence() {
        val synth = ToneSynth(sampleRate, seed = 11)
        synth.riseSeconds = 0.0
        synth.fallSeconds = 1.0
        synth.targetGain = 0.8

        val buffer = FloatArray(2048 * 2)
        synth.render(buffer, 2048, SoundRecipe(200.0, 210.0))

        synth.targetGain = 0.0
        var frames = 0
        while (synth.currentGain > 0.0 && frames < sampleRate * 10) {
            synth.render(buffer, 2048, SoundRecipe(200.0, 210.0))
            frames += 2048
        }
        assertEquals(0.0, synth.currentGain, 0.0)
        assertEquals("Ausblenden", 1.0, frames.toDouble() / sampleRate, 0.1)

        synth.render(buffer, 2048, SoundRecipe(200.0, 210.0))
        assertTrue(buffer.all { it == 0f })
    }

    @Test
    fun breathingWaveModulatesLoudness() {
        // Eine Atemwelle mit 0.1 Hz dauert 10 s: leise Phase und laute Phase
        // muessen sich deutlich unterscheiden.
        val (left, _) = render(
            SoundRecipe(150.0, 150.0, breathHz = 0.1),
            seconds = 10.0,
            gain = 0.8
        )
        val quiet = peak(left.copyOfRange(0, sampleRate))
        val loud = peak(left.copyOfRange(sampleRate * 4, sampleRate * 6))
        assertTrue("laut=$loud leise=$quiet", loud > quiet * 1.5)
    }

    @Test
    fun catalogRecipesStayWithinSafeLevels() {
        for (session in ch.resona.frequenz.data.Catalog.all) {
            val (left, right) = render(session.recipe, seconds = 0.5, gain = 1.0)
            assertTrue("${session.id} uebersteuert", peak(left) <= 1.0 && peak(right) <= 1.0)
            assertTrue("${session.id} ist stumm", peak(left) > 0.02)
        }
    }
}
