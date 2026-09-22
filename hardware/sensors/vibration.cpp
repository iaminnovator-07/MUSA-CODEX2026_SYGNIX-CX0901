/*
 * ============================================================
 *                  HAZARDEYE VIBRATION SENSOR
 * ============================================================
 *
 * Purpose:
 *   Detect abnormal vibration behaviour from an industrial
 *   machine and expose a clean interface to the main firmware.
 *
 * Sensor:
 *   SW-420 / compatible vibration sensor
 *
 * ESP32:
 *   VIBRATION_PIN -> GPIO 34
 *
 * Architecture:
 *
 * Machine
 *    ↓
 * Vibration Sensor
 *    ↓
 * ESP32 Edge Node
 *    ↓
 * Vibration Analysis
 *    ↓
 * Alert / Telemetry
 *
 * ============================================================
 */

#include <Arduino.h>


/*
 * ============================================================
 * CONFIGURATION
 * ============================================================
 */

#define VIBRATION_PIN 34


/*
 * Threshold configuration
 *
 * For analog vibration sensing, this should be calibrated
 * against the actual machine during deployment.
 */

#define VIBRATION_THRESHOLD 3000


/*
 * ============================================================
 * INITIALIZATION
 * ============================================================
 */

void initVibrationSensor() {

    pinMode(
        VIBRATION_PIN,
        INPUT
    );

    Serial.println(
        "[VIBRATION] Sensor initialized"
    );
}


/*
 * ============================================================
 * RAW SENSOR READING
 * ============================================================
 */

int readVibrationRaw() {

    return analogRead(
        VIBRATION_PIN
    );
}


/*
 * ============================================================
 * NORMALIZED VIBRATION VALUE
 * ============================================================
 *
 * ESP32 ADC:
 *   0 → 4095
 *
 * Converts the raw reading into a percentage-like
 * representation for higher-level application logic.
 */

float getVibrationLevel() {

    int raw =
        readVibrationRaw();


    float level =
        (raw / 4095.0f) * 100.0f;


    return level;
}


/*
 * ============================================================
 * ANOMALY DETECTION
 * ============================================================
 */

bool isVibrationAbnormal() {

    int raw =
        readVibrationRaw();


    return raw >
           VIBRATION_THRESHOLD;
}


/*
 * ============================================================
 * VIBRATION STATUS
 * ============================================================
 */

const char* getVibrationStatus() {

    if (
        isVibrationAbnormal()
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

void printVibrationDiagnostics() {

    int raw =
        readVibrationRaw();


    float level =
        getVibrationLevel();


    Serial.println(
        "---------- VIBRATION ----------"
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
        getVibrationStatus()
    );


    Serial.println(
        "--------------------------------"
    );
}
