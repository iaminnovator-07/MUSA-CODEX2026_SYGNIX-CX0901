/*
 * ============================================================
 *              HAZARDEYE SECRETS CONFIGURATION
 * ============================================================
 *
 * This file is a SAFE TEMPLATE.
 *
 * IMPORTANT:
 *   - Never commit real credentials to GitHub.
 *   - Copy this file as `secrets.h` locally.
 *   - Add `secrets.h` to `.gitignore`.
 *
 * Required credentials:
 *   - Wi-Fi SSID
 *   - Wi-Fi password
 *   - Firebase API key
 *   - Firebase Realtime Database URL
 *
 * ============================================================
 */

#ifndef HAZARDEYE_SECRETS_EXAMPLE_H
#define HAZARDEYE_SECRETS_EXAMPLE_H


/*
 * ============================================================
 * WIFI CREDENTIALS
 * ============================================================
 */

#define WIFI_SSID \
    "YOUR_WIFI_NETWORK"

#define WIFI_PASSWORD \
    "YOUR_WIFI_PASSWORD"


/*
 * ============================================================
 * FIREBASE CONFIGURATION
 * ============================================================
 */

#define FIREBASE_API_KEY \
    "YOUR_FIREBASE_API_KEY"

#define FIREBASE_DATABASE_URL \
    "https://YOUR_PROJECT-default-rtdb.firebaseio.com/"


/*
 * ============================================================
 * FIREBASE AUTHENTICATION
 * ============================================================
 *
 * Use the authentication method configured for the
 * corresponding Firebase project.
 */

#define FIREBASE_USER_EMAIL \
    "YOUR_DEVICE_ACCOUNT_EMAIL"

#define FIREBASE_USER_PASSWORD \
    "YOUR_DEVICE_ACCOUNT_PASSWORD"


#endif
