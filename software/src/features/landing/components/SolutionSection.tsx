import { motion } from "framer-motion";
import { Cpu, BrainCircuit, Radio, ShieldCheck, BellRing, ArrowDown, Activity, Thermometer, Waves } from "lucide-react";

const architecture = [
  { name: "SENSING LAYER", desc: "Vibration, sound, temperature, current, worker safety", icon: Radio },
  { name: "EDGE PROCESSING", desc: "ESP32 captures and filters signal data", icon: Cpu },
  { name: "LOCAL AI", desc: "Anomaly detection at the machine edge", icon: BrainCircuit },
  { name: "CONNECTIVITY", desc: "LoRa-based offline-first communication", icon: Waves },
  { name: "MONITORING & ALERTS", desc: "Dashboard, alerts and voice notifications", icon: BellRing },
];

const SolutionSection = () => {
  return (
    <section id="solution" className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-5xl gradient-text">
            Meet HazardEye.
          </h2>
          <p className="mx-auto max-w-3xl text-sm text-muted-foreground md:text-base">
            HazardEye is not just a dashboard. It is a physical sensing and edge intelligence system built to retrofit machines and protect people in real time.
          </p>
        </motion.div>

        <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-primary/20 bg-slate-950/60 p-6 md:p-10">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div className="space-y-4">
              {architecture.map((layer, i) => (
                <motion.div
                  key={layer.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="relative overflow-hidden rounded-2xl border border-border bg-card/60 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <layer.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-display text-[10px] tracking-[0.22em] text-muted-foreground">{layer.name}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{layer.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative mx-auto w-full max-w-[500px]"
            >
              <div className="glass-card relative overflow-hidden p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.15),transparent_35%)]" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="mb-4 flex items-center gap-3 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-[10px] font-display tracking-[0.22em] text-primary">
                    <ShieldCheck className="h-4 w-4" />
                    ARCHITECTURE
                  </div>

                  <div className="relative h-[300px] w-full max-w-[360px]">
                    <div className="absolute left-1/2 top-2 h-16 w-28 -translate-x-1/2 rounded-2xl border border-primary/25 bg-slate-950/90 p-3">
                      <div className="flex h-full items-center justify-center rounded-xl border border-primary/25 bg-primary/10 font-display text-[9px] tracking-[0.22em] text-primary">SENSORS</div>
                    </div>
                    <div className="absolute left-1/2 top-[22%] h-16 w-28 -translate-x-1/2 rounded-2xl border border-cyan-400/25 bg-cyan-500/5 p-3">
                      <div className="flex h-full items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-500/10 font-display text-[9px] tracking-[0.2em] text-cyan-300">ESP32</div>
                    </div>
                    <div className="absolute left-1/2 top-[42%] h-16 w-28 -translate-x-1/2 rounded-2xl border border-violet-400/25 bg-violet-500/5 p-3">
                      <div className="flex h-full items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/10 font-display text-[9px] tracking-[0.2em] text-violet-300">LOCAL AI</div>
                    </div>
                    <div className="absolute left-1/2 top-[62%] h-16 w-28 -translate-x-1/2 rounded-2xl border border-primary/20 bg-slate-950/80 p-3">
                      <div className="flex h-full items-center justify-center rounded-xl border border-primary/25 bg-primary/10 font-display text-[9px] tracking-[0.2em] text-primary">LORA</div>
                    </div>
                    <div className="absolute left-1/2 top-[82%] h-16 w-32 -translate-x-1/2 rounded-2xl border border-cyan-400/25 bg-cyan-500/5 p-3">
                      <div className="flex h-full items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-500/10 font-display text-[9px] tracking-[0.18em] text-cyan-300">DASHBOARD</div>
                    </div>

                    <div className="absolute left-1/2 top-[18%] h-[56%] w-px -translate-x-1/2 bg-gradient-to-b from-primary via-cyan-400 to-violet-400" />
                    <div className="absolute left-1/2 top-[18%] h-[56%] w-[120px] -translate-x-1/2 border-l border-r border-dashed border-primary/30" />
                    <ArrowDown className="absolute left-1/2 top-[14%] -translate-x-1/2 text-primary" />
                    <ArrowDown className="absolute left-1/2 top-[34%] -translate-x-1/2 text-cyan-400" />
                    <ArrowDown className="absolute left-1/2 top-[55%] -translate-x-1/2 text-violet-400" />
                    <ArrowDown className="absolute left-1/2 top-[75%] -translate-x-1/2 text-primary" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
