import { motion } from "framer-motion";
import { Activity, Cpu, ShieldCheck, Radio, Waves, ArrowUpRight } from "lucide-react";

const innovations = [
  { title: "LOW-COST RETROFIT", desc: "Attach intelligent sensing to existing machines without replacing the equipment.", icon: Radio },
  { title: "DUAL SAFETY FOCUS", desc: "Monitor both machine health and worker safety with a single connected layer.", icon: ShieldCheck },
  { title: "EDGE AI", desc: "Analyze abnormal patterns locally instead of relying entirely on cloud processing.", icon: Cpu },
  { title: "OFFLINE-FIRST CONNECTIVITY", desc: "Use LoRa-based communication for resilient low-bandwidth monitoring.", icon: Waves },
  { title: "MSME-FIRST DESIGN", desc: "Simple deployment, affordable hardware and practical monitoring for smaller manufacturers.", icon: Activity },
];

const TechSection = () => {
  return (
    <section id="technology" className="relative py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-5xl gradient-text">
            Key innovations
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {innovations.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass-card-hover group p-5"
            >
              <div className="mb-5 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display text-[10px] tracking-[0.22em] text-muted-foreground">0{ i + 1 }</span>
                <ArrowUpRight className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="mb-3 font-display text-sm font-bold tracking-[0.14em] text-foreground">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechSection;
