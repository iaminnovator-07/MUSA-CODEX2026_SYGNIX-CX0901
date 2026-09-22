/*
 * ============================================================
 *                 HAZARDEYE AUDIO PLAYER
 * ============================================================
 *
 * Audio Pipeline:
 *
 * SD Card
 *    ↓
 * WAV Audio File
 *    ↓
 * ESP32
 *    ↓
 * I²S
 *    ↓
 * MAX98357A
 *    ↓
 * Speaker
 *
 * Purpose:
 *   - Initialize MAX98357A
 *   - Load audio files from SD card
 *   - Play local safety/voice alerts
 *   - Provide an offline-first audio feedback layer
 *
 * ============================================================
 */

#include <Arduino.h>
#include <SD.h>
#include "driver/i2s.h"


/*
 * ============================================================
 * CONFIGURATION
 * ============================================================
 */

#define AUDIO_I2S_PORT I2S_NUM_0

#define I2S_BCLK 26
#define I2S_LRC  25
#define I2S_DOUT 22

#define AUDIO_BUFFER_SIZE 1024

#define DEFAULT_SAMPLE_RATE 16000


/*
 * ============================================================
 * AUDIO STATE
 * ============================================================
 */

bool audioPlayerReady = false;


/*
 * ============================================================
 * WAV HEADER
 * ============================================================
 *
 * Basic PCM WAV header structure.
 *
 * The player reads the important audio parameters directly
 * from the file instead of assuming every file has the same
 * configuration.
 */

struct WAVHeader {

    char riff[4];

    uint32_t fileSize;

    char wave[4];

    char fmt[4];

    uint32_t fmtSize;

    uint16_t audioFormat;

    uint16_t channels;

    uint32_t sampleRate;

    uint32_t byteRate;

    uint16_t blockAlign;

    uint16_t bitsPerSample;
};


/*
 * ============================================================
 * INITIALIZE I²S / MAX98357A
 * ============================================================
 */

bool initAudioPlayer() {

    Serial.println(
        "[AUDIO] Initializing MAX98357A..."
    );


    i2s_config_t config = {

        .mode =
            (i2s_mode_t)(
                I2S_MODE_MASTER |
                I2S_MODE_TX
            ),

        .sample_rate =
            DEFAULT_SAMPLE_RATE,

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


    i2s_pin_config_t pins = {

        .bck_io_num =
            I2S_BCLK,

        .ws_io_num =
            I2S_LRC,

        .data_out_num =
            I2S_DOUT,

        .data_in_num =
            I2S_PIN_NO_CHANGE
    };


    esp_err_t result =
        i2s_driver_install(
            AUDIO_I2S_PORT,
            &config,
            0,
            nullptr
        );


    if (result != ESP_OK) {

        Serial.println(
            "[AUDIO] I²S driver initialization failed."
        );

        return false;
    }


    result =
        i2s_set_pin(
            AUDIO_I2S_PORT,
            &pins
        );


    if (result != ESP_OK) {

        Serial.println(
            "[AUDIO] I²S pin configuration failed."
        );

        return false;
    }


    i2s_zero_dma_buffer(
        AUDIO_I2S_PORT
    );


    audioPlayerReady = true;


    Serial.println(
        "[AUDIO] MAX98357A ready."
    );


    return true;
}


/*
 * ============================================================
 * READ WAV HEADER
 * ============================================================
 */

bool readWAVHeader(
    File &file,
    WAVHeader &header
) {

    if (
        file.read(
            (uint8_t*)&header,
            sizeof(WAVHeader)
        )
        != sizeof(WAVHeader)
    ) {

        return false;
    }


    /*
     * Verify RIFF/WAVE identifiers.
     */

    if (
        strncmp(
            header.riff,
            "RIFF",
            4
        ) != 0
    ) {

        return false;
    }


    if (
        strncmp(
            header.wave,
            "WAVE",
            4
        ) != 0
    ) {

        return false;
    }


    return true;
}


/*
 * ============================================================
 * CONFIGURE I²S FOR AUDIO FILE
 * ============================================================
 */

bool configureAudioFormat(
    uint32_t sampleRate,
    uint16_t bitsPerSample,
    uint16_t channels
) {

    i2s_set_clk(
        AUDIO_I2S_PORT,
        sampleRate,
        (i2s_bits_per_sample_t)
            bitsPerSample,
        (i2s_channel_t)
            channels
    );


    return true;
}


/*
 * ============================================================
 * PLAY WAV FILE
 * ============================================================
 */

bool playWAV(
    const char* path
) {

    if (!audioPlayerReady) {

        Serial.println(
            "[AUDIO] Player not initialized."
        );

        return false;
    }


    if (!SD.exists(path)) {

        Serial.print(
            "[AUDIO] File not found: "
        );

        Serial.println(path);

        return false;
    }


    File audioFile =
        SD.open(path);


    if (!audioFile) {

        Serial.println(
            "[AUDIO] Unable to open audio file."
        );

        return false;
    }


    WAVHeader header;


    if (
        !readWAVHeader(
            audioFile,
            header
        )
    ) {

        Serial.println(
            "[AUDIO] Invalid WAV file."
        );

        audioFile.close();

        return false;
    }


    Serial.println();
    Serial.println(
        "========== AUDIO =========="
    );


    Serial.print(
        "File       : "
    );

    Serial.println(path);


    Serial.print(
        "Sample Rate: "
    );

    Serial.println(
        header.sampleRate
    );


    Serial.print(
        "Channels   : "
    );

    Serial.println(
        header.channels
    );


    Serial.print(
        "Bit Depth  : "
    );

    Serial.println(
        header.bitsPerSample
    );


    Serial.println(
        "============================"
    );


    /*
     * Configure I²S according to the WAV file.
     */

    configureAudioFormat(
        header.sampleRate,
        header.bitsPerSample,
        header.channels
    );


    uint8_t buffer[
        AUDIO_BUFFER_SIZE
    ];


    /*
     * Stream the audio directly from SD card.
     *
     * This avoids loading the entire audio file
     * into RAM.
     */

    while (
        audioFile.available()
    ) {

        size_t bytesRead =
            audioFile.read(
                buffer,
                AUDIO_BUFFER_SIZE
            );


        if (
            bytesRead == 0
        ) {

            break;
        }


        size_t bytesWritten =
            0;


        esp_err_t result =
            i2s_write(
                AUDIO_I2S_PORT,
                buffer,
                bytesRead,
                &bytesWritten,
                portMAX_DELAY
            );


        if (
            result != ESP_OK
        ) {

            Serial.println(
                "[AUDIO] I²S playback error."
            );

            audioFile.close();

            return false;
        }
    }


    audioFile.close();


    /*
     * Clear remaining samples.
     */

    i2s_zero_dma_buffer(
        AUDIO_I2S_PORT
    );


    Serial.println(
        "[AUDIO] Playback complete."
    );


    return true;
}


/*
 * ============================================================
 * PLAY SAFETY ALERT
 * ============================================================
 */

void playSafetyAlert() {

    playWAV(
        "/audio/warning.wav"
    );
}


/*
 * ============================================================
 * PLAY STARTUP AUDIO
 * ============================================================
 */

void playStartupAudio() {

    playWAV(
        "/audio/startup.wav"
    );
}


/*
 * ============================================================
 * PLAY EMERGENCY AUDIO
 * ============================================================
 */

void playEmergencyAudio() {

    playWAV(
        "/audio/emergency.wav"
    );
}


/*
 * ============================================================
 * STOP AUDIO
 * ============================================================
 */

void stopAudio() {

    if (!audioPlayerReady) {

        return;
    }


    i2s_zero_dma_buffer(
        AUDIO_I2S_PORT
    );


    Serial.println(
        "[AUDIO] Playback stopped."
    );
}
