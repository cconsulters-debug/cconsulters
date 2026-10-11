# Resona – Frequenzen & Klang (Android)

Eine native Android-App zum Entspannen mit Klang: Binaural Beats, Solfeggio-Frequenzen,
isochrone Pulse, rosa Rauschen und ein Atem-Anker. Vorbild ist die im Screenshot gezeigte
App "Bina" – Aufbau und Bedienung sind vergleichbar, der gesamte Code ist eigenständig.

Das Besondere: **die App enthält keine einzige Audiodatei.** Jeder Klang wird auf dem Gerät
in Echtzeit berechnet. Dadurch ist das APK sehr klein, alles funktioniert offline, es gibt
keine Anmeldung, kein Konto und keinen Netzwerkzugriff.

## Was drin ist

- **Startbildschirm** „Wie möchtest du entspannen?" mit acht Stimmungs-Filtern
  (Gedankenkarussell stoppen, Tiefe Ruhe, Angst lösen, Erdung, Körper beruhigen,
  Herz öffnen, Klarer Fokus, Einschlafen) und Karten mit Farbverlauf
- **18 Klänge** in drei Kategorien: Gehirnwellen (Delta/Theta/Alpha/Beta/Gamma,
  Schumann-Resonanz), Solfeggio (174 bis 852 Hz, 432 Hz) und Rituale
  (Abend-Ritual, Atem-Anker, rosa Rauschen)
- **Player** mit atmendem Farbkreis, Lautstärke, zumischbarem Rauschen,
  Einschlaf-Timer (10 – 90 Minuten) und technischer Beschreibung des Klangs
- **Mini-Player** über der Navigationsleiste, Wiedergabe läuft im Hintergrund weiter
- **Benachrichtigung** mit Play/Pause und Beenden, Vordergrunddienst für stabile Wiedergabe
- **Suche** nach Titel, Frequenz („528", „Theta") oder Stimmung
- **Bibliothek** mit Kategorie- und Favoritenfilter
- **Profil** mit gehörten Minuten, Anzahl Sitzungen, Tagen in Folge und Standard-Timer
- Audiofokus, Pause beim Abziehen der Kopfhörer, sanftes Ein- und Ausblenden

## Bauen

Voraussetzung: Android Studio (Ladybug oder neuer) oder das Android SDK mit
`compileSdk 34` und JDK 17.

```bash
cd android
./gradlew assembleDebug          # APK unter app/build/outputs/apk/debug/
./gradlew installDebug           # direkt auf ein angeschlossenes Gerät
./gradlew :app:testDebugUnitTest # Tests der Klangsynthese
```

In Android Studio: `File > Open` und den Ordner `android/` wählen.
Ohne Android Studio muss `local.properties` mit `sdk.dir=/pfad/zum/android-sdk`
angelegt werden (die Datei gehört nicht ins Git).

Mindestversion ist Android 8.0 (API 26).

## Aufbau

```
app/src/main/java/ch/resona/frequenz/
├── audio/
│   ├── ToneSynth.kt          reine Klangmathematik, ohne Android – testbar
│   ├── ToneEngine.kt         AudioTrack-Ausgabe auf eigenem Thread
│   ├── PlaybackController.kt Zustand, Timer, Audiofokus, Statistik
│   └── PlaybackService.kt    Vordergrunddienst und Benachrichtigung
├── data/
│   ├── Catalog.kt            alle Klänge, Stimmungen, Kategorien, Farben
│   └── UserStore.kt          DataStore: Favoriten, Statistik, Einstellungen
└── ui/                       Jetpack Compose, Material 3
```

### Wie ein Klang entsteht

`SoundRecipe` beschreibt einen Klang vollständig durch Zahlen:

| Feld | Bedeutung |
|------|-----------|
| `leftHz` / `rightHz` | Trägerfrequenz je Ohr. Sind sie verschieden, entsteht ein Binaural Beat in Höhe der Differenz (braucht Kopfhörer). |
| `pulseHz` | Isochrone Pulsung: der Ton schwillt mit weicher Kosinus-Hüllkurve an und ab, wirkt auch über Lautsprecher. |
| `breathHz` | Sehr langsame Lautstärkewelle, z. B. 0.0917 Hz = 5.5 Atemzüge pro Minute. |
| `noiseLevel` | Anteil rosa Rauschen (Approximation nach Paul Kellet). |
| `toneLevel` | Grundpegel des Tons. |

Neue Klänge kommen ohne weiteren Code aus – einfach einen Eintrag in `Catalog.all`
ergänzen.

### Tests

`app/src/test/java/.../ToneSynthTest.kt` prüft die Synthese als normalen JVM-Test:
Kanaltrennung beim Binaural Beat (per Goertzel-Analyse), Übersteuerungsfreiheit bei
Vollpegel, exakte Ein- und Ausblendzeiten, Wirkung der Atemwelle und dass jeder
Klang im Katalog hörbar und nicht übersteuert ist.

## Wichtiger Hinweis

Resona ist **kein Medizinprodukt**. Die App stellt keine Diagnose, behandelt keine
Krankheit und ersetzt keine ärztliche oder psychotherapeutische Hilfe. Die Wirkung von
Binaural Beats ist wissenschaftlich nur teilweise belegt und individuell sehr
unterschiedlich. Bei Epilepsie, Tinnitus, Schwindel, Herzschrittmacher oder
Höranfälligkeit vorher fachlich abklären. Nicht beim Autofahren oder Bedienen von
Maschinen verwenden. Diese Hinweise stehen auch in der App selbst (Startbildschirm
und Profil).

Wer die App veröffentlichen will, sollte diese Punkte auch im Play-Store-Eintrag
nennen – Google verlangt bei Gesundheits- und Wellness-Apps entsprechende Angaben.
