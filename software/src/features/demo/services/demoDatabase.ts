import type { DemoHistoryEntry } from "@/features/demo/types/demoTypes";

export type { DemoHistoryEntry } from "@/features/demo/types/demoTypes";

const STORAGE_KEY = "hazardeye-demo-telemetry-v1";

const readStore = (): Record<string, DemoHistoryEntry[]> => {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeStore = (store: Record<string, DemoHistoryEntry[]>) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    void 0;
  }
};

export const loadDemoHistory = (deviceId: string, since: number) => {
  return (readStore()[deviceId] ?? [])
    .filter((entry) => entry.timestamp >= since)
    .sort((a, b) => a.timestamp - b.timestamp);
};

export const saveDemoHistory = (deviceId: string, entries: DemoHistoryEntry[]) => {
  const store = readStore();
  store[deviceId] = entries.slice(-1000);
  writeStore(store);
};
