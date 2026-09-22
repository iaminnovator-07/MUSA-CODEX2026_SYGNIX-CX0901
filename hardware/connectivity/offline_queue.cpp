/*
 * ============================================================
 *              HAZARDEYE OFFLINE TELEMETRY QUEUE
 * ============================================================
 *
 * Offline-First Connectivity Layer
 *
 * When connectivity is available:
 *
 *   ESP32 → Firebase
 *
 * When connectivity is unavailable:
 *
 *   ESP32 → SD Card Queue
 *                    ↓
 *              Connection Restored
 *                    ↓
 *                 Firebase
 *
 * ============================================================
 */

#include <Arduino.h>
#include <SD.h>


/*
 * ============================================================
 * CONFIGURATION
 * ============================================================
 */

#define OFFLINE_QUEUE_FILE "/data/telemetry_queue.csv"

#define MAX_QUEUE_ENTRIES 100


/*
 * ============================================================
 * TELEMETRY STRUCTURE
 * ============================================================
 */

struct OfflineTelemetry {

    String deviceId;

    float temperature;

    int vibration;

    int sound;

    float distance;

    String status;

    unsigned long timestamp;
};


/*
 * ============================================================
 * INITIALIZATION
 * ============================================================
 */

void initOfflineQueue() {

    if (!SD.exists("/data")) {

        SD.mkdir("/data");
    }


    if (!SD.exists(OFFLINE_QUEUE_FILE)) {

        File file =
            SD.open(
                OFFLINE_QUEUE_FILE,
                FILE_WRITE
            );


        if (file) {

            file.println(
                "deviceId,temperature,vibration,sound,distance,status,timestamp"
            );

            file.close();
        }
    }


    Serial.println(
        "[QUEUE] Offline telemetry queue ready."
    );
}


/*
 * ============================================================
 * QUEUE TELEMETRY
 * ============================================================
 */

bool queueTelemetry(
    const char* deviceId,
    float temperature,
    int vibration,
    int sound,
    float distance,
    const char* status
) {

    File file =
        SD.open(
            OFFLINE_QUEUE_FILE,
            FILE_APPEND
        );


    if (!file) {

        Serial.println(
            "[QUEUE] Unable to open queue."
        );

        return false;
    }


    file.print(deviceId);
    file.print(",");

    file.print(temperature);
    file.print(",");

    file.print(vibration);
    file.print(",");

    file.print(sound);
    file.print(",");

    file.print(distance);
    file.print(",");

    file.print(status);
    file.print(",");

    file.println(millis());


    file.close();


    Serial.println(
        "[QUEUE] Telemetry stored locally."
    );


    return true;
}


/*
 * ============================================================
 * COUNT QUEUED RECORDS
 * ============================================================
 */

int getQueuedEntries() {

    if (
        !SD.exists(
            OFFLINE_QUEUE_FILE
        )
    ) {

        return 0;
    }


    File file =
        SD.open(
            OFFLINE_QUEUE_FILE
        );


    if (!file) {

        return 0;
    }


    int count = 0;


    /*
     * Skip CSV header.
     */

    if (file.available()) {

        file.readStringUntil(
            '\n'
        );
    }


    while (
        file.available()
    ) {

        String line =
            file.readStringUntil(
                '\n'
            );


        line.trim();


        if (
            line.length() > 0
        ) {

            count++;
        }
    }


    file.close();


    return count;
}


/*
 * ============================================================
 * CHECK QUEUE
 * ============================================================
 */

bool hasQueuedTelemetry() {

    return
        getQueuedEntries() > 0;
}


/*
 * ============================================================
 * READ NEXT QUEUED RECORD
 * ============================================================
 */

bool readNextQueuedRecord(
    OfflineTelemetry &data
) {

    File file =
        SD.open(
            OFFLINE_QUEUE_FILE
        );


    if (!file) {

        return false;
    }


    /*
     * Skip CSV header.
     */

    if (file.available()) {

        file.readStringUntil(
            '\n'
        );
    }


    if (!file.available()) {

        file.close();

        return false;
    }


    String line =
        file.readStringUntil(
            '\n'
        );


    file.close();


    line.trim();


    if (
        line.length() == 0
    ) {

        return false;
    }


    /*
     * Parse CSV fields.
     */

    int index = 0;

    int nextIndex;


    nextIndex =
        line.indexOf(
            ',',
            index
        );

    data.deviceId =
        line.substring(
            index,
            nextIndex
        );


    index =
        nextIndex + 1;


    nextIndex =
        line.indexOf(
            ',',
            index
        );

    data.temperature =
        line.substring(
            index,
            nextIndex
        ).toFloat();


    index =
        nextIndex + 1;


    nextIndex =
        line.indexOf(
            ',',
            index
        );

    data.vibration =
        line.substring(
            index,
            nextIndex
        ).toInt();


    index =
        nextIndex + 1;


    nextIndex =
        line.indexOf(
            ',',
            index
        );

    data.sound =
        line.substring(
            index,
            nextIndex
        ).toInt();


    index =
        nextIndex + 1;


    nextIndex =
        line.indexOf(
            ',',
            index
        );

    data.distance =
        line.substring(
            index,
            nextIndex
        ).toFloat();


    index =
        nextIndex + 1;


    nextIndex =
        line.indexOf(
            ',',
            index
        );

    data.status =
        line.substring(
            index,
            nextIndex
        );


    index =
        nextIndex + 1;


    data.timestamp =
        line.substring(
            index
        ).toInt();


    return true;
}


/*
 * ============================================================
 * REMOVE FIRST QUEUED RECORD
 * ============================================================
 *
 * After successful Firebase synchronization, remove the
 * oldest record from the local queue.
 */

bool removeFirstQueuedRecord() {

    File source =
        SD.open(
            OFFLINE_QUEUE_FILE
        );


    if (!source) {

        return false;
    }


    String tempFile =
        "/data/telemetry_tmp.csv";


    File destination =
        SD.open(
            tempFile,
            FILE_WRITE
        );


    if (!destination) {

        source.close();

        return false;
    }


    /*
     * Preserve CSV header.
     */

    if (source.available()) {

        String header =
            source.readStringUntil(
                '\n'
            );

        destination.println(
            header
        );
    }


    /*
     * Skip the oldest telemetry record.
     */

    if (source.available()) {

        source.readStringUntil(
            '\n'
        );
    }


    /*
     * Copy remaining records.
     */

    while (
        source.available()
    ) {

        String line =
            source.readStringUntil(
                '\n'
            );


        if (
            line.length() > 0
        ) {

            destination.println(
                line
            );
        }
    }


    source.close();

    destination.close();


    /*
     * Replace original queue.
     */

    SD.remove(
        OFFLINE_QUEUE_FILE
    );


    if (
        !SD.rename(
            tempFile,
            OFFLINE_QUEUE_FILE
        )
    ) {

        Serial.println(
            "[QUEUE] Failed to update queue."
        );

        return false;
    }


    return true;
}


/*
 * ============================================================
 * CLEAR QUEUE
 * ============================================================
 */

void clearOfflineQueue() {

    if (
        SD.exists(
            OFFLINE_QUEUE_FILE
        )
    ) {

        SD.remove(
            OFFLINE_QUEUE_FILE
        );
    }


    initOfflineQueue();


    Serial.println(
        "[QUEUE] Offline queue cleared."
    );
}


/*
 * ============================================================
 * QUEUE STATUS
 * ============================================================
 */

void printQueueStatus() {

    int entries =
        getQueuedEntries();


    Serial.println();

    Serial.println(
        "========== OFFLINE QUEUE =========="
    );


    Serial.print(
        "Queued records : "
    );

    Serial.println(
        entries
    );


    Serial.print(
        "Storage        : "
    );

    Serial.println(
        OFFLINE_QUEUE_FILE
    );


    Serial.println(
        "==================================="
    );
}
