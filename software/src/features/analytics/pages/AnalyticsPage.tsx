import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, BarChart3, Clock, Cpu, Activity, Thermometer, Radio, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { subscribeToUserMachines } from "@/features/machines/services/machineService";
import { subscribeToTelemetryHistory } from "@/features/telemetry/services/telemetryService";
import type { Machine } from "@/features/machines/types/machineTypes";
import type { SensorReading } from "@/features/telemetry/types/telemetryTypes";
import { useAuth } from "@/app/providers/AuthProvider";
import { Button } from "@/shared/components/ui/button";

type Device = Machine;
type HistoryEntry = SensorReading;

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
  const [lastPacketAt, setLastPacketAt] = useState<number | null>(null);

  // Load devices
  useEffect(() => {
    if (!user) {
      setDevices([]);
      setSelectedDevice(null);
      return;
    }
    return subscribeToUserMachines(user.uid, (userDevices) => {
      setDevices(userDevices);
      setSelectedDevice((previous) => previous && userDevices.some((device) => device.device_id === previous) ? previous : userDevices[0]?.device_id ?? null);
    });
  }, [user]);

  // Load history
  useEffect(() => {
    if (!selectedDevice) return;
    const config = RANGE_CONFIG[range];

    const unsub = subscribeToTelemetryHistory(selectedDevice, config.limit, (entries) => {
      const filteredEntries = entries.filter((entry) => entry.timestamp >= Date.now() - config.ms);
      setHistoryData(filteredEntries);
      setLastPacketAt(filteredEntries.at(-1)?.timestamp ?? null);
    });
    return unsub;
  }, [selectedDevice, range]);

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

  const currentReading = historyData.at(-1);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="section-container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
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
          <div className="flex items-center gap-3"><span className="relative flex h-2 w-2"><span className="relative h-2 w-2 rounded-full bg-success" /></span><span className="text-xs text-foreground">Live machine history is active</span><span className="hidden text-[0.58rem] text-muted-foreground sm:inline">Last packet {lastPacketAt ? new Date(lastPacketAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--"}</span></div>
          <span className="text-[0.58rem] font-display tracking-[0.18em] text-primary uppercase">{devices.find((device) => device.device_id === selectedDevice)?.device_name ?? "No machine selected"}</span>
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
          <TwinAnalyticsCard icon={Thermometer} label="Current temperature" value={currentReading ? `${currentReading.temperature}°C` : "--"} tone="text-primary" />
          <TwinAnalyticsCard icon={Activity} label="Current vibration" value={currentReading ? `${currentReading.vibration} g` : "--"} tone="text-warning" />
          <TwinAnalyticsCard icon={Radio} label="Work chamber distance" value={currentReading ? `${currentReading.distance} cm` : "--"} tone="text-cyan-300" />
          <TwinAnalyticsCard icon={Zap} label="Power draw" value={currentReading ? `${currentReading.power ?? 0} kW` : "--"} tone="text-success" />
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <TwinComponentRow label="Spindle head" status={currentReading ? "Healthy" : "Awaiting data"} reading={currentReading ? `${currentReading.vibration} g vibration` : "No live reading"} />
          <TwinComponentRow label="Work chamber" status={currentReading ? "Monitored" : "Awaiting data"} reading={currentReading ? `${currentReading.temperature}°C thermal load` : "No live reading"} />
          <TwinComponentRow label="Drive unit" status={currentReading ? "Efficient" : "Awaiting data"} reading={currentReading ? `${currentReading.power ?? 0} kW power draw` : "No live reading"} />
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
