// CookieBanner.jsx — PECR + UK GDPR compliant cookie consent
// Drop into src/CookieBanner.jsx and import in App.jsx

import { useState, useEffect } from "react";

const CONSENT_KEY = "mbp_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showIcon, setShowIcon] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (!saved) {
      // Small delay so it doesn't flash on load
      setTimeout(() => setVisible(true), 800);
    } else {
      setShowIcon(true);
      if (saved === "all") loadAnalytics();
    }
  }, []);

  const loadAnalytics = () => {
    // Load Google Analytics / HubSpot etc. here once consent is given
    // Example: inject GA script tag
    // if (!document.getElementById("ga-script")) {
    //   const s = document.createElement("script");
    //   s.id = "ga-script";
    //   s.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX";
    //   s.async = true;
    //   document.head.appendChild(s);
    // }
  };

  const accept = (type) => {
    localStorage.setItem(CONSENT_KEY, type);
    setVisible(false);
    setShowIcon(true);
    if (type === "all") loadAnalytics();
  };

  const reopen = () => setVisible(true);

  if (!visible && !showIcon) return null;

  return (
    <>
      {/* Cookie banner */}
      {visible && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
          background: "#fff", borderTop: "3px solid #00E5FF",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
          fontFamily: "'DM Sans', 'Manrope', sans-serif",
          padding: "20px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "24px", flexWrap: "wrap",
        }}>
          {/* Text */}
          <div style={{ flex: "1 1 320px", minWidth: 240 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E", marginBottom: 4 }}>
              We use cookies
            </div>
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>
              We use essential cookies to keep the site running. We'd also like to set analytics
              cookies to understand how you use our site. No advertising cookies are used.{" "}
              <a href="/cookies" target="_blank" rel="noreferrer"
                style={{ color: "#7B1FA2", textDecoration: "underline" }}>
                Cookie Policy
              </a>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
            <button
              onClick={() => accept("essential")}
              style={{
                padding: "9px 20px", borderRadius: 100, cursor: "pointer",
                background: "#fff", color: "#00C4DD", border: "1.5px solid #00E5FF",
                fontSize: 13, fontWeight: 700, fontFamily: "inherit", whiteSpace: "nowrap",
              }}>
              Essential Only
            </button>
            <button
              onClick={() => accept("all")}
              style={{
                padding: "9px 20px", borderRadius: 100, cursor: "pointer",
                background: "#00E5FF", color: "#000", border: "1.5px solid #00E5FF",
                fontSize: 13, fontWeight: 700, fontFamily: "inherit", whiteSpace: "nowrap",
              }}>
              Accept All
            </button>
          </div>
        </div>
      )}

      {/* Floating cookie icon — reopens banner */}
      {showIcon && !visible && (
        <button
          onClick={reopen}
          title="Cookie preferences"
          aria-label="Manage cookie preferences"
          style={{
            position: "fixed", bottom: 20, left: 20, zIndex: 9998,
            width: 40, height: 40, borderRadius: "50%",
            background: "#fff", border: "1.5px solid #E8E8F0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            cursor: "pointer", fontSize: 20, display: "flex",
            alignItems: "center", justifyContent: "center",
            transition: "transform .2s, box-shadow .2s",
          }}
          onMouseEnter={e => { e.target.style.transform = "scale(1.12)"; e.target.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)"; }}
          onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"; }}
        >
          🍪
        </button>
      )}
    </>
  );
}
