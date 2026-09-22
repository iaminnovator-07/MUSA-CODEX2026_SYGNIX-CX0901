/*
 * ============================================================
 *                  HAZARDEYE TINYML MODEL
 * ============================================================
 *
 * TensorFlow Lite Micro model interface.
 *
 * Training:
 *     Dataset → TensorFlow → .tflite
 *
 * Deployment:
 *     .tflite → C array → model.h → ESP32 Flash
 *
 * The actual generated model array should be produced using:
 *
 *     xxd -i hazard_model.tflite > model.h
 *
 * or an equivalent binary-to-C-array conversion tool.
 *
 * ============================================================
 */

#ifndef HAZARDEYE_TINYML_MODEL_H
#define HAZARDEYE_TINYML_MODEL_H


/*
 * ============================================================
 * MODEL METADATA
 * ============================================================
 */

#define HAZARDEYE_MODEL_NAME \
    "HazardEye Machine Anomaly Model"

#define HAZARDEYE_MODEL_VERSION \
    "0.1.0"

#define HAZARDEYE_MODEL_INPUTS \
    4

#define HAZARDEYE_MODEL_OUTPUTS \
    2


/*
 * ============================================================
 * INPUT FEATURES
 * ============================================================
 *
 * Feature order MUST remain identical to the order used
 * during model training.
 *
 * [0] Temperature
 * [1] Vibration
 * [2] Sound
 * [3] Distance
 */

enum HazardEyeFeature {

    FEATURE_TEMPERATURE = 0,

    FEATURE_VIBRATION = 1,

    FEATURE_SOUND = 2,

    FEATURE_DISTANCE = 3
};


/*
 * ============================================================
 * MODEL OUTPUTS
 * ============================================================
 *
 * Example:
 *
 * [0] Normal probability
 * [1] Anomaly probability
 */

enum HazardEyeOutput {

    OUTPUT_NORMAL = 0,

    OUTPUT_ANOMALY = 1
};


/*
 * ============================================================
 * EMBEDDED MODEL
 * ============================================================
 *
 * The generated TensorFlow Lite model should define these
 * symbols.
 *
 * Do NOT manually type a fake model here.
 */

extern const unsigned char
    hazard_model_tflite[];

extern const unsigned int
    hazard_model_tflite_len;


/*
 * ============================================================
 * MODEL INFORMATION
 * ============================================================
 */

struct HazardEyeModelInfo {

    const char* name;

    const char* version;

    unsigned int inputCount;

    unsigned int outputCount;

    unsigned int modelSize;
};


/*
 * ============================================================
 * MODEL METADATA INSTANCE
 * ============================================================
 */

static const HazardEyeModelInfo
    hazardEyeModelInfo = {

        HAZARDEYE_MODEL_NAME,

        HAZARDEYE_MODEL_VERSION,

        HAZARDEYE_MODEL_INPUTS,

        HAZARDEYE_MODEL_OUTPUTS,

        hazard_model_tflite_len
    };


#endif
