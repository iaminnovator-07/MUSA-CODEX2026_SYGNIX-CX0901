/*
 * ============================================================
 *             HAZARDEYE TINYML INFERENCE ENGINE
 * ============================================================
 *
 * Edge AI pipeline:
 *
 * Sensors
 *    ↓
 * Feature Extraction
 *    ↓
 * TensorFlow Lite Micro Model
 *    ↓
 * On-device Inference
 *    ↓
 * Anomaly Probability
 *    ↓
 * HazardEye Decision Layer
 *
 * Target:
 *   ESP32-class edge hardware
 *
 * Model:
 *   TensorFlow Lite / TensorFlow Lite Micro
 *
 * The trained .tflite model is converted into a C/C++
 * byte array before deployment to the microcontroller.
 *
 * ============================================================
 */

#include <Arduino.h>

/*
 * TensorFlow Lite Micro headers.
 *
 * Add the TensorFlow Lite Micro library to the actual
 * firmware environment before compiling this module.
 */

#include "tensorflow/lite/micro/micro_interpreter.h"
#include "tensorflow/lite/micro/micro_mutable_op_resolver.h"
#include "tensorflow/lite/schema/schema_generated.h"


/*
 * ============================================================
 * MODEL CONFIGURATION
 * ============================================================
 */

#define TENSOR_ARENA_SIZE (60 * 1024)

uint8_t tensorArena[
    TENSOR_ARENA_SIZE
];


/*
 * Model byte array.
 *
 * Generated from the trained .tflite model.
 *
 * Example:
 *
 * #include "model.h"
 */

extern const unsigned char hazard_model_tflite[];

extern const unsigned int
    hazard_model_tflite_len;


/*
 * ============================================================
 * TFLITE OBJECTS
 * ============================================================
 */

const tflite::Model* model = nullptr;

tflite::MicroInterpreter* interpreter = nullptr;

TfLiteTensor* inputTensor = nullptr;

TfLiteTensor* outputTensor = nullptr;


/*
 * ============================================================
 * OPERATOR RESOLVER
 * ============================================================
 *
 * Only register operators required by the trained model.
 * This keeps the firmware footprint smaller.
 */

tflite::MicroMutableOpResolver<8>
    resolver;


/*
 * ============================================================
 * INITIALIZE TINYML
 * ============================================================
 */

bool initTinyML() {

    Serial.println(
        "[AI] Initializing TensorFlow Lite Micro..."
    );


    /*
     * Load model from embedded flash.
     */

    model =
        tflite::GetModel(
            hazard_model_tflite
        );


    if (
        model->version() !=
        TFLITE_SCHEMA_VERSION
    ) {

        Serial.println(
            "[AI] Model schema mismatch."
        );

        return false;
    }


    /*
     * Register model operators.
     *
     * Add only the operators actually used by
     * the trained model.
     */

    resolver.AddFullyConnected();

    resolver.AddRelu();

    resolver.AddSoftmax();


    /*
     * Create interpreter.
     */

    static tflite::MicroInterpreter
        staticInterpreter(
            model,
            resolver,
            tensorArena,
            TENSOR_ARENA_SIZE
        );


    interpreter =
        &staticInterpreter;


    /*
     * Allocate tensors.
     */

    if (
        interpreter->AllocateTensors()
        != kTfLiteOk
    ) {

        Serial.println(
            "[AI] Tensor allocation failed."
        );

        return false;
    }


    inputTensor =
        interpreter->input(0);


    outputTensor =
        interpreter->output(0);


    Serial.println(
        "[AI] TensorFlow Lite Micro ready."
    );


    return true;
}


/*
 * ============================================================
 * RUN INFERENCE
 * ============================================================
 *
 * Inputs should be normalized using exactly the same
 * preprocessing used during model training.
 */

float runAnomalyInference(
    float temperature,
    float vibration,
    float sound,
    float distance
) {

    if (
        interpreter == nullptr
    ) {

        return -1.0;
    }


    /*
     * Example feature vector.
     *
     * IMPORTANT:
     * Replace normalization with the preprocessing used
     * during actual model training.
     */

    inputTensor->data.f[0] =
        temperature;

    inputTensor->data.f[1] =
        vibration;

    inputTensor->data.f[2] =
        sound;

    inputTensor->data.f[3] =
        distance;


    /*
     * Execute neural network.
     */

    if (
        interpreter->Invoke()
        != kTfLiteOk
    ) {

        Serial.println(
            "[AI] Inference failed."
        );

        return -1.0;
    }


    /*
     * Example output:
     *
     * output[0] = NORMAL probability
     * output[1] = ANOMALY probability
     */

    float anomalyProbability =
        outputTensor->data.f[1];


    return anomalyProbability;
}


/*
 * ============================================================
 * AI STATUS
 * ============================================================
 */

const char* classifyAIResult(
    float anomalyProbability
) {

    if (
        anomalyProbability < 0
    ) {

        return "AI_ERROR";
    }


    if (
        anomalyProbability >= 0.80
    ) {

        return "CRITICAL_ANOMALY";
    }


    if (
        anomalyProbability >= 0.50
    ) {

        return "POSSIBLE_ANOMALY";
    }


    return "NORMAL";
}
