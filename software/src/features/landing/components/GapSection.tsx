import { motion } from "framer-motion";
import { Cpu, Building2, ShieldAlert, ArrowRight } from "lucide-react";

const gaps = [
  {
    title: "PLC-BASED CONDITION MONITORING",
    points: ["High hardware cost", "Complex industrial setup"],
    icon: Cpu,
  },
  {
    title: "SCADA-BASED SYSTEMS",
    points: ["Centralized", "Expensive", "Not designed for small MSMEs"],
    icon: Building2,
  },
  {
    title: "ENTERPRISE PREDICTIVE MAINTENANCE",
    points: ["Powerful", "But expensive and difficult to deploy"],
    icon: ShieldAlert,
  },
];

const strengths = ["LOW COST", "RETROFIT READY", "MSME FOCUSED", "EDGE INTELLIGENCE", "OFFLINE FIRST"];

const GapSection = () => {
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
            Industrial monitoring exists. Affordable intelligence doesn&apos;t.
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          {gaps.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="glass-card p-6"
            >
              <div className="mb-5 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-4 font-display text-sm tracking-[0.14em] text-foreground">{item.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {item.points.map((point) => (
                  <li key={point}>• {point}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-12 max-w-4xl rounded-[28px] border border-primary/20 bg-slate-950/60 p-8 text-center"
        >
          <p className="mb-6 font-display text-sm tracking-[0.24em] text-primary">HAZARDEYE IS BUILT FOR THE GAP.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {strengths.map((strength) => (
              <div key={strength} className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-[10px] tracking-[0.18em] text-primary">
                {strength}
                <ArrowRight className="h-3 w-3" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GapSection;
