const Footer = () => (
  <footer className="border-t border-border/80 py-12">
    <div className="section-container text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <img src="/hazardeye-logo.jpeg" alt="HazardEye logo" className="h-6 w-6 object-contain" />
        <span className="font-display text-sm font-bold tracking-[0.22em] text-foreground">
          HAZARD<span className="text-primary">EYE</span>
        </span>
      </div>
      <p className="text-xs text-muted-foreground tracking-[0.18em] uppercase">
        Predict Today. Prevent Tomorrow.
      </p>
      <p className="text-xs text-muted-foreground mt-3">
        Industrial safety monitoring for machines, teams and MSMEs.
      </p>
    </div>
  </footer>
);

export default Footer;
