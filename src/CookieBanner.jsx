// CookieBanner.jsx — PECR + UK GDPR compliant cookie consent
// Consent is logged via the MyBizPal API (server records the real IP for the audit trail)

import { useState, useEffect, useRef } from "react";

// Exported so consent-gated features elsewhere read the SAME key rather than
// re-typing the string and silently drifting from it.
export const CONSENT_KEY = "mbp_cookie_consent";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const logConsent = async (type) => {
  try {
    await fetch(`${API_URL}/api/consent-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consent_type: type,
        user_agent: navigator.userAgent,
        page_url: window.location.href,
      }),
    });
  } catch (err) {
    // Fail silently — consent is still saved to localStorage
    console.warn("Consent log failed:", err);
  }
};

// Published so anything anchored to the bottom of the viewport can sit clear of
// the banner. The banner is z-index 9999 and full-width, so it covers the Sofi
// launcher (z-index 500, bottom-right) completely — on a first visit the FAB,
// its bubble and the bubble's ✕ were all untappable. Lifting by the banner's
// measured height keeps every stacking order exactly as it was.
const BANNER_H_VAR = "--mbp-banner-h";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const barRef = useRef(null);

  // Measured, not hardcoded: the banner wraps to two or three rows depending on
  // viewport width, so its height is 100-220px in practice. A constant would be
  // wrong on most screens.
  useEffect(() => {
    const root = document.documentElement;
    const clear = () => root.style.setProperty(BANNER_H_VAR, "0px");
    if (!visible) { clear(); return; }
    const el = barRef.current;
    if (!el) { clear(); return; }
    const apply = () => root.style.setProperty(BANNER_H_VAR, `${Math.ceil(el.getBoundingClientRect().height)}px`);
    apply();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(apply) : null;
    ro?.observe(el);
    window.addEventListener("resize", apply);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", apply);
      clear();
    };
  }, [visible]);

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (!saved) {
      setTimeout(() => setVisible(true), 800);
    } else {
      setShowIcon(true);
      if (saved === "all") loadAnalytics();
    }
  }, []);

  const loadAnalytics = () => {
    // Load Google Analytics / HubSpot etc. here once consent is given
    // if (!document.getElementById("ga-script")) {
    //   const s = document.createElement("script");
    //   s.id = "ga-script";
    //   s.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX";
    //   s.async = true;
    //   document.head.appendChild(s);
    // }
  };

  const accept = async (type) => {
    localStorage.setItem(CONSENT_KEY, type);
    setVisible(false);
    setShowIcon(true);
    await logConsent(type);
    if (type === "all") loadAnalytics();
  };

  const reopen = () => setVisible(true);

  if (!visible && !showIcon) return null;

  return (
    <>
      {/* Cookie banner */}
      {visible && (
        <div ref={barRef} style={{
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
