import { get, onValue, ref, set, database } from "@/services/firebase";
import type { Machine } from "@/features/machines/types/machineTypes";

export const subscribeToUserMachines = (userId: string, onChange: (machines: Machine[]) => void) =>
  onValue(ref(database, "devices"), (snapshot) => {
    const data = snapshot.val() as Record<string, Machine> | null;
    const machines = data ? Object.values(data).filter((machine) => machine.user_id === userId) : [];
    onChange(machines);
  });

export const createMachine = async (userId: string, deviceName: string, deviceId: string) => {
  const cleanId = deviceId.trim().replace(/[.#$[\]]/g, "_");
  const existing = await get(ref(database, `devices/${cleanId}`));
  if (existing.exists()) throw new Error("This Device ID is already registered.");

  await set(ref(database, `devices/${cleanId}`), {
    device_name: deviceName.trim(),
    device_id: cleanId,
    user_id: userId,
    createdAt: Date.now(),
  });

  return cleanId;
};

export const removeMachine = (deviceId: string) => set(ref(database, `devices/${deviceId}`), null);
