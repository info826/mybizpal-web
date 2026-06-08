import { useState, useEffect, useRef } from "react";
import CookieBanner from "./CookieBanner";

const LOGO_FULL = "https://res.cloudinary.com/dp8novljz/image/upload/MyBizPal_Full_Logo_Dark_BG_R_gud0ag.png";
const LOGO_ICON = "https://res.cloudinary.com/dp8novljz/image/upload/MyBizPal_Full_Logo_Dark_BG_R_gud0ag.png";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const WA_NUMBER = import.meta.env.VITE_WA_NUMBER || "447360280655";

// ── Integration logos (Cloudinary-hosted, trimmed & fitted to 72px height) ───
const CLD = "https://res.cloudinary.com/dp8novljz/image/upload/f_auto,q_auto,e_trim,h_72,c_fit";
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

const COUNTRIES = [
  {code:"+44",flag:"🇬🇧",name:"UK"},{code:"+1",flag:"🇺🇸",name:"US"},{code:"+34",flag:"🇪🇸",name:"ES"},
  {code:"+351",flag:"🇵🇹",name:"PT"},{code:"+49",flag:"🇩🇪",name:"DE"},{code:"+33",flag:"🇫🇷",name:"FR"},
  {code:"+39",flag:"🇮🇹",name:"IT"},{code:"+31",flag:"🇳🇱",name:"NL"},{code:"+353",flag:"🇮🇪",name:"IE"},
  {code:"+61",flag:"🇦🇺",name:"AU"},{code:"+1",flag:"🇨🇦",name:"CA"},{code:"+971",flag:"🇦🇪",name:"UAE"},
  {code:"+91",flag:"🇮🇳",name:"IN"},{code:"+55",flag:"🇧🇷",name:"BR"},{code:"+27",flag:"🇿🇦",name:"ZA"},
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

const PRICES = {
  starter:{setup:"price_1TbRiUEeQsMUUSove7Zk2xI4",monthly:"price_1TbRkNEeQsMUUSovudq4xJVy",annual:"price_1TbRpTEeQsMUUSovR6swIWaJ"},
  pro:    {setup:"price_1TbRjMEeQsMUUSovK2cPJHxc",monthly:"price_1TbRkvEeQsMUUSovAQatpRDB",annual:"price_1TbRpwEeQsMUUSovcxJ5MDNi"},
  elite:  {setup:"price_1TbRjhEeQsMUUSovnIb8Qzbi",monthly:"price_1TbRluEeQsMUUSovw7IX1uCE",annual:"price_1TbRsVEeQsMUUSovSx7v82k2"},
};

const PLANS = [
  {
    key:"starter",tier:"Starter",setup:"399",monthly:"297",yearly:"238",featured:false,cta:"Get Started",
    roi:"Pays back from ~1 recovered lead/mo",
    features:["1 local UK number","1,000 call minutes/mo","Inbound call handling","Calendar integration & booking","FAQ automation","WhatsApp auto-replies","Lead capture & CRM sync","Email support"],
  },
  {
    key:"pro",tier:"Pro",setup:"799",monthly:"597",yearly:"478",featured:true,cta:"Get Started",
    roi:"Avg. client recovers £2,400/mo",
    features:["Everything in Starter","3,000 call minutes/mo","Outbound calling & follow-ups","Multi-calendar support","CRM & webhook integrations","GoHighLevel / HubSpot sync","N8N custom automations","Custom voice & AI name","Priority support"],
  },
  {
    key:"elite",tier:"Elite",setup:"1,499",monthly:"1197",yearly:"958",featured:false,cta:"Get Started",
    roi:"Clients avg. 12–20× ROI in 90 days",
    features:["Everything in Pro","10,000 call minutes/mo","Backend dashboard access","Full AI persona customisation","Dead lead reactivation","White-label option","Dedicated account manager","SLA guarantee + 30-day money back"],
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
  ["Pricing (GBP)",                  "£2k–£3.5k/mo salary",  "£300–£1,500+/mo",         "✓ From £149/mo"],
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

/* TICKER */
.ticker-strip{border-top:1px solid rgba(255,255,255,0.08);border-bottom:1px solid rgba(255,255,255,0.08);overflow:hidden;padding:13px 0;background:rgba(255,255,255,0.02)}
.ticker-track{display:flex;animation:tick 32s linear infinite;width:max-content}
.ticker-track:hover{animation-play-state:paused}
@keyframes tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.ticker-item{display:flex;align-items:center;gap:10px;padding:0 28px;font-size:12px;font-weight:600;color:#6E6E73;white-space:nowrap;text-transform:uppercase;letter-spacing:0.09em}
.ticker-sep{width:4px;height:4px;border-radius:50%;background:#00D4FF;flex-shrink:0;opacity:.5}

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

/* MODAL */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:600;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;pointer-events:none;transition:opacity .25s;backdrop-filter:blur(8px)}
.modal-overlay.open{opacity:1;pointer-events:all}
.modal-box{background:#0d0d1a;border:1px solid rgba(255,255,255,0.1);border-radius:24px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;position:relative;transform:translateY(16px) scale(.98);transition:transform .25s;scrollbar-width:thin}
.modal-overlay.open .modal-box{transform:translateY(0) scale(1)}
.modal-header{padding:28px 28px 0;display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
.modal-close{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:#A1A1A6;width:32px;height:32px;border-radius:50%;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Manrope',sans-serif;transition:all .2s}
.modal-close:hover{background:rgba(255,255,255,0.12);color:#F5F5F7}
.modal-body{padding:20px 28px 28px}

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
.pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;align-items:stretch}
.p-card{background:#0d0d1a;border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:36px;transition:border-color .3s;position:relative;overflow:hidden;display:flex;flex-direction:column}
.p-card.featured{border-color:rgba(0,212,255,0.35);background:linear-gradient(160deg,rgba(0,212,255,0.05),rgba(123,47,255,0.05),#0d0d1a)}
.p-badge{position:absolute;top:-1px;right:28px;background:linear-gradient(135deg,#00D4FF,#7B2FFF);color:#000;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:4px 14px;border-radius:0 0 10px 10px}
.p-tier{font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#6E6E73;margin-bottom:14px}
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
.p-btn-outline{width:100%;padding:13px;border-radius:100px;background:transparent;color:#F5F5F7;border:1px solid rgba(255,255,255,0.13);font-family:'Manrope',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s}
.p-btn-outline:hover{border-color:rgba(0,212,255,0.4);color:#00D4FF}
.p-btn-grad{width:100%;padding:13px;border-radius:100px;background:linear-gradient(135deg,#00D4FF,#7B2FFF,#4060FF);color:#000;border:none;font-family:'Manrope',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s}
.p-btn-grad:hover{opacity:.86;box-shadow:0 6px 24px rgba(0,212,255,0.28)}

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
.footer-grid{display:grid;grid-template-columns:2.2fr 1fr 1fr 1fr;gap:48px;margin-bottom:56px}
.footer-brand-desc{font-size:14px;color:#6E6E73;line-height:1.7;font-weight:300;margin-top:16px;max-width:260px}
.footer-col-title{font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#6E6E73;margin-bottom:18px}
.footer-links{list-style:none;display:flex;flex-direction:column;gap:11px}
.footer-links a{color:#A1A1A6;text-decoration:none;font-size:14px;transition:color .2s}
.footer-links a:hover{color:#F5F5F7}
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
.sofi-fab-btn{width:58px;height:58px;border-radius:50%;background:#0d0d1a;border:1.5px solid rgba(0,212,255,0.5);cursor:grab;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 28px rgba(0,212,255,0.15);position:relative;transition:box-shadow .2s}
.sofi-fab-btn:active{cursor:grabbing}
.sofi-fab-btn:hover{box-shadow:0 10px 36px rgba(0,212,255,0.4);opacity:.92}
.sofi-drag-hint{font-size:10px;color:rgba(255,255,255,0.35);text-align:center;margin-top:2px;pointer-events:none;font-family:'Manrope',sans-serif}
.sofi-dot{position:absolute;top:2px;right:2px;width:10px;height:10px;background:#00D4FF;border-radius:50%;border:2px solid #0d0d1a}
.sofi-fab-label{background:rgba(13,13,26,0.95);border:1px solid rgba(255,255,255,0.1);color:#F5F5F7;font-family:'Manrope',sans-serif;font-size:13px;font-weight:600;padding:8px 14px;border-radius:100px;white-space:nowrap;backdrop-filter:blur(12px)}
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
  .nav{padding:0 20px 0 8px;height:140px}.nav-links{display:none}.nav-right{display:none}.hamburger{display:flex}
  .nav-logo img{height:52px}
  .mobile-menu{top:140px}
  .hero-ctas{flex-direction:column;align-items:stretch}.hero-ctas .btn-primary,.hero-ctas .btn-outline{width:100%;justify-content:center}
  .stats-bar{display:grid;grid-template-columns:1fr 1fr}.stat-item{flex:none;border-right:none;border-bottom:1px solid rgba(255,255,255,0.08)}.stat-item:nth-child(odd){border-right:1px solid rgba(255,255,255,0.08)}.stat-item:nth-last-child(-n+2){border-bottom:none}
  .steps-wrap,.feat-grid,.testi-grid,.pricing-grid,.pain-cards,.industries-grid{grid-template-columns:1fr}
  .calc-body{grid-template-columns:1fr;padding:24px 24px 40px}.calc-left{border-right:none;border-bottom:1px solid rgba(255,255,255,0.08);padding-right:0;padding-bottom:28px;margin-bottom:28px}
  .calc-header{padding:32px 24px 0}
  .compare-section{overflow-x:auto}
  .demo-inner{grid-template-columns:1fr}.demo-left{border-right:none;border-bottom:1px solid rgba(255,255,255,0.08);padding:40px 28px}.demo-right{padding:40px 28px}
  .form-row{grid-template-columns:1fr}.footer-grid{grid-template-columns:1fr 1fr}
  .footer-bottom{flex-direction:column;text-align:center}
  .guarantee-inner{padding:40px 28px}
  .industries-grid{grid-template-columns:repeat(2,1fr)}
  .sofi-panel{right:12px;left:12px;width:auto;bottom:92px}
  .modal-overlay{padding:12px}
  .modal-box{max-width:100%}
}
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={"faq-item" + (open ? " open" : "")}>
      <div className="faq-q" onClick={() => setOpen(!open)}>{q}<span className="faq-chevron">+</span></div>
      <div className="faq-a">{a}</div>
    </div>
  );
}

function CountrySelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = COUNTRIES.find(c => c.code === value) || COUNTRIES[0];
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="country-select" ref={ref}>
      <div className={"country-trigger" + (open ? " open" : "")} onClick={() => setOpen(!open)}>
        <span>{selected.flag} {value}</span>
        <span style={{ fontSize: 9, color: "#6E6E73" }}>▼</span>
      </div>
      {open && (
        <div className="country-dropdown">
          {COUNTRIES.map((c, i) => (
            <div key={i} className={"country-option" + (c.code === value && c.name === selected.name ? " active" : "")}
              onClick={() => { onChange(c.code); setOpen(false); }}>
              {c.flag} {c.name} {c.code}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DemoForm({ onClose }) {
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", countryCode: "+44", phone: "", message: "" });
  const [errs, setErrs] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const e = {};
    if (!f.firstName.trim()) e.firstName = "Required";
    if (!f.lastName.trim()) e.lastName = "Required";
    if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Valid email required";
    if (!f.phone.trim()) e.phone = "Required";
    return e;
  };

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
          phone: `${f.countryCode}${f.phone}`,
          business: f.message,
          source: "website_demo_form",
        }),
      });
      if (!res.ok) throw new Error("API error");
      setDone(true);
    } catch {
      alert("Something went wrong. Please email info@mybizpal.ai");
    } finally { setLoading(false); }
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
        <div className="phone-wrap">
          <CountrySelect value={f.countryCode} onChange={v => ch("countryCode", v)} />
          <input className={"form-input" + (errs.phone ? " err" : "")} placeholder="7700 000000" value={f.phone} onChange={e => ch("phone", e.target.value)} style={{ flex: 1 }} />
        </div>
        {errs.phone && <div className="field-err">{errs.phone}</div>}
      </div>
      <div className="form-group">
        <label className="form-label">About your business <span style={{ color: "#6E6E73", fontWeight: 400 }}>(optional)</span></label>
        <input className="form-input" placeholder="e.g. Dental clinic, 4 staff, 50 calls/week" value={f.message} onChange={e => ch("message", e.target.value)} />
      </div>
      <button className="form-submit" onClick={submit} disabled={loading}>
        {loading ? "Connecting..." : "Get a Live Demo Call →"}
      </button>
      <p className="form-note">🔒 No spam. No credit card. Demo call arrives within 30 seconds.</p>
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
  const roi = recovered > 0 ? Math.round(recovered / 149) : 0;
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
              <div className="calc-row"><span className="calc-row-label">ROI at Starter plan (£149/mo)</span><span className="calc-row-val green">{roi}×</span></div>
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
function SofiWidget() {
  const [open, setOpen] = useState(false);
  const [showLabel, setShowLabel] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showHandoff, setShowHandoff] = useState(false);
  const [waUrl, setWaUrl] = useState(`https://wa.me/${WA_NUMBER}`);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [context, setContext] = useState({});

  // Drag state
  const [pos, setPos] = useState({ bottom: 100, right: 28 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, bottom: 0, right: 0 });
  const didDrag = useRef(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setShowLabel(false), 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // ── Drag handlers ──────────────────────────────────────────────────────
  const onPointerDown = (e) => {
    // Only drag on the button itself, not inner elements
    if (e.target.tagName === "BUTTON" || e.currentTarget === e.target) {
      dragging.current = true;
      didDrag.current = false;
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        bottom: pos.bottom,
        right: pos.right,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
      e.preventDefault();
    }
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag.current = true;
    const newRight = Math.max(8, Math.min(window.innerWidth - 66, dragStart.current.right - dx));
    const newBottom = Math.max(8, Math.min(window.innerHeight - 66, dragStart.current.bottom - dy));
    setPos({ right: newRight, bottom: newBottom });
    setShowLabel(false);
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  const buildWaUrl = (ctx) => {
    const industry = ctx.industry || "business";
    const msg = encodeURIComponent(`Hi Sofi! I was just chatting on the MyBizPal website. I run a ${industry} and I'm interested in learning more.`);
    return `https://wa.me/${WA_NUMBER}?text=${msg}`;
  };

  const sofiReply = (userMsg, count, ctx) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      let reply = "";
      let newCtx = { ...ctx };
      let triggerHandoff = false;

      if (count === 1) {
        newCtx.industry = userMsg;
        reply = `${userMsg} — great, we work really well with that! 🙌\n\nWhat's the biggest headache right now?\n\n1️⃣ Missing calls after hours\n2️⃣ WhatsApp not replied fast enough\n3️⃣ Booking is too manual\n4️⃣ All of the above 😅`;
      } else if (count === 2) {
        newCtx.pain = userMsg;
        reply = `Exactly what MyBizPal fixes — usually within the first week.\n\nLast question: roughly how many people in your team?`;
      } else if (count >= 3) {
        newCtx.teamSize = userMsg;
        reply = `Perfect — I have everything I need! 👌\n\nLet's move this to WhatsApp so I can walk you through exactly what this looks like for your business and sort next steps.`;
        triggerHandoff = true;
      }

      setContext(newCtx);
      setMessages(prev => [...prev, { from: "sofi", text: reply }]);

      if (triggerHandoff) {
        const url = buildWaUrl(newCtx);
        setWaUrl(url);
        setTimeout(() => setShowHandoff(true), 400);
      }
    }, 800 + Math.random() * 500);
  };

  const sendMessage = () => {
    const txt = input.trim();
    if (!txt || typing) return;
    const newCount = exchangeCount + 1;
    setMessages(prev => [...prev, { from: "user", text: txt }]);
    setInput("");
    setExchangeCount(newCount);
    sofiReply(txt, newCount, context);
  };

  const toggleOpen = () => {
    // Don't toggle if user just dragged
    if (didDrag.current) { didDrag.current = false; return; }
    const next = !open;
    setOpen(next);
    setShowLabel(false);
    if (next && messages.length === 0) {
      setTimeout(() => {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setMessages([{ from: "sofi", text: "Hi! 👋 I'm Sofi from MyBizPal.\n\nI help UK businesses answer every call, reply on WhatsApp, and book appointments — 24/7.\n\nWhat kind of business do you run?" }]);
        }, 900);
      }, 300);
    }
  };

  const waIconSvg = (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="#ffffff">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );

  // Panel position — opens above and to the left of the button
  const panelStyle = {
    position: "fixed",
    bottom: pos.bottom + 68,
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
        style={{ bottom: pos.bottom, right: pos.right }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {showLabel && !open && <div className="sofi-fab-label">Chat with Sofi 👋</div>}
        <button
          className="sofi-fab-btn"
          onClick={toggleOpen}
          aria-label="Chat with Sofi"
        >
          {open ? <span style={{ fontSize: 20, color: "#fff", fontFamily: "Manrope,sans-serif" }}>✕</span> : waIconSvg}
          {!open && <span className="sofi-dot" />}
        </button>
        {!open && <div className="sofi-drag-hint">drag to move</div>}
      </div>

      {open && (
        <div style={panelStyle}>
          <div className="sofi-panel-header">
            <div className="sofi-avatar" style={{ color: "#fff" }}>{waIconSvg}</div>
            <div className="sofi-header-text">
              <h4>Sofi — MyBizPal AI</h4>
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
              <p>Let's continue on WhatsApp — I'll be right there 💬</p>
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
function VideoBox({ label, title, subtitle, duration, accentColor = "#00D4FF" }) {
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
      <div className="video-box" onClick={() => setPlaying(true)}>
        <div className="video-grid" />
        <div className="video-glow" style={{ background: `radial-gradient(ellipse,${accentColor}20 0%,rgba(123,47,255,0.08) 40%,transparent 70%)` }} />
        {!playing ? (
          <div className="video-play-wrap">
            <button className="play-btn" style={{ background: `linear-gradient(135deg,${accentColor},#7B2FFF)` }}><div className="play-tri" /></button>
            <div style={{ fontSize: 15, color: "#A1A1A6", fontWeight: 300 }}>MyBizPal — {label} · {duration}</div>
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 18, color: "#A1A1A6" }}>🎬 Video Coming Soon</div>
            <div style={{ fontSize: 14, color: "#6E6E73" }}>Replace with your Vimeo or YouTube embed</div>
          </div>
        )}
        <div style={cornerStyle(true, undefined, undefined, true)} />
        <div style={cornerStyle(true, true, undefined, undefined)} />
        <div style={cornerStyle(undefined, undefined, true, true)} />
        <div style={cornerStyle(undefined, true, true, undefined)} />
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [billing, setBilling] = useState("monthly");
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => { setModalOpen(true); document.body.style.overflow = "hidden"; };
  const closeModal = () => { setModalOpen(false); document.body.style.overflow = ""; };

  const handleCheckout = async (planKey, billingCycle) => {
    setCheckoutLoading(planKey); setCheckoutError(null);
    try {
      const priceId = PRICES[planKey][billingCycle === "yearly" ? "annual" : "monthly"];
      const setupPriceId = PRICES[planKey].setup;
      const res = await fetch(`${API_URL}/api/create-checkout-session`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, billingCycle, priceId, setupPriceId }),
      });
      if (!res.ok) throw new Error("Failed");
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setCheckoutError("Something went wrong. Please try again or email info@mybizpal.ai");
      setCheckoutLoading(null);
    }
  };

  const monthlySavings = Object.fromEntries(
    PLANS.map(p => {
      const num = s => Number(String(s).replace(/,/g, ""));
      return [p.key, (num(p.monthly) - num(p.yearly)) * 12];
    })
  );

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Close modal on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <>
      <style>{CSS}</style>

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

      {/* TICKER */}
      <div className="ticker-strip">
        <div className="ticker-track">{TICKER.map((t, i) => <div className="ticker-item" key={i}><span className="ticker-sep" />{t}</div>)}</div>
      </div>

      {/* VIDEO 1 — AI Agent Demo */}
      <div id="video">
        <VideoBox label="Product Demo" title={<>See MyBizPal <span className="grad-text">in action</span></>}
          subtitle="Watch a real AI agent handle an inbound call, qualify a lead, and book an appointment."
          duration="1:58" accentColor="#00D4FF" />
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
        duration="3:45" accentColor="#7B2FFF" />

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
                  <th className="col-new">✦ MyBizPal</th>
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
          <p className="section-sub" style={{ margin: "0 auto 32px", textAlign: "center" }}>No hidden fees. Cancel any time. Pays for itself in one booking.</p>
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
            <div className={"p-card" + (p.featured ? " featured" : "")} key={p.tier}>
              {p.featured && <div className="p-badge">Most Popular</div>}
              <div className="p-tier">{p.tier}</div>
              <div className="p-price"><sup>£</sup>{billing === "yearly" ? p.yearly : p.monthly}</div>
              <div className="p-period">{billing === "yearly" ? "/ mo, billed annually" : "/ month"}</div>
              <div className="p-savings">
                {billing === "yearly" ? `💚 Save £${monthlySavings[p.key]}/yr vs monthly` : ""}
              </div>
              <div className="p-roi">💰 {p.roi}</div>
              <div className="setup-fee">+ £{p.setup} one-time setup</div>
              <div className="p-divider" />
              <ul className="p-feats">{p.features.map(f => <li key={f}><span className="p-check">✓</span>{f}</li>)}</ul>
              <button
                className={p.featured ? "p-btn-grad" : "p-btn-outline"}
                onClick={() => handleCheckout(p.key, billing)}
                disabled={checkoutLoading === p.key}
                style={{ cursor: checkoutLoading === p.key ? "wait" : "pointer" }}
              >
                {checkoutLoading === p.key ? "Loading…" : p.cta}
              </button>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#6E6E73" }}>Prices in GBP. Annual plans billed as a single payment.</p>
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

      {checkoutError && (
        <div className="checkout-toast" onClick={() => setCheckoutError(null)}>⚠ {checkoutError}</div>
      )}

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

      {/* SOFI WIDGET */}
      <SofiWidget />

      {/* COOKIE CONSENT */}
      <CookieBanner />
    </>
  );
}
