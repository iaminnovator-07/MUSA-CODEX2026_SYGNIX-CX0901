/*
 * ============================================================
 *                    HAZARDEYE SOUND SENSOR
 * ============================================================
 *
 * Purpose:
 *   Capture acoustic intensity from the machine/environment
 *   and provide an edge-side signal for anomaly detection.
 *
 * Sensor:
 *   Analog Sound Sensor
 *
 * ESP32:
 *   SOUND_SENSOR -> GPIO 35
 *
 * Pipeline:
 *
 * Acoustic Environment
 *        ↓
 * Sound Sensor
 *        ↓
 * ESP32 ADC
 *        ↓
 * Signal Level
 *        ↓
 * Threshold / Analysis
 *        ↓
 * Telemetry + Alert
 *
 * ============================================================
 */

#include <Arduino.h>


/*
 * ============================================================
 * CONFIGURATION
 * ============================================================
 */

#define SOUND_SENSOR_PIN 35

/*
 * Prototype threshold.
 * This should be calibrated using real machine data
 * before industrial deployment.
 */
#define SOUND_THRESHOLD 3000


/*
 * ============================================================
 * INITIALIZATION
 * ============================================================
 */

void initSoundSensor() {

    pinMode(
        SOUND_SENSOR_PIN,
        INPUT
    );

    Serial.println(
        "[SOUND] Sensor initialized"
    );
}


/*
 * ============================================================
 * RAW SOUND READING
 * ============================================================
 */

int readSoundRaw() {

    return analogRead(
        SOUND_SENSOR_PIN
    );
}


/*
 * ============================================================
 * SOUND INTENSITY
 * ============================================================
 *
 * Converts the ESP32 ADC reading into a normalized
 * 0–100 representation.
 */

float getSoundLevel() {

    int raw =
        readSoundRaw();


    float level =
        (raw / 4095.0f) * 100.0f;


    return level;
}


/*
 * ============================================================
 * SOUND ANOMALY DETECTION
 * ============================================================
 */

bool isSoundAbnormal() {

    int raw =
        readSoundRaw();


    return raw >
           SOUND_THRESHOLD;
}


/*
 * ============================================================
 * SOUND STATUS
 * ============================================================
 */

const char* getSoundStatus() {

    if (
        isSoundAbnormal()
    ) {

        return "ABNORMAL";
    }


    return "NORMAL";
}


/*
 * ============================================================
 * DIAGNOSTICS
 * ============================================================
 */

void printSoundDiagnostics() {

    int raw =
        readSoundRaw();


    float level =
        getSoundLevel();


    Serial.println(
        "------------ SOUND ------------"
    );


    Serial.print(
        "Raw Value : "
    );

    Serial.println(raw);


    Serial.print(
        "Level     : "
    );

    Serial.print(level);

    Serial.println("%");


    Serial.print(
        "Status    : "
    );

    Serial.println(
        getSoundStatus()
    );


    Serial.println(
        "--------------------------------"
    );
}
