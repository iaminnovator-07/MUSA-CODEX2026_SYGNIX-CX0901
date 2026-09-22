import { motion } from "framer-motion";
import { ArrowDown, Cpu, Radio, Wifi, Gateway, ShieldCheck } from "lucide-react";

const flow = [
  "Machine Sensors",
  "ESP32",
  "Local / Edge Processing",
  "LoRa",
  "Gateway",
  "Dashboard",
];

const OfflineSection = () => {
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
            When connectivity becomes unreliable, HazardEye shouldn&apos;t become useless.
          </h2>
          <p className="mx-auto max-w-4xl text-sm text-muted-foreground md:text-base">
            HazardEye is designed around local processing and low-bandwidth communication so critical machine and safety information can continue moving even when conventional connectivity is unreliable.
          </p>
        </motion.div>

        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center gap-3 md:flex-row md:justify-center md:gap-4">
            {flow.map((step, index) => (
              <div key={step} className="flex items-center gap-3 md:gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="glass-card flex h-20 w-32 items-center justify-center rounded-2xl border-primary/20 px-3 text-center"
                >
                  <span className="font-display text-[10px] tracking-[0.16em] text-foreground">{step}</span>
                </motion.div>
                {index < flow.length - 1 && (
                  <ArrowDown className="h-4 w-4 rotate-90 text-primary md:rotate-0" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {[
              { label: "EDGE-FIRST", icon: Cpu },
              { label: "LOW BANDWIDTH", icon: Radio },
              { label: "OFFLINE CAPABLE", icon: Wifi },
              { label: "RESILIENT", icon: ShieldCheck },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                className="glass-card flex items-center gap-3 p-4"
              >
                <div className="rounded-xl bg-primary/10 p-2 text-primary"><item.icon className="h-4 w-4" /></div>
                <span className="font-display text-[10px] tracking-[0.2em] text-foreground">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfflineSection;
