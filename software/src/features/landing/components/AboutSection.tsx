import { motion } from "framer-motion";
import teamPhoto from "../../../../vc.jpeg";

const team = [
  { name: "SWADEEP BANSODE", role: "Lead & System Architecture", tags: ["IoT", "Embedded Systems", "System Architecture"] },
  { name: "SHREYASH CHAVAN", role: "Backend Development & IoT Communication", tags: ["Backend", "IoT", "Communication"] },
  { name: "HARSH POOJARI", role: "Frontend Development & Web Dashboard", tags: ["Frontend", "AI", "Hardware"] },
];

const AboutSection = () => {
  return (
    <section id="about" className="relative py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-5xl gradient-text">
            Team
          </h2>
        </motion.div>

        <div className="mb-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card overflow-hidden p-4"
          >
            <img src={teamPhoto} alt="HazardEye team" className="h-[360px] w-full rounded-2xl object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card flex flex-col justify-center p-6"
          >
            <p className="mb-4 font-display text-[10px] tracking-[0.3em] text-primary">CODEX 2026</p>
            <h3 className="mb-3 text-3xl font-bold text-foreground">MUSA</h3>
            <p className="mb-4 text-sm text-muted-foreground">Selected Domain: <span className="text-foreground">IoT & Smart Automation</span></p>
            <p className="mb-1 text-sm text-muted-foreground">Problem Statement: <span className="text-foreground">“The Machine That Died Quietly”</span></p>
            <p className="mb-6 text-sm text-muted-foreground">PS: <span className="text-foreground">CX0901</span></p>
            <p className="font-display text-[10px] tracking-[0.2em] text-primary">TEAM: SYGNIX</p>
          </motion.div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="glass-card p-6"
            >
              <p className="mb-2 font-display text-sm tracking-[0.18em] text-primary">{member.name}</p>
              <p className="mb-4 text-sm text-muted-foreground">{member.role}</p>
              <div className="flex flex-wrap gap-2">
                {member.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-primary/20 bg-primary/5 px-2 py-1 text-[10px] tracking-[0.12em] text-primary">{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
