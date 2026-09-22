import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, BarChart3, Clock, Cpu, Activity, Thermometer, Radio, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { database, ref, onValue, query, orderByChild, limitToLast } from "@/services/firebase";
import { useAuth } from "@/app/providers/AuthProvider";
import { Button } from "@/shared/components/ui/button";
import { loadDemoHistory, saveDemoHistory, DemoHistoryEntry } from "@/features/demo/services/demoDatabase";
import type { DemoDevice } from "@/features/demo/types/demoTypes";
import { buildDemoHistory, demoDevices, getDemoProfile } from "@/features/demo/data/demoData";

type Device = DemoDevice;

type HistoryEntry = DemoHistoryEntry;

type TimeRange = "1h" | "24h" | "7d";

const RANGE_CONFIG: Record<TimeRange, { label: string; ms: number; limit: number }> = {
  "1h": { label: "Last 1 Hour", ms: 3600000, limit: 120 },
  "24h": { label: "Last 24 Hours", ms: 86400000, limit: 500 },
  "7d": { label: "Last 7 Days", ms: 604800000, limit: 1000 },
};


const Analytics = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [range, setRange] = useState<TimeRange>("1h");
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [lastPacketAt, setLastPacketAt] = useState(Date.now());

  // Load devices
  useEffect(() => {
    if (!user) {
      setDevices(demoDevices);
      setSelectedDevice((previous) => previous || "demo-01");
      setIsDemoMode(true);
      return undefined;
    }
    const unsub = onValue(ref(database, "devices"), (snap) => {
      const data = snap.val();
      if (!data) {
        setDevices(demoDevices);
        setSelectedDevice((previous) => previous || "demo-01");
        setIsDemoMode(true);
        return;
      }
      const userDevices = Object.values(data as Record<string, Device>).filter((d) => d.user_id === user.uid);
      if (userDevices.length === 0) {
        setDevices(demoDevices);
        setSelectedDevice((previous) => previous || "demo-01");
        setIsDemoMode(true);
        return;
      }
      setDevices(userDevices);
      setIsDemoMode(false);
      if (userDevices.length > 0 && !selectedDevice) setSelectedDevice(userDevices[0].device_id);
    });
    return unsub;
  }, [user]);

  // Load history
  useEffect(() => {
    if (!selectedDevice) return;
    const config = RANGE_CONFIG[range];

    if (isDemoMode || selectedDevice.startsWith("demo-")) {
      const persisted = loadDemoHistory(selectedDevice, Date.now() - config.ms);
      const seeded = persisted.length ? persisted : buildDemoHistory(selectedDevice, range);
      setHistoryData(seeded);
      saveDemoHistory(selectedDevice, seeded);
      setLastPacketAt(Date.now());

      const profile = getDemoProfile(selectedDevice);
      const stream = window.setInterval(() => {
        const wave = Math.sin(Date.now() / 4200);
        const nextEntry: HistoryEntry = {
          temperature: Number((profile.temp + wave * 3).toFixed(1)),
          vibration: Number((profile.vib + wave * 0.45 + (selectedDevice === "demo-02" ? 0.18 : 0)).toFixed(2)),
          distance: Number((profile.dist + wave * 4).toFixed(1)),
          power: Number((profile.power + wave * 0.08).toFixed(2)),
          timestamp: Date.now(),
        };

        setHistoryData((previous) => {
          const nextHistory = [...previous.slice(-(config.limit - 1)), nextEntry];
          saveDemoHistory(selectedDevice, nextHistory);
          return nextHistory;
        });
        setLastPacketAt(nextEntry.timestamp);
      }, 3000);

      return () => window.clearInterval(stream);
    }

    const histRef = query(ref(database, `sensorData/${selectedDevice}/history`), orderByChild("timestamp"), limitToLast(config.limit));

    const unsub = onValue(histRef, (snap) => {
      const data = snap.val();
      if (!data) { setHistoryData([]); return; }
      const now = Date.now();
      const entries = Object.values(data as Record<string, HistoryEntry>)
        .map((e) => ({
          ...e,
          // Normalize: if timestamp is in seconds (< 1e12), convert to ms
          timestamp: e.timestamp < 1e12 ? e.timestamp * 1000 : e.timestamp,
        }))
        .filter((e) => e.timestamp >= now - config.ms)
        .sort((a, b) => a.timestamp - b.timestamp);
      setHistoryData(entries);
      setLastPacketAt(Date.now());
    });
    return unsub;
  }, [selectedDevice, range, isDemoMode]);

  const chartData = historyData.map((e) => ({
    time: range === "7d"
      ? new Date(e.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : new Date(e.timestamp).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
    temperature: e.temperature,
    vibration: e.vibration,
    distance: e.distance,
    power: e.power ?? 0,
  }));

  // Averages
  const avg = (key: keyof HistoryEntry) => {
    if (historyData.length === 0) return "—";
    const sum = historyData.reduce((s, e) => s + (Number(e[key]) || 0), 0);
    return (sum / historyData.length).toFixed(1);
  };

  const currentProfile = getDemoProfile(selectedDevice ?? undefined);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="section-container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to={isDemoMode ? "/demo" : "/dashboard"} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Dashboard</span>
            </Link>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-2">
              <img src="/hazardeye-logo.jpeg" alt="HazardEye logo" className="h-5 w-5 object-contain" />
              <span className="font-display text-sm font-bold tracking-wider">ANALYTICS</span>
            </div>
          </div>
        </div>
      </header>

      <div className="section-container py-6">
        <div className="mb-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[0.62rem] font-display tracking-[0.28em] text-primary uppercase"><span className="h-2 w-2 rounded-full bg-primary" /> Digital twin analytics</div>
          <h1 className="text-3xl font-bold text-white md:text-4xl">Machine telemetry intelligence</h1>
          <p className="text-sm text-muted-foreground">Historical readings from the 360° twin and its monitored machine components.</p>
        </div>

        <div className="mb-6 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="flex items-center gap-3"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" /><span className="relative h-2 w-2 rounded-full bg-success" /></span><span className="text-xs text-foreground">{isDemoMode ? "Demo twin stream is active" : "Live machine history is active"}</span><span className="hidden text-[0.58rem] text-muted-foreground sm:inline">Last packet {new Date(lastPacketAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span></div>
          <span className="text-[0.58rem] font-display tracking-[0.18em] text-primary uppercase">{devices.find((device) => device.device_id === selectedDevice)?.device_name ?? "Machine 01"}</span>
        </div>
        {/* Device + Time Range Selectors */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            {devices.map((d) => (
              <button
                key={d.device_id}
                onClick={() => setSelectedDevice(d.device_id)}
                className={`px-3 py-1.5 rounded-lg font-display text-xs tracking-wider border transition-all flex items-center gap-1.5 ${
                  selectedDevice === d.device_id
                    ? "bg-primary/10 text-primary border-primary/40"
                    : "bg-secondary text-muted-foreground border-border hover:border-muted-foreground"
                }`}
              >
                <Cpu className="w-3 h-3" /> {d.device_name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(Object.keys(RANGE_CONFIG) as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg font-display text-xs tracking-wider border transition-all flex items-center gap-1.5 ${
                  range === r ? "bg-primary/10 text-primary border-primary/40" : "bg-secondary text-muted-foreground border-border hover:border-muted-foreground"
                }`}
              >
                <Clock className="w-3 h-3" /> {RANGE_CONFIG[r].label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 text-center">
            <p className="text-xs text-muted-foreground font-display tracking-wider mb-1">AVG TEMPERATURE</p>
            <p className="text-2xl font-display font-bold text-foreground">{avg("temperature")}°C</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-5 text-center">
            <p className="text-xs text-muted-foreground font-display tracking-wider mb-1">AVG VIBRATION</p>
            <p className="text-2xl font-display font-bold text-foreground">{avg("vibration")} g</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 text-center">
            <p className="text-xs text-muted-foreground font-display tracking-wider mb-1">AVG DISTANCE</p>
            <p className="text-2xl font-display font-bold text-foreground">{avg("distance")} cm</p>
          </motion.div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <TwinAnalyticsCard icon={Thermometer} label="Current temperature" value={`${currentProfile.temp}°C`} tone="text-primary" />
          <TwinAnalyticsCard icon={Activity} label="Current vibration" value={`${currentProfile.vib} g`} tone="text-warning" />
          <TwinAnalyticsCard icon={Radio} label="Work chamber distance" value={`${currentProfile.dist} cm`} tone="text-cyan-300" />
          <TwinAnalyticsCard icon={Zap} label="Power draw" value={`${currentProfile.power} kW`} tone="text-success" />
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <TwinComponentRow label="Spindle head" status="Healthy" reading={`${currentProfile.vib} g vibration`} />
          <TwinComponentRow label="Work chamber" status="Monitored" reading={`${currentProfile.temp}°C thermal load`} />
          <TwinComponentRow label="Drive unit" status="Efficient" reading={`${currentProfile.power} kW power draw`} />
        </div>

        {historyData.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold text-foreground mb-2">No Historical Data</h3>
            <p className="text-sm text-muted-foreground">
              Your ESP32 should push data to <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-[11px]">/sensorData/{selectedDevice}/history</code>
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnalyticsChart title="Temperature (°C)" data={chartData} dataKey="temperature" color="hsl(0, 84%, 60%)" />
            <AnalyticsChart title="Vibration (g)" data={chartData} dataKey="vibration" color="hsl(38, 92%, 50%)" />
            <AnalyticsChart title="Distance (cm)" data={chartData} dataKey="distance" color="hsl(45, 96%, 53%)" />
          </div>
        )}
      </div>
    </div>
  );
};

const AnalyticsChart = ({ title, data, dataKey, color }: { title: string; data: Array<Record<string, string | number>>; dataKey: string; color: string }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
    <h3 className="font-display text-xs font-bold tracking-wider text-muted-foreground mb-4">{title.toUpperCase()}</h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`ag-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }} />
          <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 15%, 22%)", borderRadius: "8px", fontSize: "12px" }} />
          <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#ag-${dataKey})`} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

const TwinAnalyticsCard = ({ icon: Icon, label, value, tone }: { icon: typeof Activity; label: string; value: string; tone: string }) => (
  <div className="glass-card flex items-center gap-3 p-4">
    <div className={`rounded-lg border border-border bg-secondary/70 p-2 ${tone}`}><Icon className="h-4 w-4" /></div>
    <div><div className="text-[0.56rem] uppercase tracking-[0.16em] text-muted-foreground">{label}</div><div className="mt-1 text-lg font-display text-white">{value}</div></div>
  </div>
);

const TwinComponentRow = ({ label, status, reading }: { label: string; status: string; reading: string }) => (
  <div className="glass-card flex items-center justify-between p-4">
    <div><div className="text-[0.62rem] font-display tracking-[0.2em] text-muted-foreground uppercase">{label}</div><div className="mt-1 text-sm text-white">{reading}</div></div>
    <div className="text-[0.56rem] font-display tracking-[0.18em] text-success uppercase">{status}</div>
  </div>
);

export default Analytics;
