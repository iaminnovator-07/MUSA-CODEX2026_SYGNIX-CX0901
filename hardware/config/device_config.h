/*
 * ============================================================
 *                  HAZARDEYE DEVICE CONFIG
 * ============================================================
 *
 * Central configuration for the HazardEye ESP32 edge node.
 *
 * Keeping hardware pins and system parameters here makes the
 * firmware modular, easier to maintain and easier to adapt
 * when deploying the node on different machines.
 *
 * ============================================================
 */

#ifndef HAZARDEYE_DEVICE_CONFIG_H
#define HAZARDEYE_DEVICE_CONFIG_H


/*
 * ============================================================
 * DEVICE IDENTITY
 * ============================================================
 */

#define HAZARDEYE_DEVICE_ID "HZ-001"

#define HAZARDEYE_FIRMWARE_VERSION "1.0.0"


/*
 * ============================================================
 * SENSOR PINS
 * ============================================================
 */

#define PIN_ULTRASONIC_TRIG 14
#define PIN_ULTRASONIC_ECHO 27

#define PIN_VIBRATION 34

#define PIN_SOUND 35

#define PIN_TEMPERATURE 4


/*
 * ============================================================
 * SD CARD
 * ============================================================
 */

#define PIN_SD_CS 5


/*
 * ============================================================
 * I²S / MAX98357A AUDIO
 * ============================================================
 */

#define PIN_I2S_BCLK 26
#define PIN_I2S_LRC 25
#define PIN_I2S_DOUT 22


/*
 * ============================================================
 * LED INDICATORS
 * ============================================================
 */

#define PIN_DISTANCE_LED 32

#define PIN_VIBRATION_LED 33

#define PIN_SOUND_LED 15

#define PIN_TEMPERATURE_LED 2


/*
 * ============================================================
 * SENSOR THRESHOLDS
 * ============================================================
 *
 * Prototype values.
 * These should be calibrated using actual machine data
 * before industrial deployment.
 */


/*
 * Vibration
 */

#define VIBRATION_THRESHOLD 3000


/*
 * Sound
 */

#define SOUND_THRESHOLD 3000


/*
 * Temperature
 */

#define TEMPERATURE_THRESHOLD_C 70.0


/*
 * Ultrasonic proximity
 */

#define PROXIMITY_THRESHOLD_CM 20.0


/*
 * ============================================================
 * SAMPLING
 * ============================================================
 */

#define SENSOR_READ_INTERVAL_MS 1000

#define CLOUD_SYNC_INTERVAL_MS 5000

#define HEARTBEAT_INTERVAL_MS 30000


/*
 * ============================================================
 * OFFLINE STORAGE
 * ============================================================
 */

#define OFFLINE_QUEUE_PATH \
    "/data/telemetry_queue.csv"

#define MAX_OFFLINE_QUEUE_ENTRIES 100


/*
 * ============================================================
 * AUDIO FILES
 * ============================================================
 */

#define AUDIO_STARTUP \
    "/audio/startup.wav"

#define AUDIO_WARNING \
    "/audio/warning.wav"

#define AUDIO_EMERGENCY \
    "/audio/emergency.wav"


/*
 * ============================================================
 * NETWORK
 * ============================================================
 */

#define WIFI_CONNECT_TIMEOUT_MS 15000

#define WIFI_RECONNECT_INTERVAL_MS 10000


/*
 * ============================================================
 * SYSTEM STATES
 * ============================================================
 */

enum HazardEyeSystemState {

    SYSTEM_BOOTING,

    SYSTEM_INITIALIZING,

    SYSTEM_NORMAL,

    SYSTEM_WARNING,

    SYSTEM_CRITICAL,

    SYSTEM_OFFLINE,

    SYSTEM_ERROR
};


/*
 * ============================================================
 * SENSOR STATES
 * ============================================================
 */

enum SensorStatus {

    SENSOR_OK,

    SENSOR_WARNING,

    SENSOR_ERROR
};


#endif
