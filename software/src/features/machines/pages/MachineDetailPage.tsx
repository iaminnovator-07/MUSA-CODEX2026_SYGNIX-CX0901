import { useMemo, type ComponentType } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Activity, Gauge, Shield, Thermometer, Radio, Zap, Wrench, Clock, ChevronDown, Cpu } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const machineProfile = {
  "demo-01": {
    name: "Machine 01",
    health: 87,
    status: "Healthy",
    temp: 33,
    vibration: 2.4,
    dist: 62,
    power: 0.82,
    condition: "Stable",
    nextInspection: "14 days",
    risk: "Low",
    sensors: "06 / 06 Active",
    timeline: [
      { time: "08:00", label: "Start-up check" },
      { time: "10:42", label: "Bearing drift increased" },
      { time: "12:15", label: "Cooling system stable" },
    ],
  },
  "demo-02": {
    name: "Machine 02",
    health: 74,
    status: "Watch",
    temp: 41,
    vibration: 4.3,
    dist: 51,
    power: 0.96,
    condition: "Elevated wear",
    nextInspection: "5 days",
    risk: "Medium",
    sensors: "06 / 06 Active",
    timeline: [
      { time: "07:20", label: "Baseline deviation" },
      { time: "09:18", label: "Temperature spike" },
      { time: "11:04", label: "Inspection recommended" },
    ],
  },
  "demo-03": {
    name: "Machine 03",
    health: 96,
    status: "Healthy",
    temp: 28,
    vibration: 1.9,
    dist: 48,
    power: 0.68,
    condition: "Excellent",
    nextInspection: "27 days",
    risk: "Low",
    sensors: "06 / 06 Active",
    timeline: [
      { time: "06:15", label: "Cooling system check" },
      { time: "10:00", label: "System stable" },
      { time: "13:30", label: "No anomalies" },
    ],
  },
} as const;

const telemetry = [
  { time: "00:00", temp: 30, vib: 2.1, power: 0.72 },
  { time: "04:00", temp: 31, vib: 2.2, power: 0.74 },
  { time: "08:00", temp: 33, vib: 2.4, power: 0.82 },
  { time: "12:00", temp: 41, vib: 4.3, power: 0.96 },
  { time: "16:00", temp: 38, vib: 3.8, power: 0.88 },
  { time: "20:00", temp: 35, vib: 2.9, power: 0.81 },
];

const MachineDetail = () => {
  const { deviceId } = useParams();
  const location = useLocation();
  const dashboardPath = location.pathname.startsWith("/demo") ? "/demo" : "/dashboard";
  const id = (deviceId && machineProfile[deviceId as keyof typeof machineProfile]) ? deviceId : "demo-01";
  const machine = machineProfile[id as keyof typeof machineProfile];

  const scoreTone = useMemo(() => {
    if (machine.health >= 85) return "text-success";
    if (machine.health >= 75) return "text-warning";
    return "text-danger";
  }, [machine.health]);

  return (
    <div className="min-h-screen bg-[#050b14] text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-[#050b14]/85 backdrop-blur-xl">
        <div className="section-container flex h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to={dashboardPath} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <img src="/hazardeye-logo.jpeg" alt="HazardEye logo" className="h-5 w-5 object-contain" />
              <span className="font-display text-[0.68rem] tracking-[0.28em] uppercase text-primary">Machine Detail</span>
            </div>
          </div>
        </div>
      </header>

      <main className="section-container py-6 md:py-8">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 text-[0.62rem] font-display tracking-[0.28em] text-primary uppercase">Machine intelligence</div>
            <h1 className="text-3xl font-bold text-white md:text-5xl">{machine.name}</h1>
          </div>
          <div className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[0.56rem] font-display tracking-[0.2em] text-primary uppercase">
            {machine.status}
          </div>
        </div>

        <div className="mb-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-[0.62rem] font-display tracking-[0.22em] text-muted-foreground uppercase">Health score</div>
                <div className="mt-2 text-4xl font-display font-bold text-white">{machine.health}/100</div>
              </div>
              <div className={`text-2xl font-display ${scoreTone}`}>{machine.risk}</div>
            </div>

            <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
              <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full border border-primary/20 bg-[radial-gradient(circle,_rgba(34,211,238,0.12),_rgba(15,23,42,0)_60%)] p-5">
                <div className="relative flex h-full w-full items-center justify-center rounded-full border border-primary/30">
                  <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(hsl(199 95% 60%) ${machine.health * 3.6}deg, rgba(148,163,184,0.1) 0deg)` }} />
                  <div className="absolute inset-[18%] rounded-full bg-[#0a1220] border border-border/80 flex flex-col items-center justify-center text-center">
                    <span className="text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">Score</span>
                    <span className="mt-1 text-3xl font-display font-bold text-white">{machine.health}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-secondary/70 p-4">
                  <div className="text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">Why this score?</div>
                  <div className="mt-3 text-sm text-foreground">Thermal load, bearing vibration, and power efficiency are the primary factors influencing this score.</div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <StatTile icon={Thermometer} label="Temperature" value={`${machine.temp}°C`} tone="text-primary" />
                  <StatTile icon={Activity} label="Vibration" value={`${machine.vibration} g`} tone="text-warning" />
                  <StatTile icon={Radio} label="Distance" value={`${machine.dist} cm`} tone="text-cyan-300" />
                  <StatTile icon={Zap} label="Power" value={`${machine.power} kW`} tone="text-success" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <div className="text-[0.62rem] font-display tracking-[0.22em] text-muted-foreground uppercase">System status</div>
              <Gauge className="h-4 w-4 text-primary" />
            </div>

            <div className="space-y-4">
              <InfoRow label="Predicted condition" value={machine.condition} />
              <InfoRow label="Next inspection" value={machine.nextInspection} />
              <InfoRow label="Sensor status" value={machine.sensors} />
              <InfoRow label="Alert history" value="02 active events" />
            </div>

            <div className="mt-5 rounded-lg border border-warning/25 bg-warning/5 p-3">
              <div className="text-[0.56rem] uppercase tracking-[0.18em] text-warning">Action</div>
              <div className="mt-2 text-sm text-foreground">Inspect bearings and review vibration trend before the next operating cycle.</div>
            </div>
          </motion.div>
        </div>

        <section className="mb-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-[0.62rem] font-display tracking-[0.22em] text-muted-foreground uppercase">Live telemetry</div>
                <h3 className="text-2xl font-bold text-white">Performance trend</h3>
              </div>
            </div>

            <div className="space-y-4">
              <TelemetryRow title="Temperature" dataKey="temp" color="hsl(199,95%,60%)" />
              <TelemetryRow title="Vibration" dataKey="vib" color="hsl(39,95%,60%)" />
              <TelemetryRow title="Power" dataKey="power" color="hsl(175,80%,52%)" />
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[0.62rem] font-display tracking-[0.22em] text-muted-foreground uppercase">Machine timeline</div>
              <Clock className="h-4 w-4 text-primary" />
            </div>

            <div className="space-y-4">
              {machine.timeline.map((entry) => (
                <div key={entry.time} className="flex gap-3 rounded-xl border border-border bg-secondary/70 p-3">
                  <div className="w-16 text-[0.56rem] uppercase tracking-[0.18em] text-muted-foreground">{entry.time}</div>
                  <div className="flex-1 text-sm text-foreground">{entry.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const StatTile = ({ icon: Icon, label, value, tone }: { icon: ComponentType<{ className?: string }>; label: string; value: string; tone: string }) => (
  <div className="rounded-lg border border-border bg-secondary/70 p-3">
    <div className="flex items-center justify-between">
      <div className={`rounded-md border border-border bg-[#0d1723] p-2 ${tone}`}><Icon className="h-4 w-4" /></div>
      <div className="text-[0.56rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
    </div>
    <div className="mt-3 text-lg font-display text-white">{value}</div>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-border bg-secondary/70 p-3">
    <div className="text-[0.56rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
    <div className="mt-2 text-white">{value}</div>
  </div>
);

const TelemetryRow = ({ title, dataKey, color }: { title: string; dataKey: keyof (typeof telemetry)[number]; color: string }) => (
  <div className="rounded-xl border border-border bg-secondary/70 p-3">
    <div className="mb-2 flex items-center justify-between">
      <div className="text-[0.62rem] font-display tracking-[0.22em] text-muted-foreground uppercase">{title}</div>
      <div className="text-[0.56rem] uppercase tracking-[0.18em] text-primary">Live</div>
    </div>
    <div className="h-28">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={telemetry}>
          <defs>
            <linearGradient id={`detail-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
          <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#detail-${dataKey})`} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default MachineDetail;
