/*
 * ============================================================
 *                HAZARDEYE EDGE AI INTERFACE
 * ============================================================
 *
 * Purpose:
 *   Provide a common AI interface between the physical
 *   HazardEye node and higher-level AI services.
 *
 * Architecture:
 *
 *   ESP32 Sensors
 *        │
 *        ▼
 *   TensorFlow Lite Micro
 *        │
 *        ▼
 *   Edge AI Result
 *        │
 *        ├───────────────┐
 *        │               │
 *        ▼               ▼
 *   Local Response    AI Gateway
 *                        │
 *                        ▼
 *                  Gemma / Local LLM
 *                        │
 *                        ▼
 *                 Explanation /
 *                 Recommendations
 *
 * IMPORTANT:
 *   A full LLM such as Gemma is NOT assumed to run directly
 *   on the ESP32. The interface allows it to run on a local
 *   gateway, industrial PC, NVIDIA edge device, or server.
 *
 * ============================================================
 */

#include <Arduino.h>


/*
 * ============================================================
 * AI RESULT
 * ============================================================
 */

enum AISeverity {

    AI_NORMAL,

    AI_WARNING,

    AI_CRITICAL,

    AI_UNKNOWN
};


struct AIInferenceResult {

    float anomalyProbability;

    AISeverity severity;

    const char* primarySignal;

    bool requiresAction;
};


/*
 * ============================================================
 * AI REQUEST
 * ============================================================
 *
 * This structure can later be serialized and sent to a
 * local Gemma inference service.
 */

struct AIContext {

    float temperature;

    float vibration;

    float sound;

    float distance;

    float anomalyProbability;

    const char* machineStatus;

    const char* primarySignal;
};


/*
 * ============================================================
 * CREATE AI CONTEXT
 * ============================================================
 */

AIContext createAIContext(
    float temperature,
    float vibration,
    float sound,
    float distance,
    float anomalyProbability,
    const char* machineStatus,
    const char* primarySignal
) {

    AIContext context;


    context.temperature =
        temperature;

    context.vibration =
        vibration;

    context.sound =
        sound;

    context.distance =
        distance;

    context.anomalyProbability =
        anomalyProbability;

    context.machineStatus =
        machineStatus;

    context.primarySignal =
        primarySignal;


    return context;
}


/*
 * ============================================================
 * CLASSIFY AI RESULT
 * ============================================================
 */

AIInferenceResult classifyInference(
    float anomalyProbability,
    const char* primarySignal
) {

    AIInferenceResult result;


    result.anomalyProbability =
        anomalyProbability;


    result.primarySignal =
        primarySignal;


    if (
        anomalyProbability >= 0.80f
    ) {

        result.severity =
            AI_CRITICAL;

        result.requiresAction =
            true;

    }
    else if (
        anomalyProbability >= 0.50f
    ) {

        result.severity =
            AI_WARNING;

        result.requiresAction =
            true;

    }
    else {

        result.severity =
            AI_NORMAL;

        result.requiresAction =
            false;
    }


    return result;
}


/*
 * ============================================================
 * SEVERITY → STRING
 * ============================================================
 */

const char* severityToString(
    AISeverity severity
) {

    switch (severity) {

        case AI_NORMAL:

            return "NORMAL";


        case AI_WARNING:

            return "WARNING";


        case AI_CRITICAL:

            return "CRITICAL";


        default:

            return "UNKNOWN";
    }
}


/*
 * ============================================================
 * BUILD AI PROMPT
 * ============================================================
 *
 * This creates structured context for a future local Gemma
 * inference service.
 *
 * The ESP32 itself does not execute the LLM.
 */

String buildGemmaContext(
    const AIContext& context
) {

    String prompt;


    prompt +=
        "You are the HazardEye industrial "
        "machine monitoring assistant.\n\n";


    prompt +=
        "Analyze the following machine telemetry:\n";


    prompt +=
        "Temperature: ";

    prompt +=
        String(
            context.temperature,
            2
        );

    prompt +=
        " C\n";


    prompt +=
        "Vibration: ";

    prompt +=
        String(
            context.vibration,
            2
        );

    prompt +=
        "\n";


    prompt +=
        "Sound: ";

    prompt +=
        String(
            context.sound,
            2
        );

    prompt +=
        "\n";


    prompt +=
        "Distance: ";

    prompt +=
        String(
            context.distance,
            2
        );

    prompt +=
        " cm\n";


    prompt +=
        "Anomaly probability: ";

    prompt +=
        String(
            context.anomalyProbability * 100.0f,
            1
        );

    prompt +=
        "%\n";


    prompt +=
        "Primary signal: ";

    prompt +=
        context.primarySignal;

    prompt +=
        "\n";


    prompt +=
        "Machine status: ";

    prompt +=
        context.machineStatus;

    prompt +=
        "\n\n";


    prompt +=
        "Provide a concise explanation of the "
        "possible machine condition and the "
        "recommended operator action.";


    return prompt;
}


/*
 * ============================================================
 * DEBUG AI CONTEXT
 * ============================================================
 */

void printAIContext(
    const AIContext& context
) {

    Serial.println();

    Serial.println(
        "========== EDGE AI =========="
    );


    Serial.print(
        "Temperature : "
    );

    Serial.println(
        context.temperature
    );


    Serial.print(
        "Vibration   : "
    );

    Serial.println(
        context.vibration
    );


    Serial.print(
        "Sound       : "
    );

    Serial.println(
        context.sound
    );


    Serial.print(
        "Distance    : "
    );

    Serial.println(
        context.distance
    );


    Serial.print(
        "Anomaly     : "
    );

    Serial.print(
        context.anomalyProbability * 100.0f
    );

    Serial.println("%");


    Serial.print(
        "Signal      : "
    );

    Serial.println(
        context.primarySignal
    );


    Serial.print(
        "Status      : "
    );

    Serial.println(
        context.machineStatus
    );


    Serial.println(
        "============================="
    );
}
