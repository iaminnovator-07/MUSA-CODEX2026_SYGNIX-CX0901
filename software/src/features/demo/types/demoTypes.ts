export interface DemoDevice {
  device_id: string;
  device_name: string;
  user_id: string;
}

export interface DemoSensorData {
  temperature: number;
  vibration: number;
  distance: number;
  power?: number;
  timestamp: number;
}

export interface DemoThresholds {
  tempMax: number;
  vibMax: number;
  distMin: number;
}

export interface DemoMetricPoint {
  time: string;
  value: number;
}

export interface DemoProfile {
  health: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  temp: number;
  vib: number;
  dist: number;
  power: number;
  condition: string;
  nextInspection: string;
  alertText: string;
}

export interface DemoHistoryEntry {
  temperature: number;
  vibration: number;
  distance: number;
  power?: number;
  timestamp: number;
}
