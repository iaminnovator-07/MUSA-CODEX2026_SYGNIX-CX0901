export interface SensorReading {
  temperature: number;
  vibration: number;
  distance: number;
  power?: number;
  timestamp: number;
}

export interface TelemetryPoint {
  time: string;
  value: number;
}
