
# 🧠 HazardEye — Edge AI Layer

HazardEye uses a **multi-layer AI architecture** designed for industrial machine monitoring.

The goal is not to push every AI workload onto the microcontroller. Instead, intelligence is distributed across the edge and higher-level AI layers depending on latency, compute and connectivity requirements.

---

## ⚡ AI Architecture

```text
                    SENSOR DATA
                         │
                         ▼
                ┌─────────────────┐
                │ Feature Pipeline │
                └────────┬────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ TensorFlow Lite     │
              │ Micro / TinyML      │
              └──────────┬──────────┘
                         │
                  Anomaly Score
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
        Local Response        AI Context
        Speaker / LED              │
                                  ▼
                         ┌─────────────────┐
                         │ Local AI Layer  │
                         │ Gemma / LLM     │
                         └────────┬────────┘
                                  │
                                  ▼
                       Explanation / Action
                                  │
                                  ▼
                         HazardEye Dashboard
````

---

## 🤖 Two-Level Intelligence

### 1. Edge AI — TensorFlow Lite Micro

The ESP32 performs lightweight inference locally.

It receives features such as:

* Temperature
* Vibration
* Sound
* Distance

The TinyML model produces an anomaly probability that can be used for immediate local decisions.

### Why Edge AI?

* Low latency
* Works with intermittent connectivity
* Reduces cloud dependency
* Enables immediate machine-side alerts
* Suitable for resource-constrained hardware

---

### 2. Higher-Level AI — Gemma / Local LLM

A larger AI model can run on a local gateway, edge computer or server rather than directly on the ESP32.

The gateway receives structured machine context such as:

```text
Temperature
Vibration
Sound
Distance
Anomaly Probability
Primary Signal
Machine Status
```

The higher-level model can then provide:

* Machine condition explanations
* Event summarization
* Operator-oriented recommendations
* Natural-language incident reports
* Contextual reasoning over telemetry

---

## 🔄 Offline-First Intelligence

HazardEye is designed around an **offline-first architecture**.

```text
Internet Available
        │
        ▼
 ESP32 → Firebase
        │
        ▼
    Dashboard


Internet Unavailable
        │
        ▼
 ESP32 → Local Processing
        │
        ▼
     SD Queue
        │
        ▼
 Connection Restored
        │
        ▼
 Firebase Synchronization
```

Critical edge processing does not depend on continuous internet connectivity.

---

## 🧩 AI Modules

```text
ai/
│
├── README.md
│
├── tinyml/
│   ├── model.h
│   ├── inference.cpp
│   └── feature_pipeline.cpp
│
└── edge_ai/
    └── ai_interface.cpp
```

### `feature_pipeline.cpp`

Converts raw sensor measurements into normalized model features.

### `inference.cpp`

Handles TensorFlow Lite Micro model initialization and inference.

### `model.h`

Defines the interface and metadata for the embedded `.tflite` model.

### `ai_interface.cpp`

Provides a common interface between edge inference and higher-level AI systems such as Gemma.

---

## 🧠 Model Development Pipeline

The intended development workflow is:

```text
Machine Telemetry
       ↓
Data Collection
       ↓
Cleaning & Labelling
       ↓
Feature Engineering
       ↓
Model Training
       ↓
Validation
       ↓
TensorFlow Lite Conversion
       ↓
Quantization / Optimization
       ↓
ESP32 Deployment
       ↓
Real-World Evaluation
```

The deployed model should be trained using machine-specific telemetry rather than relying only on generic threshold values.

---

## 🔐 Security & Deployment

AI models and device credentials are kept separate.

Never commit:

```text
Wi-Fi passwords
Firebase credentials
API keys
Private certificates
Production secrets
```

Only example configuration files should be included in the public repository.

---

## 🚧 Current Status

HazardEye is currently being developed as a prototype industrial monitoring platform.

The current architecture combines:

* ESP32 edge computing
* Multi-sensor telemetry
* TensorFlow Lite Micro integration
* Offline-first storage
* Firebase synchronization
* Local audio alerts
* Dashboard visualization
* Future local LLM/Gemma integration

The AI pipeline is designed to evolve as real machine telemetry becomes available.

---

## 🔮 Future Direction

The long-term goal is to move from simple monitoring toward **Physical AI for industrial environments**.

Future iterations can explore:

* Predictive maintenance
* Multivariate anomaly detection
* Time-series models
* TinyML on-device inference
* Local multimodal AI
* Gemma-based machine reasoning
* Edge GPU inference
* Digital twins
* Autonomous machine health assessment

> **Sense → Understand → Decide → Act**

HazardEye is being built toward that loop.


