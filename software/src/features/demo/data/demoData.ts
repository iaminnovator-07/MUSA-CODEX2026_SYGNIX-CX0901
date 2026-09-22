import type {
  DemoDevice,
  DemoHistoryEntry,
  DemoMetricPoint,
  DemoProfile,
  DemoSensorData,
  DemoThresholds,
} from "@/features/demo/types/demoTypes";

export const defaultThresholds: DemoThresholds = { tempMax: 38, vibMax: 4, distMin: 30 };

export const demoDevices: DemoDevice[] = [
  { device_id: "demo-01", device_name: "Machine 01", user_id: "demo" },
  { device_id: "demo-02", device_name: "Machine 02", user_id: "demo" },
  { device_id: "demo-03", device_name: "Machine 03", user_id: "demo" },
];

export const demoProfiles: Record<string, DemoProfile> = {
  "demo-01": {
    health: 87,
    risk: "LOW",
    temp: 33,
    vib: 2.4,
    dist: 62,
    power: 0.82,
    condition: "Stable",
    nextInspection: "14 days",
    alertText: "Operating within normal parameters.",
  },
  "demo-02": {
    health: 74,
    risk: "MEDIUM",
    temp: 41,
    vib: 4.3,
    dist: 51,
    power: 0.96,
    condition: "Elevated wear",
    nextInspection: "5 days",
    alertText: "Vibration trend increasing above baseline.",
  },
  "demo-03": {
    health: 96,
    risk: "LOW",
    temp: 28,
    vib: 1.9,
    dist: 48,
    power: 0.68,
    condition: "Excellent",
    nextInspection: "27 days",
    alertText: "Cooling system stable and efficient.",
  },
};

export const demoSensorMap: Record<string, DemoSensorData> = {
  "demo-01": { temperature: 33, vibration: 2.4, distance: 62, power: 0.82, timestamp: Date.now() },
  "demo-02": { temperature: 41, vibration: 4.3, distance: 51, power: 0.96, timestamp: Date.now() },
  "demo-03": { temperature: 28, vibration: 1.9, distance: 48, power: 0.68, timestamp: Date.now() },
};

export const getDemoProfile = (deviceId?: string) => demoProfiles[deviceId ?? "demo-01"] ?? demoProfiles["demo-01"];

export const buildDemoHistory = (
  deviceId: string,
  range: "1h" | "24h" | "7d",
): DemoHistoryEntry[] => {
  const profile = getDemoProfile(deviceId);
  const points = range === "1h" ? 12 : range === "24h" ? 24 : 28;
  const stepMs = range === "1h" ? 5 * 60 * 1000 : range === "24h" ? 60 * 60 * 1000 : 6 * 60 * 60 * 1000;

  return Array.from({ length: points }, (_, index) => {
    const wave = Math.sin((index + 2) / 2.2);
    return {
      temperature: Number((profile.temp + wave * 3).toFixed(1)),
      vibration: Number((profile.vib + wave * 0.45 + (deviceId === "demo-02" ? index * 0.02 : 0)).toFixed(2)),
      distance: Number((profile.dist + wave * 4).toFixed(1)),
      power: Number((profile.power + wave * 0.08).toFixed(2)),
      timestamp: Date.now() - (points - index) * stepMs,
    };
  });
};

export const buildDemoSeries = (
  deviceId: string,
  metric: "temperature" | "vibration" | "distance" | "power",
): DemoMetricPoint[] => {
  const profile = getDemoProfile(deviceId);
  const base = profile[metric === "temperature" ? "temp" : metric === "vibration" ? "vib" : metric === "distance" ? "dist" : "power"];
  const range = metric === "temperature" ? 8 : metric === "vibration" ? 1.3 : metric === "distance" ? 14 : 0.32;
  const points: DemoMetricPoint[] = [];

  for (let index = 11; index >= 0; index -= 1) {
    const date = new Date(Date.now() - index * 6 * 60 * 60 * 1000);
    const wave = Math.sin((index + 2) / 2.2) * (range * 0.55);
    const drift = metric === "vibration" && deviceId === "demo-02" ? 0.9 : 0;
    const value = Math.max(0, Number((base + wave + drift).toFixed(metric === "distance" ? 1 : metric === "power" ? 2 : 1)));
    points.push({
      time: date.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
      value,
    });
  }

  return points;
};

export const buildAlertList = (profileKey: string, thresholds: DemoThresholds): string[] => {
  const profile = getDemoProfile(profileKey);
  const alerts: string[] = [];
  if (profile.temp > thresholds.tempMax) alerts.push(`⚠ Temperature ${profile.temp}°C exceeds ${thresholds.tempMax}°C`);
  if (profile.vib > thresholds.vibMax) alerts.push(`⚠ Vibration ${profile.vib}g exceeds ${thresholds.vibMax}g`);
  if (profile.dist < thresholds.distMin) alerts.push(`⚠ Distance ${profile.dist}cm below ${thresholds.distMin}cm`);
  if (alerts.length === 0) alerts.push(`✓ ${profile.alertText}`);
  return alerts;
};

export const getHealthScore = (sensor: DemoSensorData | null, thresholds: DemoThresholds) => {
  if (!sensor) return 88;
  let score = 100;
  score -= Math.max(0, sensor.temperature - thresholds.tempMax) * 1.5;
  score -= Math.max(0, sensor.vibration - thresholds.vibMax) * 12;
  score -= Math.max(0, thresholds.distMin - sensor.distance) * 0.7;
  return Math.max(60, Math.min(99, Math.round(score)));
};

export const getRiskLabel = (score: number): "LOW" | "MEDIUM" | "HIGH" => {
  if (score >= 85) return "LOW";
  if (score >= 72) return "MEDIUM";
  return "HIGH";
};
