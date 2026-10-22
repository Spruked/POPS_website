import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useCart } from "../cart";

interface LayoutProps {
  children: React.ReactNode;
}

const secondaryLinks = [
  ["/about", "About / Our Mission"], ["/declaration", "Declaration"],
  ["/pledge", "Pledge"], ["/lexicon", "Lexicon"],
  ["/early-adopters", "Early Adopters"], ["/how-you-use-it", "How It Works"],
  ["/installation", "Installation"], ["/faq", "FAQs"],
  ["/support", "Contact & Support"], ["/counsel-handoff", "Counsel Handoff"],
  ["/events", "Events"], ["/attorney-referral", "Noted Counsel"],
  ["/policies-procedures", "Policies & Procedures"], ["/terms", "Terms of Service"],
  ["/privacy", "Privacy Notice"],
];

export default function Layout({ children }: LayoutProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { itemCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        document.getElementById('site-menu-control')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <div className="page">
      <nav
        aria-label="Primary navigation"
        className="nav site-header"
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

          <div id="primary-navigation" className={`nav-links${mobileOpen ? " is-open" : ""}`} onClick={(event) => { if ((event.target as HTMLElement).closest('a')) setMobileOpen(false); }}>
            <Link to="/" className="nav-link" aria-current={location.pathname==='/'?'page':undefined}>Home</Link>
            <Link to="/desktop-app" className="nav-link" aria-current={location.pathname==='/desktop-app'?'page':undefined}>Windows</Link>
            <Link to="/android" className="nav-link" aria-current={location.pathname==='/android'?'page':undefined}>Android</Link>
            <Link to="/product-demo" className="nav-link" aria-current={location.pathname==='/product-demo'?'page':undefined}>Demo</Link>
            <Link to="/beta" className="nav-link" aria-current={location.pathname==='/beta'?'page':undefined}>Beta</Link>
            <Link to="/access" className="nav-link" data-orb-target="pops.nav.access" aria-current={location.pathname==='/access'?'page':undefined}>Pricing</Link>
            <Link to="/account" className="nav-link" aria-current={location.pathname.startsWith('/account')?'page':undefined}>Sign In</Link>
            <Link to="/cart" className="nav-cart" aria-label={`Cart with ${itemCount} item${itemCount === 1 ? "" : "s"}`} aria-current={location.pathname==='/cart'?'page':undefined}>
              <ShoppingCart size={17} />
              <span>Cart</span>
              {itemCount > 0 && <strong>{itemCount}</strong>}
            </Link>
            <div className="site-mobile-secondary">{secondaryLinks.map(([href,label])=><Link key={href} className="nav-link" to={href} aria-current={location.pathname===href?'page':undefined}>{label}</Link>)}</div>
          </div>

          <Link to="/access" className="nav-cta site-purchase" data-orb-target="pops.nav.get-pops">Get P.O.P.S.</Link>

          <button
            className="nav-menu-toggle"
            id="site-menu-control"
            type="button"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            aria-controls="primary-navigation"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            <span>{mobileOpen ? "Close" : "Menu"}</span>
          </button>
        </div>
      </nav>

      <div className="site-frame">
        <aside className="site-secondary" aria-labelledby="site-navigation-title">
          <div className="site-secondary-inner"><h2 id="site-navigation-title">Explore P.O.P.S.</h2><p>Our purpose, your next steps.</p><nav aria-label="Site navigation">{secondaryLinks.map(([href,label])=><Link key={href} to={href} aria-current={location.pathname===href?'page':undefined}>{label}</Link>)}</nav></div>
        </aside>
        <main id="site-main-content" key={location.pathname} className="animate-in">{children}</main>
      </div>

      <footer className="footer">
        <div className="container"><nav className="launch-links" aria-label="Products, participation and help"><Link to="/desktop-app">Windows</Link><Link to="/android">Android</Link><Link to="/beta">Beta program</Link><Link to="/early-adopters">Early adopters</Link><Link to="/installation">Installation</Link><Link to="/faq">FAQs</Link><Link to="/support">Contact & privacy support</Link></nav></div>
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
            <Link to="/see-pops-in-action">See POPS in Action</Link>
            <Link to="/declaration">Declaration</Link>
            <Link to="/pledge">Pledge</Link>
            <Link to="/lexicon">Lexicon</Link>
            <Link to="/access">Access</Link>
            <Link to="/account">Account</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/events">Events</Link>
            <Link to="/counsel-handoff">Counsel Handoff</Link>
            <Link to="/attorney-referral">Noted Counsel</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/policies-procedures">Policies &amp; Procedures</Link>
          </div>
          <div className="footer-network" aria-label="Spruked network">
            <a href="https://spruked.com/" target="_blank" rel="noopener">Spruked</a>
            <a href="https://orbweaver.spruked.com/" target="_blank" rel="noopener">OrbWeaver</a>
            <a href="https://certsig.com/" target="_blank" rel="noopener">CertSig</a>
            <a href="https://truemarkmint.com/" target="_blank" rel="noopener">TrueMarkMint</a>
          </div>
          <div className="footer-copy">
            Copyright 2026 Proof of Presence System. Pro Prime Series AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
