import { motion } from "framer-motion";
import { Factory, Cpu, Radio, ArrowRight } from "lucide-react";

const machines = [
  { name: "Machine 01", status: "Sensor Node" },
  { name: "Machine 02", status: "Sensor Node" },
  { name: "Machine 03", status: "Sensor Node" },
  { name: "Machine 04", status: "Sensor Node" },
];

const ApplicationsSection = () => {
  return (
    <section className="relative py-24 hazard-stripe">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-5xl gradient-text">
            Built to retrofit the machines you already own.
          </h2>
        </motion.div>

        <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-center">
          <div className="flex-1">
            <div className="grid gap-4 md:grid-cols-2">
              {machines.map((machine, index) => (
                <motion.div
                  key={machine.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="glass-card p-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-primary/10 p-2 text-primary">
                        <Factory className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-display text-xs tracking-[0.18em] text-foreground">{machine.name}</p>
                        <p className="text-[10px] text-muted-foreground">{machine.status}</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-primary/25 bg-primary/5 px-2 py-1 text-[9px] tracking-[0.18em] text-primary">LIVE</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-cyan-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <div className="glass-card p-6">
              <div className="mb-6 flex items-center justify-center gap-3 text-center">
                <div className="rounded-xl bg-primary/10 p-2 text-primary"><Cpu className="h-5 w-5" /></div>
                <div>
                  <p className="font-display text-[10px] tracking-[0.24em] text-muted-foreground">GATEWAY</p>
                  <p className="mt-1 font-display text-sm tracking-[0.18em] text-foreground">LoRa Gateway</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="rounded-full border border-primary/25 bg-primary/5 px-3 py-2 text-[9px] tracking-[0.2em] text-primary">LoRa</div>
                <ArrowRight className="h-4 w-4 text-primary" />
                <div className="rounded-full border border-cyan-400/25 bg-cyan-500/5 px-3 py-2 text-[9px] tracking-[0.2em] text-cyan-300">Dashboard</div>
              </div>

              <div className="mt-8 space-y-3 text-sm text-muted-foreground">
                <p>• No machine replacement</p>
                <p>• Low-cost deployment</p>
                <p>• Modular sensors</p>
                <p>• Scalable architecture</p>
                <p>• Centralized monitoring</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ApplicationsSection;
