/*
 * ============================================================
 *                  HAZARDEYE WIFI MANAGER
 * ============================================================
 *
 * Purpose:
 *   Manage Wi-Fi connectivity for the HazardEye edge node.
 *
 * Design:
 *
 *   ESP32
 *     │
 *     ├── Wi-Fi Connected
 *     │        ↓
 *     │     Firebase
 *     │
 *     └── Wi-Fi Disconnected
 *              ↓
 *        Offline Queue / SD
 *
 * Features:
 *   - Wi-Fi initialization
 *   - Connection handling
 *   - Automatic reconnection
 *   - Connection status
 *   - Signal strength monitoring
 *
 * ============================================================
 */

#include <Arduino.h>
#include <WiFi.h>


/*
 * ============================================================
 * CONFIGURATION
 * ============================================================
 *
 * Keep real credentials outside the public repository.
 */

#define WIFI_SSID       "YOUR_WIFI_SSID"
#define WIFI_PASSWORD   "YOUR_WIFI_PASSWORD"


/*
 * Connection timeout.
 */

#define WIFI_CONNECT_TIMEOUT 15000


/*
 * Reconnection interval.
 */

#define WIFI_RECONNECT_INTERVAL 10000


/*
 * ============================================================
 * STATE
 * ============================================================
 */

bool wifiReady = false;

unsigned long lastReconnectAttempt = 0;


/*
 * ============================================================
 * INITIALIZE WIFI
 * ============================================================
 */

void initWiFi() {

    Serial.println();
    Serial.println(
        "[WIFI] Initializing Wi-Fi..."
    );


    WiFi.mode(
        WIFI_STA
    );


    WiFi.setAutoReconnect(
        true
    );


    WiFi.persistent(
        false
    );


    connectWiFi();
}


/*
 * ============================================================
 * CONNECT TO NETWORK
 * ============================================================
 */

bool connectWiFi() {

    if (
        WiFi.status() == WL_CONNECTED
    ) {

        wifiReady = true;

        return true;
    }


    Serial.print(
        "[WIFI] Connecting to: "
    );

    Serial.println(
        WIFI_SSID
    );


    WiFi.begin(
        WIFI_SSID,
        WIFI_PASSWORD
    );


    unsigned long startTime =
        millis();


    while (
        WiFi.status() != WL_CONNECTED &&
        millis() - startTime <
            WIFI_CONNECT_TIMEOUT
    ) {

        delay(300);

        Serial.print(".");
    }


    Serial.println();


    if (
        WiFi.status() != WL_CONNECTED
    ) {

        wifiReady = false;


        Serial.println(
            "[WIFI] Connection failed."
        );


        return false;
    }


    wifiReady = true;


    Serial.println(
        "[WIFI] Connected."
    );


    Serial.print(
        "[WIFI] IP Address: "
    );

    Serial.println(
        WiFi.localIP()
    );


    Serial.print(
        "[WIFI] RSSI: "
    );

    Serial.print(
        WiFi.RSSI()
    );

    Serial.println(
        " dBm"
    );


    return true;
}


/*
 * ============================================================
 * CONNECTION STATUS
 * ============================================================
 */

bool isWiFiConnected() {

    return
        WiFi.status() ==
        WL_CONNECTED;
}


/*
 * ============================================================
 * WIFI RSSI
 * ============================================================
 */

int getWiFiRSSI() {

    if (
        !isWiFiConnected()
    ) {

        return -127;
    }


    return WiFi.RSSI();
}


/*
 * ============================================================
 * CONNECTION QUALITY
 * ============================================================
 */

const char* getWiFiQuality() {

    if (
        !isWiFiConnected()
    ) {

        return "OFFLINE";
    }


    int rssi =
        WiFi.RSSI();


    if (rssi >= -55) {

        return "EXCELLENT";
    }


    if (rssi >= -67) {

        return "GOOD";
    }


    if (rssi >= -75) {

        return "FAIR";
    }


    return "WEAK";
}


/*
 * ============================================================
 * AUTOMATIC RECONNECTION
 * ============================================================
 */

void maintainWiFi() {

    if (
        WiFi.status() ==
        WL_CONNECTED
    ) {

        wifiReady = true;

        return;
    }


    wifiReady = false;


    unsigned long currentTime =
        millis();


    if (
        currentTime -
        lastReconnectAttempt <
        WIFI_RECONNECT_INTERVAL
    ) {

        return;
    }


    lastReconnectAttempt =
        currentTime;


    Serial.println(
        "[WIFI] Connection lost. Reconnecting..."
    );


    WiFi.disconnect();


    connectWiFi();
}


/*
 * ============================================================
 * DISCONNECT WIFI
 * ============================================================
 */

void disconnectWiFi() {

    WiFi.disconnect(
        true
    );


    wifiReady = false;


    Serial.println(
        "[WIFI] Disconnected."
    );
}


/*
 * ============================================================
 * NETWORK DIAGNOSTICS
 * ============================================================
 */

void printWiFiDiagnostics() {

    Serial.println();

    Serial.println(
        "========== WIFI STATUS =========="
    );


    Serial.print(
        "Status  : "
    );

    Serial.println(
        isWiFiConnected()
            ? "CONNECTED"
            : "OFFLINE"
    );


    if (
        isWiFiConnected()
    ) {

        Serial.print(
            "SSID    : "
        );

        Serial.println(
            WiFi.SSID()
        );


        Serial.print(
            "IP      : "
        );

        Serial.println(
            WiFi.localIP()
        );


        Serial.print(
            "RSSI    : "
        );

        Serial.print(
            WiFi.RSSI()
        );

        Serial.println(
            " dBm"
        );


        Serial.print(
            "Quality : "
        );

        Serial.println(
            getWiFiQuality()
        );
    }


    Serial.println(
        "================================="
    );
}
