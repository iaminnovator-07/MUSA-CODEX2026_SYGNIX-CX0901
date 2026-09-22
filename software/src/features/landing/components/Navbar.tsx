import { Link, useLocation } from "react-router-dom";
import { BarChart3, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/80 bg-background/75 backdrop-blur-xl">
      <div className="section-container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src="/hazardeye-logo.jpeg" alt="HazardEye logo" className="h-7 w-7 object-contain" />
          <span className="font-display text-sm font-bold tracking-[0.22em] text-foreground">
            HAZARD<span className="text-primary">EYE</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {isHome && (
            <>
              <a href="#problem" className="text-sm text-muted-foreground hover:text-primary transition-colors">Problem</a>
              <a href="#solution" className="text-sm text-muted-foreground hover:text-primary transition-colors">Solution</a>
              <a href="#technology" className="text-sm text-muted-foreground hover:text-primary transition-colors">Innovation</a>
              <a href="#about" className="text-sm text-muted-foreground hover:text-primary transition-colors">Team</a>
            </>
          )}
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-display text-[10px] font-bold tracking-[0.2em] hover:brightness-110 transition-all"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            DASHBOARD
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-4 py-4 space-y-3">
          {isHome && (
            <>
              <a href="#problem" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground">Problem</a>
              <a href="#solution" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground">Solution</a>
              <a href="#technology" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground">Innovation</a>
              <a href="#about" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground">Team</a>
            </>
          )}
          <Link to="/demo" onClick={() => setOpen(false)} className="block text-sm text-primary font-bold">Dashboard</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
