import { useState } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="site-footer">
      {/* ───── Newsletter Banner ───── */}
      <div className="ft-newsletter">
        <div className="ft-newsletter-inner">
          <div className="ft-newsletter-left">
            <div className="ft-newsletter-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 4L12 13L2 4" />
              </svg>
            </div>
            <div className="ft-newsletter-text">
              <span className="ft-newsletter-eyebrow">STAY UPDATED</span>
              <h3>Get the latest updates, offers and school uniform trends.</h3>
              <p>Subscribe to our newsletter and never miss a deal.</p>
            </div>
          </div>
          <form className="ft-newsletter-form" onSubmit={handleSubscribe}>
            <div className="ft-newsletter-input-wrap">
              <svg className="ft-newsletter-mail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 4L12 13L2 4" />
              </svg>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="ft-subscribe-btn">
                {subscribed ? "✓ Subscribed!" : "Subscribe"}
              </button>
            </div>
            <span className="ft-newsletter-disclaimer">No spam. Unsubscribe anytime.</span>
          </form>
          <div className="ft-newsletter-tagline">
            <span className="ft-tagline-text">Better Uniforms<br />Brighter Tomorrows</span>
            <svg className="ft-tagline-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* ───── Main Footer Grid ───── */}
      <div className="ft-main">
        <div className="ft-main-inner">
          {/* Brand Column */}
          <div className="ft-brand-col">
            <Link to="/" className="ft-brand-logo">
              <span className="ft-brand-icon">🎓</span>
              Shop<span className="ft-brand-my">My</span>Uniform
            </Link>
            <p className="ft-brand-tagline">School uniforms made simple.</p>
            <p className="ft-brand-desc">
              Your trusted destination for genuine school uniforms, shoes, and more. Quality products, fast delivery, and a better shopping experience for every student.
            </p>
            <div className="ft-social-icons">
              <a href="#" className="ft-social-link" title="Facebook" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="#" className="ft-social-link" title="Instagram" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="ft-social-link" title="YouTube" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"/></svg>
              </a>
              <a href="#" className="ft-social-link" title="Twitter / X" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="ft-social-link" title="LinkedIn" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div className="ft-link-col">
            <h4 className="ft-col-title">Shop</h4>
            <ul className="ft-col-links">
              <li><Link to="/schools">All Schools</Link></li>
              <li><Link to="/products">Uniforms</Link></li>
              <li><Link to="/products?category=shoes">Shoes</Link></li>
              <li><Link to="/products?category=sports-kit">Sports Kits</Link></li>
              <li><Link to="/products?category=tie">Ties</Link></li>
              <li><Link to="/products">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Customer Care Column */}
          <div className="ft-link-col">
            <h4 className="ft-col-title">Customer Care</h4>
            <ul className="ft-col-links">
              <li><Link to="/orders">Track Your Order</Link></li>
              <li><Link to="/products">Returns &amp; Refunds</Link></li>
              <li><Link to="/products">Size Guide</Link></li>
              <li><Link to="/products">Shipping Information</Link></li>
              <li><Link to="/">FAQs</Link></li>
              <li><Link to="/">Contact Us</Link></li>
              <li><Link to="/">Help Center</Link></li>
            </ul>
          </div>

          {/* About Column */}
          <div className="ft-link-col">
            <h4 className="ft-col-title">About</h4>
            <ul className="ft-col-links">
              <li><Link to="/">Our Story</Link></li>
              <li><Link to="/">Why ShopMyUniform</Link></li>
              <li><Link to="/">Careers</Link></li>
              <li><Link to="/">Partner with Us</Link></li>
              <li><Link to="/">Terms of Service</Link></li>
              <li><Link to="/">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Need Help Column */}
          <div className="ft-help-col">
            <div className="ft-help-header">
              <div className="ft-help-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <strong>Need Help?</strong>
                <p>Our AI assistant is here 24/7<br />to answer your questions.</p>
              </div>
            </div>
            <button
              className="ft-chat-btn"
              onClick={() => {
                const chatBtn = document.querySelector('.chat-toggle');
                if (chatBtn) chatBtn.click();
              }}
            >
              Chat with AI Assistant →
            </button>

            <div className="ft-contact-items">
              <div className="ft-contact-item">
                <div className="ft-contact-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                </div>
                <div>
                  <strong>+91 98765 43210</strong>
                  <span>Mon – Sat, 9AM – 6PM</span>
                </div>
              </div>
              <div className="ft-contact-item">
                <div className="ft-contact-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13L2 4"/></svg>
                </div>
                <div>
                  <strong>support@shopmyuniform.com</strong>
                  <span>We typically reply within 24 hours</span>
                </div>
              </div>
              <div className="ft-contact-item">
                <div className="ft-contact-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <strong>Bangalore, India</strong>
                  <span>Serving schools across India</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───── Payment Methods Strip ───── */}
      <div className="ft-payments-strip">
        <div className="ft-payments-inner">
          <div className="ft-payments-left">
            <span className="ft-payments-label">We Accept</span>
            <div className="ft-payment-logos">
              <span className="ft-pay-chip">
                <svg viewBox="0 0 48 32" width="40" height="28"><rect width="48" height="32" rx="4" fill="#1A1F71"/><text x="24" y="21" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold" fontStyle="italic" fontFamily="Arial">VISA</text></svg>
              </span>
              <span className="ft-pay-chip">
                <svg viewBox="0 0 48 32" width="40" height="28"><rect width="48" height="32" rx="4" fill="#fff" stroke="#e2e8f0"/><circle cx="19" cy="16" r="10" fill="#EB001B"/><circle cx="29" cy="16" r="10" fill="#F79E1B"/><path d="M24 8.5a10 10 0 000 15" fill="#FF5F00"/></svg>
              </span>
              <span className="ft-pay-chip">
                <svg viewBox="0 0 56 32" width="48" height="28"><rect width="56" height="32" rx="4" fill="#fff" stroke="#e2e8f0"/><text x="28" y="20" textAnchor="middle" fill="#097540" fontSize="11" fontWeight="800" fontFamily="Arial">RuPay</text></svg>
              </span>
              <span className="ft-pay-chip">
                <svg viewBox="0 0 48 32" width="40" height="28"><rect width="48" height="32" rx="4" fill="#fff" stroke="#e2e8f0"/><text x="24" y="20" textAnchor="middle" fill="#333" fontSize="12" fontWeight="800" fontFamily="Arial">UPI</text></svg>
              </span>
              <span className="ft-pay-chip">
                <svg viewBox="0 0 56 32" width="48" height="28"><rect width="56" height="32" rx="4" fill="#002970"/><text x="28" y="21" textAnchor="middle" fill="#00B9F5" fontSize="13" fontWeight="800" fontFamily="Arial">paytm</text></svg>
              </span>
              <span className="ft-pay-chip">
                <svg viewBox="0 0 56 32" width="48" height="28"><rect width="56" height="32" rx="4" fill="#fff" stroke="#e2e8f0"/><text x="28" y="21" textAnchor="middle" fill="#4285F4" fontSize="11" fontWeight="700" fontFamily="Arial">G Pay</text></svg>
              </span>
              <span className="ft-pay-chip">
                <svg viewBox="0 0 64 32" width="54" height="28"><rect width="64" height="32" rx="4" fill="#5F259F"/><text x="32" y="21" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="Arial">PhonePe</text></svg>
              </span>
            </div>
          </div>
          <div className="ft-payments-right">
            <div className="ft-app-download">
              <div className="ft-app-text">
                <strong>Download Our App</strong>
                <span>Shop on the go, anytime, anywhere.</span>
              </div>
              <div className="ft-app-badges">
                <a href="#" className="ft-app-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  App Store
                </a>
                <a href="#" className="ft-app-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.609 22.186a.996.996 0 01-.609-.92V2.734a.996.996 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.707l2.49 1.442c.52.3.52 1.116 0 1.416l-2.49 1.442-2.534-2.534 2.534-2.766zM5.864 3.471L16.801 9.804l-2.302 2.302L5.864 3.471z"/></svg>
                  Google Play
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───── Bottom Bar ───── */}
      <div className="ft-bottom-bar">
        <div className="ft-bottom-inner">
          <p className="ft-copyright">
            © {new Date().getFullYear()} ShopMyUniform — Built by{" "}
            <a href="#" className="ft-credit-link">@N.Pranav</a>
          </p>
          <div className="ft-bottom-links">
            <Link to="/">Terms of Service</Link>
            <span className="ft-bottom-sep">|</span>
            <Link to="/">Privacy Policy</Link>
            <span className="ft-bottom-sep">|</span>
            <Link to="/">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
