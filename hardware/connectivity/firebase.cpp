/*
 * ============================================================
 *                 HAZARDEYE FIREBASE CONNECTIVITY
 * ============================================================
 *
 * Purpose:
 *   Synchronize edge telemetry from the ESP32 with the
 *   HazardEye cloud backend.
 *
 * Data Flow:
 *
 * Sensors
 *    ↓
 * ESP32 Edge Node
 *    ↓
 * Local Processing
 *    ↓
 * Firebase
 *    ↓
 * HazardEye Dashboard
 *
 * Design Philosophy:
 *
 *   Edge First
 *      +
 *   Cloud Connected
 *      +
 *   Offline Resilience
 *
 * ============================================================
 */

#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>


/*
 * ============================================================
 * FIREBASE CONFIGURATION
 * ============================================================
 *
 * IMPORTANT:
 * Do NOT commit real credentials to GitHub.
 *
 * Provide these through a local configuration file,
 * build environment or secure secret-management system.
 */

#define WIFI_SSID       "YOUR_WIFI_SSID"
#define WIFI_PASSWORD   "YOUR_WIFI_PASSWORD"

#define API_KEY         "YOUR_FIREBASE_API_KEY"
#define DATABASE_URL    "YOUR_FIREBASE_DATABASE_URL"


/*
 * ============================================================
 * FIREBASE OBJECTS
 * ============================================================
 */

FirebaseData fbdo;

FirebaseAuth auth;

FirebaseConfig config;


/*
 * ============================================================
 * CONNECTION STATE
 * ============================================================
 */

bool firebaseReady = false;


/*
 * ============================================================
 * WIFI CONNECTION
 * ============================================================
 */

bool connectWiFi() {

    Serial.println();
    Serial.println(
        "[WIFI] Connecting..."
    );


    WiFi.begin(
        WIFI_SSID,
        WIFI_PASSWORD
    );


    unsigned long startTime =
        millis();


    const unsigned long timeout =
        15000;


    while (
        WiFi.status() != WL_CONNECTED &&
        millis() - startTime < timeout
    ) {

        delay(500);

        Serial.print(".");
    }


    Serial.println();


    if (
        WiFi.status() != WL_CONNECTED
    ) {

        Serial.println(
            "[WIFI] Connection failed."
        );

        return false;
    }


    Serial.println(
        "[WIFI] Connected."
    );


    Serial.print(
        "[WIFI] IP: "
    );

    Serial.println(
        WiFi.localIP()
    );


    return true;
}


/*
 * ============================================================
 * FIREBASE INITIALIZATION
 * ============================================================
 */

bool initFirebase() {

    if (
        WiFi.status() != WL_CONNECTED
    ) {

        Serial.println(
            "[FIREBASE] Wi-Fi unavailable."
        );

        return false;
    }


    config.api_key =
        API_KEY;


    config.database_url =
        DATABASE_URL;


    /*
     * Anonymous authentication can be used for a prototype
     * if enabled in the Firebase project.
     *
     * Replace with the appropriate authentication flow
     * before production deployment.
     */

    if (
        !Firebase.signUp(
            &config,
            &auth,
            "",
            ""
        )
    ) {

        Serial.print(
            "[FIREBASE] Authentication failed: "
        );

        Serial.println(
            config.signer.signupError.message.c_str()
        );

        return false;
    }


    Firebase.begin(
        &config,
        &auth
    );


    Firebase.reconnectWiFi(
        true
    );


    firebaseReady = true;


    Serial.println(
        "[FIREBASE] Firebase ready."
    );


    return true;
}


/*
 * ============================================================
 * DEVICE STATUS
 * ============================================================
 */

bool isFirebaseReady() {

    return
        firebaseReady &&
        Firebase.ready();
}


/*
 * ============================================================
 * UPLOAD SENSOR TELEMETRY
 * ============================================================
 *
 * Example Firebase structure:
 *
 * devices/
 *   HZ-001/
 *      temperature
 *      vibration
 *      sound
 *      distance
 *      status
 *      timestamp
 */

bool uploadTelemetry(
    const char* deviceId,
    float temperature,
    int vibration,
    int sound,
    float distance,
    const char* status
) {

    if (
        !isFirebaseReady()
    ) {

        Serial.println(
            "[FIREBASE] Not connected."
        );

        return false;
    }


    String basePath =
        "/devices/" +
        String(deviceId);


    bool success = true;


    /*
     * Temperature
     */

    if (
        !Firebase.RTDB.setFloat(
            &fbdo,
            basePath + "/temperature",
            temperature
        )
    ) {

        success = false;
    }


    /*
     * Vibration
     */

    if (
        !Firebase.RTDB.setInt(
            &fbdo,
            basePath + "/vibration",
            vibration
        )
    ) {

        success = false;
    }


    /*
     * Sound
     */

    if (
        !Firebase.RTDB.setInt(
            &fbdo,
            basePath + "/sound",
            sound
        )
    ) {

        success = false;
    }


    /*
     * Distance
     */

    if (
        !Firebase.RTDB.setFloat(
            &fbdo,
            basePath + "/distance",
            distance
        )
    ) {

        success = false;
    }


    /*
     * Machine status
     */

    if (
        !Firebase.RTDB.setString(
            &fbdo,
            basePath + "/status",
            status
        )
    ) {

        success = false;
    }


    /*
     * Timestamp
     */

    if (
        !Firebase.RTDB.setInt(
            &fbdo,
            basePath + "/timestamp",
            millis()
        )
    ) {

        success = false;
    }


    if (!success) {

        Serial.print(
            "[FIREBASE] Upload error: "
        );

        Serial.println(
            fbdo.errorReason()
        );

        return false;
    }


    Serial.println(
        "[FIREBASE] Telemetry uploaded."
    );


    return true;
}


/*
 * ============================================================
 * UPLOAD MACHINE EVENT
 * ============================================================
 *
 * Useful for events such as:
 *
 *   HIGH_VIBRATION
 *   HIGH_TEMPERATURE
 *   ABNORMAL_SOUND
 *   PROXIMITY_ALERT
 */

bool uploadEvent(
    const char* deviceId,
    const char* eventType,
    const char* message
) {

    if (
        !isFirebaseReady()
    ) {

        return false;
    }


    String eventPath =
        "/devices/" +
        String(deviceId) +
        "/events/" +
        String(millis());


    FirebaseJson event;


    event.set(
        "type",
        eventType
    );


    event.set(
        "message",
        message
    );


    event.set(
        "timestamp",
        (int)millis()
    );


    if (
        !Firebase.RTDB.setJSON(
            &fbdo,
            eventPath,
            &event
        )
    ) {

        Serial.print(
            "[FIREBASE] Event upload failed: "
        );

        Serial.println(
            fbdo.errorReason()
        );

        return false;
    }


    Serial.println(
        "[FIREBASE] Event uploaded."
    );


    return true;
}


/*
 * ============================================================
 * DEVICE HEARTBEAT
 * ============================================================
 *
 * Lets the dashboard know that the physical node is alive.
 */

bool sendHeartbeat(
    const char* deviceId
) {

    if (
        !isFirebaseReady()
    ) {

        return false;
    }


    String path =
        "/devices/" +
        String(deviceId) +
        "/online";


    if (
        !Firebase.RTDB.setBool(
            &fbdo,
            path,
            true
        )
    ) {

        return false;
    }


    Firebase.RTDB.setInt(
        &fbdo,
        "/devices/" +
        String(deviceId) +
        "/lastSeen",
        millis()
    );


    return true;
}


/*
 * ============================================================
 * DISCONNECT HANDLING
 * ============================================================
 */

void handleFirebaseConnection() {

    if (
        WiFi.status() != WL_CONNECTED
    ) {

        firebaseReady = false;

        Serial.println(
            "[FIREBASE] Network unavailable."
        );

        return;
    }


    if (
        !Firebase.ready()
    ) {

        Serial.println(
            "[FIREBASE] Waiting for connection..."
        );

        return;
    }


    firebaseReady = true;
}
