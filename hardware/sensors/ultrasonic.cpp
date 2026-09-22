/*
 * ============================================================
 *                 HAZARDEYE ULTRASONIC SENSOR
 * ============================================================
 *
 * Purpose:
 *   Measure distance/proximity around the monitored system.
 *
 * Sensor:
 *   HC-SR04 / compatible ultrasonic sensor
 *
 * ESP32:
 *   TRIG -> GPIO 14
 *   ECHO -> GPIO 27
 *
 * Pipeline:
 *
 * Physical Environment
 *        ↓
 *   Ultrasonic Pulse
 *        ↓
 *      Echo
 *        ↓
 *      ESP32
 *        ↓
 * Distance Calculation
 *        ↓
 * Proximity Analysis
 *        ↓
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

#define ULTRASONIC_TRIG_PIN 14
#define ULTRASONIC_ECHO_PIN 27

/*
 * Maximum echo wait time.
 * Prevents pulseIn() from blocking indefinitely.
 */

#define ECHO_TIMEOUT_US 30000


/*
 * Prototype proximity threshold.
 * Calibrate according to the actual deployment.
 */

#define PROXIMITY_THRESHOLD_CM 20.0


/*
 * ============================================================
 * INITIALIZATION
 * ============================================================
 */

void initUltrasonicSensor() {

    pinMode(
        ULTRASONIC_TRIG_PIN,
        OUTPUT
    );

    pinMode(
        ULTRASONIC_ECHO_PIN,
        INPUT
    );


    digitalWrite(
        ULTRASONIC_TRIG_PIN,
        LOW
    );


    Serial.println(
        "[ULTRASONIC] Sensor initialized"
    );
}


/*
 * ============================================================
 * DISTANCE MEASUREMENT
 * ============================================================
 *
 * Sound travels through air at approximately 343 m/s.
 *
 * Distance:
 *
 *     distance = time × speed / 2
 *
 * Division by 2 is required because the ultrasonic pulse
 * travels to the object and returns to the sensor.
 */

float readDistanceCM() {

    /*
     * Ensure a clean trigger pulse.
     */

    digitalWrite(
        ULTRASONIC_TRIG_PIN,
        LOW
    );

    delayMicroseconds(2);


    /*
     * Send trigger pulse.
     */

    digitalWrite(
        ULTRASONIC_TRIG_PIN,
        HIGH
    );

    delayMicroseconds(10);

    digitalWrite(
        ULTRASONIC_TRIG_PIN,
        LOW
    );


    /*
     * Measure echo duration.
     */

    unsigned long duration =
        pulseIn(
            ULTRASONIC_ECHO_PIN,
            HIGH,
            ECHO_TIMEOUT_US
        );


    /*
     * No echo received.
     */

    if (duration == 0) {

        return -1.0;
    }


    /*
     * Convert microseconds to centimeters.
     */

    float distance =
        (duration * 0.0343) / 2.0;


    return distance;
}


/*
 * ============================================================
 * PROXIMITY DETECTION
 * ============================================================
 */

bool isObjectNearby() {

    float distance =
        readDistanceCM();


    if (distance < 0) {

        return false;
    }


    return distance <
           PROXIMITY_THRESHOLD_CM;
}


/*
 * ============================================================
 * DISTANCE STATUS
 * ============================================================
 */

const char* getUltrasonicStatus() {

    float distance =
        readDistanceCM();


    if (distance < 0) {

        return "NO_ECHO";
    }


    if (
        distance <
        PROXIMITY_THRESHOLD_CM
    ) {

        return "OBJECT_NEAR";
    }


    return "CLEAR";
}


/*
 * ============================================================
 * DIAGNOSTICS
 * ============================================================
 */

void printUltrasonicDiagnostics() {

    float distance =
        readDistanceCM();


    Serial.println(
        "--------- ULTRASONIC ---------"
    );


    Serial.print(
        "Distance : "
    );


    if (distance < 0) {

        Serial.println(
            "NO ECHO"
        );

    } else {

        Serial.print(
            distance
        );

        Serial.println(
            " cm"
        );
    }


    Serial.print(
        "Status   : "
    );

    Serial.println(
        getUltrasonicStatus()
    );


    Serial.println(
        "-------------------------------"
    );
}
