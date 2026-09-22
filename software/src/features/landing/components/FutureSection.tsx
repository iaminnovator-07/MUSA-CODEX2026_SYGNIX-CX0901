import { motion } from "framer-motion";
import { Activity, ChartColumnIncreasing, Cpu, HardHat } from "lucide-react";

const roadmap = [
  {
    phase: "PHASE 1",
    title: "Working prototype",
    bullets: ["Sensor integration", "ESP32 processing", "Dashboard"],
    icon: Cpu,
  },
  {
    phase: "PHASE 2",
    title: "Industrial pilot",
    bullets: ["Multiple machines", "LoRa deployment", "Validation"],
    icon: HardHat,
  },
  {
    phase: "PHASE 3",
    title: "Edge AI refinement",
    bullets: ["Predictive models", "Multi-machine monitoring"],
    icon: Activity,
  },
  {
    phase: "PHASE 4",
    title: "MSME-scale deployment",
    bullets: ["Scalable hardware", "Analytics platform"],
    icon: ChartColumnIncreasing,
  },
];

const FutureSection = () => {
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
            Roadmap
          </h2>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-4">
          {roadmap.map((phase, index) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="glass-card relative p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="font-display text-[10px] tracking-[0.22em] text-primary">{phase.phase}</span>
                <phase.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-4 font-display text-sm tracking-[0.18em] text-foreground">{phase.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {phase.bullets.map((bullet) => (
                  <li key={bullet}>• {bullet}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FutureSection;
