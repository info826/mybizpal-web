import { useState, useEffect, useRef } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import CookieBanner, { CONSENT_KEY } from "./CookieBanner";

const LOGO_FULL = "https://res.cloudinary.com/dp8novljz/image/upload/MyBizPal_Full_Logo_Dark_BG_R_gud0ag.png";
const LOGO_ICON = "https://res.cloudinary.com/dp8novljz/image/upload/MyBizPal_Full_Logo_Dark_BG_R_gud0ag.png";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const WA_NUMBER = import.meta.env.VITE_WA_NUMBER || "447360280655";
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

// ── Integration logos (Cloudinary-hosted, trimmed & fitted to 72px height) ───
const CLD = "https://res.cloudinary.com/dp8novljz/image/upload/f_auto,q_auto,e_trim,h_72,c_fit";

// ── Sofi launcher avatar (Cloudinary video) ─────────────────────────────────
// Verified 18 Aug 2026: webm 45KB (vp9), mp4 36KB (avc1), poster 4.9KB.
// The poster is derived from the MP4's public id (sofi-wave_wfxmpt) while the
// webm is a different id (sofi-wave_rzws1b) — that mismatch is in the source
// assets, not a typo here; all three resolve.
const SOFI_AVATAR_BASE = "https://res.cloudinary.com/dp8novljz/video/upload/v1787079094";
const SOFI_AVATAR_POSTER =
  "https://res.cloudinary.com/dp8novljz/video/upload/so_1.5,f_jpg,w_256,h_256/sofi-wave_wfxmpt.jpg";
const INTEGRATIONS = [
  { name: "WhatsApp",        logo: `${CLD}/WhatsApp_Logo_b8suk6.png`        },
  { name: "Google Calendar", logo: `${CLD}/Google_Calendar_Logo_wj8gjo.png` },
  { name: "Calendly",        logo: `${CLD}/Calendly_Logo_nw6arq.png`        },
  { name: "Zoom",            logo: `${CLD}/Zoom_Logo_hxzqir.png`            },
  { name: "n8n",             logo: `${CLD}/N8N_Logo_qo07ha.png`             },
  { name: "HubSpot",         logo: `${CLD}/HubSpot_Logo_k3thxr.png`         },
  { name: "GoHighLevel",     logo: `${CLD}/GoHighLevel_Logo_sdm3ck.png`     },
  { name: "Gmail",           logo: `${CLD}/Gmail_Logo_k5yyp9.png`           },
  { name: "Outlook",         logo: `${CLD}/Outlook_Logo_mwemjs.png`         },
  { name: "Slack",           logo: `${CLD}/Slack_Logo_ic65to.png`           },
  { name: "Stripe",          logo: `${CLD}/Stripe_Logo_twta5u.png`          },
  { name: "LinkedIn",        logo: `${CLD}/LinkedIn_Logo_yqllkl.png`        },
];

const FAQS = [
  {q:"Does MyBizPal sound like a real human?",a:"Yes. We use ElevenLabs and advanced conversational AI to deliver natural, human-quality voices. The vast majority of callers cannot tell the difference."},
  {q:"How quickly can I go live?",a:"Most businesses are fully live within 24 hours. We handle onboarding, voice training, and integrations — no technical knowledge needed."},
  {q:"Can it book directly into my calendar?",a:"Absolutely. MyBizPal integrates with Google Calendar and Calendly, checking real-time availability and confirming bookings with clients instantly."},
  {q:"What happens if the AI cannot handle something?",a:"The AI escalates gracefully — transferring to a human, taking a detailed message, or scheduling a callback. Nothing falls through the cracks."},
  {q:"Is my data GDPR compliant?",a:"All data is encrypted in transit and at rest. We are ICO registered and fully GDPR compliant. Your data is never used to train AI models."},
  {q:"Do I need a developer to set this up?",a:"Not at all. Our step-by-step wizard connects your calendar, phone number, and existing tools in minutes."},
  {q:"Can I customise the AI's voice and personality?",a:"Yes — on Pro and Elite plans you can choose the voice, name, tone, and persona of your AI agent. It can sound exactly like a member of your team."},
  {q:"Does it make outbound calls too?",a:"Yes. MyBizPal can make outbound calls to follow up on leads, confirm appointments, and re-engage cold prospects automatically."},
];

const TESTIMONIALS = [
  {text:"MyBizPal instantly started booking leads after hours. We doubled appointments in the first month without hiring anyone.",name:"D. Soden",role:"Clinic Owner, London",photo:"/D.Soden.png"},
  {text:"The AI sounds completely natural. Our team can now focus on in-person clients instead of answering the same questions by phone.",name:"A. Patel",role:"Home Services, Birmingham",photo:"/A.Patel.png"},
  {text:"Easiest setup I have done. Paid for itself within the first week. If you run an SME and miss calls, you need this now.",name:"Chris D.",role:"Agency Owner, Manchester",photo:"/Chris.D.png"},
];

// desktopOrder = left→right on wide screens (Exclusive, Elite, Pro, Starter).
// mobileOrder  = top→bottom when stacked (Pro, Starter, Elite, Exclusive).
const PLANS = [
  {
    key:"starter",tier:"Starter",tagline:"Never miss a call.",
    featured:false,trial:"7-Day Free Trial",badge:"7-Day Free Trial",monthly:"197",annual:"158",setup:null,
    desktopOrder:4,mobileOrder:2,cta:"Start 7-day free trial",
    roi:"Pays back from ~1 recovered lead/mo",
    features:["Inbound call answering","WhatsApp conversations","Google Calendar booking","FAQ & customer service","Call transcripts","Basic analytics","500 voice minutes/mo (unlimited WhatsApp, fair use)"],
    locked:"Unlock with Pro: Outbound calling & lead qualification",
  },
  {
    key:"pro",tier:"Pro",tagline:"Your AI sales & service team.",
    featured:true,trial:"14-Day Free Trial",badge:"14-Day Free Trial",monthly:"497",annual:"397",setup:"299",
    desktopOrder:3,mobileOrder:1,cta:"Start 14-day free trial",
    roi:"Avg. client recovers £2,400/mo",
    features:["SMS & email integration","Slack notifications","Outbound calling","Lead input & qualification","1 CRM integration","Unlimited calling (fair use)",{from:"Everything in Starter"},"Inbound call answering","WhatsApp conversations","Google Calendar booking","FAQ & customer service","Call transcripts","Basic analytics","500 voice minutes/mo (unlimited WhatsApp, fair use)"],
    locked:"Unlock with Elite: Outbound campaigns at scale, full CRM suite & closer briefings",
  },
  {
    key:"elite",tier:"Elite",tagline:"A revenue engine that never sleeps.",
    featured:false,contactSales:true,badge:"✦ Enterprise",desktopOrder:2,mobileOrder:3,cta:"Contact Sales",
    roi:"Less than a quarter the cost of one SDR (£50k+/yr).",
    features:["Outbound campaigns at scale","Full CRM integrations","Closer briefings","Advanced analytics","Multilingual","Dedicated account manager","Done-for-you onboarding",{from:"Everything in Pro"},"SMS & email integration","Slack notifications","Outbound calling","Lead input & qualification","1 CRM integration","Unlimited calling (fair use)",{from:"Everything in Starter"},"Inbound call answering","WhatsApp conversations","Google Calendar booking","FAQ & customer service","Call transcripts","Basic analytics","500 voice minutes/mo (unlimited WhatsApp, fair use)"],
    locked:"Unlock with Exclusive: White-label, multi-location & bespoke build",
  },
  {
    key:"exclusive",tier:"Exclusive",tagline:"Built entirely around you.",
    featured:false,contactSales:true,salesPlan:"exclusive",badge:"✦ Bespoke",desktopOrder:1,mobileOrder:4,cta:"Contact Sales",
    roi:"Less than a quarter the cost of one SDR (£50k+/yr).",
    features:["White-label","Multi-location","Voice cloning / custom voice","Bespoke integrations","White-glove onboarding + SLA",{from:"Everything in Elite"},"Outbound campaigns at scale","Full CRM integrations","Closer briefings","Advanced analytics","Multilingual","Dedicated account manager","Done-for-you onboarding",{from:"Everything in Pro & Starter"},"Outbound calling & lead qualification","SMS, email & Slack integration","1 CRM integration","Unlimited calling (fair use)","Inbound call answering","WhatsApp conversations","Google Calendar booking","FAQ & customer service","Call transcripts","Basic analytics","500 voice minutes/mo (unlimited WhatsApp, fair use)"],
    locked:null,
  },
];

const INDUSTRIES = [
  {icon:"🔧",name:"Trades & Home Services",desc:"Never miss an emergency call after hours."},
  {icon:"⚖️",name:"Legal & Professional",desc:"Qualify leads before they reach your desk."},
  {icon:"🏥",name:"Health & Wellness",desc:"Book appointments around the clock."},
  {icon:"🏠",name:"Property & Lettings",desc:"Reply to every enquiry instantly."},
  {icon:"🛒",name:"Retail & eCommerce",desc:"Handle order queries on WhatsApp."},
  {icon:"🍽️",name:"Hospitality & Food",desc:"Bookings, menus, enquiries — handled."},
  {icon:"🎓",name:"Education & Coaching",desc:"Enrol and qualify students 24/7."},
  {icon:"🏢",name:"Agencies & B2B",desc:"White-label under your brand."},
];

const TICKER = ["AI Voice Agent","24/7 Availability","Calendar Booking","Outbound Calling","WhatsApp Automation","Lead Qualification","CRM Integration","Human Handoff","Zero Missed Calls","No Code Setup","Real Time AI","UK Based","AI Voice Agent","24/7 Availability","Calendar Booking","Outbound Calling","WhatsApp Automation","Lead Qualification","CRM Integration","Human Handoff","Zero Missed Calls","No Code Setup","Real Time AI","UK Based"];

// ── Compare table rows ────────────────────────────────────────────────────────
const COMPARE_ROWS = [
  ["Answers calls 24/7",             "Office hours only",     "Inbound only",           "✓ 24/7 inbound + outbound"],
  ["Makes outbound calls",           "❌",                    "❌ Rarely",               "✓ Automated follow-ups"],
  ["WhatsApp integration",           "Manual only",           "❌ Most don't",           "✓ Native WhatsApp AI"],
  ["Remembers past conversations",   "Partially",             "❌",                      "✓ Full conversation memory"],
  ["Lead qualification",             "Basic / scripted",      "Limited",                 "✓ AI-driven qualification"],
  ["Books appointments",             "During hours only",     "Google Cal only",         "✓ Cal, Calendly & more"],
  ["CRM integrations",               "Manual entry",          "Limited",                 "✓ HubSpot, GHL, webhooks"],
  ["Custom voice & AI persona",      "❌",                    "❌",                      "✓ Full customisation"],
  ["Backend dashboard",              "❌",                    "❌",                      "✓ Client portal included"],
  ["N8N / custom automations",       "❌",                    "❌ Locked",               "✓ Unlimited workflows"],
  ["UK phone number",                "Yes",                   "❌ US/international",      "✓ Local UK number"],
  ["Pricing (GBP)",                  "£2k–£3.5k/mo salary",  "£300–£1,500+/mo",         "✓ From £197/mo"],
  ["Setup time",                     "Weeks",                 "2–8 weeks",               "✓ Live in 7 days"],
  ["Performance guarantee",          "❌",                    "❌",                      "✓ 30-day money back"],
];

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#000;color:#F5F5F7;font-family:'Manrope',sans-serif;font-size:17px;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
h1,h2,h3{font-family:'Manrope',sans-serif;line-height:1.1;letter-spacing:-0.03em;font-weight:700}
::selection{background:#00D4FF;color:#000}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#000}::-webkit-scrollbar-thumb{background:#333;border-radius:2px}
.grad-text{background:linear-gradient(135deg,#00D4FF,#9B5FFF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.eyebrow{font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:16px;background:linear-gradient(135deg,#00D4FF,#9B5FFF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}

/* NAV */
.nav{position:fixed;top:0;left:0;right:0;z-index:200;height:120px;padding:0 48px;display:flex;align-items:center;justify-content:space-between;transition:all .4s}
.nav.scrolled{background:rgba(0,0,0,0.75);backdrop-filter:blur(24px);border-bottom:1px solid rgba(255,255,255,0.08)}
.nav-logo{display:flex;align-items:center;text-decoration:none}
.nav-logo img{height:52px;width:auto}
.nav-links{display:flex;align-items:center;gap:28px;list-style:none}
.nav-links a{color:#A1A1A6;text-decoration:none;font-size:14px;font-weight:500;transition:color .2s;cursor:pointer}
.nav-links a:hover{color:#F5F5F7}
.nav-right{display:flex;align-items:center;gap:10px}
.btn-ghost{background:transparent;color:#A1A1A6;border:none;padding:8px 16px;border-radius:20px;font-family:'Manrope',sans-serif;font-size:14px;cursor:pointer;transition:color .2s;text-decoration:none;display:inline-flex;align-items:center}
.btn-ghost:hover{color:#F5F5F7}
.btn-pill{background:rgba(255,255,255,0.1);color:#F5F5F7;border:1px solid rgba(255,255,255,0.13);padding:8px 18px;border-radius:20px;font-family:'Manrope',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;text-decoration:none;display:inline-flex;align-items:center;gap:6px;backdrop-filter:blur(8px)}
.btn-pill:hover{background:rgba(255,255,255,0.15)}
.btn-primary{background:linear-gradient(135deg,#00D4FF,#7B2FFF,#4060FF);color:#000;border:none;padding:15px 30px;border-radius:100px;font-family:'Manrope',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all .25s;text-decoration:none;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.btn-primary:hover{opacity:.88;transform:translateY(-1px);box-shadow:0 8px 32px rgba(0,212,255,0.28)}
.btn-outline{background:rgba(255,255,255,0.06);color:#F5F5F7;border:1px solid rgba(255,255,255,0.13);padding:15px 30px;border-radius:100px;font-family:'Manrope',sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all .25s;text-decoration:none;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;backdrop-filter:blur(8px)}
.btn-outline:hover{background:rgba(255,255,255,0.10);border-color:rgba(255,255,255,0.22);transform:translateY(-1px)}

/* HERO */
.hero{min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:100px 24px 80px;position:relative;overflow:hidden}
.hero-glow{position:absolute;top:-10%;left:50%;transform:translateX(-50%);width:900px;height:700px;pointer-events:none;background:radial-gradient(ellipse at 50% 0%,rgba(0,212,255,0.18) 0%,rgba(123,47,255,0.10) 40%,transparent 70%)}
.hero-grid{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px);background-size:80px 80px;mask-image:radial-gradient(ellipse 70% 60% at 50% 40%,black 0%,transparent 100%)}
.hero-ring{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:700px;height:700px;border-radius:50%;border:1px solid rgba(0,212,255,0.06);pointer-events:none;animation:ringPulse 8s ease-in-out infinite}
.hero-ring2{width:1000px;height:1000px;border:1px solid rgba(123,47,255,0.04);animation:ringPulse 10s ease-in-out infinite reverse}
@keyframes ringPulse{0%,100%{opacity:.6;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.02)}}
.hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px 6px 8px;border-radius:100px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.13);font-size:13px;color:#A1A1A6;margin-bottom:28px;position:relative;z-index:1;backdrop-filter:blur(8px)}
.hero-badge-pill{background:linear-gradient(135deg,#00D4FF,#7B2FFF,#4060FF);color:#000;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase}
.hero-title{font-size:clamp(52px,8.5vw,92px);font-weight:800;letter-spacing:-0.05em;line-height:1.0;margin-bottom:28px;position:relative;z-index:1;max-width:1000px;color:#F5F5F7}
.hero-sub{font-size:clamp(17px,2.2vw,21px);color:#A1A1A6;max-width:580px;margin:0 auto 40px;font-weight:300;line-height:1.65;position:relative;z-index:1}
.hero-ctas{display:flex;align-items:center;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:72px;position:relative;z-index:1}
.stats-bar{display:flex;align-items:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;position:relative;z-index:1;backdrop-filter:blur(12px)}
.stat-item{padding:20px 44px;text-align:center;border-right:1px solid rgba(255,255,255,0.08)}
.stat-item:last-child{border-right:none}
.stat-val{font-family:'Manrope',sans-serif;font-size:30px;font-weight:800;letter-spacing:-0.04em;margin-bottom:2px}
.stat-label{font-size:11px;color:#6E6E73;text-transform:uppercase;letter-spacing:0.1em}

/* FEATURE STRIP (shimmer grid) */
.feat-strip{border-top:1px solid rgba(255,255,255,0.08);border-bottom:1px solid rgba(255,255,255,0.08);padding:34px 24px;background:rgba(255,255,255,0.02);position:relative;z-index:1}
.feat-strip-grid{max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.feat-strip-tag{position:relative;padding:11px 20px;border-radius:12px;font-size:13.5px;font-weight:600;color:#D6D6DE;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);overflow:hidden;white-space:nowrap}
.feat-strip-tag::after{content:'';position:absolute;top:0;left:-120%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(0,212,255,0.25),transparent)}
@media (prefers-reduced-motion:no-preference){
  .feat-strip-tag::after{animation:featShimmer 5s linear infinite}
  .feat-strip-tag:nth-child(2n)::after{animation-delay:1.2s}
  .feat-strip-tag:nth-child(3n)::after{animation-delay:2.4s}
  .feat-strip-tag:nth-child(4n)::after{animation-delay:3.6s}
}
@keyframes featShimmer{0%{left:-120%}60%,100%{left:140%}}

/* SECTIONS */
.section{padding:100px 24px;max-width:1200px;margin:0 auto;position:relative;z-index:1}
.section-h{font-size:clamp(36px,5vw,56px);font-weight:800;margin-bottom:18px;letter-spacing:-0.04em;color:#F5F5F7}
.section-sub{font-size:18px;color:#A1A1A6;font-weight:300;line-height:1.7;max-width:520px}
.mb64{margin-bottom:64px}
.text-center{text-align:center}

/* VIDEO */
.video-section{padding:80px 24px;position:relative;z-index:1;max-width:900px;margin:0 auto;text-align:center}
.video-label{display:inline-block;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;background:rgba(0,212,255,0.12);color:#00D4FF;border:1px solid rgba(0,212,255,0.2);padding:4px 12px;border-radius:100px;margin-bottom:12px}
.video-box{position:relative;border-radius:20px;overflow:hidden;background:#0d0d1a;border:1px solid rgba(255,255,255,0.08);aspect-ratio:16/9;cursor:pointer;transition:border-color .3s}
.video-box:hover{border-color:rgba(0,212,255,0.35)}
.video-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(0,212,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.04) 1px,transparent 1px);background-size:40px 40px}
.video-glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:400px;height:300px;background:radial-gradient(ellipse,rgba(0,212,255,0.12) 0%,rgba(123,47,255,0.08) 40%,transparent 70%);pointer-events:none}
.video-play-wrap{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}
.play-btn{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#00D4FF,#7B2FFF);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s}
.play-btn:hover{transform:scale(1.08);box-shadow:0 0 40px rgba(0,212,255,0.4)}
.play-tri{width:0;height:0;border-top:11px solid transparent;border-bottom:11px solid transparent;border-left:18px solid #000;margin-left:3px}
.vid-corner{position:absolute;width:20px;height:20px}

/* PAIN SECTION */
.pain-section{padding:80px 24px;background:linear-gradient(180deg,transparent,rgba(255,70,40,0.025),transparent)}
.pain-inner{max-width:1200px;margin:0 auto}
.pain-eyebrow{font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#FF6B35;margin-bottom:14px}
.pain-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:48px}
.pain-card{background:#0d0d1a;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:32px;position:relative;overflow:hidden;transition:border-color .3s,transform .3s}
.pain-card:hover{border-color:rgba(255,107,53,0.3);transform:translateY(-3px)}
.pain-bar{position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#FF6B35,#FF3535)}
.pain-num{font-size:48px;font-weight:800;letter-spacing:-0.04em;line-height:1;margin-bottom:12px;color:#FF6B35}
.pain-title{font-size:16px;font-weight:700;margin-bottom:8px;color:#F5F5F7}
.pain-desc{font-size:14px;color:#A1A1A6;line-height:1.7;font-weight:300}

/* HOW IT WORKS */
.steps-wrap{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.08);border-radius:24px;overflow:hidden}
.step{background:#0d0d1a;padding:52px 40px;transition:background .3s;position:relative;overflow:hidden}
.step:hover{background:#111126}
.step-num{font-size:80px;font-weight:800;line-height:1;margin-bottom:28px;letter-spacing:-0.06em;background:linear-gradient(135deg,#00D4FF,#7B2FFF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;opacity:0.55}
.step-icon{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,rgba(0,212,255,0.12),rgba(123,47,255,0.12));border:1px solid rgba(0,212,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:22px}
.step-title{font-size:21px;font-weight:700;margin-bottom:12px;letter-spacing:-0.02em;color:#F5F5F7}
.step-desc{font-size:15px;color:#A1A1A6;line-height:1.7;font-weight:300}
.step-line{position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(135deg,#00D4FF,#7B2FFF);opacity:0;transition:opacity .3s}
.step:hover .step-line{opacity:1}

/* FEATURES */
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.feat-card{background:#0d0d1a;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:36px;transition:border-color .3s,transform .3s;position:relative;overflow:hidden}
.feat-card:hover{border-color:rgba(0,212,255,0.25);transform:translateY(-3px)}
.feat-icon{font-size:30px;margin-bottom:18px;display:block}
.feat-tag{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:100px;background:rgba(0,255,148,0.08);border:1px solid rgba(0,255,148,0.2);font-size:11px;font-weight:700;color:#00FF94;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px}
.feat-title{font-size:20px;font-weight:700;margin-bottom:10px;letter-spacing:-0.02em;color:#F5F5F7}
.feat-desc{font-size:14px;color:#A1A1A6;line-height:1.7;font-weight:300}

/* INTEGRATIONS */
.logos-section{padding:88px 24px;border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.01)}
.logos-inner{max-width:1200px;margin:0 auto;text-align:center}
.logos-label{font-size:13px;color:#7B7B8C;text-transform:uppercase;letter-spacing:3px;font-weight:700;margin-bottom:40px}
.logo-pill{display:inline-flex;align-items:center;gap:14px;padding:11px 28px 11px 11px;border:1px solid rgba(255,255,255,0.09);border-radius:100px;background:#101019;white-space:nowrap;flex-shrink:0}
.logo-tile{width:48px;height:48px;border-radius:13px;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden}
.logo-tile img{width:32px;height:32px;object-fit:contain}
.logo-name{font-size:17px;font-weight:600;color:#F2F2F7}
.marquee-row{overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent);mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)}
.marquee-row+.marquee-row{margin-top:18px}
.marquee-track{display:flex;align-items:center;gap:14px;width:max-content}
.logos-disclaimer{max-width:600px;margin:36px auto 0;font-size:11px;color:#46464F;line-height:1.6}
@media (prefers-reduced-motion: no-preference){
  .marquee-track{animation:logoMarquee 48s linear infinite}
  .marquee-row-1 .marquee-track{animation-direction:reverse}
  .marquee-row:hover .marquee-track{animation-play-state:paused}
}
@keyframes logoMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@media (prefers-reduced-motion: reduce){
  .marquee-row{-webkit-mask-image:none;mask-image:none}
  .marquee-row+.marquee-row{margin-top:14px}
  .marquee-track{flex-wrap:wrap;justify-content:center;width:auto}
}

/* CALCULATOR */
.calc-section{padding:80px 24px;position:relative;z-index:1}
.calc-inner{max-width:1100px;margin:0 auto;background:#0d0d1a;border:1px solid rgba(255,255,255,0.08);border-radius:28px;overflow:hidden}
.calc-header{padding:52px 52px 0;text-align:center}
.calc-body{display:grid;grid-template-columns:1fr 1fr;padding:36px 52px 52px;gap:48px}
.calc-left{border-right:1px solid rgba(255,255,255,0.07);padding-right:48px}
.calc-field{margin-bottom:24px}
.calc-field-label{font-size:12px;font-weight:700;color:#6E6E73;text-transform:uppercase;letter-spacing:0.08em;display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.calc-val{color:#00D4FF;font-size:14px;font-weight:800;letter-spacing:0;text-transform:none}
.slider{width:100%;height:4px;-webkit-appearance:none;appearance:none;border-radius:2px;outline:none;cursor:pointer}
.slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 0 0 4px rgba(0,212,255,0.25);cursor:pointer}
.slider::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 0 0 4px rgba(0,212,255,0.25);cursor:pointer;border:none}
.calc-result-wrap{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:24px;margin-bottom:16px}
.calc-result-label{font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#6E6E73;margin-bottom:6px}
.calc-result-num{font-size:44px;font-weight:800;letter-spacing:-0.04em;background:linear-gradient(135deg,#00D4FF,#9B5FFF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;margin-bottom:4px}
.calc-result-sub{font-size:13px;color:#6E6E73}
.calc-rows{display:flex;flex-direction:column;gap:8px;margin-bottom:20px}
.calc-row{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px;font-size:13px}
.calc-row-label{color:#6E6E73}
.calc-row-val{font-weight:700;color:#F5F5F7}
.calc-row-val.green{color:#00FF94}

/* INDUSTRIES */
.industries-section{padding:80px 24px;position:relative;z-index:1}
.industries-inner{max-width:1200px;margin:0 auto}
.industries-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:48px}
.industry-card{background:#0d0d1a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:26px 20px;text-align:center;cursor:pointer;transition:all .25s;position:relative;overflow:hidden}
.industry-card:hover{border-color:rgba(0,212,255,0.35);background:rgba(0,212,255,0.04);transform:translateY(-3px)}
.industry-icon{font-size:28px;margin-bottom:10px}
.industry-name{font-size:14px;font-weight:700;margin-bottom:5px;color:#F5F5F7}
.industry-desc{font-size:12px;color:#6E6E73;line-height:1.5}

/* COMPARISON TABLE */
.compare-section{padding:80px 24px;position:relative;z-index:1}
.compare-inner{max-width:1200px;margin:0 auto}
.compare-scroll{overflow-x:auto}
.compare-table{width:100%;border-collapse:separate;border-spacing:0;background:#0d0d1a;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;table-layout:fixed}
.compare-table th{padding:18px 20px;font-size:12px;font-weight:700;text-align:center;border-bottom:1px solid rgba(255,255,255,0.08)}
.compare-table th:first-child{text-align:left;width:32%;color:#6E6E73}
.compare-table th.col-rec{color:#FF6B35}
.compare-table th.col-ai{color:#A1A1A6}
.compare-table th.col-new{background:rgba(0,212,255,0.05);color:#00D4FF;border-left:1px solid rgba(0,212,255,0.15);border-right:1px solid rgba(0,212,255,0.15)}
.compare-table td{padding:12px 20px;font-size:13px;color:#6E6E73;border-bottom:1px solid rgba(255,255,255,0.04);text-align:center}
.compare-table td:first-child{color:#F5F5F7;font-weight:600;text-align:left}
.compare-table td.col-new{background:rgba(0,212,255,0.02);border-left:1px solid rgba(0,212,255,0.08);border-right:1px solid rgba(0,212,255,0.08);color:#F5F5F7;font-weight:600}
.compare-table tr:last-child td{border-bottom:none}
.compare-table tr:hover td{background:rgba(255,255,255,0.015)}
.compare-table tr:hover td.col-new{background:rgba(0,212,255,0.04)}
.compare-hint{display:none;text-align:center;color:#6E6E73;font-size:12px;margin-top:12px;font-family:'Manrope',sans-serif}
.check-yes{color:#00FF94}
.check-no{color:#FF5555}

/* DEMO FORM (kept inline, hidden) */
.demo-wrap{padding:0 24px 100px;position:relative;z-index:1}
.demo-inner{max-width:1200px;margin:0 auto;background:#0d0d1a;border:1px solid rgba(255,255,255,0.08);border-radius:28px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr;position:relative}
.demo-left{padding:64px 52px;border-right:1px solid rgba(255,255,255,0.08);position:relative;z-index:1}
.demo-right{padding:64px 52px;position:relative;z-index:1}
.demo-title{font-size:clamp(28px,3.5vw,40px);font-weight:800;letter-spacing:-0.04em;margin-bottom:16px;color:#F5F5F7}
.demo-desc{font-size:16px;color:#A1A1A6;line-height:1.7;font-weight:300;margin-bottom:32px}
.demo-feats{list-style:none;display:flex;flex-direction:column;gap:13px}
.demo-feats li{display:flex;align-items:center;gap:10px;font-size:14px;color:#A1A1A6}
.df-check{width:18px;height:18px;flex-shrink:0;border-radius:50%;background:rgba(0,255,148,0.1);border:1px solid rgba(0,255,148,0.25);display:flex;align-items:center;justify-content:center;font-size:10px;color:#00FF94}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.form-group{margin-bottom:14px}
.form-label{display:block;font-size:12px;font-weight:600;color:#6E6E73;margin-bottom:6px;letter-spacing:0.04em;text-transform:uppercase}
.form-label span{color:#FF453A}
.form-input{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:13px 16px;color:#F5F5F7;font-family:'Manrope',sans-serif;font-size:15px;transition:all .2s;outline:none}
.form-input:focus{border-color:rgba(0,212,255,0.5);background:rgba(0,212,255,0.04);box-shadow:0 0 0 3px rgba(0,212,255,0.08)}
.form-input::placeholder{color:#6E6E73}
.form-input.err{border-color:rgba(255,69,58,0.6)}
.phone-wrap{display:flex;gap:8px}
.country-select{position:relative;flex-shrink:0;width:120px}
.country-trigger{width:120px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:13px 12px;color:#F5F5F7;font-family:'Manrope',sans-serif;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:4px;transition:all .2s;user-select:none;white-space:nowrap}
.country-trigger:hover,.country-trigger.open{border-color:rgba(0,212,255,0.5);background:rgba(0,212,255,0.04)}
.country-dropdown{position:absolute;top:calc(100% + 4px);left:0;width:200px;background:#111126;border:1px solid rgba(255,255,255,0.12);border-radius:12px;overflow-x:hidden;overflow-y:auto;max-height:220px;z-index:300;box-shadow:0 8px 24px rgba(0,0,0,0.5)}
.country-option{padding:10px 14px;font-size:13px;color:#F5F5F7;cursor:pointer;transition:background .15s;white-space:nowrap}
.country-option:hover{background:rgba(0,212,255,0.1)}
.country-option.active{background:rgba(0,212,255,0.08);color:#00D4FF}
.field-err{font-size:11px;color:#FF453A;margin-top:4px}
.form-submit{width:100%;background:linear-gradient(135deg,#00D4FF,#7B2FFF,#4060FF);color:#000;border:none;padding:15px;border-radius:100px;font-family:'Manrope',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all .25s;margin-top:8px;display:flex;align-items:center;justify-content:center;gap:8px}
.form-submit:hover{opacity:.88;box-shadow:0 8px 30px rgba(0,212,255,0.3);transform:translateY(-1px)}
.form-submit:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}
.form-note{font-size:12px;color:#6E6E73;text-align:center;margin-top:10px}
.success-state{text-align:center;padding:40px 0}
/* Contact-sales success actions. Own class names on purpose: .success-state is
   shared with DemoForm, which must not inherit any of this. */
.cs-book-actions{display:flex;flex-direction:column;align-items:center;gap:14px}
.cs-book-btn{margin:0 auto;display:inline-flex}
.cs-book-btn:disabled{opacity:.6;cursor:default}
.cs-book-secondary{background:none;border:none;color:#A1A1A6;font-family:'Manrope',sans-serif;font-size:14px;cursor:pointer;text-decoration:underline;text-underline-offset:3px;padding:4px 8px;border-radius:8px;transition:color .15s}
.cs-book-secondary:hover{color:#F5F5F7}
.cs-book-secondary:focus-visible{outline:2px solid #00D4FF;outline-offset:2px}

/* MODAL */
/* bottom:var(--mbp-banner-h) — CookieBanner publishes its measured height there
   while it is showing, 0px otherwise. The overlay ends ABOVE the banner, so the
   modal centres in the space that is actually visible and its lower edge (the
   Submit button) can never sit under the banner. No z-index changes: the banner
   stays on top, the modal simply stops being underneath it. Same mechanism as
   the Sofi launcher. */
.modal-overlay{position:fixed;inset:0;bottom:var(--mbp-banner-h,0px);background:rgba(0,0,0,0.75);z-index:600;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;pointer-events:none;transition:opacity .25s;backdrop-filter:blur(8px)}
.modal-overlay.open{opacity:1;pointer-events:all}
/* min(90vh, 100%): 90vh alone is measured against the VIEWPORT and so ignores
   the banner entirely. 100% is the overlay's own (already banner-reduced,
   already padded) height. With no banner 90vh is the smaller value, so the
   modal looks exactly as it always has; with the banner up the percentage wins
   and the box shrinks to fit above it, scrolling internally via overflow-y. */
.modal-box{background:#0d0d1a;border:1px solid rgba(255,255,255,0.1);border-radius:24px;width:100%;max-width:520px;max-height:min(90vh,100%);overflow-y:auto;position:relative;transform:translateY(16px) scale(.98);transition:transform .25s;scrollbar-width:thin}
.modal-overlay.open .modal-box{transform:translateY(0) scale(1)}
.modal-header{padding:28px 28px 0;display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
.modal-close{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:#A1A1A6;width:32px;height:32px;border-radius:50%;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Manrope',sans-serif;transition:all .2s}
.modal-close:hover{background:rgba(255,255,255,0.12);color:#F5F5F7}
.modal-body{padding:20px 28px 28px}

/* CONTACT SALES FORM */
.sales-progress{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:18px}
.sales-dot{height:6px;width:24px;border-radius:100px;background:rgba(255,255,255,0.1);transition:all .3s}
.sales-dot.active{width:36px;background:linear-gradient(135deg,#00D4FF,#7B2FFF)}
.sales-dot.done{background:rgba(0,212,255,0.4)}
.sales-title{font-size:20px;font-weight:800;letter-spacing:-0.02em;color:#F5F5F7;text-align:center;margin-bottom:18px}
.sales-btn-row{display:flex;gap:10px;margin-top:8px}
.sales-back-btn{flex-shrink:0;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#A1A1A6;border-radius:100px;padding:0 22px;font-family:'Manrope',sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s}
.sales-back-btn:hover{border-color:rgba(255,255,255,0.2);color:#F5F5F7}
select.form-input{appearance:none;-webkit-appearance:none;-moz-appearance:none;cursor:pointer;background-image:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236E6E73' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 16px center;padding-right:40px}
select.form-input option{background:#111126;color:#F5F5F7}
textarea.form-input{min-height:88px;resize:vertical;font-family:'Manrope',sans-serif;line-height:1.5}
.plat-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.plat-opt{display:flex;align-items:center;gap:9px;padding:10px 12px;border:1px solid rgba(255,255,255,0.08);border-radius:10px;background:rgba(255,255,255,0.04);font-size:13px;color:#A1A1A6;cursor:pointer;transition:all .2s;user-select:none}
.plat-opt:hover{border-color:rgba(0,212,255,0.4)}
.plat-opt.on{border-color:rgba(0,212,255,0.5);background:rgba(0,212,255,0.06);color:#F5F5F7}
.plat-opt input{accent-color:#00D4FF;width:15px;height:15px;cursor:pointer;flex-shrink:0;margin:0}
.sales-phone{display:flex;align-items:center;width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:11px 14px;transition:all .2s}
.sales-phone:focus-within{border-color:rgba(0,212,255,0.5);background:rgba(0,212,255,0.04);box-shadow:0 0 0 3px rgba(0,212,255,0.08)}
.sales-phone.err{border-color:rgba(255,69,58,0.6)}
.sales-phone .PhoneInput{display:flex;align-items:center;width:100%;gap:8px}
.sales-phone .PhoneInputInput{flex:1;min-width:0;background:transparent;border:none;outline:none;color:#F5F5F7;font-family:'Manrope',sans-serif;font-size:15px}
.sales-phone .PhoneInputInput::placeholder{color:#6E6E73}
.sales-phone .PhoneInputCountryIcon{box-shadow:none}
.sales-phone .PhoneInputCountrySelect{color:#0d0d1a}
.sales-phone .PhoneInputCountrySelectArrow{color:#6E6E73;opacity:.9}

/* TESTIMONIALS */
.testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.testi-card{background:#0d0d1a;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:32px;transition:border-color .3s,transform .3s}
.testi-card:hover{border-color:rgba(0,212,255,0.2);transform:translateY(-2px)}
.stars{display:flex;gap:3px;margin-bottom:14px}
.star{color:#FFD60A;font-size:13px}
.quote-mark{font-size:40px;font-weight:800;color:rgba(0,212,255,0.2);line-height:1;margin-bottom:12px}
.testi-text{font-size:15px;color:#A1A1A6;line-height:1.7;font-weight:300;margin-bottom:24px}
.testi-author{display:flex;align-items:center;gap:12px}
.testi-avatar{width:48px;height:48px;border-radius:50%;flex-shrink:0;overflow:hidden;border:2px solid rgba(0,212,255,0.3)}
.testi-avatar img{width:100%;height:100%;object-fit:cover;display:block}
.testi-name{font-size:14px;font-weight:600;color:#F5F5F7}
.testi-role{font-size:12px;color:#6E6E73}

/* TRUSTPILOT STRIP */
.tp-strip{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:48px;padding:20px 32px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;flex-wrap:wrap}
.tp-logo{display:flex;align-items:center;gap:8px;text-decoration:none;font-size:16px;font-weight:700;color:#F5F5F7;transition:opacity .2s}
.tp-logo:hover{opacity:.8}
.tp-divider{width:1px;height:28px;background:rgba(255,255,255,0.08)}

/* PRICING */
.billing-toggle{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:40px}
.billing-label{font-size:15px;color:#6E6E73;font-weight:500;cursor:pointer;transition:color .2s;user-select:none}
.billing-label.active{color:#F5F5F7}
.toggle-track{width:48px;height:26px;border-radius:100px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.13);cursor:pointer;position:relative;transition:background .25s;flex-shrink:0}
.toggle-track.on{background:linear-gradient(135deg,#00D4FF,#7B2FFF)}
.toggle-thumb{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .25s;box-shadow:0 1px 4px rgba(0,0,0,0.3)}
.toggle-track.on .toggle-thumb{transform:translateX(22px)}
.save-badge{display:inline-block;background:rgba(0,255,148,0.1);border:1px solid rgba(0,255,148,0.2);color:#00FF94;font-size:11px;font-weight:700;padding:2px 8px;border-radius:100px;letter-spacing:0.06em;text-transform:uppercase;margin-left:6px;vertical-align:middle}
.pricing-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;align-items:stretch}
.pricing-grid .p-card{order:var(--order-d,0)}
@media(max-width:1080px) and (min-width:961px){.pricing-grid{grid-template-columns:repeat(2,1fr)}}
.p-card{background:#0d0d1a;border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:36px;transition:border-color .3s;position:relative;overflow:hidden;display:flex;flex-direction:column}
.p-card.featured{border-color:rgba(0,212,255,0.35);background:linear-gradient(160deg,rgba(0,212,255,0.05),rgba(123,47,255,0.05),#0d0d1a)}
/* Premium card treatments */
.p-card.premium{background:linear-gradient(165deg,rgba(123,47,255,0.10),rgba(0,212,255,0.04),#0d0d1a);border-color:rgba(155,95,255,0.3)}
.p-card.premium.top{background:linear-gradient(165deg,rgba(155,95,255,0.16),rgba(0,212,255,0.05),#0d0d1a);border-color:rgba(155,95,255,0.45)}
.p-badge{position:absolute;top:-1px;right:28px;background:linear-gradient(135deg,#00D4FF,#7B2FFF);color:#000;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:4px 14px;border-radius:0 0 10px 10px}
.p-trial-badge{position:absolute;top:-1px;left:28px;background:linear-gradient(135deg,#D946EF,#A21CAF);color:#fff;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:4px 14px;border-radius:0 0 10px 10px}
/* Unified badge row */
.p-badge-row{height:30px;display:flex;align-items:center;margin-bottom:16px}
.p-tier-badge{display:inline-flex;align-items:center;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:5px 13px;border-radius:100px;line-height:1}
.p-tier-badge.trial{color:#fff;background:linear-gradient(135deg,#D946EF,#A21CAF)}
.p-tier-badge.prem{color:#C9A8FF;background:rgba(155,95,255,0.12);border:1px solid rgba(155,95,255,0.35)}
/* Bright tier titles (gradient for premium) */
.p-tier{font-size:13px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#F5F5F7;margin-bottom:12px}
.p-tier.cyan{background:linear-gradient(135deg,#00D4FF,#9B5FFF);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.p-price{font-family:'Manrope',sans-serif;font-size:52px;font-weight:800;letter-spacing:-0.05em;line-height:1;margin-bottom:4px;color:#F5F5F7}
.p-price sup{font-size:22px;vertical-align:super}
.p-period{font-size:13px;color:#6E6E73;margin-bottom:6px}
.p-savings{font-size:13px;font-weight:700;color:#00FF94;margin-bottom:10px;min-height:20px}
.p-roi{background:rgba(0,255,136,0.07);border:1px solid rgba(0,255,136,0.18);border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;color:#00FF94;margin-bottom:14px}
.setup-fee{display:inline-block;background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.2);color:#00D4FF;font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:16px}
.p-divider{height:1px;background:rgba(255,255,255,0.08);margin-bottom:24px}
.p-feats{list-style:none;display:flex;flex-direction:column;gap:10px;margin-bottom:28px;flex:1}
.p-feats li{display:flex;align-items:flex-start;gap:10px;font-size:14px;color:#A1A1A6;line-height:1.5}
.p-check{color:#00FF94;flex-shrink:0}
/* Feature list: own vs inherited + divider */
.p-feats li.own{color:#F5F5F7;font-weight:500}
.p-feats li.own .p-check{color:#00D4FF}
.p-from{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#5a5a66;margin:10px 0 2px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06)}
.p-btn-outline{width:100%;padding:13px;border-radius:100px;background:transparent;color:#F5F5F7;border:1px solid rgba(255,255,255,0.13);font-family:'Manrope',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s}
.p-btn-outline:hover{border-color:rgba(0,212,255,0.4);color:#00D4FF}
.p-btn-grad{width:100%;padding:13px;border-radius:100px;background:linear-gradient(135deg,#00D4FF,#7B2FFF,#4060FF);color:#000;border:none;font-family:'Manrope',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s}
.p-btn-grad:hover{opacity:.86;box-shadow:0 6px 24px rgba(0,212,255,0.28)}
/* Unified equal-height buttons */
.p-btn-grad,.p-btn-outline{height:54px;display:flex;align-items:center;justify-content:center;gap:6px}
.p-btn-grad{box-shadow:0 6px 22px rgba(0,212,255,0.35);font-weight:800}
.p-btn-grad:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(0,212,255,0.5)}
/* Premium gradient-outline button for Contact Sales */
.p-btn-prem{position:relative;width:100%;height:54px;border-radius:100px;background:rgba(123,47,255,0.08);color:#fff;border:1.5px solid transparent;font-family:'Manrope',sans-serif;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:transform .15s,background .2s}
.p-btn-prem::before{content:'';position:absolute;inset:0;border-radius:100px;padding:1.5px;background:linear-gradient(135deg,#9B5FFF,#00D4FF);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
.p-btn-prem:hover{background:rgba(123,47,255,0.18);transform:translateY(-2px)}
.p-tagline{min-height:44px}

/* GUARANTEE */
.guarantee-section{padding:0 24px 80px;position:relative;z-index:1}
.guarantee-inner{max-width:1200px;margin:0 auto;background:linear-gradient(135deg,rgba(0,212,255,0.06),rgba(123,47,255,0.06));border:1px solid rgba(0,212,255,0.2);border-radius:28px;padding:72px 80px;text-align:center;position:relative;overflow:hidden}
.guarantee-icon{font-size:52px;margin-bottom:20px}
.guarantee-title{font-size:clamp(28px,4vw,44px);font-weight:800;letter-spacing:-0.04em;margin-bottom:16px;line-height:1.15;color:#F5F5F7}
.guarantee-desc{font-size:17px;color:#A1A1A6;max-width:560px;margin:0 auto 36px;line-height:1.7;font-weight:300}

/* FAQ */
.faq-stack{display:flex;flex-direction:column;gap:2px;background:rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);max-width:760px;margin:0 auto}
.faq-item{background:#0d0d1a;transition:background .2s}
.faq-item.open{background:#111126}
.faq-q{padding:22px 28px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;font-size:16px;font-weight:500;color:#F5F5F7;gap:16px;transition:color .2s}
.faq-q:hover{color:#00D4FF}
.faq-chevron{flex-shrink:0;width:26px;height:26px;border-radius:50%;border:1px solid rgba(255,255,255,0.13);display:flex;align-items:center;justify-content:center;color:#6E6E73;font-size:18px;transition:all .25s}
.faq-item.open .faq-chevron{border-color:#00D4FF;color:#00D4FF;transform:rotate(45deg)}
.faq-a{padding:0 28px;font-size:15px;color:#A1A1A6;line-height:1.75;font-weight:300;max-height:0;overflow:hidden;transition:max-height .32s ease,padding .32s}
.faq-item.open .faq-a{max-height:220px;padding-bottom:24px}

/* FOOTER */
.footer{border-top:1px solid rgba(255,255,255,0.08);padding:72px 48px 40px;position:relative;z-index:1}
.footer-grid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:48px;margin-bottom:56px}
.footer-brand-desc{font-size:14px;color:#6E6E73;line-height:1.7;font-weight:300;margin-top:16px;max-width:260px}
.footer-col-title{font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#6E6E73;margin-bottom:18px}
.footer-links{list-style:none;display:flex;flex-direction:column;gap:11px}
.footer-links a{color:#A1A1A6;text-decoration:none;font-size:14px;transition:color .2s}
.footer-links a:hover{color:#F5F5F7}
.footer-disclosure{margin:0 0 40px;padding:24px 28px;background:rgba(0,212,255,0.04);border:1px solid rgba(0,212,255,0.16);border-radius:16px}
.footer-disclosure > *{max-width:900px}
.footer-disclosure-title{font-size:13px;font-weight:700;letter-spacing:0.04em;color:#00D4FF;margin-bottom:10px}
.footer-disclosure p{font-size:13px;color:#A1A1A6;line-height:1.7;font-weight:300}
.footer-disclosure a{color:#00D4FF;text-decoration:underline}
.footer-bottom{display:flex;align-items:center;justify-content:space-between;padding-top:32px;border-top:1px solid rgba(255,255,255,0.08);flex-wrap:wrap;gap:16px}
.footer-legal{font-size:12px;color:#6E6E73;line-height:1.7}
.footer-socials{display:flex;gap:10px}
.social-icon{width:36px;height:36px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;color:#6E6E73;text-decoration:none;font-size:14px;transition:all .2s}
.social-icon:hover{border-color:rgba(0,212,255,0.4);color:#00D4FF}

/* CHECKOUT TOAST */
.checkout-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a0a0a;border:1px solid rgba(255,69,58,0.4);color:#FF453A;padding:12px 20px;border-radius:12px;font-size:14px;z-index:999;max-width:420px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.5)}

/* MOBILE NAV */
.hamburger{display:none;background:none;border:none;color:#F5F5F7;font-size:26px;cursor:pointer;padding:8px;line-height:1;flex-shrink:0;align-items:center;justify-content:center}
.mobile-menu{position:fixed;top:80px;left:0;right:0;z-index:190;background:rgba(5,5,15,0.97);backdrop-filter:blur(24px);border-bottom:1px solid rgba(255,255,255,0.08);padding:16px 20px 24px;display:flex;flex-direction:column;gap:2px;animation:menuSlide .2s ease}
@keyframes menuSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.mobile-menu a{color:#A1A1A6;text-decoration:none;font-size:16px;font-weight:500;padding:13px 16px;border-radius:12px;display:block;transition:all .2s;cursor:pointer}
.mobile-menu a:hover{color:#F5F5F7;background:rgba(255,255,255,0.05)}
.mobile-menu-divider{height:1px;background:rgba(255,255,255,0.08);margin:8px 0}
.mobile-menu-cta{background:linear-gradient(135deg,#00D4FF,#7B2FFF,#4060FF);color:#000!important;font-weight:700!important;text-align:center;border-radius:100px!important}

/* SOFI WIDGET */
.sofi-fab{position:fixed;z-index:500;display:flex;flex-direction:column;align-items:flex-end;gap:10px;touch-action:none;user-select:none}
/* 58px OUTER stays 58px — box-sizing:border-box is global, so the 2px ring
   eats inward (54px of video) rather than growing the button. The ring is the
   brand gradient painted in the border box, with the panel colour filling the
   padding box on top; that is the only way to get a gradient border without a
   wrapper element (which would break the drag target test below). */
.sofi-fab-btn{width:58px;height:58px;border-radius:50%;background-image:linear-gradient(#0d0d1a,#0d0d1a),linear-gradient(135deg,#00D4FF,#7B2FFF,#4060FF);background-origin:border-box;background-clip:padding-box,border-box;border:2px solid transparent;cursor:grab;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 28px rgba(0,212,255,0.15);position:relative;transition:box-shadow .2s;padding:0}
/* pointer-events:none is LOAD-BEARING, not cosmetic: onPointerDown only starts
   a drag when the event target is the FAB button itself. Let the video become
   the target and dragging silently stops working. */
.sofi-fab-avatar{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;pointer-events:none}
.sofi-fab-btn:active{cursor:grabbing}
.sofi-fab-btn:hover{box-shadow:0 10px 36px rgba(0,212,255,0.4);opacity:.92}
.sofi-drag-hint{font-size:10px;color:rgba(255,255,255,0.35);text-align:center;margin-top:2px;pointer-events:none;font-family:'Manrope',sans-serif}
.sofi-dot{position:absolute;top:2px;right:2px;width:10px;height:10px;background:#00D4FF;border-radius:50%;border:2px solid #0d0d1a}
/* Sits ABOVE the button inside the fixed, bottom-anchored flex column, so
   appearing/dismissing moves nothing: the button's own position is fixed from
   the bottom edge. No layout shift by construction. */
.sofi-fab-label{background:rgba(13,13,26,0.95);border:1px solid rgba(255,255,255,0.1);color:#F5F5F7;font-family:'Manrope',sans-serif;font-size:13px;font-weight:600;padding:8px 10px 8px 14px;border-radius:100px;white-space:nowrap;backdrop-filter:blur(12px);display:inline-flex;align-items:center;gap:8px;animation:sofiLabelIn .2s ease-out both}
@media (prefers-reduced-motion:reduce){.sofi-fab-label{animation:none}}
@keyframes sofiLabelIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.sofi-fab-label-x{background:none;border:none;color:rgba(255,255,255,0.45);font-size:12px;line-height:1;cursor:pointer;padding:2px 4px;border-radius:100px;font-family:'Manrope',sans-serif;transition:color .15s}
.sofi-fab-label-x:hover{color:#F5F5F7}
.sofi-fab-label-x:focus-visible{outline:2px solid #00D4FF;outline-offset:1px}
.sofi-panel{position:fixed;bottom:100px;right:28px;z-index:499;width:340px;background:#0d0d1a;border:1px solid rgba(255,255,255,0.1);border-radius:20px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.6);display:flex;flex-direction:column;animation:panelIn .25s cubic-bezier(.34,1.4,.64,1) both}
@keyframes panelIn{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
.sofi-panel-header{background:linear-gradient(135deg,#0d0d1a,#111126);border-bottom:1px solid rgba(0,212,255,0.2);padding:16px 18px;display:flex;align-items:center;gap:12px}
.sofi-avatar{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.sofi-header-text h4{font-size:14px;font-weight:700;color:#fff;margin-bottom:1px}
.sofi-header-text p{font-size:11px;color:rgba(255,255,255,0.75)}
.sofi-close{margin-left:auto;background:rgba(255,255,255,0.15);border:none;color:#fff;width:28px;height:28px;border-radius:50%;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Manrope',sans-serif}
.sofi-close:hover{background:rgba(255,255,255,0.25)}
/* Always-visible WA direct button */
.sofi-wa-direct{display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 16px;background:rgba(0,212,255,0.06);border-bottom:1px solid rgba(0,212,255,0.15);font-family:'Manrope',sans-serif;font-size:12px;font-weight:700;color:#00D4FF;cursor:pointer;text-decoration:none;transition:background .2s}
.sofi-wa-direct:hover{background:rgba(0,212,255,0.1)}
.sofi-messages{flex:1;padding:14px;display:flex;flex-direction:column;gap:9px;overflow-y:auto;max-height:260px;min-height:180px}
.sofi-msg{max-width:86%;padding:10px 13px;border-radius:13px;font-size:13px;line-height:1.55;font-family:'Manrope',sans-serif;white-space:pre-wrap}
.sofi-msg.sofi{background:rgba(0,212,255,0.06);border:1px solid rgba(0,212,255,0.15);color:#F5F5F7;align-self:flex-start;border-bottom-left-radius:3px}
.sofi-msg.user{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.08);color:#A1A1A6;align-self:flex-end;border-bottom-right-radius:3px}
.sofi-typing{display:flex;gap:4px;padding:10px 13px;background:rgba(0,212,255,0.06);border:1px solid rgba(0,212,255,0.15);border-radius:13px;border-bottom-left-radius:3px;width:fit-content;align-self:flex-start}
.sofi-tdot{width:6px;height:6px;background:#00D4FF;border-radius:50%;animation:sofiBounce 1.3s infinite}
.sofi-tdot:nth-child(2){animation-delay:.18s}
.sofi-tdot:nth-child(3){animation-delay:.36s}
@keyframes sofiBounce{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-6px);opacity:1}}
.sofi-handoff{background:rgba(0,212,255,0.06);border:1px solid rgba(0,212,255,0.18);border-radius:12px;padding:13px 15px;margin:0 14px 4px;text-align:center}
.sofi-handoff p{font-size:12px;color:#A1A1A6;margin-bottom:9px;line-height:1.5}
.sofi-wa-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:10px;border-radius:100px;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;border:none;font-family:'Manrope',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:opacity .2s;text-decoration:none}
.sofi-wa-btn:hover{opacity:.88}
.sofi-input-row{display:flex;gap:8px;padding:11px 14px;border-top:1px solid rgba(255,255,255,0.06)}
.sofi-input{flex:1;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:9px 13px;color:#F5F5F7;font-family:'Manrope',sans-serif;font-size:13px;outline:none;transition:border-color .2s}
.sofi-input:focus{border-color:rgba(0,212,255,0.4)}
.sofi-input::placeholder{color:#6E6E73}
.sofi-send{width:36px;height:36px;background:linear-gradient(135deg,#00D4FF,#7B2FFF);border:none;border-radius:10px;color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .2s;font-family:'Manrope',sans-serif}
.sofi-send:hover{opacity:.85}
.sofi-send:disabled{opacity:.3;cursor:not-allowed}

/* RESPONSIVE */
@media(max-width:960px){
  .bg-arcs{opacity:0.3}
  .nav{padding:0 20px 0 8px;height:140px}.nav-links{display:none}.nav-right{display:none}.hamburger{display:flex}
  .nav-logo img{height:52px}
  .mobile-menu{top:140px}
  .hero-ctas{flex-direction:column;align-items:stretch}.hero-ctas .btn-primary,.hero-ctas .btn-outline{width:100%;justify-content:center}
  .stats-bar{display:grid;grid-template-columns:1fr 1fr}.stat-item{flex:none;border-right:none;border-bottom:1px solid rgba(255,255,255,0.08)}.stat-item:nth-child(odd){border-right:1px solid rgba(255,255,255,0.08)}.stat-item:nth-last-child(-n+2){border-bottom:none}
  .steps-wrap,.feat-grid,.testi-grid,.pricing-grid,.pain-cards,.industries-grid{grid-template-columns:1fr}
  .pricing-grid .p-card{order:var(--order-m,0)}
  .calc-body{grid-template-columns:1fr;padding:24px 24px 40px}.calc-left{border-right:none;border-bottom:1px solid rgba(255,255,255,0.08);padding-right:0;padding-bottom:28px;margin-bottom:28px}
  .calc-header{padding:32px 24px 0}
  .compare-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
  .compare-table{min-width:680px}
  .compare-table th:first-child,.compare-table td:first-child{min-width:140px}
  .compare-table th:not(:first-child),.compare-table td:not(:first-child){min-width:150px}
  .compare-hint{display:block}
  .demo-inner{grid-template-columns:1fr}.demo-left{border-right:none;border-bottom:1px solid rgba(255,255,255,0.08);padding:40px 28px}.demo-right{padding:40px 28px}
  .form-row{grid-template-columns:1fr}.footer-grid{grid-template-columns:1fr 1fr}
  .footer-bottom{flex-direction:column;text-align:center}
  .guarantee-inner{padding:40px 28px}
  .industries-grid{grid-template-columns:repeat(2,1fr)}
  .sofi-panel{right:12px;left:12px;width:auto;bottom:92px}
  .modal-overlay{padding:12px}
  .modal-box{max-width:100%}
}

/* ===== VISUAL ENHANCEMENTS ===== */
@property --angle { syntax:'<angle>'; initial-value:0deg; inherits:false; }
@keyframes borderSpin{to{--angle:360deg}}

/* 1. Glowing edge arcs */
.bg-arcs{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.arc-svg{position:absolute;top:50%;height:160vh;width:auto}
.arc-left{left:0;transform:translate(-44%,-50%)}
.arc-right{right:0;transform:translate(44%,-50%)}
@media (prefers-reduced-motion:no-preference){
  .arc-left{animation:arcSwingL 50s linear infinite}
  .arc-right{animation:arcSwingR 60s linear infinite}
}
@keyframes arcSwingL{to{transform:translate(-44%,-50%) rotate(360deg)}}
@keyframes arcSwingR{to{transform:translate(44%,-50%) rotate(-360deg)}}

/* 2 & 3. Illuminated rotating border on primary buttons only */
.btn-primary,.p-btn-grad,.form-submit{position:relative}
.btn-primary::before,.p-btn-grad::before,.form-submit::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:2px;background:conic-gradient(from var(--angle),#00D4FF,#7B5FFF,#00D4FF);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
@media (prefers-reduced-motion:no-preference){.btn-primary::before,.p-btn-grad::before,.form-submit::before{animation:borderSpin 3s linear infinite}}

/* 4a. Illuminated border on the live-demo box */
.demo-inner::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1.5px;background:conic-gradient(from var(--angle),#00D4FF,#7B5FFF,#00D4FF);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;z-index:2;pointer-events:none}
@media (prefers-reduced-motion:no-preference){.demo-inner::before{animation:borderSpin 5s linear infinite}}

/* 4b. Platform carousel */
.platform-section{padding:100px 24px;max-width:1200px;margin:0 auto;position:relative;z-index:1}
.pc-head{text-align:center;margin-bottom:56px}
.pc-head h2{font-size:clamp(36px,5vw,52px);font-weight:800;letter-spacing:-0.04em;margin:6px 0 14px;color:#F5F5F7}
.pc-head p{font-size:18px;color:#A1A1A6;font-weight:300;max-width:560px;margin:0 auto}
.pc-slide{display:none}
.pc-slide.active{display:block;animation:pcFade .5s ease}
@keyframes pcFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.pc-grid{display:grid;grid-template-columns:1fr 1fr;gap:52px;align-items:center}
.pc-num{font-size:13px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#00D4FF;margin-bottom:16px}
.pc-title{font-size:clamp(26px,3.5vw,34px);font-weight:800;letter-spacing:-0.03em;line-height:1.12;margin-bottom:16px;color:#F5F5F7}
.pc-desc{font-size:16px;line-height:1.65;color:#A1A1A6;font-weight:300;margin-bottom:26px}
.pc-chips{display:flex;flex-wrap:wrap;gap:10px}
.pc-chip{padding:8px 16px;border:1px solid rgba(255,255,255,0.1);border-radius:100px;font-size:13px;font-weight:600;color:#C8C8D2;background:rgba(255,255,255,0.03)}
.pc-visual{position:relative;border-radius:24px;padding:1.5px;background:linear-gradient(135deg,rgba(0,212,255,0.5),rgba(123,95,255,0.5))}
.pc-visual-inner{background:#0a0a14;border-radius:23px;padding:48px 40px;min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.pc-icon{width:92px;height:92px;border-radius:24px;background:linear-gradient(135deg,#00D4FF,#7B2FFF);display:flex;align-items:center;justify-content:center;font-size:42px;margin-bottom:22px}
.pc-metric{font-size:40px;font-weight:800;letter-spacing:-1px;background:linear-gradient(120deg,#00D4FF,#9B5FFF);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.pc-metric-label{font-size:14px;color:#7B7B8C;margin-top:6px}
.pc-controls{display:flex;align-items:center;justify-content:center;gap:24px;margin-top:44px}
.pc-arrow{width:46px;height:46px;border-radius:50%;border:1px solid rgba(255,255,255,0.15);background:transparent;color:#fff;font-size:18px;cursor:pointer;font-family:'Manrope',sans-serif;transition:border-color .2s,background .2s}
.pc-arrow:hover{border-color:#00D4FF;background:rgba(0,212,255,0.08)}
.pc-dots{display:flex;gap:9px}
.pc-dot{width:9px;height:9px;border-radius:50%;border:none;background:rgba(255,255,255,0.2);cursor:pointer;padding:0;transition:width .2s,background .2s}
.pc-dot.active{width:26px;border-radius:5px;background:linear-gradient(90deg,#00D4FF,#7B2FFF)}
@media(max-width:820px){.pc-grid{grid-template-columns:1fr;gap:32px}}
@media (prefers-reduced-motion:reduce){.pc-slide.active{animation:none}}
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

const PLATFORM_SLIDES = [
  { num:"01 · Find", icon:"🎯", title:"We find your ideal customers", desc:"Targeted B2B prospecting across outbound AI calls, email and LinkedIn. We build lists of your ideal customer and start the conversation — at scale, without the manual grind.", chips:["Outbound AI calls","Multichannel outreach","B2B target lists","100+ data sources"], metric:"100+", metricLabel:"data sources searched" },
  { num:"02 · Engage", icon:"📞", title:"An AI that holds real conversations", desc:"A supernatural, human-sounding voice that answers calls and replies on WhatsApp and SMS in seconds — and never sounds robotic. Callers feel like they're talking to your best receptionist.", chips:["Supernatural voice","WhatsApp + SMS","8-second replies","Answers 24/7"], metric:"24/7", metricLabel:"never misses a lead" },
  { num:"03 · Qualify", icon:"✨", title:"Knows who's ready to buy", desc:"Every lead is qualified and scored in real time. Your warmest opportunities rise to the top, so you spend time only on the leads that actually convert.", chips:["Lead scoring","Intent detection","Auto-routing","Warm-lead alerts"], metric:"Live", metricLabel:"qualification & scoring" },
  { num:"04 · Nurture", icon:"🔥", title:"Warms every lead until they're ready", desc:"Automated nurture sequences across email and WhatsApp keep leads engaged. Cold and dormant leads get re-activated — nothing slips through the cracks.", chips:["Email + WhatsApp","Drip sequences","Re-engagement","Smart follow-ups"], metric:"0", metricLabel:"leads left behind" },
  { num:"05 · Remember", icon:"🧠", title:"Recognises and remembers every customer", desc:"The AI remembers past conversations across voice, WhatsApp and SMS. Returning customers are greeted with familiarity — it knows who they are and picks up exactly where you left off, learning with every interaction.", chips:["Memory across channels","Returning-caller recall","Personalised","Always learning"], metric:"∞", metricLabel:"memory across channels" },
  { num:"06 · Convert", icon:"📅", title:"Books warm leads into your calendar", desc:"Qualified, nurtured leads are booked straight into your calendar — synced with Google Calendar, Calendly and your CRM. You just show up to the call.", chips:["Auto-booking","Calendar sync","CRM sync","Zero admin"], metric:"1-click", metricLabel:"straight to calendar" },
];

function PlatformCarousel() {
  const [cur, setCur] = useState(0);
  const n = PLATFORM_SLIDES.length;
  useEffect(() => {
    const t = setInterval(() => setCur(c => (c + 1) % n), 8000);
    return () => clearInterval(t);
  }, [n]);
  const go = (i) => setCur((i + n) % n);
  return (
    <section className="platform-section" id="platform">
      <div className="pc-head">
        <div className="eyebrow">Platform Overview</div>
        <h2>The full <span className="grad-text">MyBizPal</span> platform</h2>
        <p>Far more than a receptionist. A complete AI revenue engine that finds, engages, qualifies, nurtures, remembers and books your leads — end to end.</p>
      </div>
      {PLATFORM_SLIDES.map((s, i) => (
        <div className={"pc-slide" + (i === cur ? " active" : "")} key={i}>
          <div className="pc-grid">
            <div>
              <div className="pc-num">{s.num}</div>
              <h3 className="pc-title">{s.title}</h3>
              <p className="pc-desc">{s.desc}</p>
              <div className="pc-chips">{s.chips.map(c => <span className="pc-chip" key={c}>{c}</span>)}</div>
            </div>
            <div className="pc-visual"><div className="pc-visual-inner">
              <div className="pc-icon">{s.icon}</div>
              <div className="pc-metric">{s.metric}</div>
              <div className="pc-metric-label">{s.metricLabel}</div>
            </div></div>
          </div>
        </div>
      ))}
      <div className="pc-controls">
        <button className="pc-arrow" onClick={() => go(cur - 1)} aria-label="Previous">‹</button>
        <div className="pc-dots">
          {PLATFORM_SLIDES.map((_, i) => (
            <button key={i} className={"pc-dot" + (i === cur ? " active" : "")} onClick={() => go(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
        <button className="pc-arrow" onClick={() => go(cur + 1)} aria-label="Next">›</button>
      </div>
    </section>
  );
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={"faq-item" + (open ? " open" : "")}>
      <div className="faq-q" onClick={() => setOpen(!open)}>{q}<span className="faq-chevron">+</span></div>
      <div className="faq-a">{a}</div>
    </div>
  );
}

function DemoForm({ onClose }) {
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", message: "" });
  const [phone, setPhone] = useState("");
  const [errs, setErrs] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [token, setToken] = useState("");          // Cloudflare Turnstile token
  const tsRef = useRef(null);                        // this instance's widget container
  const widgetIdRef = useRef(null);                  // explicit-render widget id

  // Render this instance's Turnstile widget explicitly (script is loaded once in
  // index.html with ?render=explicit). Both DemoForms are always mounted, so each
  // owns its own container ref + widget id — no collision. window.turnstile loads
  // async, so poll until it's ready before rendering; a slow load can't crash this.
  useEffect(() => {
    let cancelled = false;
    let pollId;
    const tryRender = () => {
      if (cancelled || widgetIdRef.current !== null) return true;
      if (!TURNSTILE_SITE_KEY) return true; // no key (e.g. local without env) → skip; button stays disabled
      if (!window.turnstile || typeof window.turnstile.render !== "function" || !tsRef.current) return false;
      widgetIdRef.current = window.turnstile.render(tsRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: setToken,
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
      return true;
    };
    if (!tryRender()) {
      pollId = setInterval(() => { if (tryRender()) clearInterval(pollId); }, 200);
    }
    return () => {
      cancelled = true;
      if (pollId) clearInterval(pollId);
      try {
        if (window.turnstile && widgetIdRef.current !== null) window.turnstile.remove(widgetIdRef.current);
      } catch {}
      widgetIdRef.current = null;
    };
  }, []);

  const validate = () => {
    const e = {};
    if (!f.firstName.trim()) e.firstName = "Required";
    if (!f.lastName.trim()) e.lastName = "Required";
    if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Valid email required";
    if (!phone || !isValidPhoneNumber(phone)) e.phone = "Please enter a valid phone number";
    return e;
  };

  const formValid = !!(
    f.firstName.trim() && f.lastName.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()) &&
    phone && isValidPhoneNumber(phone) &&
    token
  );

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    setErrs({}); setLoading(true);
    try {
      const res = await fetch("https://mybizpal-n8n.onrender.com/webhook/lead-form", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${f.firstName} ${f.lastName}`,
          email: f.email,
          phone: phone,
          business: f.message,
          source: "website_demo_form",
          turnstileToken: token,
        }),
      });
      if (!res.ok) throw new Error("API error");
      setDone(true);
    } catch {
      alert("Something went wrong. Please email info@mybizpal.ai");
    } finally {
      setLoading(false);
      // Tokens are single-use — clear it and reset the widget so a retry gets a fresh one.
      setToken("");
      try { if (window.turnstile && widgetIdRef.current !== null) window.turnstile.reset(widgetIdRef.current); } catch {}
    }
  };

  const ch = (k, v) => { setF({ ...f, [k]: v }); if (errs[k]) setErrs({ ...errs, [k]: undefined }); };

  if (done) return (
    <div className="success-state">
      <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: "#F5F5F7" }}>You're all set, {f.firstName}!</div>
      <p style={{ fontSize: 15, color: "#A1A1A6", marginBottom: 24 }}>Expect a demo call from our AI within 30 seconds. Check your email for confirmation.</p>
      {onClose && <button className="btn-primary" style={{ margin: "0 auto", display: "inline-flex" }} onClick={onClose}>Close ✕</button>}
    </div>
  );

  return (
    <div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">First Name <span>*</span></label>
          <input className={"form-input" + (errs.firstName ? " err" : "")} placeholder="Jane" value={f.firstName} onChange={e => ch("firstName", e.target.value)} />
          {errs.firstName && <div className="field-err">{errs.firstName}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Last Name <span>*</span></label>
          <input className={"form-input" + (errs.lastName ? " err" : "")} placeholder="Smith" value={f.lastName} onChange={e => ch("lastName", e.target.value)} />
          {errs.lastName && <div className="field-err">{errs.lastName}</div>}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Work Email <span>*</span></label>
        <input className={"form-input" + (errs.email ? " err" : "")} type="email" placeholder="jane@yourbusiness.com" value={f.email} onChange={e => ch("email", e.target.value)} />
        {errs.email && <div className="field-err">{errs.email}</div>}
      </div>
      <div className="form-group">
        <label className="form-label">Phone Number <span>*</span></label>
        <div className={"sales-phone" + (errs.phone ? " err" : "")}>
          <PhoneInput defaultCountry="GB" international value={phone} onChange={setPhone} />
        </div>
        {errs.phone && <div className="field-err">{errs.phone}</div>}
      </div>
      <div className="form-group">
        <label className="form-label">About your business <span style={{ color: "#6E6E73", fontWeight: 400 }}>(optional)</span></label>
        <input className="form-input" placeholder="e.g. Dental clinic, 4 staff, 50 calls/week" value={f.message} onChange={e => ch("message", e.target.value)} />
      </div>
      <div className="form-group" style={{ display: "flex", justifyContent: "center" }}>
        <div ref={tsRef}></div>
      </div>
      <button className="form-submit" onClick={submit} disabled={loading || !formValid}>
        {loading ? "Connecting..." : "Get a Live Demo Call →"}
      </button>
      <p className="form-note">🔒 No spam. No credit card. Demo call arrives within 30 seconds.</p>
    </div>
  );
}

// ── Contact Sales (Elite) ───────────────────────────────────────────────────
const SALES_INDUSTRIES = ["Marketing Agency", "B2B SaaS", "Mortgage Broker", "Recruitment", "Finance", "Real Estate", "Healthcare", "Legal", "Insurance", "Accounting", "Construction", "Hospitality", "E-commerce / Retail", "Education", "Automotive", "Professional Services", "Fitness & Wellness", "Dental / Medical Practice", "Other"];
const SALES_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];
const SALES_PLATFORMS = ["Voice agent", "WhatsApp", "SMS", "Google Calendar booking", "GoHighLevel", "HubSpot", "N8N automations", "Outbound calling", "Website chat widget", "All channels"];
const SALES_COUNTRIES = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Brazzaville)", "Congo (Kinshasa)", "Costa Rica", "Côte d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "São Tomé and Príncipe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];

// ── Calendly (success step only) ────────────────────────────────────────────
const CALENDLY_URL = "https://calendly.com/mybizpal-info/30min";
const CALENDLY_CSS = "https://assets.calendly.com/assets/external/widget.css";
const CALENDLY_JS = "https://assets.calendly.com/assets/external/widget.js";

// Marketing consent means the "all" choice in CookieBanner. NOT-YET-CHOSEN
// counts as no consent, which is the case for anyone who reaches this step on a
// first visit — they get the new tab, not the embedded widget.
const hasMarketingConsent = () => {
  try { return localStorage.getItem(CONSENT_KEY) === "all"; } catch { return false; }
};

// Lazily injected on FIRST CLICK, never at page load — Calendly's widget is
// ~90KB of third-party JS and nobody who does not book should pay for it.
let calendlyLoad = null;
function loadCalendly() {
  if (typeof window !== "undefined" && window.Calendly) return Promise.resolve();
  if (calendlyLoad) return calendlyLoad;
  calendlyLoad = new Promise((resolve, reject) => {
    if (!document.getElementById("calendly-css")) {
      const link = document.createElement("link");
      link.id = "calendly-css";
      link.rel = "stylesheet";
      link.href = CALENDLY_CSS;
      document.head.appendChild(link);
    }
    const s = document.createElement("script");
    s.id = "calendly-js";
    s.src = CALENDLY_JS;
    s.async = true;
    s.onload = resolve;
    // Reset the cache so a later click can retry rather than being stuck on a
    // permanently rejected promise.
    s.onerror = () => { calendlyLoad = null; reject(new Error("Calendly script blocked or unavailable")); };
    document.head.appendChild(s);
  });
  return calendlyLoad;
}

// The site has no analytics layer yet (CookieBanner's loadAnalytics is a
// commented-out stub), so this is a GTM-shaped push that starts reporting the
// day GA/GTM is added and costs nothing until then. Never allowed to throw:
// analytics must not be able to break a booking CTA.
function trackEvent(event, params = {}) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...params });
  } catch { /* analytics is never load-bearing */ }
}

// utm_content carries the business email — the join key back to
// sales_leads.business_email (ruled 18 Aug 2026). The API replies
// {success:true} with no row id (it inserts with Prefer: return=minimal), so
// there is no lead id to carry; email is the key the lead is actually stored
// under. A repeat enquirer produces two rows sharing one key, so joins should
// use email + timestamp.
const calendlyParams = (name, email) =>
  new URLSearchParams({ name, email, utm_content: email }).toString();

function ContactSalesForm({ onClose, plan = "" }) {
  const [step, setStep] = useState(1);
  const [f, setF] = useState({
    companyWebsite: "", businessEmail: "",
    firstName: "", lastName: "", companyName: "",
    industry: "", companySize: "",
    country: "United Kingdom",
    platformInterest: [], useCase: "", heardAbout: "",
  });
  const [phone, setPhone] = useState("");
  const [errs, setErrs] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  const [booking, setBooking] = useState(false);

  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const ch = (k, v) => { setF(p => ({ ...p, [k]: v })); if (errs[k]) setErrs(p => ({ ...p, [k]: undefined })); };
  const togglePlatform = v => setF(p => ({
    ...p,
    platformInterest: p.platformInterest.includes(v)
      ? p.platformInterest.filter(x => x !== v)
      : [...p.platformInterest, v],
  }));

  const step1Valid = emailOk(f.businessEmail.trim());
  const step2Valid = !!(
    f.firstName.trim() && f.lastName.trim() && f.companyName.trim() &&
    f.industry && f.companySize && f.country.trim() && phone && isValidPhoneNumber(phone) && f.useCase.trim()
  );

  const next = () => {
    const e = {};
    if (!step1Valid) e.businessEmail = "Valid email required";
    if (Object.keys(e).length) { setErrs(e); return; }
    setErrs({}); setStep(2);
  };

  const submit = async () => {
    const e = {};
    if (!f.firstName.trim()) e.firstName = "Required";
    if (!f.lastName.trim()) e.lastName = "Required";
    if (!f.companyName.trim()) e.companyName = "Required";
    if (!f.industry) e.industry = "Required";
    if (!f.companySize) e.companySize = "Required";
    if (!f.country.trim()) e.country = "Required";
    if (!phone || !isValidPhoneNumber(phone)) e.phone = "Please enter a valid phone number";
    if (!f.useCase.trim()) e.useCase = "Required";
    if (Object.keys(e).length) { setErrs(e); return; }
    setErrs({}); setError(false); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/sales-lead`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyWebsite: f.companyWebsite,
          businessEmail: f.businessEmail,
          firstName: f.firstName,
          lastName: f.lastName,
          companyName: f.companyName,
          industry: f.industry,
          companySize: f.companySize,
          country: f.country,
          phone: phone,
          platformInterest: f.platformInterest.join(", "),
          useCase: f.useCase,
          heardAbout: f.heardAbout,
          plan,
        }),
      });
      if (!res.ok) throw new Error("API error");
      setDone(true);
    } catch {
      setError(true);
    } finally { setLoading(false); }
  };

  // Success step only. Nothing above this is touched: steps 1-2, validation and
  // the lead submission are exactly as they were, and the thank-you still only
  // renders on a CONFIRMED write.
  const bookCall = async () => {
    const name = `${f.firstName} ${f.lastName}`.trim();
    const email = f.businessEmail.trim();
    const consented = hasMarketingConsent();

    trackEvent("contact_sales_book_call", {
      method: consented ? "popup" : "new_tab",
      plan: plan || "elite",
    });

    const openInTab = () => window.open(`${CALENDLY_URL}?${calendlyParams(name, email)}`, "_blank", "noopener,noreferrer");

    // No marketing consent (including "not chosen yet"): do NOT inject
    // Calendly's script into this page. Same booking, same prefill, their
    // domain and their consent.
    if (!consented) { openInTab(); return; }

    setBooking(true);
    try {
      await loadCalendly();
      window.Calendly.initPopupWidget({
        url: CALENDLY_URL,
        prefill: { name, email, firstName: f.firstName.trim(), lastName: f.lastName.trim() },
        utm: { utmContent: email },
      });
    } catch {
      // Ad blockers block assets.calendly.com routinely. Falling through to the
      // tab means the button always does SOMETHING — a CTA that silently does
      // nothing is the exact failure this codebase just spent two days on.
      openInTab();
    } finally {
      setBooking(false);
    }
  };

  if (done) return (
    <div className="success-state">
      <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: "#F5F5F7" }}>Thanks — our team will be in touch shortly.</div>
      <p style={{ fontSize: 15, color: "#A1A1A6", marginBottom: 24 }}>We've received your Elite enquiry and will reach out to {f.businessEmail} soon.</p>
      <div className="cs-book-actions">
        <button
          type="button"
          className="btn-primary cs-book-btn"
          onClick={bookCall}
          disabled={booking}
        >
          {booking ? "Opening…" : "Book a 30-min call"}
        </button>
        {onClose && (
          <button type="button" className="cs-book-secondary" onClick={onClose}>
            Close, I&rsquo;ll wait for your call.
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="sales-progress">
        <div className={"sales-dot" + (step === 1 ? " active" : " done")} />
        <div className={"sales-dot" + (step === 2 ? " active" : "")} />
      </div>
      <h3 className="sales-title">{step === 1 ? "Contact sales" : "Tell us about yourself"}</h3>

      {step === 1 && (
        <div>
          <div className="form-group">
            <label className="form-label">Company Website</label>
            <input className="form-input" placeholder="https://yourcompany.com" value={f.companyWebsite} onChange={e => ch("companyWebsite", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Business Email <span>*</span></label>
            <input className={"form-input" + (errs.businessEmail ? " err" : "")} type="email" placeholder="you@company.com" value={f.businessEmail} onChange={e => ch("businessEmail", e.target.value)} />
            {errs.businessEmail && <div className="field-err">{errs.businessEmail}</div>}
          </div>
          <button className="form-submit" onClick={next} disabled={!step1Valid}>Next →</button>
          <p className="form-note">🔒 We'll only use this to discuss your Elite plan.</p>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name <span>*</span></label>
              <input className={"form-input" + (errs.firstName ? " err" : "")} placeholder="Jane" value={f.firstName} onChange={e => ch("firstName", e.target.value)} />
              {errs.firstName && <div className="field-err">{errs.firstName}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Last Name <span>*</span></label>
              <input className={"form-input" + (errs.lastName ? " err" : "")} placeholder="Smith" value={f.lastName} onChange={e => ch("lastName", e.target.value)} />
              {errs.lastName && <div className="field-err">{errs.lastName}</div>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Company Name <span>*</span></label>
            <input className={"form-input" + (errs.companyName ? " err" : "")} placeholder="Acme Ltd" value={f.companyName} onChange={e => ch("companyName", e.target.value)} />
            {errs.companyName && <div className="field-err">{errs.companyName}</div>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Industry <span>*</span></label>
              <select className={"form-input" + (errs.industry ? " err" : "")} value={f.industry} onChange={e => ch("industry", e.target.value)}>
                <option value="">Select…</option>
                {SALES_INDUSTRIES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              {errs.industry && <div className="field-err">{errs.industry}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Company Size <span>*</span></label>
              <select className={"form-input" + (errs.companySize ? " err" : "")} value={f.companySize} onChange={e => ch("companySize", e.target.value)}>
                <option value="">Select…</option>
                {SALES_SIZES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              {errs.companySize && <div className="field-err">{errs.companySize}</div>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Country <span>*</span></label>
            <select className={"form-input" + (errs.country ? " err" : "")} value={f.country} onChange={e => ch("country", e.target.value)}>
              <option value="">Select…</option>
              {SALES_COUNTRIES.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            {errs.country && <div className="field-err">{errs.country}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Phone <span>*</span></label>
            <div className={"sales-phone" + (errs.phone ? " err" : "")}>
              <PhoneInput defaultCountry="GB" international value={phone} onChange={setPhone} />
            </div>
            {errs.phone && <div className="field-err">{errs.phone}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Which platform are you most interested in?</label>
            <div className="plat-grid">
              {SALES_PLATFORMS.map(o => (
                <label key={o} className={"plat-opt" + (f.platformInterest.includes(o) ? " on" : "")}>
                  <input type="checkbox" checked={f.platformInterest.includes(o)} onChange={() => togglePlatform(o)} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Use case <span>*</span></label>
            <textarea className={"form-input" + (errs.useCase ? " err" : "")} placeholder="Tell us more about your use case" value={f.useCase} onChange={e => ch("useCase", e.target.value)} rows={3} />
            {errs.useCase && <div className="field-err">{errs.useCase}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">How did you hear about us?</label>
            <input className="form-input" placeholder="Google, referral, social…" value={f.heardAbout} onChange={e => ch("heardAbout", e.target.value)} />
          </div>

          <div className="sales-btn-row">
            <button type="button" className="sales-back-btn" onClick={() => setStep(1)}>← Back</button>
            <button className="form-submit" style={{ marginTop: 0, flex: 1 }} onClick={submit} disabled={loading || !step2Valid}>
              {loading ? "Sending…" : "Submit"}
            </button>
          </div>
          {error && <p className="form-note" style={{ color: "#FF453A" }}>Something went wrong. Please email <a href="mailto:info@mybizpal.ai" style={{ color: "#00D4FF" }}>info@mybizpal.ai</a></p>}
        </div>
      )}
    </div>
  );
}

// ── Revenue Calculator ─────────────────────────────────────────────────────
function RevenueCalculator({ onOpenModal }) {
  const [leads, setLeads] = useState(80);
  const [jobValue, setJobValue] = useState(1200);
  const [missedPct, setMissedPct] = useState(30);
  const [closeRate, setCloseRate] = useState(25);

  const missedLeads = Math.round(leads * (missedPct / 100));
  const monthlyLeak = Math.round(missedLeads * (closeRate / 100) * jobValue);
  const recovered = Math.round(monthlyLeak * 0.7);
  const roi = recovered > 0 ? Math.round(recovered / 197) : 0;
  const fmt = n => n >= 1000 ? `£${(n / 1000).toFixed(1)}k` : `£${n}`;

  const sliderStyle = (val, min, max) => ({
    background: `linear-gradient(to right,#00D4FF ${((val - min) / (max - min)) * 100}%,rgba(255,255,255,0.1) ${((val - min) / (max - min)) * 100}%)`
  });

  return (
    <div className="calc-section" id="calculator">
      <div className="calc-inner">
        <div className="calc-header">
          <div className="eyebrow">Revenue Recovery Calculator</div>
          <h2 className="section-h" style={{ marginBottom: 8 }}>How much are you leaving<br />on the table?</h2>
          <p style={{ fontSize: 16, color: "#A1A1A6", fontWeight: 300, paddingBottom: 8 }}>Drag the sliders — see what inaction is costing you right now.</p>
        </div>
        <div className="calc-body">
          <div className="calc-left">
            {[
              { label: "Monthly leads / enquiries", val: leads, setVal: setLeads, min: 10, max: 500, step: 1, display: leads },
              { label: "Average job / sale value", val: jobValue, setVal: setJobValue, min: 100, max: 10000, step: 100, display: `£${jobValue.toLocaleString()}` },
              { label: "Missed / unanswered %", val: missedPct, setVal: setMissedPct, min: 5, max: 80, step: 1, display: `${missedPct}%` },
              { label: "Your close rate", val: closeRate, setVal: setCloseRate, min: 5, max: 80, step: 1, display: `${closeRate}%` },
            ].map(({ label, val, setVal, min, max, step, display }) => (
              <div className="calc-field" key={label}>
                <div className="calc-field-label">{label} <span className="calc-val">{display}</span></div>
                <input type="range" className="slider" min={min} max={max} step={step} value={val}
                  onChange={e => setVal(Number(e.target.value))} style={sliderStyle(val, min, max)} />
              </div>
            ))}
          </div>
          <div>
            <div className="calc-result-wrap">
              <div className="calc-result-label">Revenue leaking monthly</div>
              <div className="calc-result-num">{fmt(monthlyLeak)}</div>
              <div className="calc-result-sub">That's {fmt(monthlyLeak * 12)} per year walking out the door.</div>
            </div>
            <div className="calc-rows">
              <div className="calc-row"><span className="calc-row-label">Leads missed monthly</span><span className="calc-row-val">{missedLeads}</span></div>
              <div className="calc-row"><span className="calc-row-label">Revenue MyBizPal recovers</span><span className="calc-row-val green">+{fmt(recovered)}/mo</span></div>
              <div className="calc-row"><span className="calc-row-label">ROI at Starter plan (£197/mo)</span><span className="calc-row-val green">{roi}×</span></div>
            </div>
            <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={onOpenModal}>
              Recover This Revenue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sofi Chat Widget (draggable) ──────────────────────────────────────────
// EU AI Act Article 50: the FIRST message discloses that Sofi is an AI
// assistant, before any data is collected. Rendering it also creates the
// widget session server-side, which stamps disclosure_logged_at (the
// evidence trail) and returns the session_ref used as the WhatsApp
// handover token. Every backend call fails soft: the chat keeps working
// and the WhatsApp link falls back to a ref-less pre-fill.
const SOFI_OPENING =
  "Hi! 👋 I'm Sofi, MyBizPal's AI assistant. I answer calls, reply on WhatsApp and book appointments for UK businesses, 24/7.\n\nWhat kind of business do you run?";

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
// No /i flag: the optional second word (surname) must be Capitalised, or
// "I'm James and I run..." would capture "James and".
const NAME_INTRO_RE = /\b(?:[Mm]y name(?:'s| is)|[Ii]'m|[Ii] am|[Tt]his is)\s+([A-Za-z][a-z'-]+(?:\s[A-Z][a-z'-]+)?)/;
// Words that follow "I'm ..." / "this is ..." far more often than a name does.
const NOT_NAMES = new Set([
  "looking", "interested", "just", "running", "trying", "calling", "here",
  "not", "the", "a", "an", "so", "really", "very", "keen", "happy", "good",
  "fine", "sure", "based", "wondering", "curious", "thinking", "hoping",
  "going", "getting", "still", "already", "also", "actually", "only", "asking",
  "great", "brilliant", "perfect", "amazing", "awesome", "lovely", "urgent",
  "my", "our", "it", "what", "how", "why", "all", "mostly", "mainly",
  "probably", "maybe", "roughly", "around", "about", "over", "more", "less",
]);

function SofiWidget() {
  const [open, setOpen] = useState(false);
  const [showLabel, setShowLabel] = useState(false); // shown at 2s, see below
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showHandoff, setShowHandoff] = useState(false);
  const [sessionRef, setSessionRef] = useState(null);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [context, setContext] = useState({});

  // Session outbox: messages/answers queue here and flush to the API once
  // the session exists; failed flushes are retried on the next send.
  const sessionRefLive = useRef(null);
  const outbox = useRef({ messages: [], qualification: {} });
  const flushing = useRef(false);

  // Drag state
  const [pos, setPos] = useState({ bottom: 24, right: 28 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, bottom: 0, right: 0 });
  const didDrag = useRef(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // The greeting bubble now APPEARS at 2s rather than auto-hiding at 5s, and
  // stays until dismissed. labelKilled guards the timer: drag, open or dismiss
  // before 2s must not be undone by the timer firing afterwards.
  const labelKilled = useRef(false);
  useEffect(() => {
    const t = setTimeout(() => { if (!labelKilled.current) setShowLabel(true); }, 2000);
    return () => clearTimeout(t);
  }, []);
  const dismissLabel = () => { labelKilled.current = true; setShowLabel(false); };

  // prefers-reduced-motion, live. Read once up front so the first paint is
  // already correct (no video flash before the preference is applied), then
  // track changes — users do toggle this at OS level mid-session.
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const onChange = (e) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // ── Drag handlers ──────────────────────────────────────────────────────
  // A press stays a TAP until it has travelled DRAG_SLOP; only then is it a
  // drag. The old test was per-axis |dx| > 4, which is far tighter than any
  // real finger: a tap routinely rolls 5-10px on glass, so ordinary taps were
  // being classified as drags and having their click discarded by toggleOpen.
  // Measured here as TOTAL displacement (hypotenuse) so diagonal movement is
  // counted once rather than twice. 16px tolerates ~11px of roll on each axis
  // and is still crossed within the first few millimetres of a real drag.
  const DRAG_SLOP = 16;

  const onPointerDown = (e) => {
    // Only drag on the FAB button itself, not inner elements — matched by class
    // because the label's dismiss ✕ is also a BUTTON.
    if (e.target.classList?.contains("sofi-fab-btn") || e.currentTarget === e.target) {
      dragging.current = true;
      didDrag.current = false;
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        bottom: pos.bottom,
        right: pos.right,
      };
      // NOTHING else happens on press. setPointerCapture and preventDefault
      // used to fire here on every press; both belong to a real drag, and on
      // touch they are exactly the things that can swallow the click that
      // follows. They now happen once the gesture has proven itself a drag.
    }
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (!didDrag.current) {
      // Still within slop — this is a tap in progress. Touch nothing, so the
      // click lands normally.
      if (Math.hypot(dx, dy) < DRAG_SLOP) return;
      didDrag.current = true;
      // Capture now, while the pointer is still inside the 58px button, so the
      // rest of the drag keeps arriving even once the finger leaves the div.
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* unsupported */ }
      labelKilled.current = true;
      setShowLabel(false);
    }
    e.preventDefault();
    const newRight = Math.max(8, Math.min(window.innerWidth - 66, dragStart.current.right - dx));
    const newBottom = Math.max(8, Math.min(window.innerHeight - 66, dragStart.current.bottom - dy));
    setPos({ right: newRight, bottom: newBottom });
  };

  const onPointerUp = (e) => {
    dragging.current = false;
    try {
      if (e?.pointerId != null && e.currentTarget.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch { /* nothing to release */ }
  };

  // WhatsApp deep link. Once the session exists, the pre-fill carries the
  // handover ref so the WhatsApp side can merge this conversation
  // (docs/widget-handover-spec.md).
  const waMessage = sessionRef
    ? `Hi Sofi, continuing our chat (ref: ${sessionRef})`
    : "Hi Sofi! I was just chatting on the MyBizPal website and I'd like to carry on here.";
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMessage)}`;

  const flushOutbox = async () => {
    const ref = sessionRefLive.current;
    const box = outbox.current;
    if (!ref || flushing.current || (!box.messages.length && !Object.keys(box.qualification).length)) return;
    flushing.current = true;
    const payload = { session_ref: ref, messages: box.messages, qualification: box.qualification };
    outbox.current = { messages: [], qualification: {} };
    try {
      const res = await fetch(`${API_URL}/api/widget-session/append`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`append ${res.status}`);
    } catch {
      // Put it back for the next attempt; the chat itself never blocks.
      outbox.current = {
        messages: [...payload.messages, ...outbox.current.messages],
        qualification: { ...payload.qualification, ...outbox.current.qualification },
      };
    } finally {
      flushing.current = false;
    }
  };

  const queueForSession = (msgs, qual = {}) => {
    outbox.current.messages.push(...msgs.map(m => ({ ...m, at: new Date().toISOString() })));
    outbox.current.qualification = { ...outbox.current.qualification, ...qual };
    flushOutbox();
  };

  const createSession = async () => {
    try {
      const res = await fetch(`${API_URL}/api/widget-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_message: SOFI_OPENING, page_url: window.location.href }),
      });
      if (!res.ok) throw new Error(`create ${res.status}`);
      const data = await res.json();
      if (data.session_ref) {
        sessionRefLive.current = data.session_ref;
        setSessionRef(data.session_ref);
        flushOutbox();
      }
    } catch {
      // Fail soft: chat works without a session; WhatsApp link stays ref-less.
    }
  };

  // Spot a volunteered name/email so Sofi can confirm it back and store it.
  const detectContact = (txt, ctx) => {
    const found = {};
    if (!ctx.email) {
      const email = txt.match(EMAIL_RE);
      if (email) found.email = email[0];
    }
    if (!ctx.name) {
      const m = txt.match(NAME_INTRO_RE);
      if (m && !NOT_NAMES.has(m[1].split(/\s/)[0].toLowerCase())) {
        found.name = m[1].replace(/\b[a-z]/g, c => c.toUpperCase());
      }
    }
    return found;
  };

  const sofiReply = (userMsg, count, ctx) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      let reply = "";
      let newCtx = { ...ctx };
      let qual = {};
      let triggerHandoff = false;

      const found = detectContact(userMsg, ctx);
      if (found.name) { newCtx.name = found.name; qual.name = found.name; }
      if (found.email) { newCtx.email = found.email; qual.email = found.email; }
      let ack = "";
      if (found.name && found.email) ack = `Lovely to meet you, ${found.name}, and I've noted ${found.email}. `;
      else if (found.name) ack = `Lovely to meet you, ${found.name}! `;
      else if (found.email) ack = `Perfect, I've noted ${found.email}. `;

      if (count === 1) {
        newCtx.business_type = userMsg;
        qual.business_type = userMsg;
        reply = `${ack}That's great, we help businesses like yours every day. 🙌\n\nWhat's the biggest headache right now?\n\n1️⃣ Missed calls\n2️⃣ After-hours enquiries\n3️⃣ Chasing and following up leads\n4️⃣ All of the above 😅`;
      } else if (count === 2) {
        newCtx.pain = userMsg;
        qual.pain = userMsg;
        reply = `${ack}That's exactly what MyBizPal fixes, usually within the first week.\n\nLast one: roughly how many calls or enquiries do you get a week?`;
      } else if (count >= 3) {
        newCtx.volume = userMsg;
        qual.volume = userMsg;
        reply = `${ack}Perfect, I have everything I need! 👌\n\nLet's carry on over WhatsApp and I'll show you exactly what Sofi can do for your business.`;
        triggerHandoff = true;
      }

      setContext(newCtx);
      setMessages(prev => [...prev, { from: "sofi", text: reply }]);
      queueForSession([{ from: "sofi", text: reply }], qual);

      if (triggerHandoff) setTimeout(() => setShowHandoff(true), 400);
    }, 800 + Math.random() * 500);
  };

  const sendMessage = () => {
    const txt = input.trim();
    if (!txt || typing) return;
    const newCount = exchangeCount + 1;
    setMessages(prev => [...prev, { from: "user", text: txt }]);
    queueForSession([{ from: "user", text: txt }]);
    setInput("");
    setExchangeCount(newCount);
    sofiReply(txt, newCount, context);
  };

  const toggleOpen = () => {
    // Don't toggle if user just dragged
    if (didDrag.current) { didDrag.current = false; return; }
    const next = !open;
    setOpen(next);
    labelKilled.current = true;
    setShowLabel(false);
    if (next && messages.length === 0) {
      setTimeout(() => {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          // Art. 50 disclosure is this first message; creating the session
          // logs the disclosure event server-side at the same moment.
          setMessages([{ from: "sofi", text: SOFI_OPENING }]);
          createSession();
        }, 900);
      }, 300);
    }
  };

  const waIconSvg = (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="#ffffff">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );

  // The launcher avatar. Reduced motion is handled in JS, not CSS: a media
  // query can hide a <video> but cannot stop it existing, and an element that
  // autoplays behind display:none is still decoding frames. Honouring the
  // preference means never putting the video in the DOM at all — so the poster
  // renders as a plain <img> instead.
  const sofiAvatar = reducedMotion ? (
    <img
      className="sofi-fab-avatar"
      src={SOFI_AVATAR_POSTER}
      alt=""
      width="54"
      height="54"
      decoding="async"
    />
  ) : (
    <video
      className="sofi-fab-avatar"
      autoPlay
      muted
      loop
      playsInline
      // playsInline is what stops iOS Safari hijacking this into a fullscreen
      // player on autoplay; muted is what makes autoplay permissible at all.
      poster={SOFI_AVATAR_POSTER}
      aria-hidden="true"
      tabIndex={-1}
    >
      {/* WebM first: Chrome/Firefox take it, Safari falls through to MP4. */}
      <source src={`${SOFI_AVATAR_BASE}/sofi-wave_rzws1b.webm`} type="video/webm" />
      <source src={`${SOFI_AVATAR_BASE}/sofi-wave_wfxmpt.mp4`} type="video/mp4" />
    </video>
  );

  // Panel position — opens above and to the left of the button
  const panelStyle = {
    position: "fixed",
    // Lifts with the button (see the FAB's style) so the panel cannot open
    // underneath the banner either.
    bottom: `calc(${pos.bottom + 68}px + var(--mbp-banner-h, 0px))`,
    right: pos.right,
    zIndex: 499,
    width: 340,
    background: "#0d0d1a",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
    display: "flex",
    flexDirection: "column",
    animation: "panelIn .25s cubic-bezier(.34,1.4,.64,1) both",
  };

  return (
    <>
      {/* Draggable FAB */}
      <div
        className="sofi-fab"
        // --mbp-banner-h is published by CookieBanner: the banner's measured
        // height while it is up, 0px otherwise. Lifting the launcher clear of
        // it is why no z-index changed — the banner stays on top, the launcher
        // simply stops being underneath it. Restores itself on consent, when
        // the variable goes back to 0px.
        style={{ bottom: `calc(${pos.bottom}px + var(--mbp-banner-h, 0px))`, right: pos.right }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {showLabel && !open && (
          <div className="sofi-fab-label">
            <span>Hi, I&rsquo;m Sofi. Ask me anything.</span>
            <button
              className="sofi-fab-label-x"
              // stopPropagation on POINTERDOWN as well as click: the drag
              // handler lives on the parent and would otherwise treat a press
              // on this ✕ as the start of a drag.
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); dismissLabel(); }}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}
        <button
          className="sofi-fab-btn"
          onClick={toggleOpen}
          aria-label="Chat with Sofi"
        >
          {open ? <span style={{ fontSize: 20, color: "#fff", fontFamily: "Manrope,sans-serif" }}>✕</span> : sofiAvatar}
          {!open && <span className="sofi-dot" />}
        </button>
        {!open && <div className="sofi-drag-hint">drag to move</div>}
      </div>

      {open && (
        <div style={panelStyle}>
          <div className="sofi-panel-header">
            <div className="sofi-avatar" style={{ color: "#fff" }}>{waIconSvg}</div>
            <div className="sofi-header-text">
              <h4>Sofi · MyBizPal AI</h4>
              <p>● Online · WhatsApp powered</p>
            </div>
            <button className="sofi-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Always-visible direct WhatsApp button */}
          <a className="sofi-wa-direct" href={waUrl} target="_blank" rel="noreferrer">
            {waIconSvg}
            Continue on WhatsApp directly →
          </a>

          <div className="sofi-messages">
            {messages.map((m, i) => (
              <div key={i} className={`sofi-msg ${m.from}`}>{m.text}</div>
            ))}
            {typing && (
              <div className="sofi-typing">
                <div className="sofi-tdot" /><div className="sofi-tdot" /><div className="sofi-tdot" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {showHandoff && (
            <div className="sofi-handoff">
              <p>Let's continue on WhatsApp, I'll be right there 💬</p>
              <a className="sofi-wa-btn" href={waUrl} target="_blank" rel="noreferrer">
                {waIconSvg} Continue on WhatsApp →
              </a>
            </div>
          )}

          {!showHandoff && (
            <div className="sofi-input-row">
              <input ref={inputRef} className="sofi-input" placeholder="Type your answer..."
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                disabled={typing} />
              <button className="sofi-send" onClick={sendMessage} disabled={typing || !input.trim()}>↑</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ── VideoBox ──────────────────────────────────────────────────────────────────
// Videos are self-hosted on Cloudinary — f_auto,q_auto lets the CDN pick format
// and quality per browser (cuts the source files by 58-83%).
const CLOUDINARY_VIDEO = "https://res.cloudinary.com/dp8novljz/video/upload";

function VideoBox({ label, title, subtitle, duration, accentColor = "#00D4FF", videoSrc, posterSrc, videoTitle }) {
  const [playing, setPlaying] = useState(false);
  const cornerStyle = (top, right, bottom, left) => ({
    position: "absolute", width: 20, height: 20,
    ...(top !== undefined && { top: 16 }), ...(bottom !== undefined && { bottom: 16 }),
    ...(right !== undefined && { right: 16 }), ...(left !== undefined && { left: 16 }),
    borderTop: top ? `2px solid ${accentColor}55` : undefined,
    borderBottom: bottom ? `2px solid ${accentColor}55` : undefined,
    borderLeft: left ? `2px solid ${accentColor}55` : undefined,
    borderRight: right ? `2px solid ${accentColor}55` : undefined,
    borderRadius: top && left ? "3px 0 0 0" : top && right ? "0 3px 0 0" : bottom && left ? "0 0 0 3px" : "0 0 3px 0",
  });
  return (
    <div className="video-section">
      <span className="video-label">{label}</span>
      <h2 style={{ fontFamily: "Manrope,sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 12, color: "#F5F5F7" }}>
        {title}
      </h2>
      <p style={{ fontSize: 17, color: "#A1A1A6", fontWeight: 300, maxWidth: 480, margin: "0 auto 32px" }}>{subtitle}</p>
      <div className="video-box" onClick={() => setPlaying(true)}
        style={videoSrc ? { boxShadow: "0 8px 32px rgba(0,0,0,0.45)", cursor: playing ? "default" : "pointer" } : undefined}>
        <div className="video-grid" />
        <div className="video-glow" style={{ background: `radial-gradient(ellipse,${accentColor}20 0%,rgba(123,47,255,0.08) 40%,transparent 70%)` }} />
        {videoSrc && !playing && posterSrc && (
          <img src={posterSrc} alt="" loading="lazy"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }} />
        )}
        {!playing ? (
          <div className="video-play-wrap">
            <button className="play-btn" aria-label={`Play video: MyBizPal ${label}`} style={{ background: `linear-gradient(135deg,${accentColor},#7B2FFF)` }}><div className="play-tri" /></button>
            <div style={{ fontSize: 15, color: "#A1A1A6", fontWeight: 300 }}>MyBizPal — {label} · {duration}</div>
          </div>
        ) : videoSrc ? (
          <video src={videoSrc} poster={posterSrc} controls autoPlay playsInline preload="none"
            aria-label={videoTitle || `MyBizPal — ${label}`}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, objectFit: "contain", background: "#000" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 18, color: "#A1A1A6" }}>🎬 Video coming soon</div>
          </div>
        )}
        {!(playing && videoSrc) && <>
          <div style={cornerStyle(true, undefined, undefined, true)} />
          <div style={cornerStyle(true, true, undefined, undefined)} />
          <div style={cornerStyle(undefined, undefined, true, true)} />
          <div style={cornerStyle(undefined, true, true, undefined)} />
        </>}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [billing, setBilling] = useState("yearly");
  const [modalOpen, setModalOpen] = useState(false);

  const [salesOpen, setSalesOpen] = useState(false);
  const [salesPlan, setSalesPlan] = useState("");

  const openModal = () => { setModalOpen(true); document.body.style.overflow = "hidden"; };
  const closeModal = () => { setModalOpen(false); document.body.style.overflow = ""; };
  const openSales = (plan = "") => { setSalesPlan(plan); setSalesOpen(true); document.body.style.overflow = "hidden"; };
  const closeSales = () => { setSalesOpen(false); document.body.style.overflow = ""; };

  const monthlySavings = Object.fromEntries(
    PLANS.filter(p => p.monthly && p.annual).map(p => {
      const num = s => Number(String(s).replace(/,/g, ""));
      return [p.key, (num(p.monthly) - num(p.annual)) * 12];
    })
  );

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  // On load with a URL hash (e.g. /#pricing), scroll to that section once
  // layout has settled. Smooth-scroll CSS handles the animation; we retry
  // briefly because images/sections above can shift position after paint.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    let tries = 0;
    const id = hash.slice(1);
    const tick = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (++tries < 8) setTimeout(tick, 250);
    };
    const start = setTimeout(tick, 300);
    return () => clearTimeout(start);
  }, []);

  // Close modal on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") { closeModal(); closeSales(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <>
      <style>{CSS}</style>

      {/* BACKGROUND ARCS */}
      <div className="bg-arcs" aria-hidden="true">
        <svg className="arc-svg arc-left" viewBox="0 0 700 1400" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="gPurple" x1="0" y1="0" x2="0" y2="1">
              <stop offset="8%" stopColor="#7B5FFF" stopOpacity="0"/>
              <stop offset="50%" stopColor="#B49BFF" stopOpacity="1"/>
              <stop offset="92%" stopColor="#7B5FFF" stopOpacity="0"/>
            </linearGradient>
            <filter id="glowP" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="14"/></filter>
          </defs>
          <circle cx="-120" cy="700" r="640" fill="none" stroke="url(#gPurple)" strokeWidth="11" filter="url(#glowP)"/>
          <circle cx="-120" cy="700" r="640" fill="none" stroke="url(#gPurple)" strokeWidth="2.5"/>
        </svg>
        <svg className="arc-svg arc-right" viewBox="0 0 700 1400" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="gCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="8%" stopColor="#00D4FF" stopOpacity="0"/>
              <stop offset="50%" stopColor="#5FE6FF" stopOpacity="1"/>
              <stop offset="92%" stopColor="#00D4FF" stopOpacity="0"/>
            </linearGradient>
            <filter id="glowC" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="14"/></filter>
          </defs>
          <circle cx="820" cy="700" r="640" fill="none" stroke="url(#gCyan)" strokeWidth="11" filter="url(#glowC)"/>
          <circle cx="820" cy="700" r="640" fill="none" stroke="url(#gCyan)" strokeWidth="2.5"/>
        </svg>
      </div>

      {/* NAV */}
      <nav className={"nav" + (scrolled ? " scrolled" : "")}>
        <a className="nav-logo" href="#"><img src={LOGO_FULL} alt="MyBizPal" /></a>
        <ul className="nav-links">
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <div className="nav-right">
          <a className="btn-ghost" href="https://app.mybizpal.ai">Sign in</a>
          <button className="btn-pill" onClick={openModal}>Book a Demo →</button>
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>
      {menuOpen && (
        <div className="mobile-menu">
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
          <div className="mobile-menu-divider" />
          <a href="https://app.mybizpal.ai" onClick={() => setMenuOpen(false)}>Sign in</a>
          <a className="mobile-menu-cta" onClick={() => { setMenuOpen(false); openModal(); }}>Book a Demo →</a>
        </div>
      )}

      {/* HERO */}
      <section className="hero">
        <div className="hero-glow" /><div className="hero-grid" />
        <div className="hero-ring" /><div className="hero-ring hero-ring2" />
        <div className="hero-badge"><span className="hero-badge-pill">NEW</span>AI voice agents — now live for UK businesses</div>
        <h1 className="hero-title">Your business,<br /><span className="grad-text">always answering.</span></h1>
        <p className="hero-sub">MyBizPal answers calls, books appointments, and handles client enquiries 24/7 — so you never miss a lead, no matter the hour.</p>
        <div className="hero-ctas">
          <button className="btn-primary" onClick={openModal}>Book a Live Demo →</button>
          <a className="btn-outline" href="#video">▶ Watch How It Works</a>
        </div>
        <div className="stats-bar">
          {[["24/7", "Always On"], ["<1s", "Response Time"], ["3×", "More Bookings"], ["£0", "Missed Leads"]].map(([v, l]) => (
            <div className="stat-item" key={l}><div className="stat-val"><span className="grad-text">{v}</span></div><div className="stat-label">{l}</div></div>
          ))}
        </div>
      </section>

      {/* FEATURE STRIP */}
      <div className="feat-strip">
        <div className="feat-strip-grid">
          {[...new Set(TICKER)].map((t, i) => <span className="feat-strip-tag" key={i}>{t}</span>)}
        </div>
      </div>

      {/* VIDEO 1 — AI Agent Demo */}
      <div id="video">
        <VideoBox label="Product Demo" title={<>See MyBizPal <span className="grad-text">in action</span></>}
          subtitle="Watch a real AI agent handle an inbound call, qualify a lead, and book an appointment."
          duration="0:40" accentColor="#00D4FF" videoTitle="MyBizPal — Live Call Demo"
          videoSrc={`${CLOUDINARY_VIDEO}/f_auto,q_auto/v1785492528/279da9c1-173d-4978-bdb3-1a8460ec36dd_nzrmfh.mp4`}
          posterSrc={`${CLOUDINARY_VIDEO}/so_auto,f_auto,q_auto,w_1800,c_limit/v1785492528/279da9c1-173d-4978-bdb3-1a8460ec36dd_nzrmfh.jpg`} />
      </div>

      {/* PAIN SECTION */}
      <div className="pain-section">
        <div className="pain-inner">
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <div className="pain-eyebrow">⚠ The Revenue Leak</div>
            <h2 className="section-h" style={{ marginBottom: 10, textAlign: "center" }}>Your competitors are answering. Are you?</h2>
            <p className="section-sub" style={{ margin: "0 auto", textAlign: "center" }}>Every unanswered call is a booked job for someone else.</p>
          </div>
          <div className="pain-cards">
            {[
              { num: "62%", title: "of SME calls go unanswered after 5pm", desc: "Your AI-enabled competitors are booking those jobs tonight. Every night. Every weekend." },
              { num: "10 min", title: "is the maximum response window", desc: "After 10 minutes, 78% of UK consumers move on to the next business on Google." },
              { num: "98%", title: "of WhatsApp messages are opened", desc: "Yet most SMEs reply manually, hours later. Your AI replies in 8 seconds. Every time." },
            ].map(p => (
              <div className="pain-card" key={p.num}><div className="pain-bar" />
                <div className="pain-num">{p.num}</div>
                <div className="pain-title">{p.title}</div>
                <p className="pain-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="section" id="how-it-works">
        <div className="mb64">
          <div className="eyebrow">How It Works</div>
          <h2 className="section-h">Three steps to<br />never miss a call.</h2>
          <p className="section-sub">No technical knowledge needed. We handle everything.</p>
        </div>
        <div className="steps-wrap">
          {[
            { n: "01", icon: "🔗", t: "Connect your business", d: "Link your calendar, phone number, and existing tools in minutes using our step-by-step setup wizard." },
            { n: "02", icon: "🤖", t: "AI handles everything 24/7", d: "MyBizPal answers calls, responds on WhatsApp, qualifies leads, and books appointments — sounding completely natural." },
            { n: "03", icon: "📈", t: "Watch your business scale", d: "Your booking rate climbs while your team focuses on delivery instead of phones." },
          ].map(s => (
            <div className="step" key={s.n}><div className="step-line" />
              <div className="step-num">{s.n}</div>
              <div className="step-icon">{s.icon}</div>
              <div className="step-title">{s.t}</div>
              <p className="step-desc">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VIDEO 2 — Platform Presentation (scattered) */}
      <VideoBox label="Platform Overview" title={<>The full <span className="grad-text">MyBizPal platform</span></>}
        subtitle="A complete walkthrough of features, integrations, and what goes live on day one."
        duration="0:41" accentColor="#7B2FFF" videoTitle="MyBizPal — Platform Overview"
        videoSrc={`${CLOUDINARY_VIDEO}/f_auto,q_auto/v1785492510/mybizpal-zoe-promo-final-v2_rol3xu.mp4`}
        posterSrc={`${CLOUDINARY_VIDEO}/so_auto,f_auto,q_auto,w_1800,c_limit/v1785492510/mybizpal-zoe-promo-final-v2_rol3xu.jpg`} />

      {/* REVENUE CALCULATOR */}
      <RevenueCalculator onOpenModal={openModal} />

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="mb64">
          <div className="eyebrow">Features</div>
          <h2 className="section-h">Built for businesses<br />that run on calls.</h2>
          <p className="section-sub">Every feature purpose-built for real SMEs.</p>
        </div>
        <div className="feat-grid">
          {[
            { icon: "📞", t: "AI Voice Agent", d: "Human-quality voice powered by ElevenLabs. Handles inbound calls, answers FAQs, qualifies leads, and books appointments in real time.", tag: "Core Feature" },
            { icon: "📤", t: "Outbound Calling", d: "Automatically follow up on leads, confirm appointments, and re-engage cold prospects — all without lifting a finger.", tag: null },
            { icon: "📅", t: "Smart Scheduling", d: "Checks live availability across Google Calendar and Calendly, books appointments, and sends confirmations automatically.", tag: null },
            { icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30"><path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>, t: "WhatsApp Automation", d: "Respond to enquiries, send booking confirmations, and follow up on leads — all via WhatsApp without lifting a finger.", tag: null },
            { icon: "🔍", t: "AI Lead Qualification", d: "Every inbound call and message is automatically scored and qualified. Only the best leads reach your team.", tag: null },
            { icon: "🔀", t: "Seamless Human Handoff", d: "When a customer needs a real person, the AI transfers naturally without dropping context or repeating anything.", tag: null },
            { icon: "📊", t: "Backend Dashboard", d: "Full client portal access. Monitor calls, conversations, bookings, and lead scores in real time from anywhere.", tag: "Client Portal" },
            { icon: "🎙️", t: "Custom Voice & Persona", d: "Change your AI's voice, name, tone, and personality. It can sound like a real team member at your business.", tag: null },
            { icon: "⚡", t: "Instant Setup, Zero Code", d: "Connect your calendar and phone number in under 10 minutes. No developers needed.", tag: "Popular" },
          ].map(f => (
            <div className="feat-card" key={f.t}>
              {f.tag && <span className="feat-tag">✦ {f.tag}</span>}
              <span className="feat-icon">{f.icon}</span>
              <div className="feat-title">{f.t}</div>
              <p className="feat-desc">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLATFORM CAROUSEL */}
      <PlatformCarousel />

      {/* INTEGRATIONS */}
      <div className="logos-section">
        <div className="logos-inner">
          <div className="logos-label">Works with the tools you already use</div>
          {[1, 2].map(row => {
            // Row 2 starts halfway through the list so the two rows never align vertically
            const list = row === 1
              ? INTEGRATIONS
              : [...INTEGRATIONS.slice(6), ...INTEGRATIONS.slice(0, 6)];
            return (
            <div className={`marquee-row marquee-row-${row}`} key={row}>
              <div className="marquee-track">
                {[...list, ...list].map((int, i) => (
                  <div className="logo-pill" key={`${row}-${i}`}>
                    <span className="logo-tile"><img src={int.logo} alt="" /></span>
                    <span className="logo-name">{int.name}</span>
                  </div>
                ))}
              </div>
            </div>
            );
          })}
          <p className="logos-disclaimer">All product names, logos and brands are property of their respective owners. Use of these names and logos does not imply endorsement.</p>
        </div>
      </div>

      {/* INDUSTRIES */}
      <div className="industries-section">
        <div className="industries-inner">
          <div style={{ textAlign: "center" }}>
            <div className="eyebrow">Built for UK SMEs</div>
            <h2 className="section-h" style={{ textAlign: "center" }}>Works for your industry.<br />Live in 7 days.</h2>
            <p className="section-sub" style={{ margin: "0 auto", textAlign: "center" }}>Pre-trained on real UK business conversations across every sector.</p>
          </div>
          <div className="industries-grid">
            {INDUSTRIES.map(ind => (
              <div className="industry-card" key={ind.name} onClick={openModal}>
                <div className="industry-icon">{ind.icon}</div>
                <div className="industry-name">{ind.name}</div>
                <div className="industry-desc">{ind.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COMPARISON TABLE */}
      <div className="compare-section">
        <div className="compare-inner">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="eyebrow">Why MyBizPal</div>
            <h2 className="section-h" style={{ textAlign: "center" }}>The old way is costing<br />you money every day.</h2>
          </div>
          <div className="compare-scroll">
            <table className="compare-table">
              <thead>
                <tr>
                  <th></th>
                  <th className="col-rec">❌ Human Receptionist</th>
                  <th className="col-ai">❌ Other AI Tools</th>
                  <th className="col-new"><img src={LOGO_FULL} alt="MyBizPal" style={{ height: 24, width: "auto", verticalAlign: "middle" }} /></th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map(([feat, rec, ai, mbp]) => (
                  <tr key={feat}>
                    <td>{feat}</td>
                    <td>{rec}</td>
                    <td>{ai}</td>
                    <td className="col-new"><span className="check-yes">✓</span> {mbp.replace("✓ ", "")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="compare-hint">← swipe to compare →</div>
        </div>
      </div>

      {/* DEMO FORM (inline, kept intact) */}
      <div className="demo-wrap" id="demo">
        <div className="demo-inner">
          <div className="demo-left">
            <div className="eyebrow">Live Demo</div>
            <h2 className="demo-title">Hear our AI<br /><span className="grad-text">answer your call.</span></h2>
            <p className="demo-desc">Enter your details and receive a real call from our AI agent within 30 seconds.</p>
            <ul className="demo-feats">
              {["Answers questions about your business naturally", "Books a follow-up appointment in real time", "Handles interruptions and complex requests", "Works from any phone, anywhere"].map(li => (
                <li key={li}><span className="df-check">✓</span>{li}</li>
              ))}
            </ul>
          </div>
          <div className="demo-right"><DemoForm /></div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <section className="section" id="testimonials">
        <div className="mb64" style={{ textAlign: "center" }}>
          <div className="eyebrow">Social Proof</div>
          <h2 className="section-h" style={{ textAlign: "center" }}>Businesses love MyBizPal.</h2>
        </div>
        <div className="testi-grid">
          {TESTIMONIALS.map(t => (
            <div className="testi-card" key={t.name}>
              <div className="stars">{[...Array(5)].map((_, i) => <span className="star" key={i}>★</span>)}</div>
              <div className="quote-mark">"</div>
              <p className="testi-text">{t.text}</p>
              <div className="testi-author">
                <div className="testi-avatar"><img src={t.photo} alt={t.name} /></div>
                <div><div className="testi-name">{t.name}</div><div className="testi-role">{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>

        {/* Trustpilot Widget */}
        <div className="tp-strip">
          <a className="tp-logo" href="https://www.trustpilot.com/review/mybizpal.ai" target="_blank" rel="noreferrer">
            <span style={{ color: "#00B67A", fontSize: 22 }}>★</span>
            <span style={{ color: "#00B67A", fontWeight: 800, fontSize: 18 }}>Trustpilot</span>
          </a>
          <div className="tp-divider" />
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#F5F5F7" }}>4.9 / 5</div>
            <div style={{ fontSize: 14, color: "#A1A1A6" }}>Excellent rating</div>
          </div>
          <div className="tp-divider" />
          <div style={{ fontSize: 14, color: "#A1A1A6", maxWidth: 220 }}>
            Rated <strong style={{ color: "#F5F5F7" }}>Excellent</strong> by our customers.<br />
            <a href="https://www.trustpilot.com/review/mybizpal.ai" target="_blank" rel="noreferrer" style={{ color: "#00D4FF", textDecoration: "none", fontSize: 13 }}>
              Read our reviews →
            </a>
          </div>
          {/* Trustpilot embed widget — paste your widget script here */}
          <div className="trustpilot-widget" data-locale="en-GB" data-template-id="56278e9abfbbba0bdcd568bc" data-businessunit-id="YOUR_BUSINESSUNIT_ID" data-style-height="52px" data-style-width="200px">
            <a href="https://www.trustpilot.com/review/mybizpal.ai" target="_blank" rel="noreferrer">Trustpilot</a>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section" id="pricing">
        <div className="mb64" style={{ textAlign: "center" }}>
          <div className="eyebrow">Pricing</div>
          <h2 className="section-h" style={{ textAlign: "center" }}>Cheaper than one missed call.<br /><span className="grad-text">Better than a full-time hire.</span></h2>
          <p className="section-sub" style={{ margin: "0 auto 32px", textAlign: "center" }}>No hidden fees. Cancel renewal any time. Pays for itself in one booking.</p>
          <div className="billing-toggle">
            <span className={"billing-label" + (billing === "monthly" ? " active" : "")} onClick={() => setBilling("monthly")}>Monthly</span>
            <div className={"toggle-track" + (billing === "yearly" ? " on" : "")} onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}>
              <div className="toggle-thumb" />
            </div>
            <span className={"billing-label" + (billing === "yearly" ? " active" : "")} onClick={() => setBilling("yearly")}>
              Yearly<span className="save-badge">Save 20%</span>
            </span>
          </div>
        </div>
        <div className="pricing-grid">
          {PLANS.map(p => (
            <div
              className={"p-card" + (p.featured ? " featured" : "") + (p.contactSales ? " premium" : "") + (p.key === "exclusive" ? " top" : "")}
              key={p.tier}
              style={{ "--order-d": p.desktopOrder, "--order-m": p.mobileOrder }}
            >
              {p.featured && <div className="p-badge">Most Popular</div>}
              <div className="p-badge-row">
                <span className={"p-tier-badge " + (p.contactSales ? "prem" : "trial")}>{p.badge}</span>
              </div>
              <div className={"p-tier" + (p.contactSales ? " cyan" : "")}>{p.tier}</div>
              <div className="p-tagline" style={{ fontSize: 15, color: "#A1A1A6", fontWeight: 300, marginBottom: 16 }}>{p.tagline}</div>
              {p.contactSales ? (
                <div className="p-price" style={{ fontSize: 30 }}>Let's talk</div>
              ) : (
                <>
                  <div className="p-price"><sup>£</sup>{billing === "yearly" ? p.annual : p.monthly}</div>
                  <div className="p-period">{billing === "yearly" ? "/ mo, billed annually" : "/ month"}</div>
                  <div className="p-savings">
                    {billing === "yearly" ? `💚 Save £${monthlySavings[p.key]}/yr vs monthly` : ""}
                  </div>
                </>
              )}
              <div className="p-roi">💰 {p.roi}</div>
              {!p.contactSales && p.setup && (
                <div className="setup-fee">{billing === "yearly" ? "Setup waived" : `£${p.setup} setup`}</div>
              )}
              <div className="p-divider" />
              <ul className="p-feats">
                {(() => {
                  let seenFrom = false;
                  return p.features.map((f, i) => {
                    if (f && typeof f === "object" && f.from) {
                      seenFrom = true;
                      return <li key={"from" + i} className="p-from">{f.from}</li>;
                    }
                    const own = !seenFrom;
                    return <li key={"f" + i} className={own ? "own" : undefined}><span className="p-check">✓</span>{f}</li>;
                  });
                })()}
                {p.locked && (
                  <li style={{ color: "#6E6E73" }}><span className="p-check" style={{ color: "#6E6E73" }}>🔒</span>{p.locked}</li>
                )}
              </ul>
              <button
                className={p.contactSales ? "p-btn-prem" : "p-btn-grad"}
                onClick={() => {
                  if (p.contactSales) { openSales(p.salesPlan || ""); return; }
                  const billingParam = billing === "yearly" ? "annual" : "monthly";
                  window.location.href = `https://app.mybizpal.ai/signup?plan=${p.key}&billing=${billingParam}`;
                }}
                style={{ cursor: "pointer" }}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", marginTop: 28, fontSize: 14, color: "#6E6E73" }}>Every plan includes a generous fair-use allowance — no surprise bills.</p>
        <p style={{ textAlign: "center", marginTop: 6, fontSize: 13, color: "#6E6E73" }}>Prices in GBP. Annual plans billed as a single payment.</p>
      </section>

      {/* GUARANTEE */}
      <div className="guarantee-section">
        <div className="guarantee-inner">
          <div className="guarantee-icon">🛡️</div>
          <h2 className="guarantee-title">If MyBizPal doesn't book you<br />more jobs — <span className="grad-text">you don't pay.</span></h2>
          <p className="guarantee-desc">Every Elite plan comes with a 30-day performance guarantee. If you don't see measurable results in your first month, we refund you completely. No awkward calls. No fine print.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={openModal}>Claim Your Guarantee →</button>
            <a className="btn-outline" href="#pricing">View All Plans</a>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="mb64" style={{ textAlign: "center" }}>
          <div className="eyebrow">FAQ</div>
          <h2 className="section-h" style={{ textAlign: "center" }}>Common questions.</h2>
        </div>
        <div className="faq-stack">{FAQS.map(f => <FAQ key={f.q} q={f.q} a={f.a} />)}</div>
      </section>

      {/* GET STARTED TODAY CTA */}
      <section style={{ padding: "0 24px 100px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", background: "linear-gradient(135deg,rgba(0,212,255,0.08),rgba(123,47,255,0.08))", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 28, padding: "72px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Get Started Today</div>
          <h2 style={{ fontFamily: "Manrope,sans-serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 18, color: "#F5F5F7" }}>
            Stop missing calls.<br /><span className="grad-text">Start booking more.</span>
          </h2>
          <p style={{ fontSize: 18, color: "#A1A1A6", fontWeight: 300, maxWidth: 460, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Join hundreds of UK businesses using MyBizPal to capture every lead, 24 hours a day.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={openModal}>Book a Free Demo →</button>
            <a className="btn-outline" href="https://www.trustpilot.com/review/mybizpal.ai" target="_blank" rel="noreferrer">★ Read Reviews</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <a className="nav-logo" href="#" style={{ display: "inline-flex", marginBottom: 12 }}>
              <img src={LOGO_ICON} alt="MyBizPal" style={{ height: "32px", width: "auto" }} />
            </a>
            <p className="footer-brand-desc">24/7 AI voice agents and automation for growing SMEs. Never miss a call, booking, or lead again.</p>
          </div>
          <div>
            <div className="footer-col-title">Product</div>
            <ul className="footer-links">
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a onClick={openModal} style={{ cursor: "pointer" }}>Book a Demo</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Company</div>
            <ul className="footer-links">
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="mailto:info@mybizpal.ai">Email Us</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Legal</div>
            <ul className="footer-links">
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/gdpr">GDPR</a></li>
              <li><a href="/cookies">Cookie Policy</a></li>
              <li><a href="/acceptable-use">Acceptable Use</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-disclosure">
          <div className="footer-disclosure-title">How MyBizPal uses Google data</div>
          <p>
            MyBizPal is an AI assistant platform for businesses. It connects to Google services,
            including Gmail and Google Calendar, to send appointment confirmations, reminders, and
            notifications, and to manage bookings on behalf of the business. We only access this data
            to provide these features and never sell it. MyBizPal's use of information received from
            Google APIs adheres to the{" "}
            <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">
              Google API Services User Data Policy
            </a>, including the Limited Use requirements.
          </p>
        </div>
        <div className="footer-bottom">
          <div className="footer-legal">
            © 2026 MyBizPal®. All rights reserved. MyBizPal® is a trading name of De Ornelas Advisory Group Ltd.<br />
            Company No: 16822556 · Registered in England &amp; Wales · ICO Reg: C1826607
          </div>
          <div className="footer-socials">
            <a className="social-icon" href="mailto:info@mybizpal.ai">✉</a>
            <a className="social-icon" href="https://www.trustpilot.com/review/mybizpal.ai" target="_blank" rel="noreferrer">★</a>
            <a className="social-icon" href="https://linkedin.com" target="_blank" rel="noreferrer">in</a>
          </div>
        </div>
      </footer>

      {/* DEMO MODAL POPUP */}
      <div className={"modal-overlay" + (modalOpen ? " open" : "")} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
        <div className="modal-box">
          <div className="modal-header">
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Live Demo</div>
              <h3 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#F5F5F7", marginBottom: 4 }}>
                Hear our AI <span className="grad-text">answer your call.</span>
              </h3>
              <p style={{ fontSize: 14, color: "#A1A1A6", fontWeight: 300 }}>Receive a real call from our AI within 30 seconds.</p>
            </div>
            <button className="modal-close" onClick={closeModal}>✕</button>
          </div>
          <div className="modal-body">
            <DemoForm onClose={closeModal} />
          </div>
        </div>
      </div>

      {/* CONTACT SALES MODAL (Elite) */}
      <div className={"modal-overlay" + (salesOpen ? " open" : "")} onClick={e => { if (e.target === e.currentTarget) closeSales(); }}>
        <div className="modal-box">
          <div className="modal-header" style={{ alignItems: "center", paddingBottom: 8 }}>
            <img src={LOGO_FULL} alt="MyBizPal" style={{ height: 30, width: "auto" }} />
            <button className="modal-close" onClick={closeSales}>✕</button>
          </div>
          <div className="modal-body">
            <ContactSalesForm onClose={closeSales} plan={salesPlan} />
          </div>
        </div>
      </div>

      {/* SOFI WIDGET */}
      <SofiWidget />

      {/* COOKIE CONSENT */}
      <CookieBanner />
    </>
  );
}
