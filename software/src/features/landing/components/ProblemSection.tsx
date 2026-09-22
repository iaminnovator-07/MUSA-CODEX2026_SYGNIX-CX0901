import { motion } from "framer-motion";
import { AlertTriangle, Activity, BellRing, ShieldCheck, Gauge, Waves, ArrowRight } from "lucide-react";

const beforeItems = [
  { text: "Subtle abnormal vibration", icon: Activity },
  { text: "Rising temperature", icon: Gauge },
  { text: "Unusual sound", icon: Waves },
  { text: "Unexpected breakdown", icon: AlertTriangle },
];

const afterItems = [
  { text: "Detect", icon: ShieldCheck },
  { text: "Analyze", icon: Activity },
  { text: "Alert", icon: BellRing },
  { text: "Prevent", icon: ArrowRight },
];

const ProblemSection = () => {
  return (
    <section id="problem" className="relative py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-5xl gradient-text">
            Machines rarely fail without warning.
          </h2>
          <p className="mx-auto max-w-3xl text-sm text-muted-foreground md:text-base">
            Small warning signals become expensive failures when nobody is watching.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card border-danger/25 bg-danger/5 p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-danger/10 p-2.5">
                <AlertTriangle className="h-6 w-6 text-danger" />
              </div>
              <h3 className="font-display text-lg font-bold text-danger">BEFORE</h3>
            </div>

            <div className="space-y-4">
              {beforeItems.map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * i }}
                  className="flex items-center gap-3 rounded-lg border border-danger/20 bg-slate-950/50 p-3"
                >
                  <item.icon className="h-5 w-5 shrink-0 text-danger" />
                  <span className="text-sm text-muted-foreground">{item.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <p>Production downtime</p>
              <p>Expensive repairs</p>
              <p>Unplanned disruption</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card border-primary/25 bg-primary/5 p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold text-primary">AFTER</h3>
            </div>

            <div className="space-y-4">
              {afterItems.map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * i }}
                  className="flex items-center gap-3 rounded-lg border border-primary/20 bg-slate-950/50 p-3"
                >
                  <item.icon className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm text-muted-foreground">{item.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 text-sm text-muted-foreground">
              <p>MSMEs, manufacturing units, maintenance teams, plant operators</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
