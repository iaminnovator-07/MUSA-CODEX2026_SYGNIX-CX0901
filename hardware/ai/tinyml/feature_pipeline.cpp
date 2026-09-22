/*
 * ============================================================
 *              HAZARDEYE TINYML FEATURE PIPELINE
 * ============================================================
 *
 * Purpose:
 *   Convert raw multi-sensor readings into normalized features
 *   suitable for TensorFlow Lite Micro inference.
 *
 * Pipeline:
 *
 *   Vibration ─┐
 *   Sound ─────┤
 *   Temperature ├──> Feature Vector ──> TinyML Model
 *   Distance ──┘
 *
 * IMPORTANT:
 *   The normalization parameters below are prototype values.
 *   Production values must be calculated from the same dataset
 *   used to train the deployed model.
 *
 * ============================================================
 */

#include <Arduino.h>


/*
 * ============================================================
 * FEATURE CONFIGURATION
 * ============================================================
 */

#define FEATURE_COUNT 4


/*
 * Expected operating ranges.
 *
 * These are deployment placeholders and should be replaced
 * with machine-specific calibration values.
 */

#define TEMP_MIN       0.0f
#define TEMP_MAX       100.0f

#define VIBRATION_MIN  0.0f
#define VIBRATION_MAX  100.0f

#define SOUND_MIN      0.0f
#define SOUND_MAX      100.0f

#define DISTANCE_MIN   0.0f
#define DISTANCE_MAX   400.0f


/*
 * ============================================================
 * FEATURE VECTOR
 * ============================================================
 */

struct FeatureVector {

    float values[FEATURE_COUNT];
};


/*
 * ============================================================
 * CLAMP
 * ============================================================
 */

float clampValue(
    float value,
    float minimum,
    float maximum
) {

    if (value < minimum) {

        return minimum;
    }


    if (value > maximum) {

        return maximum;
    }


    return value;
}


/*
 * ============================================================
 * MIN-MAX NORMALIZATION
 * ============================================================
 */

float normalize(
    float value,
    float minimum,
    float maximum
) {

    value =
        clampValue(
            value,
            minimum,
            maximum
        );


    if (
        maximum <= minimum
    ) {

        return 0.0f;
    }


    return
        (value - minimum) /
        (maximum - minimum);
}


/*
 * ============================================================
 * BUILD FEATURE VECTOR
 * ============================================================
 */

FeatureVector buildFeatureVector(
    float temperature,
    float vibration,
    float sound,
    float distance
) {

    FeatureVector features;


    /*
     * Temperature
     */

    features.values[0] =
        normalize(
            temperature,
            TEMP_MIN,
            TEMP_MAX
        );


    /*
     * Vibration
     */

    features.values[1] =
        normalize(
            vibration,
            VIBRATION_MIN,
            VIBRATION_MAX
        );


    /*
     * Sound
     */

    features.values[2] =
        normalize(
            sound,
            SOUND_MIN,
            SOUND_MAX
        );


    /*
     * Distance
     */

    features.values[3] =
        normalize(
            distance,
            DISTANCE_MIN,
            DISTANCE_MAX
        );


    return features;
}


/*
 * ============================================================
 * WRITE FEATURES TO TFLITE INPUT
 * ============================================================
 *
 * Keeps model-specific tensor handling outside the sensor
 * processing layer.
 */

void writeFeaturesToTensor(
    float* input,
    const FeatureVector& features
) {

    if (
        input == nullptr
    ) {

        return;
    }


    for (
        int i = 0;
        i < FEATURE_COUNT;
        i++
    ) {

        input[i] =
            features.values[i];
    }
}


/*
 * ============================================================
 * DEBUG OUTPUT
 * ============================================================
 */

void printFeatureVector(
    const FeatureVector& features
) {

    Serial.println();

    Serial.println(
        "========== AI FEATURES =========="
    );


    Serial.print(
        "Temperature : "
    );

    Serial.println(
        features.values[0],
        4
    );


    Serial.print(
        "Vibration   : "
    );

    Serial.println(
        features.values[1],
        4
    );


    Serial.print(
        "Sound       : "
    );

    Serial.println(
        features.values[2],
        4
    );


    Serial.print(
        "Distance    : "
    );

    Serial.println(
        features.values[3],
        4
    );


    Serial.println(
        "================================="
    );
}
