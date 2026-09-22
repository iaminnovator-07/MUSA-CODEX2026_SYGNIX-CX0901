import { motion } from "framer-motion";
import { Activity, HardHat, BriefcaseBusiness } from "lucide-react";

const impacts = [
  {
    title: "MACHINE",
    icon: Activity,
    points: ["Early anomaly detection", "Health monitoring", "Predictive insights"],
  },
  {
    title: "PEOPLE",
    icon: HardHat,
    points: ["Worker safety alerts", "Emergency notifications", "Safer workplaces"],
  },
  {
    title: "BUSINESS",
    icon: BriefcaseBusiness,
    points: ["Reduced unexpected downtime", "Lower maintenance costs", "Better operational visibility"],
  },
];

const ImpactSection = () => {
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
            Safer machines. Safer people. Stronger MSMEs.
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {impacts.map((impact, index) => (
            <motion.div
              key={impact.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="glass-card p-6"
            >
              <div className="mb-5 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                <impact.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-4 font-display text-sm tracking-[0.2em] text-foreground">{impact.title}</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {impact.points.map((point) => (
                  <li key={point}>• {point}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
