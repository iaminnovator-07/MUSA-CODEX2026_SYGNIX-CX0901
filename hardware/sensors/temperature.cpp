/*
 * ============================================================
 *                 HAZARDEYE TEMPERATURE SENSOR
 * ============================================================
 *
 * Purpose:
 *   Monitor machine/environment temperature and provide
 *   temperature data to the edge intelligence layer.
 *
 * Current Hardware:
 *   DHT11 / compatible digital temperature sensor
 *
 * ESP32:
 *   DHT DATA -> GPIO 4
 *
 * Pipeline:
 *
 * Physical Environment
 *        ↓
 * Temperature Sensor
 *        ↓
 * ESP32
 *        ↓
 * Temperature Reading
 *        ↓
 * Threshold / Analysis
 *        ↓
 * Telemetry + Alert
 *
 * ============================================================
 */

#include <Arduino.h>
#include <DHT.h>


/*
 * ============================================================
 * CONFIGURATION
 * ============================================================
 */

#define TEMPERATURE_PIN 4

#define DHT_TYPE DHT11


/*
 * Temperature threshold.
 *
 * This is a prototype value and should be calibrated
 * according to the monitored machine/environment.
 */

#define TEMPERATURE_THRESHOLD 70.0


/*
 * ============================================================
 * DHT SENSOR OBJECT
 * ============================================================
 */

DHT temperatureSensor(
    TEMPERATURE_PIN,
    DHT_TYPE
);


/*
 * ============================================================
 * INITIALIZATION
 * ============================================================
 */

void initTemperatureSensor() {

    temperatureSensor.begin();


    Serial.println(
        "[TEMPERATURE] Sensor initialized"
    );
}


/*
 * ============================================================
 * READ TEMPERATURE
 * ============================================================
 */

float readTemperature() {

    float temperature =
        temperatureSensor.readTemperature();


    /*
     * DHT sensors may return NaN when a reading fails.
     */

    if (isnan(temperature)) {

        Serial.println(
            "[TEMPERATURE] Sensor read failed"
        );

        return -1.0;
    }


    return temperature;
}


/*
 * ============================================================
 * TEMPERATURE STATUS
 * ============================================================
 */

bool isTemperatureAbnormal() {

    float temperature =
        readTemperature();


    if (temperature < 0) {

        return false;
    }


    return temperature >
           TEMPERATURE_THRESHOLD;
}


/*
 * ============================================================
 * TEMPERATURE STATUS STRING
 * ============================================================
 */

const char* getTemperatureStatus() {

    float temperature =
        readTemperature();


    if (temperature < 0) {

        return "ERROR";
    }


    if (
        temperature >
        TEMPERATURE_THRESHOLD
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

void printTemperatureDiagnostics() {

    float temperature =
        readTemperature();


    Serial.println(
        "--------- TEMPERATURE ---------"
    );


    Serial.print(
        "Temperature : "
    );


    if (temperature < 0) {

        Serial.println(
            "READ ERROR"
        );

    } else {

        Serial.print(
            temperature
        );

        Serial.println(
            " °C"
        );
    }


    Serial.print(
        "Status      : "
    );

    Serial.println(
        getTemperatureStatus()
    );


    Serial.println(
        "--------------------------------"
    );
}
