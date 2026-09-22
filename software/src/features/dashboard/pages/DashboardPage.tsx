import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, Clock, LogOut, Cpu, Bell, Gauge, Wrench, Zap, Sparkles,
  ChevronRight, Radar, Activity, AlertTriangle, Rotate3D
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { database, ref, onValue, set } from "@/services/firebase";
import { useAuth } from "@/app/providers/AuthProvider";
import { Button } from "@/shared/components/ui/button";
import AddDeviceDialog from "@/features/machines/components/AddDeviceDialog";
import { useToast } from "@/shared/hooks/use-toast";
import type { DemoDevice, DemoMetricPoint, DemoSensorData, DemoThresholds } from "@/features/demo/types/demoTypes";
import {
  buildAlertList,
  buildDemoSeries,
  defaultThresholds,
  demoDevices,
  demoProfiles,
  demoSensorMap,
  getHealthScore,
  getRiskLabel,
} from "@/features/demo/data/demoData";

type Device = DemoDevice;
type SensorData = DemoSensorData;
type Thresholds = DemoThresholds;
type MetricPoint = DemoMetricPoint;

const OFFLINE_TIMEOUT = 60000;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [devices, setDevices] = useState<Device[]>(demoDevices);
  const [selectedDevice, setSelectedDevice] = useState<string | null>("demo-01");
  const [sensorData, setSensorData] = useState<SensorData | null>(demoSensorMap["demo-01"]);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSeen, setLastSeen] = useState<number | null>(Date.now());
  const [thresholds, setThresholds] = useState<Thresholds>(defaultThresholds);
  const [alerts, setAlerts] = useState<string[]>(buildAlertList("demo-01", defaultThresholds));
  const [distData, setDistData] = useState<MetricPoint[]>(buildDemoSeries("demo-01", "distance"));
  const [vibData, setVibData] = useState<MetricPoint[]>(buildDemoSeries("demo-02", "vibration"));
  const [tempData, setTempData] = useState<MetricPoint[]>(buildDemoSeries("demo-01", "temperature"));
  const [powerData, setPowerData] = useState<MetricPoint[]>(buildDemoSeries("demo-01", "power"));
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [selectedTwinNode, setSelectedTwinNode] = useState("Spindle head");
  const [twinRotation, setTwinRotation] = useState(0);
  const twinDragStart = useRef<number | null>(null);

  const loadDevices = useCallback(() => {
    if (!user) {
      setDevices(demoDevices);
      setSelectedDevice((prev) => prev || "demo-01");
      setIsDemoMode(true);
      return undefined;
    }

    const unsub = onValue(ref(database, "devices"), (snap) => {
      const data = snap.val();
      if (!data) {
        setDevices(demoDevices);
        setSelectedDevice((prev) => prev || "demo-01");
        setIsDemoMode(true);
        return;
      }

      const userDevices = Object.values(data as Record<string, Device>).filter((d) => d.user_id === user.uid);
      if (userDevices.length === 0) {
        setDevices(demoDevices);
        setSelectedDevice((prev) => prev || "demo-01");
        setIsDemoMode(true);
        return;
      }

      setDevices(userDevices);
      setIsDemoMode(false);
      if (!selectedDevice) setSelectedDevice(userDevices[0].device_id);
    });
    return unsub;
  }, [user, selectedDevice]);

  useEffect(() => {
    const unsub = loadDevices();
    return () => unsub?.();
  }, [loadDevices]);

  useEffect(() => {
    if (!user || !selectedDevice) return;
    const unsub = onValue(ref(database, `alertSettings/${user.uid}/${selectedDevice}`), (snap) => {
      if (snap.exists()) setThresholds(snap.val());
      else setThresholds(defaultThresholds);
    });
    return unsub;
  }, [user, selectedDevice]);

  useEffect(() => {
    if (!selectedDevice) return;
    setDistData([]);
    setVibData([]);
    setTempData([]);
    setPowerData([]);
    setSensorData(null);

    if (isDemoMode || selectedDevice.startsWith("demo-")) {
      const demoData = demoSensorMap[selectedDevice] ?? demoSensorMap["demo-01"];
      const ts = demoData.timestamp || Date.now();
      setLastSeen(ts);
      setIsOnline(true);
      setSensorData(demoData);

      const profile = demoProfiles[selectedDevice] ?? demoProfiles["demo-01"];
      setDistData(buildDemoSeries(selectedDevice, "distance"));
      setVibData(buildDemoSeries(selectedDevice, "vibration"));
      setTempData(buildDemoSeries(selectedDevice, "temperature"));
      setPowerData(buildDemoSeries(selectedDevice, "power"));

      const nextAlerts = buildAlertList(selectedDevice, thresholds);
      setAlerts(nextAlerts);

      if (profile.health < 80) setAlerts((prev) => [...new Set([...prev, `⚠ ${profile.condition} condition on ${demoDevices.find((d) => d.device_id === selectedDevice)?.device_name || "machine"}.`])]);
      return;
    }

    const unsub = onValue(ref(database, `sensorData/${selectedDevice}/current`), (snap) => {
      const data = snap.val();
      if (!data) {
        setIsOnline(false);
        return;
      }

      const now = Date.now();
      const rawTs = data.timestamp || now;
      const ts = rawTs < 1e12 ? rawTs * 1000 : rawTs;
      setLastSeen(ts);
      setIsOnline(now - ts < OFFLINE_TIMEOUT);

      const sd: SensorData = {
        temperature: Number(data.temperature) || 0,
        vibration: Number(data.vibration) || 0,
        distance: Number(data.distance) || 0,
        power: Number(data.power) || 0.8,
        timestamp: ts,
      };
      setSensorData(sd);
      setTempData((prev) => [...prev.slice(-29), { time: new Date(ts).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }), value: sd.temperature }]);
      setVibData((prev) => [...prev.slice(-29), { time: new Date(ts).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }), value: sd.vibration }]);
      setDistData((prev) => [...prev.slice(-29), { time: new Date(ts).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }), value: sd.distance }]);
      setPowerData((prev) => [...prev.slice(-29), { time: new Date(ts).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }), value: sd.power ?? 0.8 }]);

      const nextAlerts: string[] = [];
      if (sd.temperature > thresholds.tempMax) nextAlerts.push(`🌡️ Temperature ${sd.temperature}°C exceeds ${thresholds.tempMax}°C`);
      if (sd.vibration > thresholds.vibMax) nextAlerts.push(`📳 Vibration ${sd.vibration}g exceeds ${thresholds.vibMax}g`);
      if (sd.distance < thresholds.distMin && sd.distance > 0) nextAlerts.push(`📏 Distance ${sd.distance}cm below ${thresholds.distMin}cm`);
      setAlerts(nextAlerts.length ? nextAlerts : [`✓ ${selectedDevice} operating within normal parameters.`]);
    });

    return unsub;
  }, [selectedDevice, thresholds, isDemoMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastSeen) setIsOnline(Date.now() - lastSeen < OFFLINE_TIMEOUT);
    }, 10000);
    return () => clearInterval(interval);
  }, [lastSeen]);

  const deleteDevice = async (deviceId: string) => {
    if (!confirm("Remove this device?")) return;
    await set(ref(database, `devices/${deviceId}`), null);
    if (selectedDevice === deviceId) setSelectedDevice(devices.find((d) => d.device_id !== deviceId)?.device_id || null);
    toast({ title: "Device Removed" });
  };

  const currentDevice = devices.find((d) => d.device_id === selectedDevice);
  const currentProfile = demoProfiles[selectedDevice ?? "demo-01"] ?? demoProfiles["demo-01"];
  const liveHealth = useMemo(() => getHealthScore(sensorData, thresholds), [sensorData, thresholds]);
  const healthRisk = getRiskLabel(liveHealth);
  const twinNodes = [
    { label: "Spindle head", area: "Precision drive", status: "Healthy", value: `${sensorData?.vibration ?? currentProfile.vib} g`, className: "left-[46%] top-[22%]" },
    { label: "Work chamber", area: "Enclosed cutting zone", status: "Monitored", value: `${sensorData?.temperature ?? currentProfile.temp}°C`, className: "left-[44%] top-[48%]" },
    { label: "Machine table", area: "Workholding surface", status: "Healthy", value: `${sensorData?.distance ?? currentProfile.dist} cm`, className: "left-[47%] top-[72%]" },
    { label: "Drive unit", area: "Base power module", status: "Efficient", value: `${sensorData?.power ?? currentProfile.power} kW`, className: "left-[25%] top-[82%]" },
    { label: "Control station", area: "Operator interface", status: "Connected", value: "Online", className: "left-[82%] top-[48%]" },
  ];
  const activeTwinNode = twinNodes.find((node) => node.label === selectedTwinNode) ?? twinNodes[0];

  const handleTwinPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    twinDragStart.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleTwinPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (twinDragStart.current === null) return;
    const delta = event.clientX - twinDragStart.current;
    if (Math.abs(delta) < 2) return;
    setTwinRotation((current) => (current + delta * 0.7 + 360) % 360);
    twinDragStart.current = event.clientX;
  };

  const handleTwinPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    twinDragStart.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const navItems = ["Overview", "Machines", "Digital Twin", "Predictive Analytics", "Energy", "Alerts", "Maintenance", "Reports"];
  const navTargets: Record<string, string> = {
    Overview: "overview",
    Machines: "machines",
    "Digital Twin": "digital-twin",
    "Predictive Analytics": "predictive-analytics",
    Energy: "energy",
    Alerts: "alerts",
    Maintenance: "maintenance",
  };
  const [activeNav, setActiveNav] = useState("Overview");

  const handleNavClick = (item: string) => {
    const target = navTargets[item];
    if (!target) return;
    setActiveNav(item);
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-[#050b14]/85 backdrop-blur-xl">
        <div className="section-container flex h-20 items-center gap-4 xl:gap-6">
          <div className="flex shrink-0 items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/35 bg-primary/10 text-primary shadow-[0_0_0_1px_rgba(56,189,248,0.15)]">
                <img src="/hazardeye-logo.jpeg" alt="HazardEye logo" className="h-5 w-5 object-contain" />
              </div>
              <div>
                <div className="font-display text-[0.68rem] tracking-[0.32em] text-primary">HAZARDEYE</div>
                <div className="text-[0.52rem] tracking-[0.28em] text-muted-foreground">MACHINESENTINEL</div>
              </div>
            </div>
          </div>

          <nav className="hidden min-w-0 flex-1 items-center justify-start gap-3 overflow-x-auto overflow-y-hidden lg:flex xl:gap-5">
            {navItems.map((item) => item === "Reports" ? (
              <Link key={item} to={isDemoMode ? "/demo/analytics" : "/analytics"} className="shrink-0 whitespace-nowrap text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground xl:text-[0.65rem]">
                {item}
              </Link>
            ) : (
              <button key={item} onClick={() => handleNavClick(item)} className={`relative shrink-0 whitespace-nowrap text-[0.6rem] font-medium uppercase tracking-[0.14em] transition-colors hover:text-foreground xl:text-[0.65rem] ${activeNav === item ? "text-primary" : "text-muted-foreground"}`}>
                {item}
                {activeNav === item && <span className="absolute -bottom-[1.55rem] left-1/2 h-px w-5 -translate-x-1/2 bg-primary" />}
              </button>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 xl:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1.5 2xl:flex">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="whitespace-nowrap text-[0.56rem] font-display tracking-[0.16em] text-primary">SYSTEM STATUS: OPERATIONAL</span>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-border bg-card/60 px-2.5 py-1.5 text-[0.56rem] text-muted-foreground 2xl:flex">
              <Clock className="h-3 w-3 text-primary" />
              <span className="whitespace-nowrap">Last sync {new Date(lastSeen ?? Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <Link to={isDemoMode ? "/demo/analytics" : "/analytics"} className="whitespace-nowrap text-[0.65rem] text-muted-foreground hover:text-primary">Analytics</Link>
            <div className="h-5 w-px bg-border" />
            <span className="hidden max-w-[100px] truncate text-[0.65rem] text-muted-foreground 2xl:inline">{user?.displayName || user?.email}</span>
            <Button variant="ghost" size="icon" onClick={logout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main id="overview" className="section-container py-6 md:py-8">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[0.62rem] font-display tracking-[0.32em] text-primary uppercase">
              <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
              industrial intelligence
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">Industrial Intelligence Command Center</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">Real-time machine health, safety and operational intelligence.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-[0.56rem] font-display tracking-[0.22em] text-primary">{isDemoMode ? "DEMO DATA" : "LIVE DATA"}</span>
            {!isDemoMode && <AddDeviceDialog onDeviceAdded={() => {}} />}
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <QuadStat label="FACILITY HEALTH" value="92 / 100" accent="text-primary" />
          <QuadStat label="MACHINES ONLINE" value="03 / 03" accent="text-success" />
          <QuadStat label="ACTIVE ALERTS" value="02" accent="text-warning" />
          <QuadStat label="ENERGY TODAY" value="18.4 kWh" accent="text-cyan-300" />
        </div>

        <div className="mb-8 grid gap-6 xl:grid-cols-[1.5fr_0.7fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-2 text-[0.62rem] font-display tracking-[0.28em] text-muted-foreground uppercase">Selected machine</div>
                <h2 className="text-2xl font-bold text-white md:text-3xl">{currentDevice?.device_name || "Machine 01"}</h2>
              </div>
              <div className="rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[0.6rem] font-display tracking-[0.18em] text-success">
                {isOnline ? "ONLINE" : "OFFLINE"}
              </div>
            </div>

            <div className="mb-8 grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center">
              <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full border border-primary/20 bg-[radial-gradient(circle,_rgba(34,211,238,0.12),_rgba(15,23,42,0)_60%)] p-5 shadow-[0_0_30px_rgba(34,211,238,0.14)]">
                <div className="relative flex h-full w-full items-center justify-center rounded-full border border-primary/30">
                  <div className="absolute inset-4 rounded-full border border-dashed border-primary/20" />
                  <div className="absolute inset-7 rounded-full border border-primary/10" />
                  <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(hsl(199 95% 60%) ${liveHealth * 3.6}deg, rgba(148,163,184,0.1) 0deg)` }} />
                  <div className="absolute inset-[18%] rounded-full bg-[#0a1220] border border-border/80 flex flex-col items-center justify-center text-center">
                    <span className="text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">Health score</span>
                    <span className="mt-1 text-3xl font-display font-bold text-white">{liveHealth}</span>
                    <span className="text-[0.58rem] uppercase tracking-[0.2em] text-primary">/100</span>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="text-[0.62rem] font-display tracking-[0.22em] text-muted-foreground uppercase">Condition</div>
                  <div className="mt-2 text-3xl font-display font-bold text-white">{healthRisk === "LOW" ? "Healthy" : healthRisk === "MEDIUM" ? "Watch" : "Critical"}</div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <MetricRow label="Temperature" value={`${sensorData?.temperature ?? currentProfile.temp}°C`} status="Normal" />
                  <MetricRow label="Vibration" value={`${sensorData?.vibration ?? currentProfile.vib} g`} status={sensorData && sensorData.vibration > thresholds.vibMax ? "Elevated" : "Normal"} />
                  <MetricRow label="Distance" value={`${sensorData?.distance ?? currentProfile.dist} cm`} status="Normal" />
                  <MetricRow label="Power" value={`${sensorData?.power ?? currentProfile.power} kW`} status="Efficient" />
                </div>

                <div className="rounded-lg border border-border bg-secondary/50 p-3">
                  <div className="text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground">Predicted condition</div>
                  <div className="mt-2 text-base text-white">{currentProfile.condition}</div>
                  <div className="mt-3 text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">Next recommended inspection</div>
                  <div className="mt-1 text-sm text-primary">{currentProfile.nextInspection}</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <div className="text-[0.62rem] font-display tracking-[0.22em] text-muted-foreground uppercase">AI safety insights</div>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>

            <div className="space-y-3">
              <InsightRow tone="ok">Machine 01 operating within normal parameters.</InsightRow>
              <InsightRow tone={currentProfile.risk === "MEDIUM" ? "warn" : "ok"}>Machine 02 vibration increased 18% over baseline.</InsightRow>
              <InsightRow tone="ok">No critical thermal anomalies detected.</InsightRow>
              <InsightRow tone="ok">Energy consumption is within expected operating range.</InsightRow>
            </div>

            <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-3 text-[0.58rem] font-display tracking-[0.18em] text-primary uppercase">
              Continuous analysis enabled
            </div>
          </motion.div>
        </div>

        <section id="machines" className="mb-8 scroll-mt-28">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[0.62rem] font-display tracking-[0.22em] text-muted-foreground uppercase">Machine overview</div>
              <h3 className="text-2xl font-bold text-white">Fleet health</h3>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {devices.map((machine) => {
              const profile = demoProfiles[machine.device_id] ?? demoProfiles["demo-01"];
              const score = machine.device_id.startsWith("demo-") ? profile.health : liveHealth;
              const risk = getRiskLabel(score);
              const status = isOnline ? "ONLINE" : "OFFLINE";

              return (
                <motion.div key={machine.device_id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-card-hover p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="font-display text-[0.62rem] tracking-[0.22em] text-muted-foreground uppercase">{machine.device_name}</div>
                      <div className="mt-1 flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-success">
                        <span className="h-2 w-2 rounded-full bg-success" />
                        {status}
                      </div>
                    </div>
                    <div className="rounded-full border border-border bg-secondary/70 px-2 py-1 text-[0.56rem] font-display tracking-[0.18em] text-muted-foreground">{score}%</div>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <div>
                      <div className="text-[0.56rem] uppercase tracking-[0.18em] text-muted-foreground">Health</div>
                      <div className="mt-1 text-lg font-display text-white">{score}%</div>
                    </div>
                    <div>
                      <div className="text-[0.56rem] uppercase tracking-[0.18em] text-muted-foreground">Risk</div>
                      <div className={`mt-1 text-lg font-display ${risk === "LOW" ? "text-success" : risk === "MEDIUM" ? "text-warning" : "text-danger"}`}>{risk}</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between border-b border-border/70 pb-2"><span>Temp</span><span className="text-white">{profile.temp}°C</span></div>
                    <div className="flex items-center justify-between border-b border-border/70 pb-2"><span>Vibration</span><span className="text-white">{profile.vib} g</span></div>
                    <div className="flex items-center justify-between border-b border-border/70 pb-2"><span>Power</span><span className="text-white">{profile.power} kW</span></div>
                    <div className="flex items-center justify-between"><span>Last sync</span><span className="text-white">00:42</span></div>
                  </div>

                  <Link to={`${isDemoMode ? "/demo/machine" : "/machine"}/${machine.device_id}`} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-[0.62rem] font-display tracking-[0.18em] text-primary transition hover:bg-primary/10">
                    VIEW MACHINE
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section id="digital-twin" className="mb-8 scroll-mt-28 glass-card p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-[0.62rem] font-display tracking-[0.22em] text-muted-foreground uppercase">Digital twin</div>
              <h3 className="text-2xl font-bold text-white">Machine intelligence map</h3>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[0.56rem] font-display tracking-[0.18em] text-primary uppercase">live telemetry</div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-[#09131d] p-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.14),_transparent_48%)]" />
              <div className="absolute inset-x-8 bottom-8 h-px bg-primary/20" />
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[0.56rem] font-display tracking-[0.18em] text-muted-foreground uppercase">
                  <Rotate3D className="h-3.5 w-3.5 text-primary" />
                  360° inspection view
                </div>
                <div className="flex items-center gap-1">
                  {[0, 90, 180, 270].map((angle) => (
                    <button key={angle} onClick={() => setTwinRotation(angle)} className={`rounded border px-2 py-1 text-[0.55rem] font-display tracking-[0.12em] transition ${twinRotation === angle ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-secondary/70 text-muted-foreground hover:text-white"}`}>
                      {angle}°
                    </button>
                  ))}
                </div>
              </div>
              <div
                className="relative mx-auto h-[360px] max-w-[620px] cursor-grab touch-none select-none [perspective:900px] active:cursor-grabbing"
                onPointerDown={handleTwinPointerDown}
                onPointerMove={handleTwinPointerMove}
                onPointerUp={handleTwinPointerUp}
                onPointerCancel={handleTwinPointerUp}
              >
                <div className="absolute inset-0 transition-transform duration-700 [transform-style:preserve-3d]" style={{ transform: `rotateY(${twinRotation}deg)` }}>
                <div className="absolute bottom-8 left-[17%] right-[17%] h-8 rounded-sm border border-slate-500/50 bg-gradient-to-b from-slate-500/70 to-slate-800 shadow-[0_14px_25px_rgba(0,0,0,0.35)]" />
                <div className="absolute bottom-16 left-[21%] right-[21%] h-48 rounded-t-xl border border-slate-500/70 bg-slate-950/90" style={{ transform: "translateZ(-28px)" }} />
                <div className="absolute bottom-16 left-[21%] right-[21%] h-48 rounded-t-xl border border-slate-300/70 bg-gradient-to-br from-slate-300/30 via-slate-700/70 to-slate-950/90 shadow-[0_0_30px_rgba(34,211,238,0.12)]" style={{ transform: "translateZ(28px)" }} />
                <div className="absolute bottom-16 left-[21%] h-48 w-14 origin-left rounded-l-xl border border-slate-400/50 bg-gradient-to-r from-slate-500/60 to-slate-900/90" style={{ transform: "rotateY(-90deg) translateX(-28px)" }} />
                <div className="absolute bottom-16 right-[21%] h-48 w-14 origin-right rounded-r-xl border border-slate-400/50 bg-gradient-to-l from-slate-500/60 to-slate-900/90" style={{ transform: "rotateY(90deg) translateX(28px)" }} />
                <div className="absolute bottom-[calc(16rem+1rem)] left-[21%] right-[21%] h-14 origin-bottom rounded-t-xl border border-slate-300/50 bg-gradient-to-b from-slate-300/40 to-slate-700/80" style={{ transform: "rotateX(90deg) translateY(28px)" }} />
                <div className="absolute bottom-16 left-[29%] right-[29%] h-44 rounded-t-lg border border-slate-300/35 bg-[#0c1722]/90" />
                <div className="absolute bottom-28 left-[34%] right-[34%] h-24 rounded border border-primary/30 bg-[#101e2b] shadow-inner shadow-primary/10" />
                <div className="absolute bottom-[42%] left-[48%] h-28 w-4 -translate-x-1/2 rounded-b border border-slate-300/60 bg-gradient-to-r from-slate-200/70 via-slate-500/80 to-slate-900" />
                <div className="absolute bottom-[51%] left-[45%] h-7 w-16 rounded-md border border-slate-300/60 bg-slate-300/70 shadow-[0_0_20px_rgba(34,211,238,0.16)]" />
                <div className="absolute bottom-[32%] left-[39%] right-[39%] h-3 rounded-full border border-slate-400/70 bg-slate-500/60" />
                <div className="absolute bottom-[34%] left-[43%] h-2 w-20 rounded-full bg-primary/70 shadow-[0_0_16px_rgba(34,211,238,0.65)]" />
                <div className="absolute bottom-16 right-[12%] h-32 w-12 rounded border border-slate-300/40 bg-gradient-to-b from-slate-400/60 to-slate-900/90" />
                <div className="absolute bottom-28 right-[5%] h-28 w-20 rounded-lg border border-primary/30 bg-slate-800/90 p-2 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
                  <div className="h-12 rounded border border-primary/20 bg-[#08121d]" />
                  <div className="mt-2 space-y-1"><div className="h-1 rounded bg-primary/60" /><div className="h-1 w-2/3 rounded bg-success/60" /><div className="h-1 w-4/5 rounded bg-warning/60" /></div>
                </div>
                <div className="absolute bottom-24 left-[16%] h-20 w-3 rounded-full bg-warning/70 shadow-[0_0_18px_rgba(245,158,11,0.25)]" />
                <div className="absolute bottom-28 left-[12%] h-20 w-12 origin-bottom -rotate-12 rounded-t-full border-l-4 border-t-4 border-warning/80" />
                <div className="absolute bottom-20 left-[8%] h-10 w-20 rounded border border-warning/40 bg-warning/10" />

                {twinNodes.map((node) => (
                  <button key={node.label} onClick={() => setSelectedTwinNode(node.label)} className={`absolute ${node.className} z-10 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 transition ${selectedTwinNode === node.label ? "scale-125 border-white bg-primary shadow-[0_0_24px_rgba(34,211,238,0.9)]" : "border-primary bg-primary/30 shadow-[0_0_14px_rgba(34,211,238,0.65)]"}`} aria-label={`Inspect ${node.label}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </button>
                ))}
                </div>
              </div>
              <div className="relative flex items-center justify-between text-[0.56rem] font-display tracking-[0.18em] text-muted-foreground uppercase">
                <span>Drag to rotate 360°</span>
                <span className="text-primary">{isDemoMode ? "simulated twin" : "live twin"}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="text-[0.56rem] font-display tracking-[0.2em] text-primary uppercase">Selected component</div>
                <div className="mt-2 text-xl font-bold text-white">{activeTwinNode.label}</div>
                <div className="mt-1 text-sm text-muted-foreground">{activeTwinNode.area}</div>
                <div className="mt-5 flex items-end justify-between border-t border-primary/20 pt-4">
                  <div><div className="text-[0.56rem] uppercase tracking-[0.18em] text-muted-foreground">Live reading</div><div className="mt-1 text-2xl font-display text-white">{activeTwinNode.value}</div></div>
                  <div className="text-right text-[0.56rem] font-display tracking-[0.18em] text-success uppercase">{activeTwinNode.status}</div>
                </div>
              </div>
              {twinNodes.map((node) => <DigitalTwinNode key={node.label} label={node.label} status={node.status} temp={node.value} vib={node.area} active={selectedTwinNode === node.label} onClick={() => setSelectedTwinNode(node.label)} />)}
            </div>
          </div>
        </section>

        <section id="predictive-analytics" className="mb-8 scroll-mt-28 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-[0.62rem] font-display tracking-[0.22em] text-muted-foreground uppercase">Live Sensor Telemetry</div>
                <h3 className="text-2xl font-bold text-white">Realtime performance</h3>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/80 px-2 py-1 text-[0.6rem] font-display tracking-[0.12em] text-muted-foreground">
                {(["1H", "6H", "24H", "7D"] as const).map((range) => (
                  <button key={range} className={`rounded-full px-2 py-1 ${range === "24H" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <TelemetryChart title="Temperature" value={`${sensorData?.temperature ?? currentProfile.temp}°C`} threshold={`${defaultThresholds.tempMax}°C`} data={tempData} color="hsl(199,95%,60%)" />
              <TelemetryChart title="Vibration" value={`${sensorData?.vibration ?? currentProfile.vib} g`} threshold={`${defaultThresholds.vibMax} g`} data={vibData} color="hsl(39,95%,60%)" />
              <TelemetryChart title="Distance" value={`${sensorData?.distance ?? currentProfile.dist} cm`} threshold={`${defaultThresholds.distMin} cm`} data={distData} color="hsl(175,80%,52%)" />
            </div>
          </div>

          <div className="space-y-6">
            <div id="energy" className="glass-card scroll-mt-28 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-[0.62rem] font-display tracking-[0.22em] text-muted-foreground uppercase">Energy intelligence</div>
                <Zap className="h-4 w-4 text-primary" />
              </div>

              <div className="mb-4 flex items-end justify-between">
                <div>
                  <div className="text-[0.56rem] uppercase tracking-[0.18em] text-muted-foreground">Power Consumption</div>
                  <div className="mt-1 text-3xl font-display font-bold text-white">0.82 kW</div>
                </div>
                <div className="text-right">
                  <div className="text-[0.56rem] uppercase tracking-[0.18em] text-muted-foreground">Efficiency</div>
                  <div className="mt-1 text-xl font-display text-primary">92%</div>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div className="rounded-lg border border-border bg-secondary/70 p-3">
                  <div className="text-[0.56rem] uppercase tracking-[0.18em]">Today</div>
                  <div className="mt-2 text-lg text-white">18.4 kWh</div>
                </div>
                <div className="rounded-lg border border-border bg-secondary/70 p-3">
                  <div className="text-[0.56rem] uppercase tracking-[0.18em]">Monthly</div>
                  <div className="mt-2 text-lg text-white">~552 kWh</div>
                </div>
              </div>

              <div className="h-20 rounded-lg border border-border bg-[#09131d] p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={powerData.slice(-6)}>
                    <defs>
                      <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(199,95%,60%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(199,95%,60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="hsl(199,95%,60%)" fill="url(#energyFill)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <div className="text-[0.56rem] uppercase tracking-[0.18em] text-primary">Energy status</div>
                <div className="mt-2 text-sm text-white">Operating within expected range</div>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                Machine 02 consumed 14% more energy than its baseline.
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-[0.62rem] font-display tracking-[0.22em] text-muted-foreground uppercase">Predictive maintenance</div>
                <Wrench className="h-4 w-4 text-warning" />
              </div>

              <div className="space-y-4">
                <MaintenanceItem title="Machine 01" label="Bearing" health="91%" risk="Low" inspection="14 days" />
                <MaintenanceItem title="Machine 02" label="Motor" health="74%" risk="Medium" inspection="5 days" />
                <MaintenanceItem title="Machine 03" label="Cooling System" health="96%" risk="Low" inspection="27 days" />
              </div>

              <div className="mt-5 rounded-lg border border-warning/30 bg-warning/5 p-3">
                <div className="text-[0.56rem] uppercase tracking-[0.18em] text-warning">Early warning</div>
                <div className="mt-2 text-sm text-foreground">Vibration trend on Machine 02 is increasing faster than its baseline.</div>
              </div>

              <button className="mt-5 w-full rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-[0.62rem] font-display tracking-[0.18em] text-primary uppercase">View prediction</button>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div id="alerts" className="glass-card scroll-mt-28 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[0.62rem] font-display tracking-[0.22em] text-muted-foreground uppercase">Alert center</div>
              <Bell className="h-4 w-4 text-warning" />
            </div>

            <div className="mb-4 flex flex-wrap gap-2 text-[0.56rem] font-display tracking-[0.18em] uppercase text-muted-foreground">
              {['All', 'Critical', 'Warning', 'Resolved'].map((filter) => (
                <button key={filter} className={`rounded-full border px-3 py-1.5 ${filter === 'All' ? 'border-primary/30 bg-primary/5 text-primary' : 'border-border bg-secondary/70'}`}>
                  {filter}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <AlertItem time="10:42 AM" level="WARNING" description="Machine 02 vibration above baseline." />
              <AlertItem time="09:18 AM" level="INFO" description="Machine 01 operating normally." />
              <AlertItem time="Yesterday" level="RESOLVED" description="Temperature anomaly detected and cleared." />
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[0.62rem] font-display tracking-[0.22em] text-muted-foreground uppercase">Risk matrix</div>
              <Radar className="h-4 w-4 text-primary" />
            </div>

            <div className="rounded-xl border border-border bg-[#09131d] p-4">
              <div className="grid grid-cols-2 gap-2 text-[0.56rem] uppercase tracking-[0.18em] text-muted-foreground">
                <div className="text-left">Likelihood</div>
                <div className="text-right">Severity</div>
              </div>

              <div className="relative mt-5 h-44 rounded-lg border border-border bg-[linear-gradient(to_right,_rgba(148,163,184,0.08)_1px,_transparent_1px),linear-gradient(to_bottom,_rgba(148,163,184,0.08)_1px,_transparent_1px)] bg-[size:40px_40px]">
                <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/20" />
                <div className="absolute left-[20%] top-[30%] h-3 w-3 rounded-full bg-success shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
                <div className="absolute left-[58%] top-[54%] h-3 w-3 rounded-full bg-warning shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
                <div className="absolute left-[66%] top-[22%] h-3 w-3 rounded-full bg-success shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
                <div className="absolute bottom-2 left-3 text-[0.54rem] uppercase tracking-[0.18em] text-muted-foreground">Low</div>
                <div className="absolute bottom-2 right-3 text-[0.54rem] uppercase tracking-[0.18em] text-muted-foreground">High</div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between"><span>Machine 01</span><span className="text-success">Low</span></div>
                <div className="flex items-center justify-between"><span>Machine 02</span><span className="text-warning">Medium</span></div>
                <div className="flex items-center justify-between"><span>Machine 03</span><span className="text-success">Low</span></div>
              </div>
            </div>
          </div>
        </section>

        <section id="maintenance" className="mb-8 scroll-mt-28 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[0.62rem] font-display tracking-[0.22em] text-muted-foreground uppercase">Upcoming maintenance</div>
              <Wrench className="h-4 w-4 text-primary" />
            </div>

            <div className="space-y-4">
              <MaintenanceSchedule title="Machine 02" task="Bearing inspection" days="5 days" />
              <MaintenanceSchedule title="Machine 01" task="Routine inspection" days="14 days" />
              <MaintenanceSchedule title="Machine 03" task="Cooling system check" days="27 days" />
            </div>

            <button className="mt-5 w-full rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-[0.62rem] font-display tracking-[0.18em] text-primary uppercase">Open Maintenance</button>
          </div>

          <div className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[0.62rem] font-display tracking-[0.22em] text-muted-foreground uppercase">Facility overview</div>
              <Gauge className="h-4 w-4 text-success" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <OverviewStat label="Machines monitored" value="03" />
              <OverviewStat label="Sensors active" value="12" />
              <OverviewStat label="Critical incidents" value="0" />
              <OverviewStat label="Warnings" value="2" />
              <OverviewStat label="System uptime" value="99.2%" />
              <OverviewStat label="Data packets received" value="18,492" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const QuadStat = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
  <div className="glass-card p-4">
    <div className="text-[0.56rem] font-display tracking-[0.22em] text-muted-foreground uppercase">{label}</div>
    <div className={`mt-3 text-2xl font-display font-bold ${accent}`}>{value}</div>
  </div>
);

const MetricRow = ({ label, value, status }: { label: string; value: string; status: string }) => (
  <div className="rounded-lg border border-border bg-secondary/70 p-3">
    <div className="text-[0.56rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
    <div className="mt-2 flex items-center justify-between gap-2">
      <span className="text-lg font-display text-white">{value}</span>
      <span className="text-[0.56rem] uppercase tracking-[0.16em] text-primary">{status}</span>
    </div>
  </div>
);

const InsightRow = ({ children, tone }: { children: React.ReactNode; tone: "ok" | "warn" }) => (
  <div className={`flex items-start gap-3 rounded-lg border p-3 ${tone === "warn" ? "border-warning/30 bg-warning/5" : "border-primary/20 bg-primary/5"}`}>
    <div className={`mt-0.5 h-2.5 w-2.5 rounded-full ${tone === "warn" ? "bg-warning" : "bg-primary"}`} />
    <div className="text-sm text-foreground">{children}</div>
  </div>
);

const DigitalTwinNode = ({ label, status, temp, vib, active, onClick }: { label: string; status: string; temp: string; vib: string; active?: boolean; onClick?: () => void }) => {
  const color = status === "Healthy" ? "text-success" : status === "Warning" ? "text-warning" : "text-danger";

  return (
    <button onClick={onClick} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${active ? "border-primary/40 bg-primary/10" : "border-border bg-secondary/70 hover:border-primary/25"}`}>
      <div>
        <div className="text-[0.62rem] font-display tracking-[0.22em] text-muted-foreground uppercase">{label}</div>
        <div className="mt-1 text-xs text-muted-foreground">Temp: <span className="text-white">{temp}</span> • Vibration: <span className="text-white">{vib}</span></div>
      </div>
      <div className={`text-[0.56rem] font-display tracking-[0.2em] uppercase ${color}`}>{status}</div>
    </button>
  );
};

const TelemetryChart = ({ title, value, threshold, data, color }: { title: string; value: string; threshold: string; data: MetricPoint[]; color: string }) => (
  <div className="rounded-xl border border-border bg-secondary/70 p-3">
    <div className="mb-2 flex items-center justify-between">
      <div>
        <div className="text-[0.62rem] font-display tracking-[0.22em] text-muted-foreground uppercase">{title}</div>
        <div className="mt-1 text-lg text-white">{value}</div>
      </div>
      <div className="text-right text-[0.56rem] uppercase tracking-[0.18em] text-muted-foreground">
        <div>Threshold</div>
        <div className="mt-1 text-primary">{threshold}</div>
      </div>
    </div>

    <div className="h-26">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.slice(-10)}>
          <defs>
            <linearGradient id={`telemetry-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
          <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke={color} fill={`url(#telemetry-${title})`} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const MaintenanceItem = ({ title, label, health, risk, inspection }: { title: string; label: string; health: string; risk: string; inspection: string }) => (
  <div className="rounded-xl border border-border bg-secondary/70 p-3">
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-[0.62rem] font-display tracking-[0.22em] text-muted-foreground uppercase">{title}</div>
        <div className="text-base text-white">{label}</div>
      </div>
      <div className="text-[0.56rem] uppercase tracking-[0.18em] text-primary">{risk}</div>
    </div>
    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
      <span>Health: <span className="text-white">{health}</span></span>
      <span>Inspection: <span className="text-white">{inspection}</span></span>
    </div>
  </div>
);

const AlertItem = ({ time, level, description }: { time: string; level: string; description: string }) => (
  <div className="flex gap-3 rounded-xl border border-border bg-secondary/70 p-3">
    <div className="w-16 shrink-0 text-[0.56rem] uppercase tracking-[0.18em] text-muted-foreground">{time}</div>
    <div className="flex-1">
      <div className={`inline-flex rounded-full border px-2 py-0.5 text-[0.55rem] font-display tracking-[0.18em] uppercase ${level === "WARNING" ? "border-warning/25 bg-warning/10 text-warning" : level === "RESOLVED" ? "border-success/25 bg-success/10 text-success" : "border-primary/25 bg-primary/10 text-primary"}`}>
        {level}
      </div>
      <div className="mt-2 text-sm text-foreground">{description}</div>
    </div>
  </div>
);

const MaintenanceSchedule = ({ title, task, days }: { title: string; task: string; days: string }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/70 p-3">
    <div>
      <div className="text-[0.62rem] font-display tracking-[0.22em] text-muted-foreground uppercase">{title}</div>
      <div className="mt-1 text-sm text-white">{task}</div>
    </div>
    <div className="text-right text-sm text-primary">{days}</div>
  </div>
);

const OverviewStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-border bg-secondary/70 p-4">
    <div className="text-[0.56rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
    <div className="mt-2 text-2xl font-display text-white">{value}</div>
  </div>
);

export default Dashboard;
