import { limitToLast, onValue, orderByChild, query, ref, database } from "@/services/firebase";
import type { SensorReading } from "@/features/telemetry/types/telemetryTypes";

const normalizeTimestamp = (timestamp: number) => (timestamp < 1e12 ? timestamp * 1000 : timestamp);

export const subscribeToCurrentTelemetry = (deviceId: string, onChange: (reading: SensorReading | null) => void) =>
  onValue(ref(database, `sensorData/${deviceId}/current`), (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      onChange(null);
      return;
    }

    const timestamp = normalizeTimestamp(Number(data.timestamp) || Date.now());
    onChange({
      temperature: Number(data.temperature) || 0,
      vibration: Number(data.vibration) || 0,
      distance: Number(data.distance) || 0,
      power: Number(data.power) || 0.8,
      timestamp,
    });
  });

export const subscribeToTelemetryHistory = (deviceId: string, limit: number, onChange: (readings: SensorReading[]) => void) =>
  onValue(query(ref(database, `sensorData/${deviceId}/history`), orderByChild("timestamp"), limitToLast(limit)), (snapshot) => {
    const data = snapshot.val() as Record<string, SensorReading> | null;
    const readings = data
      ? Object.values(data).map((reading) => ({ ...reading, timestamp: normalizeTimestamp(reading.timestamp) }))
      : [];
    onChange(readings.sort((a, b) => a.timestamp - b.timestamp));
  });
