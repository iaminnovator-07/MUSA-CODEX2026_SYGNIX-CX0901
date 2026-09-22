import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ChevronRight, BarChart3, Activity, Thermometer, Radio, Waves, BellRing } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const signalNodes = [
  { label: "VIBRATION", icon: Activity },
  { label: "TEMPERATURE", icon: Thermometer },
  { label: "SOUND", icon: Waves },
  { label: "CURRENT", icon: Radio },
  { label: "SAFETY", icon: BellRing },
];

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20 pb-12">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),transparent_35%),linear-gradient(to_bottom,rgba(4,10,18,0.65),rgba(4,10,18,0.95))]" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="h-px w-full bg-primary/30 animate-scan-line" />
      </div>

      <div className="relative z-10 section-container py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2">
              <img src="/hazardeye-logo.jpeg" alt="HazardEye logo" className="h-5 w-5 object-contain" />
              <span className="text-[10px] font-display tracking-[0.26em] text-primary">HAZARDEYE</span>
            </div>

            <h1 className="mb-6 text-5xl font-black leading-none sm:text-6xl lg:text-7xl">
              <span className="block gradient-text">Predict Today.</span>
              <span className="mt-2 block text-foreground">Prevent Tomorrow.</span>
            </h1>

            <p className="mb-5 max-w-xl text-lg text-primary/90">
              Affordable industrial intelligence for safer machines and smarter MSMEs.
            </p>

            <p className="mb-10 max-w-xl text-sm text-muted-foreground md:text-base">
              HazardEye retrofits existing machines with intelligent sensing, edge AI and offline connectivity to detect abnormal conditions before they become costly failures.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <a
                href="#solution"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3 font-display text-xs font-bold tracking-[0.2em] text-primary-foreground hover:brightness-110 transition-all"
              >
                EXPLORE HAZARDEYE
                <ChevronRight className="h-4 w-4" />
              </a>
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 rounded-lg border border-primary/35 bg-primary/5 px-7 py-3 font-display text-xs font-bold tracking-[0.2em] text-primary hover:bg-primary/10 transition-all"
              >
                <BarChart3 className="h-4 w-4" />
                VIEW SYSTEM
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative mx-auto w-full max-w-[560px]"
          >
            <div className="glass-card relative overflow-hidden border-primary/20 bg-[#08121d]/90 p-5 shadow-[0_24px_80px_rgba(2,8,23,0.45)] sm:p-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.18),transparent_38%)]" />
              <div className="relative z-10">
                <div className="mb-6 flex items-start justify-between gap-4 border-b border-border/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-display tracking-[0.24em] text-primary">
                      <Shield className="h-3.5 w-3.5" />
                      HAZARDEYE COMMAND CARD
                    </div>
                    <div className="mt-2 text-sm font-semibold text-white">CNC machining cell / Machine 01</div>
                    <div className="mt-1 text-[10px] tracking-[0.16em] text-muted-foreground uppercase">Edge safety intelligence</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2.5 py-1.5 text-[9px] font-display tracking-[0.2em] text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                      ACTIVE
                    </span>
                    <div className="mt-2 text-[9px] tracking-[0.16em] text-muted-foreground">DEMO STREAM</div>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between text-[9px] font-display tracking-[0.18em] uppercase">
                  <span className="text-muted-foreground">Live machine state</span>
                  <span className="text-primary">Health score 87 / 100</span>
                </div>

                <div className="relative mx-auto h-[280px] w-full max-w-[420px] rounded-2xl border border-primary/15 bg-[#06101a]/60 p-2">
                  <div className="absolute left-1/2 top-10 h-[160px] w-[220px] -translate-x-1/2 rounded-[28px] border border-primary/20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
                    <div className="absolute inset-x-6 top-8 h-12 rounded-xl border border-primary/20 bg-slate-900/90" />
                    <div className="absolute inset-x-8 top-24 h-2 rounded-full bg-primary/40" />
                    <div className="absolute bottom-6 left-6 right-6 h-10 rounded-xl border border-slate-700 bg-slate-950/80" />
                  </div>

                  <div className="absolute left-10 top-20 h-10 w-10 rounded-full border border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                    <div className="absolute inset-2 rounded-full bg-cyan-400/80" />
                  </div>
                  <div className="absolute right-10 top-20 h-10 w-10 rounded-full border border-violet-400/60 bg-violet-500/10 shadow-[0_0_20px_rgba(168,85,247,0.35)]">
                    <div className="absolute inset-2 rounded-full bg-violet-400/80" />
                  </div>
                  <div className="absolute left-14 bottom-8 h-12 w-12 rounded-xl border border-cyan-400/50 bg-cyan-500/10" />
                  <div className="absolute right-14 bottom-8 h-12 w-12 rounded-xl border border-violet-400/50 bg-violet-500/10" />

                  <div className="absolute left-1/2 top-[28%] h-[84px] w-[120px] -translate-x-1/2 rounded-2xl border border-primary/30 bg-slate-900/80 p-2 shadow-[0_0_30px_rgba(96,165,250,0.18)]">
                    <div className="flex h-full items-center justify-center rounded-xl border border-primary/25 bg-primary/5 font-display text-[10px] tracking-[0.24em] text-primary">ESP32</div>
                  </div>

                  <div className="absolute left-1/2 top-[68%] h-[74px] w-[140px] -translate-x-1/2 rounded-2xl border border-violet-400/30 bg-violet-500/5 p-2">
                    <div className="flex h-full items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/10 font-display text-[9px] tracking-[0.22em] text-violet-300">EDGE AI</div>
                  </div>

                  <div className="absolute left-1/2 top-[86%] h-10 w-[200px] -translate-x-1/2 rounded-full border border-cyan-400/30 bg-cyan-400/10" />

                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 420 280" fill="none" aria-hidden="true">
                    <path d="M72 110 L130 110 L160 135 L200 135" stroke="rgba(34,211,238,0.8)" strokeWidth="2" strokeDasharray="6 6" />
                    <path d="M348 110 L290 110 L260 135 L220 135" stroke="rgba(168,85,247,0.8)" strokeWidth="2" strokeDasharray="6 6" />
                    <path d="M208 186 L208 230 L110 230" stroke="rgba(34,211,238,0.8)" strokeWidth="2" strokeDasharray="6 6" />
                    <path d="M212 186 L212 230 L310 230" stroke="rgba(168,85,247,0.8)" strokeWidth="2" strokeDasharray="6 6" />
                    <path d="M198 140 L198 170" stroke="rgba(96,165,250,0.5)" strokeWidth="2" />
                    <path d="M222 140 L222 170" stroke="rgba(168,85,247,0.5)" strokeWidth="2" />
                  </svg>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {signalNodes.map(({ label, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-2 rounded-lg border border-border bg-slate-950/60 px-2.5 py-2 text-[9px] tracking-[0.16em] text-muted-foreground">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
