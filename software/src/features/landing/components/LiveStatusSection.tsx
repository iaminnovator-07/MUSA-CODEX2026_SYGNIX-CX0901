import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wifi, WifiOff, Cpu, Clock, Thermometer, Activity, Radio, ShieldCheck } from "lucide-react";
import { database, ref, onValue } from "@/services/firebase";
import { useAuth } from "@/app/providers/AuthProvider";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";

interface Device {
  device_id: string;
  device_name: string;
  user_id: string;
}

interface DeviceStatus {
  device: Device;
  isOnline: boolean;
  lastSeen: number | null;
  temperature?: number;
  vibration?: number;
  distance?: number;
}

const OFFLINE_TIMEOUT = 60000;

const demoStatuses: DeviceStatus[] = [
  {
    device: { device_id: "HX-03", device_name: "Machine 03", user_id: "demo" },
    isOnline: true,
    lastSeen: Date.now() - 12000,
    temperature: 41,
    vibration: 3.6,
    distance: 48,
  },
  {
    device: { device_id: "HX-02", device_name: "Machine 02", user_id: "demo" },
    isOnline: true,
    lastSeen: Date.now() - 18000,
    temperature: 45,
    vibration: 4.4,
    distance: 52,
  },
  {
    device: { device_id: "HX-01", device_name: "Machine 01", user_id: "demo" },
    isOnline: true,
    lastSeen: Date.now() - 9000,
    temperature: 33,
    vibration: 2.5,
    distance: 61,
  },
];

const LiveStatusSection = () => {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<DeviceStatus[]>(demoStatuses);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setStatuses(demoStatuses);
      setLoading(false);
      return;
    }

    const unsub = onValue(ref(database, "devices"), (snap) => {
      const data = snap.val();
      if (!data) {
        setStatuses([]);
        setLoading(false);
        return;
      }
      const userDevices = Object.values(data as Record<string, Device>).filter(
        (d) => d.user_id === user.uid
      );

      const unsubSensors: (() => void)[] = [];
      const statusMap = new Map<string, DeviceStatus>();

      userDevices.forEach((device) => {
        statusMap.set(device.device_id, {
          device,
          isOnline: false,
          lastSeen: null,
        });

        const sensorUnsub = onValue(
          ref(database, `sensorData/${device.device_id}/current`),
          (sSnap) => {
            const sData = sSnap.val();
            const now = Date.now();
            const rawTs = sData?.timestamp || null;
            const ts = rawTs ? (rawTs < 1e12 ? rawTs * 1000 : rawTs) : null;
            statusMap.set(device.device_id, {
              device,
              isOnline: ts ? now - ts < OFFLINE_TIMEOUT : false,
              lastSeen: ts,
              temperature: sData?.temperature,
              vibration: sData?.vibration,
              distance: sData?.distance,
            });
            setStatuses(Array.from(statusMap.values()));
            setLoading(false);
          }
        );
        unsubSensors.push(sensorUnsub);
      });

      if (userDevices.length === 0) setLoading(false);

      return () => unsubSensors.forEach((u) => u());
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatuses((prev) =>
        prev.map((s) => ({
          ...s,
          isOnline: s.lastSeen ? Date.now() - s.lastSeen < OFFLINE_TIMEOUT : false,
        }))
      );
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const displayStatuses = statuses.length ? statuses : demoStatuses;
  const onlineCount = displayStatuses.filter((s) => s.isOnline).length;
  const offlineCount = displayStatuses.length - onlineCount;

  return (
    <section className="relative py-16">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            </span>
            <span className="text-xs font-display tracking-[0.2em] text-muted-foreground uppercase">
              Live Status
            </span>
          </div>
          <h2 className="mb-3 text-3xl font-bold md:text-5xl gradient-text">
            {user ? "Your devices" : "DEMO DATA"}
          </h2>
          <div className="flex items-center justify-center gap-6 text-sm">
            <span className="flex items-center gap-1.5 text-success">
              <Wifi className="h-4 w-4" /> {onlineCount} Online
            </span>
            <span className="flex items-center gap-1.5 text-danger">
              <WifiOff className="h-4 w-4" /> {offlineCount} Offline
            </span>
          </div>
        </motion.div>

        <div className="mx-auto mb-8 grid max-w-5xl gap-4 px-2 sm:grid-cols-2 sm:px-0 lg:grid-cols-3">
          {displayStatuses.map((s, i) => (
            <motion.div
              key={s.device.device_id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card border p-5 ${s.isOnline ? "border-success/30" : "border-danger/30"}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`rounded-lg p-2 ${s.isOnline ? "bg-success/10" : "bg-danger/10"}`}>
                    <Cpu className={`h-4 w-4 ${s.isOnline ? "text-success" : "text-danger"}`} />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-foreground">{s.device.device_name}</h3>
                    <p className="font-mono text-[10px] text-muted-foreground">{s.device.device_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {s.isOnline ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                      </span>
                      <span className="text-[10px] font-display tracking-[0.18em] text-success">ONLINE</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-danger" />
                      <span className="text-[10px] font-display tracking-[0.18em] text-danger">OFFLINE</span>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-3 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-muted/50 p-2 text-center">
                  <Thermometer className="mx-auto mb-1 h-3 w-3 text-primary" />
                  <p className="text-xs font-bold text-foreground">{s.temperature != null ? `${s.temperature}°C` : "—"}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2 text-center">
                  <Activity className="mx-auto mb-1 h-3 w-3 text-warning" />
                  <p className="text-xs font-bold text-foreground">{s.vibration != null ? `${s.vibration}g` : "—"}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2 text-center">
                  <Radio className="mx-auto mb-1 h-3 w-3 text-primary" />
                  <p className="text-xs font-bold text-foreground">{s.distance != null ? `${s.distance}cm` : "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                {s.lastSeen ? `Last seen: ${new Date(s.lastSeen).toLocaleTimeString()}` : "No data received yet"}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-[10px] font-display tracking-[0.22em] text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            DEMO DATA
          </div>
          <Link to="/demo">
            <Button variant="outline" className="font-display text-[10px] tracking-[0.22em]">
              OPEN FULL DASHBOARD →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LiveStatusSection;
