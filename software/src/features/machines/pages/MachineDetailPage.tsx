import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Activity, ArrowLeft, Radio, Thermometer, Zap } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { subscribeToCurrentTelemetry, subscribeToTelemetryHistory } from "@/features/telemetry/services/telemetryService";
import { subscribeToUserMachines } from "@/features/machines/services/machineService";
import type { Machine } from "@/features/machines/types/machineTypes";
import type { SensorReading } from "@/features/telemetry/types/telemetryTypes";
import { useAuth } from "@/app/providers/AuthProvider";

const MachineDetail = () => {
  const { deviceId } = useParams();
  const { user } = useAuth();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [reading, setReading] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);

  useEffect(() => {
    if (!user || !deviceId) return;
    return subscribeToUserMachines(user.uid, (machines) => {
      setMachine(machines.find((item) => item.device_id === deviceId) ?? null);
    });
  }, [user, deviceId]);

  useEffect(() => {
    if (!deviceId) return;
    const unsubscribeCurrent = subscribeToCurrentTelemetry(deviceId, setReading);
    const unsubscribeHistory = subscribeToTelemetryHistory(deviceId, 120, setHistory);
    return () => {
      unsubscribeCurrent();
      unsubscribeHistory();
    };
  }, [deviceId]);

  const chartData = useMemo(() => history.map((entry) => ({
    time: new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    temperature: entry.temperature,
    vibration: entry.vibration,
    distance: entry.distance,
  })), [history]);

  if (!machine) {
    return (
      <main className="min-h-screen bg-[#050b14] px-6 py-16 text-foreground">
        <div className="mx-auto max-w-3xl">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>
          <h1 className="mt-10 text-3xl font-bold text-white">Machine unavailable</h1>
          <p className="mt-3 text-muted-foreground">This machine is not registered to the current account.</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#050b14] text-foreground">
      <header className="border-b border-border/80 bg-[#050b14]/85">
        <div className="section-container flex h-20 items-center gap-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
          <div className="h-6 w-px bg-border" />
          <span className="font-display text-[0.68rem] tracking-[0.28em] text-primary uppercase">Machine detail</span>
        </div>
      </header>

      <main className="section-container py-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="text-[0.62rem] font-display tracking-[0.28em] text-primary uppercase">Live machine telemetry</div>
            <h1 className="mt-2 text-4xl font-bold text-white">{machine.device_name}</h1>
          </div>
          <span className={`rounded-full border px-3 py-1.5 text-[0.56rem] font-display tracking-[0.2em] uppercase ${reading ? "border-success/30 text-success" : "border-warning/30 text-warning"}`}>
            {reading ? "Receiving data" : "Awaiting data"}
          </span>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <ReadingCard icon={Thermometer} label="Temperature" value={reading ? `${reading.temperature}°C` : "--"} />
          <ReadingCard icon={Activity} label="Vibration" value={reading ? `${reading.vibration} g` : "--"} />
          <ReadingCard icon={Radio} label="Distance" value={reading ? `${reading.distance} cm` : "--"} />
          <ReadingCard icon={Zap} label="Power" value={reading ? `${reading.power ?? 0} kW` : "--"} />
        </div>

        <section className="glass-card p-6">
          <div className="mb-5">
            <div className="text-[0.62rem] font-display tracking-[0.22em] text-muted-foreground uppercase">Historical readings</div>
            <h2 className="mt-2 text-2xl font-bold text-white">Performance trend</h2>
          </div>
          {chartData.length === 0 ? <p className="py-16 text-center text-sm text-muted-foreground">No historical telemetry has been received for this machine.</p> : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }} />
                  <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 15%, 22%)", borderRadius: "8px", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="temperature" stroke="hsl(199,95%,60%)" fill="hsl(199,95%,60%)" fillOpacity={0.12} />
                  <Area type="monotone" dataKey="vibration" stroke="hsl(39,95%,60%)" fill="hsl(39,95%,60%)" fillOpacity={0.12} />
                  <Area type="monotone" dataKey="distance" stroke="hsl(175,80%,52%)" fill="hsl(175,80%,52%)" fillOpacity={0.12} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

const ReadingCard = ({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) => (
  <div className="glass-card flex items-center gap-3 p-4">
    <div className="rounded-lg border border-border bg-secondary/70 p-2 text-primary"><Icon className="h-4 w-4" /></div>
    <div><div className="text-[0.56rem] uppercase tracking-[0.16em] text-muted-foreground">{label}</div><div className="mt-1 text-lg font-display text-white">{value}</div></div>
  </div>
);

export default MachineDetail;
