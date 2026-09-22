# ⚡ HazardEye — Software

### Industrial Intelligence & Safety Platform

HazardEye is an **AI-powered Industrial IoT platform** designed for machine monitoring, telemetry, analytics, predictive maintenance and worker safety.

🌐 **Live Demo:** [https://machinesentinel.vercel.app/](https://machinesentinel.vercel.app/)

The software follows a **feature-based modular architecture**, keeping each major product capability independently organized and easier to extend.

```text
src/
├── app/            # Application configuration
├── assets/         # Static assets
│
├── features/
│   ├── alerts/     # Alerts & notifications
│   ├── analytics/  # Industrial analytics
│   ├── auth/       # Authentication
│   ├── dashboard/  # Monitoring dashboard
│   ├── demo/       # Demonstration workflows
│   ├── landing/    # Landing page
│   ├── machines/   # Machine monitoring
│   └── telemetry/  # Sensor telemetry
│
├── services/       # Backend & external integrations
├── shared/         # Reusable components & utilities
├── test/           # Testing
├── types/          # TypeScript types & models
│
├── index.css
└── main.tsx
```

## 🧠 System Architecture

HazardEye is designed as a complete physical-to-digital loop:

```text
Physical Environment
        ↓
Sensors / ESP32
        ↓
IoT Connectivity
        ↓
Telemetry
        ↓
Firebase / Backend
        ↓
Analytics & AI
        ↓
Dashboard
        ↓
Alerts & Human Action
```

The architecture is designed to support **IoT devices, real-time telemetry, Firebase integration, analytics and future AI-driven predictive maintenance**.

## 🔥 Current Demo Status

For the current **Round 2 demonstration**, the deployed website uses **controlled demo data** to demonstrate the complete dashboard experience and product workflows.

The reason is that the final live hardware-to-cloud pipeline requires synchronization between the **ESP32 sensor nodes and the Firebase database**.

The source code in this repository includes the **Firebase integration and database-related implementation** prepared for the live telemetry pipeline.

The next integration step is:

```text
ESP32 Sensor Node
       ↓
Sensor Data
       ↓
Firebase Realtime Database
       ↓
HazardEye Software
       ↓
Live Telemetry + Analytics + Alerts
```

This allows the software interface and backend architecture to be demonstrated while the physical IoT layer is being synchronized.

## 📴 Offline-First Direction

Industrial environments cannot always depend on continuous internet connectivity.

HazardEye is therefore being designed around an **offline-first architecture**, combining local/edge processing, IoT connectivity and cloud synchronization.

```text
Sensors
   ↓
Edge / ESP32
   ↓
Local Processing
   ↓
Connectivity
   ↓
Cloud Synchronization
   ↓
AI + Analytics
```

## 🏭 Core Capabilities

* Machine monitoring
* Real-time telemetry
* Industrial analytics
* Anomaly detection
* Predictive maintenance
* Safety alerts
* IoT device integration
* Firebase-based data synchronization
* Offline-first architecture
* Modular dashboard

## 🛠️ Technology

**Frontend:** React, TypeScript, Vite
**Backend/Data:** Firebase
**IoT:** ESP32 + sensors
**Intelligence:** AI/ML + analytics
**Architecture:** Feature-based modular system

## 🚀 Future Direction

HazardEye is part of our broader exploration of **Physical AI** — connecting intelligence with machines, sensors and the physical world.

### Sense → Understand → Predict → Respond

---

### Built by **Team SYGNIX**

**AI × IoT × Hardware × Software × Physical Systems**

> **From physical signals to intelligent decisions.**
