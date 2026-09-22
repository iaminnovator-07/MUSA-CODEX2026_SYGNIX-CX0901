/*
 * ============================================================
 *                       HAZARDEYE
 *              INDUSTRIAL INTELLIGENCE NODE
 * ============================================================
 *
 *                     MAIN FIRMWARE
 *
 * ESP32 Edge Node
 *
 * Hardware:
 *  - ESP32
 *  - Industrial Sensors
 *  - SD Card Module
 *  - MAX98357A I2S Audio Amplifier
 *  - Speaker
 *
 * System Flow:
 *
 * Sensors
 *    ↓
 * ESP32 Edge Processing
 *    ↓
 * Machine Condition
 *    ↓
 * ┌───────────────┬────────────────┐
 * │               │                │
 * ▼               ▼                ▼
 * Local Alert   SD Audio       Firebase
 *               Playback       Telemetry
 *    │               │                │
 *    └───────────────┼────────────────┘
 *                    ▼
 *             HazardEye Dashboard
 *
 * ============================================================
 */

#include <Arduino.h>
#include <SPI.h>
#include <SD.h>
#include "driver/i2s.h"


/*
 * ============================================================
 *                       PIN CONFIGURATION
 * ============================================================
 */

/* ---------------- Sensors ---------------- */

#define VIB_SENSOR      34
#define SOUND_SENSOR    35
#define DHT_PIN         4

#define DIST_TRIG       14
#define DIST_ECHO       27


/* ---------------- Status LEDs ---------------- */

#define DIST_LED        32
#define VIB_LED         33
#define SOUND_LED       15
#define TEMP_LED        2


/* ---------------- SD Card ---------------- */

#define SD_CS           5


/* ---------------- MAX98357A ----------------
 *
 * I2S Digital Audio Amplifier
 *
 * BCLK → GPIO 26
 * LRC  → GPIO 25
 * DIN  → GPIO 22
 */

#define I2S_BCLK        26
#define I2S_LRC         25
#define I2S_DOUT        22


/*
 * ============================================================
 *                       SYSTEM SETTINGS
 * ============================================================
 */

#define SERIAL_BAUD     115200

#define SAMPLE_RATE     16000

#define I2S_PORT        I2S_NUM_0

#define AUDIO_BUFFER    1024


/*
 * ============================================================
 *                      SENSOR DATA
 * ============================================================
 */

struct SensorData {

    float temperature;

    int vibration;

    int sound;

    long distance;

    unsigned long timestamp;
};


SensorData sensorData;


/*
 * ============================================================
 *                       SYSTEM STATE
 * ============================================================
 */

bool sdReady = false;

bool audioReady = false;

bool abnormalCondition = false;


/*
 * ============================================================
 *                     I2S AUDIO SETUP
 * ============================================================
 *
 * ESP32
 *   ↓
 * I2S
 *   ↓
 * MAX98357A
 *   ↓
 * Speaker
 *
 * Audio files are stored locally on SD card.
 */

void setupAudio() {

    Serial.println(
        "[AUDIO] Initializing MAX98357A..."
    );


    i2s_config_t i2sConfig = {

        .mode =
            (i2s_mode_t)(
                I2S_MODE_MASTER |
                I2S_MODE_TX
            ),

        .sample_rate =
            SAMPLE_RATE,

        .bits_per_sample =
            I2S_BITS_PER_SAMPLE_16BIT,

        .channel_format =
            I2S_CHANNEL_FMT_RIGHT_LEFT,

        .communication_format =
            I2S_COMM_FORMAT_STAND_I2S,

        .intr_alloc_flags =
            ESP_INTR_FLAG_LEVEL1,

        .dma_buf_count = 8,

        .dma_buf_len = 256,

        .use_apll = false,

        .tx_desc_auto_clear = true,

        .fixed_mclk = 0
    };


    i2s_pin_config_t pinConfig = {

        .bck_io_num =
            I2S_BCLK,

        .ws_io_num =
            I2S_LRC,

        .data_out_num =
            I2S_DOUT,

        .data_in_num =
            I2S_PIN_NO_CHANGE
    };


    esp_err_t result;


    result = i2s_driver_install(
        I2S_PORT,
        &i2sConfig,
        0,
        NULL
    );


    if (result != ESP_OK) {

        Serial.println(
            "[AUDIO] I2S driver failed!"
        );

        audioReady = false;

        return;
    }


    result = i2s_set_pin(
        I2S_PORT,
        &pinConfig
    );


    if (result != ESP_OK) {

        Serial.println(
            "[AUDIO] I2S pin configuration failed!"
        );

        audioReady = false;

        return;
    }


    i2s_zero_dma_buffer(
        I2S_PORT
    );


    audioReady = true;


    Serial.println(
        "[AUDIO] MAX98357A ready"
    );
}


/*
 * ============================================================
 *                        SD CARD SETUP
 * ============================================================
 */

void setupSDCard() {

    Serial.println(
        "[SD] Initializing SD card..."
    );


    if (!SD.begin(SD_CS)) {

        Serial.println(
            "[SD] Initialization failed!"
        );

        sdReady = false;

        return;
    }


    uint8_t cardType =
        SD.cardType();


    if (cardType == CARD_NONE) {

        Serial.println(
            "[SD] No SD card detected!"
        );

        sdReady = false;

        return;
    }


    uint64_t cardSize =
        SD.cardSize() /
        (1024 * 1024);


    Serial.print(
        "[SD] Card Size: "
    );

    Serial.print(cardSize);

    Serial.println(
        " MB"
    );


    sdReady = true;


    Serial.println(
        "[SD] SD card ready"
    );
}


/*
 * ============================================================
 *                     SENSOR INITIALIZATION
 * ============================================================
 */

void setupSensors() {

    pinMode(
        VIB_SENSOR,
        INPUT
    );

    pinMode(
        SOUND_SENSOR,
        INPUT
    );


    pinMode(
        DIST_TRIG,
        OUTPUT
    );

    pinMode(
        DIST_ECHO,
        INPUT
    );


    pinMode(
        DIST_LED,
        OUTPUT
    );

    pinMode(
        VIB_LED,
        OUTPUT
    );

    pinMode(
        SOUND_LED,
        OUTPUT
    );

    pinMode(
        TEMP_LED,
        OUTPUT
    );


    Serial.println(
        "[SENSORS] Sensors initialized"
    );
}


/*
 * ============================================================
 *                   READ VIBRATION
 * ============================================================
 */

int readVibration() {

    return analogRead(
        VIB_SENSOR
    );
}


/*
 * ============================================================
 *                     READ SOUND
 * ============================================================
 */

int readSound() {

    return analogRead(
        SOUND_SENSOR
    );
}


/*
 * ============================================================
 *                   READ DISTANCE
 * ============================================================
 */

long readDistance() {

    digitalWrite(
        DIST_TRIG,
        LOW
    );

    delayMicroseconds(2);


    digitalWrite(
        DIST_TRIG,
        HIGH
    );

    delayMicroseconds(10);


    digitalWrite(
        DIST_TRIG,
        LOW
    );


    long duration =
        pulseIn(
            DIST_ECHO,
            HIGH,
            30000
        );


    if (duration == 0) {

        return -1;
    }


    long distance =
        duration * 0.034 / 2;


    return distance;
}


/*
 * ============================================================
 *                 TEMPERATURE PLACEHOLDER
 * ============================================================
 *
 * Replace this with the actual sensor implementation
 * being used on the final hardware node.
 */

float readTemperature() {

    /*
     * Placeholder.
     *
     * Integrate DHT11 / LM35 implementation here
     * depending on the deployed sensor configuration.
     */

    return 0.0;
}


/*
 * ============================================================
 *                    READ ALL SENSORS
 * ============================================================
 */

void readSensors() {

    sensorData.vibration =
        readVibration();


    sensorData.sound =
        readSound();


    sensorData.distance =
        readDistance();


    sensorData.temperature =
        readTemperature();


    sensorData.timestamp =
        millis();
}


/*
 * ============================================================
 *                  EDGE CONDITION ANALYSIS
 * ============================================================
 *
 * This is the first intelligence layer.
 *
 * Future versions can replace threshold logic with:
 *
 *  - Signal processing
 *  - FFT
 *  - Anomaly detection
 *  - TinyML
 *  - Predictive models
 */

void analyzeMachineState() {

    abnormalCondition =
        false;


    /*
     * Vibration anomaly
     */

    if (
        sensorData.vibration
        > 3000
    ) {

        abnormalCondition =
            true;

        digitalWrite(
            VIB_LED,
            HIGH
        );

        Serial.println(
            "[ALERT] High vibration"
        );

    } else {

        digitalWrite(
            VIB_LED,
            LOW
        );
    }


    /*
     * Sound anomaly
     */

    if (
        sensorData.sound
        > 3000
    ) {

        abnormalCondition =
            true;

        digitalWrite(
            SOUND_LED,
            HIGH
        );

        Serial.println(
            "[ALERT] Abnormal sound"
        );

    } else {

        digitalWrite(
            SOUND_LED,
            LOW
        );
    }


    /*
     * Distance condition
     */

    if (
        sensorData.distance > 0 &&
        sensorData.distance < 20
    ) {

        digitalWrite(
            DIST_LED,
            HIGH
        );

    } else {

        digitalWrite(
            DIST_LED,
            LOW
        );
    }
}


/*
 * ============================================================
 *                 PLAY RAW AUDIO BUFFER
 * ============================================================
 *
 * This function sends PCM audio data to MAX98357A.
 *
 * Audio files should be stored in a compatible PCM/WAV
 * format before playback.
 */

void playAudioBuffer(
    uint8_t* buffer,
    size_t length
) {

    if (!audioReady) {

        Serial.println(
            "[AUDIO] Audio system unavailable"
        );

        return;
    }


    size_t bytesWritten;


    i2s_write(
        I2S_PORT,
        buffer,
        length,
        &bytesWritten,
        portMAX_DELAY
    );
}


/*
 * ============================================================
 *                    PLAY AUDIO FILE
 * ============================================================
 *
 * SD Card
 *    ↓
 * WAV / PCM File
 *    ↓
 * ESP32
 *    ↓
 * I2S
 *    ↓
 * MAX98357A
 *    ↓
 * Speaker
 *
 * NOTE:
 * The WAV header must be handled before sending
 * raw PCM samples to I2S.
 */

void playAudioFile(
    const char* path
) {

    if (!sdReady) {

        Serial.println(
            "[AUDIO] SD card unavailable"
        );

        return;
    }


    if (!audioReady) {

        Serial.println(
            "[AUDIO] MAX98357A unavailable"
        );

        return;
    }


    File audioFile =
        SD.open(path);


    if (!audioFile) {

        Serial.print(
            "[AUDIO] File not found: "
        );

        Serial.println(path);

        return;
    }


    Serial.print(
        "[AUDIO] Playing: "
    );

    Serial.println(path);


    /*
     * Skip standard 44-byte WAV header.
     *
     * For production use, parse the WAV header
     * dynamically instead of assuming 44 bytes.
     */

    audioFile.seek(44);


    uint8_t buffer[
        AUDIO_BUFFER
    ];


    while (
        audioFile.available()
    ) {

        size_t bytesRead =
            audioFile.read(
                buffer,
                AUDIO_BUFFER
            );


        if (bytesRead == 0) {

            break;
        }


        size_t bytesWritten;


        i2s_write(
            I2S_PORT,
            buffer,
            bytesRead,
            &bytesWritten,
            portMAX_DELAY
        );
    }


    audioFile.close();


    i2s_zero_dma_buffer(
        I2S_PORT
    );


    Serial.println(
        "[AUDIO] Playback complete"
    );
}


/*
 * ============================================================
 *                     TELEMETRY
 * ============================================================
 */

void printTelemetry() {

    Serial.println();
    Serial.println(
        "========== HAZARDEYE TELEMETRY =========="
    );


    Serial.print(
        "Temperature : "
    );

    Serial.println(
        sensorData.temperature
    );


    Serial.print(
        "Vibration   : "
    );

    Serial.println(
        sensorData.vibration
    );


    Serial.print(
        "Sound       : "
    );

    Serial.println(
        sensorData.sound
    );


    Serial.print(
        "Distance    : "
    );

    Serial.print(
        sensorData.distance
    );

    Serial.println(
        " cm"
    );


    Serial.print(
        "Status      : "
    );

    Serial.println(
        abnormalCondition
            ? "ABNORMAL"
            : "NORMAL"
    );


    Serial.println(
        "=========================================="
    );
}


/*
 * ============================================================
 *                         SETUP
 * ============================================================
 */

void setup() {

    Serial.begin(
        SERIAL_BAUD
    );


    delay(1000);


    Serial.println();
    Serial.println(
        "=========================================="
    );

    Serial.println(
        "          HAZARDEYE EDGE NODE"
    );

    Serial.println(
        "       Physical AI Hardware Layer"
    );

    Serial.println(
        "=========================================="
    );


    setupSensors();

    setupSDCard();

    setupAudio();


    /*
     * Startup audio test.
     *
     * Uncomment after placing the required
     * audio file on the SD card.
     */

    // playAudioFile("/startup.wav");


    Serial.println(
        "[SYSTEM] HazardEye ready."
    );
}


/*
 * ============================================================
 *                          LOOP
 * ============================================================
 */

void loop() {

    /*
     * 1. SENSE
     */

    readSensors();


    /*
     * 2. ANALYZE
     */

    analyzeMachineState();


    /*
     * 3. DISPLAY / DEBUG
     */

    printTelemetry();


    /*
     * 4. LOCAL AUDIO RESPONSE
     *
     * Example:
     *
     * if (abnormalCondition) {
     *
     *     playAudioFile("/alert.wav");
     *
     * }
     *
     * Keep this disabled during initial testing
     * to avoid repeatedly playing the alert.
     */


    delay(1000);
}
