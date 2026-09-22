/*
 * ============================================================
 *                    HAZARDEYE SD MANAGER
 * ============================================================
 *
 * Purpose:
 *   Manage local storage on the ESP32 SD card.
 *
 * Responsibilities:
 *   - Initialize SD card
 *   - Check SD availability
 *   - Check files
 *   - List stored files
 *   - Read basic file information
 *
 * Primary use:
 *   Local audio files for the MAX98357A speaker system.
 *
 * Architecture:
 *
 * SD Card
 *    │
 *    ├── /audio/
 *    │     ├── startup.wav
 *    │     ├── warning.wav
 *    │     └── emergency.wav
 *    │
 *    └── /data/
 *          └── telemetry logs
 *
 * ============================================================
 */

#include <Arduino.h>
#include <SPI.h>
#include <SD.h>


/*
 * ============================================================
 * CONFIGURATION
 * ============================================================
 */

#define SD_CS_PIN 5


/*
 * ============================================================
 * STATE
 * ============================================================
 */

bool sdInitialized = false;


/*
 * ============================================================
 * INITIALIZE SD CARD
 * ============================================================
 */

bool initSDCard() {

    Serial.println(
        "[SD] Initializing SD card..."
    );


    if (!SD.begin(SD_CS_PIN)) {

        Serial.println(
            "[SD] Initialization failed!"
        );

        sdInitialized = false;

        return false;
    }


    uint8_t cardType =
        SD.cardType();


    if (cardType == CARD_NONE) {

        Serial.println(
            "[SD] No SD card detected!"
        );

        sdInitialized = false;

        return false;
    }


    uint64_t cardSize =
        SD.cardSize() /
        (1024ULL * 1024ULL);


    Serial.print(
        "[SD] Card size: "
    );

    Serial.print(
        cardSize
    );

    Serial.println(
        " MB"
    );


    sdInitialized = true;


    Serial.println(
        "[SD] SD card ready."
    );


    return true;
}


/*
 * ============================================================
 * SD CARD STATUS
 * ============================================================
 */

bool isSDReady() {

    return sdInitialized;
}


/*
 * ============================================================
 * FILE EXISTENCE CHECK
 * ============================================================
 */

bool fileExists(
    const char* path
) {

    if (!sdInitialized) {

        return false;
    }


    return SD.exists(path);
}


/*
 * ============================================================
 * GET FILE SIZE
 * ============================================================
 */

size_t getFileSize(
    const char* path
) {

    if (!sdInitialized) {

        return 0;
    }


    File file =
        SD.open(path);


    if (!file) {

        return 0;
    }


    size_t size =
        file.size();


    file.close();


    return size;
}


/*
 * ============================================================
 * CREATE DIRECTORY
 * ============================================================
 */

bool createDirectory(
    const char* path
) {

    if (!sdInitialized) {

        return false;
    }


    if (SD.exists(path)) {

        return true;
    }


    return SD.mkdir(path);
}


/*
 * ============================================================
 * LIST DIRECTORY
 * ============================================================
 */

void listDirectory(
    const char* path
) {

    if (!sdInitialized) {

        Serial.println(
            "[SD] Card unavailable."
        );

        return;
    }


    File root =
        SD.open(path);


    if (!root) {

        Serial.print(
            "[SD] Unable to open: "
        );

        Serial.println(path);

        return;
    }


    if (!root.isDirectory()) {

        Serial.println(
            "[SD] Path is not a directory."
        );

        root.close();

        return;
    }


    Serial.println();
    Serial.print(
        "[SD] Directory: "
    );

    Serial.println(path);

    Serial.println(
        "-------------------------------"
    );


    File file =
        root.openNextFile();


    while (file) {

        Serial.print(
            file.name()
        );


        if (file.isDirectory()) {

            Serial.println(
                "  <DIR>"
            );

        } else {

            Serial.print(
                "  "
            );

            Serial.print(
                file.size()
            );

            Serial.println(
                " bytes"
            );
        }


        file.close();

        file =
            root.openNextFile();
    }


    root.close();


    Serial.println(
        "-------------------------------"
    );
}


/*
 * ============================================================
 * READ TEXT FILE
 * ============================================================
 *
 * Useful for configuration or local logs.
 */

String readTextFile(
    const char* path
) {

    if (!sdInitialized) {

        return "";
    }


    File file =
        SD.open(path);


    if (!file) {

        Serial.print(
            "[SD] Cannot open: "
        );

        Serial.println(path);

        return "";
    }


    String content = "";


    while (file.available()) {

        content +=
            (char)file.read();
    }


    file.close();


    return content;
}


/*
 * ============================================================
 * WRITE TEXT FILE
 * ============================================================
 */

bool writeTextFile(
    const char* path,
    const String& content
) {

    if (!sdInitialized) {

        return false;
    }


    File file =
        SD.open(
            path,
            FILE_WRITE
        );


    if (!file) {

        Serial.print(
            "[SD] Cannot write: "
        );

        Serial.println(path);

        return false;
    }


    size_t written =
        file.print(content);


    file.close();


    return written > 0;
}


/*
 * ============================================================
 * APPEND TO TEXT FILE
 * ============================================================
 */

bool appendTextFile(
    const char* path,
    const String& content
) {

    if (!sdInitialized) {

        return false;
    }


    File file =
        SD.open(
            path,
            FILE_APPEND
        );


    if (!file) {

        Serial.print(
            "[SD] Cannot append: "
        );

        Serial.println(path);

        return false;
    }


    size_t written =
        file.print(content);


    file.close();


    return written > 0;
}


/*
 * ============================================================
 * DELETE FILE
 * ============================================================
 */

bool deleteFile(
    const char* path
) {

    if (!sdInitialized) {

        return false;
    }


    if (!SD.exists(path)) {

        return false;
    }


    return SD.remove(path);
}


/*
 * ============================================================
 * HAZARDEYE STORAGE SETUP
 * ============================================================
 */

void setupStorage() {

    if (!initSDCard()) {

        Serial.println(
            "[SD] Running without local storage."
        );

        return;
    }


    /*
     * Create application directories.
     */

    createDirectory(
        "/audio"
    );

    createDirectory(
        "/data"
    );


    Serial.println(
        "[SD] Storage system ready."
    );


    /*
     * Useful during development.
     */

    listDirectory(
        "/audio"
    );
}
