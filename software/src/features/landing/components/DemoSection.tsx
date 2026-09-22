import { motion } from "framer-motion";
import { AlertTriangle, Activity, Thermometer, ArrowDown, CheckCircle2 } from "lucide-react";

const flow = [
  { title: "Vibration anomaly detected", type: "warning", icon: Activity },
  { title: "Edge AI identifies abnormal pattern", type: "info", icon: AlertTriangle },
  { title: "Machine health status changes", type: "neutral", icon: Thermometer },
  { title: "Dashboard alert", type: "info", icon: CheckCircle2 },
  { title: "Voice notification", type: "warning", icon: AlertTriangle },
  { title: "Maintenance action", type: "success", icon: CheckCircle2 },
];

const DemoSection = () => {
  return (
    <section className="relative py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-5xl gradient-text">
            From abnormal signal to actionable alert.
          </h2>
        </motion.div>

        <div className="mx-auto max-w-5xl">
          <div className="mb-6 grid gap-4 md:grid-cols-6">
            {flow.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="flex flex-col items-center text-center"
              >
                <div className="glass-card flex h-16 w-16 items-center justify-center rounded-2xl border-primary/20 bg-primary/5">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{step.title}</p>
                {index < flow.length - 1 && (
                  <ArrowDown className="mt-3 h-4 w-4 text-primary/60" />
                )}
              </motion.div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "⚠ HIGH VIBRATION", subtitle: "Machine #03" },
              { title: "⚠ TEMPERATURE ANOMALY", subtitle: "Machine #02" },
              { title: "✓ MACHINE HEALTH NORMAL", subtitle: "Machine #01" },
            ].map((alert, index) => (
              <motion.div
                key={alert.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="glass-card p-5"
              >
                <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                  {alert.title.includes("✓") ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </div>
                <p className="font-display text-xs tracking-[0.16em] text-foreground">{alert.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{alert.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
