import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const FinalCtaSection = () => (
  <section className="relative py-24">
    <div className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card overflow-hidden border-primary/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),transparent_35%),linear-gradient(to_bottom,_rgba(15,23,42,0.9),_rgba(2,6,23,0.95))] p-8 md:p-12"
      >
        <div className="text-center">
          <p className="mb-4 font-display text-[10px] tracking-[0.3em] text-primary">DON&apos;T WAIT FOR THE MACHINE TO FAIL.</p>
          <h2 className="mb-6 text-4xl font-black md:text-6xl">
            <span className="block gradient-text">DETECT.</span>
            <span className="block text-foreground">ANALYZE.</span>
            <span className="block text-primary">ALERT.</span>
            <span className="block text-foreground">PREVENT.</span>
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-sm text-muted-foreground md:text-base">
            HazardEye brings affordable industrial intelligence to the machines that keep MSMEs running.
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-display text-[10px] tracking-[0.22em] text-primary-foreground transition-all hover:brightness-110"
          >
            EXPLORE THE SYSTEM
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

export default FinalCtaSection;
