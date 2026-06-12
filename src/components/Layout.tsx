import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="page">
      <nav
        className="nav"
        style={{
          background: scrolled ? "rgba(7, 10, 15, 0.95)" : "rgba(7, 10, 15, 0.6)",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.3)" : "none",
        }}
      >
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <div className="nav-logo-shield">
              <img src="/popsbadge.png" alt="POPS badge" className="brand-badge" />
            </div>
            <div className="nav-logo-text">
              P.O.P.S.<span>TM</span>
            </div>
          </Link>

          <div className="nav-links" style={{ display: mobileOpen ? "flex" : undefined }}>
            <Link to="/" className="nav-link">Landing</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/declaration" className="nav-link">Declaration</Link>
            <Link to="/pledge" className="nav-link">Pledge</Link>
            <Link to="/lexicon" className="nav-link">Lexicon</Link>
            <Link to="/access" className="nav-link">Access</Link>
            <Link to="/access" className="nav-cta">Get P.O.P.S.</Link>
          </div>

          <button
            className="nav-link"
            style={{ display: "none", background: "none", border: "none" }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <main key={location.pathname} className="animate-in">{children}</main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <img src="/popsbadge.png" alt="POPS badge" className="footer-badge" />
            <div className="footer-brand-text">
              P.O.P.S.<span>TM</span>
            </div>
          </div>
          <div className="footer-links">
            <Link to="/">Landing</Link>
            <Link to="/about">About</Link>
            <Link to="/declaration">Declaration</Link>
            <Link to="/pledge">Pledge</Link>
            <Link to="/lexicon">Lexicon</Link>
            <Link to="/access">Access</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/policies-procedures">Policies &amp; Procedures</Link>
          </div>
          <div className="footer-copy">
            (c) 2026 Proof of Presence System. This is a Pro Prime Series application. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
