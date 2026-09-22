import { motion } from "framer-motion";
import { ArrowRight, Cpu, BellRing, ShieldCheck, Radio } from "lucide-react";

const steps = [
  { label: "SENSE", desc: "Sensors continuously capture machine and environment data.", icon: Radio },
  { label: "ANALYZE", desc: "ESP32 processes incoming signals and detects abnormal conditions.", icon: Cpu },
  { label: "ALERT", desc: "HazardEye generates alerts and voice notifications.", icon: BellRing },
  { label: "PREVENT", desc: "Maintenance teams act before failure or unsafe conditions escalate.", icon: ShieldCheck },
];

const HowItWorksSection = () => {
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
            How it works
          </h2>
          <p className="mx-auto max-w-3xl text-sm text-muted-foreground md:text-base">
            A simple signal chain turns unusual machine behavior into actionable intervention.
          </p>
        </motion.div>

        <div className="mx-auto max-w-6xl">
          <div className="hidden items-center justify-between gap-4 lg:flex">
            {steps.map((step, index) => (
              <div key={step.label} className="flex min-w-0 flex-1 items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07 }}
                  className="glass-card flex-1 p-5"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-2.5 text-primary">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 font-display text-sm font-bold tracking-[0.2em] text-foreground">{step.label}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </motion.div>

                {index < steps.length - 1 && (
                  <div className="mx-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/5 text-primary">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4 lg:hidden">
            {steps.map((step, index) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="glass-card p-5"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-2.5 text-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-display text-sm font-bold tracking-[0.2em] text-foreground">{step.label}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
