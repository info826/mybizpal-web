import { useState, useEffect, useRef } from "react";

const LOGO_FULL = "/logo-full.png";
const LOGO_ICON = "/logo-icon.png";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const B = {
  bg:"#000000",bgAlt:"#080810",surface:"#0a0a14",card:"#0d0d1a",cardHov:"#111126",
  border:"rgba(255,255,255,0.08)",borderMd:"rgba(255,255,255,0.13)",borderHi:"rgba(255,255,255,0.22)",
  c1:"#00D4FF",c2:"#7B2FFF",c3:"#4060FF",
  grad:"linear-gradient(135deg, #00D4FF 0%, #7B2FFF 60%, #4060FF 100%)",
  gradText:"linear-gradient(135deg, #00D4FF 0%, #9B5FFF 100%)",
  tp:"#F5F5F7",ts:"#A1A1A6",tm:"#6E6E73",
};

const COUNTRIES=[
  {code:"+44",name:"🇬🇧 UK"},{code:"+1",name:"🇺🇸 US"},{code:"+34",name:"🇪🇸 ES"},
  {code:"+351",name:"🇵🇹 PT"},{code:"+49",name:"🇩🇪 DE"},{code:"+33",name:"🇫🇷 FR"},
  {code:"+39",name:"🇮🇹 IT"},{code:"+31",name:"🇳🇱 NL"},{code:"+353",name:"🇮🇪 IE"},
  {code:"+61",name:"🇦🇺 AU"},{code:"+1",name:"🇨🇦 CA"},{code:"+971",name:"🇦🇪 UAE"},
  {code:"+91",name:"🇮🇳 IN"},{code:"+55",name:"🇧🇷 BR"},{code:"+27",name:"🇿🇦 ZA"},
];

const FAQS=[
  {q:"Does MyBizPal sound like a real human?",a:"Yes. We use ElevenLabs and advanced conversational AI to deliver natural, human-quality voices. The vast majority of callers cannot tell the difference."},
  {q:"How quickly can I go live?",a:"Most businesses are fully live within 24 hours. We handle onboarding, voice training, and integrations — no technical knowledge needed."},
  {q:"Can it book directly into my calendar?",a:"Absolutely. MyBizPal integrates with Google Calendar, checking real-time availability and confirming bookings with clients instantly."},
  {q:"What happens if the AI cannot handle something?",a:"The AI escalates gracefully — transferring to a human, taking a detailed message, or scheduling a callback. Nothing falls through the cracks."},
  {q:"Is my data GDPR compliant?",a:"All data is encrypted in transit and at rest. We are ICO registered and fully GDPR compliant. Your data is never used to train AI models."},
  {q:"Do I need a developer to set this up?",a:"Not at all. Our step-by-step wizard connects your calendar, phone number, and existing tools in minutes."},
];

const TESTIMONIALS=[
  {text:"MyBizPal instantly started booking leads after hours. We doubled appointments in the first month without hiring anyone.",name:"D. Soden",role:"Clinic Owner, London",photo:"/D.Soden.png"},
  {text:"The AI sounds completely natural. Our team can now focus on in-person clients instead of answering the same questions by phone.",name:"A. Patel",role:"Home Services, Birmingham",photo:"/A.Patel.png"},
  {text:"Easiest setup I have done. Paid for itself within the first week. If you run an SME and miss calls, you need this now.",name:"Chris D.",role:"Agency Owner, Manchester",photo:"/Chris.D.png"},
];

const PLANS=[
  {tier:"Starter",monthly:"149",yearly:"119",featured:false,cta:"Get Started",features:["1 local UK number","1,000 call minutes/mo","1 calendar integration","FAQ handling & booking","Email support"]},
  {tier:"Pro",monthly:"349",yearly:"279",featured:true,cta:"Get Started",features:["Everything in Starter","3,000 call minutes/mo","Multi-calendar support","CRM & webhook integrations","WhatsApp automation","Priority support"]},
  {tier:"Elite",monthly:"799",yearly:"639",featured:false,cta:"Contact Sales",features:["Everything in Pro","10,000 call minutes/mo","White-label option","Dedicated onboarding","Custom AI persona","SLA guarantee"]},
];

const TICKER=["AI Voice Agent","24/7 Availability","Calendar Booking","Instant Response","WhatsApp Automation","Lead Capture","CRM Integration","Human Handoff","Zero Missed Calls","No Code Setup","Real Time AI","UK Based","AI Voice Agent","24/7 Availability","Calendar Booking","Instant Response","WhatsApp Automation","Lead Capture","CRM Integration","Human Handoff","Zero Missed Calls","No Code Setup","Real Time AI","UK Based"];

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#000;color:#F5F5F7;font-family:'Manrope',sans-serif;font-size:17px;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
h1,h2,h3{font-family:'Manrope',sans-serif;line-height:1.1;letter-spacing:-0.03em;font-weight:700}
::selection{background:#00D4FF;color:#000}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#000}::-webkit-scrollbar-thumb{background:#333;border-radius:2px}
.grad-text{background:linear-gradient(135deg,#00D4FF,#9B5FFF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.nav{position:fixed;top:0;left:0;right:0;z-index:200;height:120px;padding:0 48px;display:flex;align-items:center;justify-content:space-between;transition:all .4s}
.nav.scrolled{background:rgba(0,0,0,0.75);backdrop-filter:blur(24px);border-bottom:1px solid rgba(255,255,255,0.08)}
.nav-logo{display:flex;align-items:center;text-decoration:none}
.nav-logo img{height:200px;width:auto}
.nav-links{display:flex;align-items:center;gap:28px;list-style:none}
.nav-links a{color:#A1A1A6;text-decoration:none;font-size:14px;font-weight:500;transition:color .2s}
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
.hero{min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:100px 24px 80px;position:relative;overflow:hidden}
.hero-glow{position:absolute;top:-10%;left:50%;transform:translateX(-50%);width:900px;height:700px;pointer-events:none;background:radial-gradient(ellipse at 50% 0%,rgba(0,212,255,0.18) 0%,rgba(123,47,255,0.10) 40%,transparent 70%)}
.hero-grid{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px);background-size:80px 80px;mask-image:radial-gradient(ellipse 70% 60% at 50% 40%,black 0%,transparent 100%)}
.hero-ring{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:700px;height:700px;border-radius:50%;border:1px solid rgba(0,212,255,0.06);pointer-events:none;animation:ringPulse 8s ease-in-out infinite}
.hero-ring2{width:1000px;height:1000px;border:1px solid rgba(123,47,255,0.04);animation:ringPulse 10s ease-in-out infinite reverse}
@keyframes ringPulse{0%,100%{opacity:.6;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.02)}}
.hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px 6px 8px;border-radius:100px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.13);font-size:13px;color:#A1A1A6;margin-bottom:28px;position:relative;z-index:1;backdrop-filter:blur(8px)}
.hero-badge-pill{background:linear-gradient(135deg,#00D4FF,#7B2FFF,#4060FF);color:#000;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase}
.hero-title{font-size:clamp(52px,8.5vw,92px);font-weight:800;letter-spacing:-0.05em;line-height:1.0;margin-bottom:28px;position:relative;z-index:1;max-width:1000px}
.hero-sub{font-size:clamp(17px,2.2vw,21px);color:#A1A1A6;max-width:580px;margin:0 auto 40px;font-weight:300;line-height:1.65;position:relative;z-index:1}
.hero-ctas{display:flex;align-items:center;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:72px;position:relative;z-index:1}
.stats-bar{display:flex;align-items:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;position:relative;z-index:1;backdrop-filter:blur(12px)}
.stat-item{padding:20px 44px;text-align:center;border-right:1px solid rgba(255,255,255,0.08)}
.stat-item:last-child{border-right:none}
.stat-val{font-family:'Manrope',sans-serif;font-size:30px;font-weight:800;letter-spacing:-0.04em;margin-bottom:2px}
.stat-label{font-size:11px;color:#6E6E73;text-transform:uppercase;letter-spacing:0.1em}
.ticker-strip{border-top:1px solid rgba(255,255,255,0.08);border-bottom:1px solid rgba(255,255,255,0.08);overflow:hidden;padding:13px 0;background:rgba(255,255,255,0.02)}
.ticker-track{display:flex;gap:0;animation:tick 28s linear infinite;width:max-content}
.ticker-track:hover{animation-play-state:paused}
@keyframes tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.ticker-item{display:flex;align-items:center;gap:10px;padding:0 28px;font-size:12px;font-weight:600;color:#6E6E73;white-space:nowrap;text-transform:uppercase;letter-spacing:0.09em}
.ticker-sep{width:4px;height:4px;border-radius:50%;background:#00D4FF;flex-shrink:0;opacity:.5}
.section{padding:100px 24px;max-width:1200px;margin:0 auto;position:relative;z-index:1}
.eyebrow{font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:16px;background:linear-gradient(135deg,#00D4FF,#9B5FFF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.section-h{font-size:clamp(36px,5vw,56px);font-weight:800;margin-bottom:18px;letter-spacing:-0.04em}
.section-sub{font-size:18px;color:#A1A1A6;font-weight:300;line-height:1.7;max-width:520px}
.mb64{margin-bottom:64px}
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
.steps-wrap{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.08);border-radius:24px;overflow:hidden}
.step{background:#0d0d1a;padding:52px 40px;transition:background .3s;position:relative;overflow:hidden}
.step:hover{background:#111126}
.step-num{font-size:80px;font-weight:800;color:rgba(255,255,255,0.04);line-height:1;margin-bottom:28px;letter-spacing:-0.06em}
.step-icon{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,rgba(0,212,255,0.12),rgba(123,47,255,0.12));border:1px solid rgba(0,212,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:22px}
.step-title{font-size:21px;font-weight:700;margin-bottom:12px;letter-spacing:-0.02em}
.step-desc{font-size:15px;color:#A1A1A6;line-height:1.7;font-weight:300}
.step-line{position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(135deg,#00D4FF,#7B2FFF);opacity:0;transition:opacity .3s}
.step:hover .step-line{opacity:1}
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.feat-card{background:#0d0d1a;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:36px;transition:border-color .3s,transform .3s;position:relative;overflow:hidden}
.feat-card:hover{border-color:rgba(0,212,255,0.25);transform:translateY(-3px)}
.feat-icon{font-size:30px;margin-bottom:18px;display:block}
.feat-tag{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:100px;background:rgba(0,255,148,0.08);border:1px solid rgba(0,255,148,0.2);font-size:11px;font-weight:700;color:#00FF94;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px}
.feat-title{font-size:20px;font-weight:700;margin-bottom:10px;letter-spacing:-0.02em}
.feat-desc{font-size:14px;color:#A1A1A6;line-height:1.7;font-weight:300}
.demo-wrap{padding:0 24px 100px;position:relative;z-index:1}
.demo-inner{max-width:1200px;margin:0 auto;background:#0d0d1a;border:1px solid rgba(255,255,255,0.08);border-radius:28px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr;position:relative}
.demo-left{padding:64px 52px;border-right:1px solid rgba(255,255,255,0.08);position:relative;z-index:1}
.demo-right{padding:64px 52px;position:relative;z-index:1}
.demo-title{font-size:clamp(28px,3.5vw,40px);font-weight:800;letter-spacing:-0.04em;margin-bottom:16px}
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
.testi-name{font-size:14px;font-weight:600}
.testi-role{font-size:12px;color:#6E6E73}
.tp-strip{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:48px;padding:20px 32px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;flex-wrap:wrap}
.tp-logo{display:flex;align-items:center;gap:8px;text-decoration:none;font-size:16px;font-weight:700;color:#F5F5F7;transition:opacity .2s}
.tp-logo:hover{opacity:.8}
.tp-divider{width:1px;height:28px;background:rgba(255,255,255,0.08)}
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
.p-price{font-family:'Manrope',sans-serif;font-size:52px;font-weight:800;letter-spacing:-0.05em;line-height:1;margin-bottom:4px}
.p-price sup{font-size:22px;vertical-align:super}
.p-period{font-size:13px;color:#6E6E73;margin-bottom:28px}
.p-divider{height:1px;background:rgba(255,255,255,0.08);margin-bottom:28px}
.p-feats{list-style:none;display:flex;flex-direction:column;gap:11px;margin-bottom:32px;flex:1}
.p-feats li{display:flex;align-items:flex-start;gap:10px;font-size:14px;color:#A1A1A6;line-height:1.5}
.p-check{color:#00FF94;flex-shrink:0}
.p-btn-outline{width:100%;padding:13px;border-radius:100px;background:transparent;color:#F5F5F7;border:1px solid rgba(255,255,255,0.13);font-family:'Manrope',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;display:block;text-decoration:none;text-align:center}
.p-btn-outline:hover{border-color:rgba(0,212,255,0.4);color:#00D4FF}
.p-btn-grad{width:100%;padding:13px;border-radius:100px;background:linear-gradient(135deg,#00D4FF,#7B2FFF,#4060FF);color:#000;border:none;font-family:'Manrope',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;display:block;text-decoration:none;text-align:center}
.p-btn-grad:hover{opacity:.86;box-shadow:0 6px 24px rgba(0,212,255,0.28)}
.faq-stack{display:flex;flex-direction:column;gap:2px;background:rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);max-width:760px;margin:0 auto}
.faq-item{background:#0d0d1a;transition:background .2s}
.faq-item.open{background:#111126}
.faq-q{padding:22px 28px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;font-size:16px;font-weight:500;color:#F5F5F7;gap:16px;transition:color .2s}
.faq-q:hover{color:#00D4FF}
.faq-chevron{flex-shrink:0;width:26px;height:26px;border-radius:50%;border:1px solid rgba(255,255,255,0.13);display:flex;align-items:center;justify-content:center;color:#6E6E73;font-size:18px;transition:all .25s}
.faq-item.open .faq-chevron{border-color:#00D4FF;color:#00D4FF;transform:rotate(45deg)}
.faq-a{padding:0 28px;font-size:15px;color:#A1A1A6;line-height:1.75;font-weight:300;max-height:0;overflow:hidden;transition:max-height .32s ease,padding .32s}
.faq-item.open .faq-a{max-height:220px;padding-bottom:24px}
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
.hamburger{display:none;background:none;border:none;color:#F5F5F7;font-size:26px;cursor:pointer;padding:8px;line-height:1;flex-shrink:0;align-items:center;justify-content:center}
.mobile-menu{position:fixed;top:80px;left:0;right:0;z-index:190;background:rgba(5,5,15,0.97);backdrop-filter:blur(24px);border-bottom:1px solid rgba(255,255,255,0.08);padding:16px 20px 24px;display:flex;flex-direction:column;gap:2px;animation:menuSlide .2s ease}
@keyframes menuSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.mobile-menu a{color:#A1A1A6;text-decoration:none;font-size:16px;font-weight:500;padding:13px 16px;border-radius:12px;display:block;transition:all .2s}
.mobile-menu a:hover{color:#F5F5F7;background:rgba(255,255,255,0.05)}
.mobile-menu-divider{height:1px;background:rgba(255,255,255,0.08);margin:8px 0}
.mobile-menu-cta{background:linear-gradient(135deg,#00D4FF,#7B2FFF,#4060FF);color:#000!important;font-weight:700!important;text-align:center;border-radius:100px!important}
@media(max-width:960px){
  .nav{padding:0 20px 0 8px;height:140px}.nav-links{display:none}.nav-right{display:none}.hamburger{display:flex}
  .nav-logo img{height:168px}
  .mobile-menu{top:140px}
  .hero-ctas{flex-direction:column;align-items:stretch}.hero-ctas .btn-primary,.hero-ctas .btn-outline{width:100%;justify-content:center}
  .stats-bar{display:grid;grid-template-columns:1fr 1fr}.stat-item{flex:none;border-right:none;border-bottom:1px solid rgba(255,255,255,0.08)}.stat-item:nth-child(odd){border-right:1px solid rgba(255,255,255,0.08)}.stat-item:nth-last-child(-n+2){border-bottom:none}
  .steps-wrap,.feat-grid,.testi-grid,.pricing-grid{grid-template-columns:1fr}
  .demo-inner{grid-template-columns:1fr}.demo-left{border-right:none;border-bottom:1px solid rgba(255,255,255,0.08);padding:40px 28px}.demo-right{padding:40px 28px}
  .form-row{grid-template-columns:1fr}.footer-grid{grid-template-columns:1fr 1fr}
  .footer-bottom{flex-direction:column;text-align:center}
}
`;

function FAQ({q,a}){
  const [open,setOpen]=useState(false);
  return(
    <div className={"faq-item"+(open?" open":"")}>
      <div className="faq-q" onClick={()=>setOpen(!open)}>{q}<span className="faq-chevron">+</span></div>
      <div className="faq-a">{a}</div>
    </div>
  );
}

function CountrySelect({value, onChange}){
  const [open,setOpen]=useState(false);
  const ref=useRef(null);
  const selected=COUNTRIES.find(c=>c.code===value)||COUNTRIES[0];
  const flag=selected.name.split(" ")[0];
  useEffect(()=>{
    const h=(e)=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[]);
  return(
    <div className="country-select" ref={ref}>
      <div className={"country-trigger"+(open?" open":"")} onClick={()=>setOpen(!open)}>
        <span>{flag} {value}</span>
        <span style={{fontSize:9,color:"#6E6E73"}}>▼</span>
      </div>
      {open&&(
        <div className="country-dropdown">
          {COUNTRIES.map((c,i)=>(
            <div key={i} className={"country-option"+(c.code===value&&c.name===selected.name?" active":"")}
              onClick={()=>{onChange(c.code);setOpen(false);}}>
              {c.name} {c.code}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DemoForm(){
  const [f,setF]=useState({firstName:"",lastName:"",email:"",countryCode:"+44",phone:"",message:""});
  const [errs,setErrs]=useState({});
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);

  const validate=()=>{
    const e={};
    if(!f.firstName.trim())e.firstName="Required";
    if(!f.lastName.trim())e.lastName="Required";
    if(!f.email.trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))e.email="Valid email required";
    if(!f.phone.trim())e.phone="Required";
    return e;
  };

  const submit=async()=>{
    const e=validate();
    if(Object.keys(e).length){setErrs(e);return;}
    setErrs({});setLoading(true);
    try{
      const res=await fetch(`${API_URL}/api/demo-request`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({firstName:f.firstName,lastName:f.lastName,email:f.email,phone:`${f.countryCode}${f.phone}`,message:f.message}),
      });
      if(!res.ok)throw new Error("API error");
      setDone(true);
    }catch(err){
      alert("Something went wrong. Please email info@mybizpal.ai");
    }finally{setLoading(false);}
  };

  const ch=(k,v)=>{setF({...f,[k]:v});if(errs[k])setErrs({...errs,[k]:undefined})};

  if(done)return(
    <div className="success-state">
      <div style={{fontSize:52,marginBottom:16}}>✅</div>
      <div style={{fontFamily:"Manrope,sans-serif",fontSize:24,fontWeight:700,marginBottom:8}}>You are all set, {f.firstName}!</div>
      <p style={{fontSize:15,color:"#A1A1A6"}}>Expect a call from our AI within 30 seconds.</p>
    </div>
  );

  return(
    <div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">First Name <span>*</span></label>
          <input className={"form-input"+(errs.firstName?" err":"")} placeholder="Jane" value={f.firstName} onChange={e=>ch("firstName",e.target.value)}/>
          {errs.firstName&&<div className="field-err">{errs.firstName}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Last Name <span>*</span></label>
          <input className={"form-input"+(errs.lastName?" err":"")} placeholder="Smith" value={f.lastName} onChange={e=>ch("lastName",e.target.value)}/>
          {errs.lastName&&<div className="field-err">{errs.lastName}</div>}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Work Email <span>*</span></label>
        <input className={"form-input"+(errs.email?" err":"")} type="email" placeholder="jane@yourbusiness.com" value={f.email} onChange={e=>ch("email",e.target.value)}/>
        {errs.email&&<div className="field-err">{errs.email}</div>}
      </div>
      <div className="form-group">
        <label className="form-label">Phone Number <span>*</span></label>
        <div className="phone-wrap">
          <CountrySelect value={f.countryCode} onChange={v=>ch("countryCode",v)}/>
          <input className={"form-input"+(errs.phone?" err":"")} placeholder="7700 000000" value={f.phone} onChange={e=>ch("phone",e.target.value)} style={{flex:1}}/>
        </div>
        {errs.phone&&<div className="field-err">{errs.phone}</div>}
      </div>
      <div className="form-group">
        <label className="form-label">About your business <span style={{color:"#6E6E73",fontWeight:400}}>(optional)</span></label>
        <input className="form-input" placeholder="e.g. Dental clinic, 4 staff, 50 calls/week" value={f.message} onChange={e=>ch("message",e.target.value)}/>
      </div>
      <button className="form-submit" onClick={submit} disabled={loading}>
        {loading?"Connecting...":"Get a Live Demo Call →"}
      </button>
      <p className="form-note">🔒 No spam. No credit card. Demo call arrives within 30 seconds.</p>
    </div>
  );
}

export default function App(){
  const [scrolled,setScrolled]=useState(false);
  const [videoPlaying,setVideoPlaying]=useState(false);
  const [menuOpen,setMenuOpen]=useState(false);
  const [billing,setBilling]=useState("monthly");
  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>20);
    window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h);
  },[]);

  return(
    <>
      <style>{CSS}</style>
      <nav className={"nav"+(scrolled?" scrolled":"")}>
        <a className="nav-logo" href="#"><img src={LOGO_FULL} alt="MyBizPal"/></a>
        <ul className="nav-links">
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#demo">Demo</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <div className="nav-right">
          <a className="btn-ghost" href="#demo">Sign in</a>
          <a className="btn-pill" href="#demo">Book a Demo →</a>
        </div>
        <button className="hamburger" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Menu">
          {menuOpen?"✕":"☰"}
        </button>
      </nav>
      {menuOpen&&(
        <div className="mobile-menu">
          <a href="#how-it-works" onClick={()=>setMenuOpen(false)}>How It Works</a>
          <a href="#features" onClick={()=>setMenuOpen(false)}>Features</a>
          <a href="#demo" onClick={()=>setMenuOpen(false)}>Demo</a>
          <a href="#pricing" onClick={()=>setMenuOpen(false)}>Pricing</a>
          <a href="#faq" onClick={()=>setMenuOpen(false)}>FAQ</a>
          <div className="mobile-menu-divider"/>
          <a href="#demo" className="mobile-menu-cta" onClick={()=>setMenuOpen(false)}>Book a Demo →</a>
        </div>
      )}

      <section className="hero">
        <div className="hero-glow"/><div className="hero-grid"/>
        <div className="hero-ring"/><div className="hero-ring hero-ring2"/>
        <div className="hero-badge"><span className="hero-badge-pill">NEW</span>AI voice agents — now live for UK businesses</div>
        <h1 className="hero-title">Your business,<br/><span className="grad-text">always answering.</span></h1>
        <p className="hero-sub">MyBizPal answers calls, books appointments, and handles client enquiries 24/7 — so you never miss a lead, no matter the hour.</p>
        <div className="hero-ctas">
          <a className="btn-primary" href="#demo">Book a Live Demo →</a>
          <a className="btn-outline" href="#video">▶ Watch How It Works</a>
        </div>
        <div className="stats-bar">
          {[["24/7","Always On"],["<1s","Response Time"],["3×","More Bookings"],["£0","Missed Leads"]].map(([v,l])=>(
            <div className="stat-item" key={l}><div className="stat-val"><span className="grad-text">{v}</span></div><div className="stat-label">{l}</div></div>
          ))}
        </div>
      </section>

      <div className="ticker-strip"><div className="ticker-track">{TICKER.map((t,i)=><div className="ticker-item" key={i}><span className="ticker-sep"/>{t}</div>)}</div></div>

      <div className="video-section" id="video">
        <span className="video-label">Product Demo</span>
        <h2 style={{fontFamily:"Manrope,sans-serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:800,letterSpacing:"-0.04em",marginBottom:12}}>See MyBizPal <span className="grad-text">in action</span></h2>
        <p style={{fontSize:17,color:"#A1A1A6",fontWeight:300,maxWidth:480,margin:"0 auto 32px"}}>Watch a real AI agent handle an inbound call, qualify a lead, and book an appointment.</p>
        <div className="video-box" onClick={()=>setVideoPlaying(true)}>
          <div className="video-grid"/><div className="video-glow"/>
          {!videoPlaying?(
            <div className="video-play-wrap">
              <button className="play-btn"><div className="play-tri"/></button>
              <div style={{fontSize:15,color:"#A1A1A6",fontWeight:300}}>MyBizPal — AI Agent Demo · 1:58</div>
            </div>
          ):(
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
              <div style={{fontSize:18,color:"#A1A1A6"}}>🎬 Video Coming Soon</div>
              <div style={{fontSize:14,color:"#6E6E73"}}>Replace with your Vimeo or YouTube embed</div>
            </div>
          )}
          {[["top","left","borderTop","borderLeft","4px 0 0 0"],["top","right","borderTop","borderRight","0 4px 0 0"],["bottom","left","borderBottom","borderLeft","0 0 0 4px"],["bottom","right","borderBottom","borderRight","0 0 4px 0"]].map(([v,h,b1,b2,r],i)=>(
            <div key={i} style={{position:"absolute",[v]:16,[h]:16,width:20,height:20,[b1]:"2px solid rgba(0,212,255,0.4)",[b2]:"2px solid rgba(0,212,255,0.4)",borderRadius:r}}/>
          ))}
        </div>
      </div>

      <section className="section" id="how-it-works">
        <div className="mb64"><div className="eyebrow">How It Works</div><h2 className="section-h">Three steps to<br/>never miss a call.</h2><p className="section-sub">No technical knowledge needed. We handle everything.</p></div>
        <div className="steps-wrap">
          {[{n:"01",icon:"🔗",t:"Connect your business",d:"Link your calendar, phone number, and existing tools in minutes using our step-by-step setup wizard."},{n:"02",icon:"🤖",t:"AI handles everything 24/7",d:"MyBizPal answers calls, responds to messages, qualifies leads, and books appointments — sounding completely natural."},{n:"03",icon:"📈",t:"Watch your business scale",d:"Your booking rate climbs while your team focuses on delivery instead of phones."}].map(s=>(
            <div className="step" key={s.n}><div className="step-line"/><div className="step-num">{s.n}</div><div className="step-icon">{s.icon}</div><div className="step-title">{s.t}</div><p className="step-desc">{s.d}</p></div>
          ))}
        </div>
      </section>

      <section className="section" id="features">
        <div className="mb64"><div className="eyebrow">Features</div><h2 className="section-h">Built for businesses<br/>that run on calls.</h2><p className="section-sub">Every feature purpose-built for real SMEs.</p></div>
        <div className="feat-grid">
          {[{icon:"📞",t:"AI Voice Agent",d:"Human-quality voice powered by ElevenLabs. Handles inbound calls, answers FAQs, qualifies leads, and books appointments in real time.",tag:"Core Feature"},{icon:"📅",t:"Smart Scheduling",d:"Checks live availability, books appointments, sends confirmations, and reduces no-shows with automatic reminders.",tag:null},{icon:<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30"><path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,t:"WhatsApp Automation",d:"Respond to enquiries, send booking confirmations, and follow up on leads — all via WhatsApp without lifting a finger.",tag:null},{icon:"🔀",t:"Seamless Human Handoff",d:"When a customer needs a real person, the AI transfers naturally without dropping context.",tag:null},{icon:"📊",t:"Lead Capture & CRM Sync",d:"Every call and conversation is logged, scored, and synced to your CRM. Never lose a lead again.",tag:null},{icon:"⚡",t:"Instant Setup, Zero Code",d:"Connect your calendar and phone number in under 10 minutes. No developers needed.",tag:"Popular"}].map(f=>(
            <div className="feat-card" key={f.t}>{f.tag&&<span className="feat-tag">✦ {f.tag}</span>}<span className="feat-icon">{f.icon}</span><div className="feat-title">{f.t}</div><p className="feat-desc">{f.d}</p></div>
          ))}
        </div>
      </section>

      <div className="demo-wrap" id="demo">
        <div className="demo-inner">
          <div className="demo-left">
            <div className="eyebrow">Live Demo</div>
            <h2 className="demo-title">Hear our AI<br/><span className="grad-text">answer your call.</span></h2>
            <p className="demo-desc">Enter your details and receive a real call from our AI agent within 30 seconds.</p>
            <ul className="demo-feats">
              {["Answers questions about your business naturally","Books a follow-up appointment in real time","Handles interruptions and complex requests","Works from any phone, anywhere"].map(li=>(
                <li key={li}><span className="df-check">✓</span>{li}</li>
              ))}
            </ul>
          </div>
          <div className="demo-right"><DemoForm/></div>
        </div>
      </div>

      <section className="section" id="testimonials">
        <div className="mb64" style={{textAlign:"center"}}><div className="eyebrow">Social Proof</div><h2 className="section-h">Businesses love MyBizPal.</h2></div>
        <div className="testi-grid">
          {TESTIMONIALS.map(t=>(
            <div className="testi-card" key={t.name}>
              <div className="stars">{[...Array(5)].map((_,i)=><span className="star" key={i}>★</span>)}</div>
              <div className="quote-mark">"</div>
              <p className="testi-text">{t.text}</p>
              <div className="testi-author"><div className="testi-avatar"><img src={t.photo} alt={t.name}/></div><div><div className="testi-name">{t.name}</div><div className="testi-role">{t.role}</div></div></div>
            </div>
          ))}
        </div>
        <div className="tp-strip">
          <a className="tp-logo" href="https://www.trustpilot.com/review/mybizpal.ai" target="_blank" rel="noreferrer">
            <span style={{color:"#00B67A",fontSize:20}}>★</span>
            <span style={{color:"#00B67A",fontWeight:800,fontSize:17}}>Trustpilot</span>
          </a>
          <div className="tp-divider"/>
          <div><div style={{fontSize:22,fontWeight:800}}>4.9 / 5</div><div style={{fontSize:14,color:"#A1A1A6"}}>Excellent rating</div></div>
          <div className="tp-divider"/>
          <div style={{fontSize:14,color:"#A1A1A6",maxWidth:220}}>Rated <strong>Excellent</strong> by our customers.<br/><a href="https://www.trustpilot.com/review/mybizpal.ai" target="_blank" rel="noreferrer" style={{color:"#00D4FF",textDecoration:"none",fontSize:13}}>Read our reviews →</a></div>
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="mb64" style={{textAlign:"center"}}>
          <div className="eyebrow">Pricing</div>
          <h2 className="section-h">Simple, transparent pricing.</h2>
          <p className="section-sub" style={{margin:"0 auto 32px"}}>No hidden fees. Cancel any time. Pays for itself in one booking.</p>
          <div className="billing-toggle">
            <span className={"billing-label"+(billing==="monthly"?" active":"")} onClick={()=>setBilling("monthly")}>Monthly</span>
            <div className={"toggle-track"+(billing==="yearly"?" on":"")} onClick={()=>setBilling(billing==="monthly"?"yearly":"monthly")}>
              <div className="toggle-thumb"/>
            </div>
            <span className={"billing-label"+(billing==="yearly"?" active":"")} onClick={()=>setBilling("yearly")}>
              Yearly<span className="save-badge">Save 20%</span>
            </span>
          </div>
        </div>
        <div className="pricing-grid">
          {PLANS.map(p=>(
            <div className={"p-card"+(p.featured?" featured":"")} key={p.tier}>
              {p.featured&&<div className="p-badge">Most Popular</div>}
              <div className="p-tier">{p.tier}</div>
              <div className="p-price"><sup>£</sup>{billing==="yearly"?p.yearly:p.monthly}</div>
              <div className="p-period">{billing==="yearly"?"/ mo, billed annually":"/ month"}</div>
              <div className="p-divider"/>
              <ul className="p-feats">{p.features.map(f=><li key={f}><span className="p-check">✓</span>{f}</li>)}</ul>
              <a href="#demo" className={p.featured?"p-btn-grad":"p-btn-outline"}>{p.cta}</a>
            </div>
          ))}
        </div>
        <p style={{textAlign:"center",marginTop:24,fontSize:13,color:"#6E6E73"}}>Prices in GBP. Annual plans billed as a single payment.</p>
      </section>

      <section className="section" id="faq">
        <div className="mb64" style={{textAlign:"center"}}><div className="eyebrow">FAQ</div><h2 className="section-h">Common questions.</h2></div>
        <div className="faq-stack">{FAQS.map(f=><FAQ key={f.q} q={f.q} a={f.a}/>)}</div>
      </section>

      <section style={{padding:"0 24px 100px",position:"relative",zIndex:1}}>
        <div style={{maxWidth:1200,margin:"0 auto",background:"linear-gradient(135deg,rgba(0,212,255,0.08),rgba(123,47,255,0.08))",border:"1px solid rgba(0,212,255,0.2)",borderRadius:28,padding:"72px 48px",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div className="eyebrow" style={{marginBottom:16}}>Get Started Today</div>
          <h2 style={{fontFamily:"Manrope,sans-serif",fontSize:"clamp(32px,5vw,52px)",fontWeight:800,letterSpacing:"-0.04em",marginBottom:18}}>Stop missing calls.<br/><span className="grad-text">Start booking more.</span></h2>
          <p style={{fontSize:18,color:"#A1A1A6",fontWeight:300,maxWidth:460,margin:"0 auto 40px",lineHeight:1.7}}>Join hundreds of UK businesses using MyBizPal to capture every lead, 24 hours a day.</p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <a className="btn-primary" href="#demo">Book a Free Demo →</a>
            <a className="btn-outline" href="https://www.trustpilot.com/review/mybizpal.ai" target="_blank" rel="noreferrer">★ Read Reviews</a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-grid">
          <div>
            <a className="nav-logo" href="#" style={{display:"inline-flex",marginBottom:12}}><img src={LOGO_ICON} alt="MyBizPal" style={{height:'100px',width:'auto'}}/></a>
            <p className="footer-brand-desc">24/7 AI voice agents and automation for growing SMEs. Never miss a call, booking, or lead again.</p>
          </div>
          <div><div className="footer-col-title">Product</div><ul className="footer-links"><li><a href="#how-it-works">How It Works</a></li><li><a href="#features">Features</a></li><li><a href="#pricing">Pricing</a></li><li><a href="#demo">Book a Demo</a></li></ul></div>
          <div><div className="footer-col-title">Company</div><ul className="footer-links"><li><a href="#">About</a></li><li><a href="#">Blog</a></li><li><a href="mailto:info@mybizpal.ai">Contact</a></li></ul></div>
          <div><div className="footer-col-title">Legal</div><ul className="footer-links"><li><a href="#">Privacy Policy</a></li><li><a href="#">Terms of Service</a></li><li><a href="#">GDPR</a></li></ul></div>
        </div>
        <div className="footer-bottom">
          <div className="footer-legal">© 2025 MyBizPal™. All rights reserved. MyBizPal™ is a trading name of De Ornelas Advisory Group Ltd.<br/>Company No: 16822556 · Registered in England &amp; Wales · ICO Reg: C1826607</div>
          <div className="footer-socials">
            <a className="social-icon" href="mailto:info@mybizpal.ai">✉</a>
            <a className="social-icon" href="https://www.trustpilot.com/review/mybizpal.ai" target="_blank" rel="noreferrer">★</a>
            <a className="social-icon" href="https://linkedin.com" target="_blank" rel="noreferrer">in</a>
          </div>
        </div>
      </footer>
    </>
  );
}
