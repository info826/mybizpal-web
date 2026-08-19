#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Calendly REAL-embed smoke check.
//
//   npm run check:calendly-live -- https://mybizpal.ai/
//
// The other success-step checks stub Calendly's CDN, which is what makes the
// blocked/stalled cases testable — and is exactly what let a broken embed ship:
// the stub iframe sized itself, the real one does not. The real widget renders
// height:100%, and against an auto-height parent that collapsed to ~150px, so
// the live calendar sat below the fold inside its own scrollbar.
//
// So this file stubs NOTHING except the lead POST (which must never write a real
// sales lead). Calendly is loaded for real, over the network, and the assertion
// is the crude physical one the stub could never make: after load, is the iframe
// actually TALL?
//
// It is a smoke check, not a gate: it depends on a third party being up, so a
// failure here means "go and look", not necessarily "the code is wrong".
// ─────────────────────────────────────────────────────────────────────────────
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const URL_UNDER_TEST = process.argv[2] || process.env.LAUNCHER_URL || 'https://mybizpal.ai/';
const MIN_IFRAME_HEIGHT = 500;

const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean).find(existsSync);
if (!CHROME) { console.error('No Chrome/Edge found. Set CHROME_PATH.'); process.exit(2); }

const M = '.modal-overlay.open .modal-box';
const results = [];
const rec = (n, p, d) => { results.push({ n, p }); console.log(`  ${p ? 'PASS' : 'FAIL'}  ${n}${d ? `  (${d})` : ''}`); };

const VIEWPORTS = [
  { label: 'desktop 1280x900', viewport: { width: 1280, height: 900 }, isMobile: false, hasTouch: false, min: MIN_IFRAME_HEIGHT },
  { label: 'mobile 390x844', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, min: MIN_IFRAME_HEIGHT },
];

const browser = await chromium.launch({ executablePath: CHROME, headless: true });

for (const vp of VIEWPORTS) {
  console.log(`\n=== ${vp.label} — REAL Calendly embed, nothing stubbed but the lead POST`);
  const ctx = await browser.newContext({ viewport: vp.viewport, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
  const page = await ctx.newPage();
  await page.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch {} }, ['mbp_cookie_consent', 'all']);
  // The ONLY interception: never create a real sales lead from a smoke check.
  await page.route('**/api/sales-lead', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }));

  await page.goto(URL_UNDER_TEST, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByRole('button', { name: /contact sales/i }).first().click();
  await page.waitForSelector('.modal-overlay.open', { timeout: 15000 });

  await page.locator(`${M} input[placeholder="you@company.com"]`).fill('smoke.check@example.com');
  await page.locator(M).getByRole('button', { name: /Next/i }).click();
  await page.locator(`${M} input[placeholder="Jane"]`).fill('Ada');
  await page.locator(`${M} input[placeholder="Smith"]`).fill('Lovelace');
  await page.locator(`${M} input[placeholder="Acme Ltd"]`).fill('Analytical Engines Ltd');
  const sel = page.locator(`${M} select`);
  await sel.nth(0).selectOption({ index: 1 });
  await sel.nth(1).selectOption({ index: 1 });
  const tel = page.locator(`${M} input[type="tel"]`);
  await tel.click();
  await page.keyboard.press('Control+A');
  await tel.pressSequentially('+447911123456', { delay: 20 });
  await page.locator(`${M} textarea`).first().fill('Calendly live smoke check.');
  const submit = page.locator(`${M} button.form-submit`);
  await submit.scrollIntoViewIfNeeded();
  await submit.click({ timeout: 15000 });

  await page.waitForSelector('.cs-success', { timeout: 20000 });

  const frame = page.locator('.cs-cal-embed iframe');
  const appeared = await frame.waitFor({ state: 'attached', timeout: 25000 }).then(() => true).catch(() => false);
  rec(`${vp.label}: real Calendly iframe present`, appeared);
  if (!appeared) { await ctx.close(); continue; }

  // POLL, do not sleep. Calendly posts junk interim heights (26px, then 2px)
  // before the real one, which landed ~6.8s in on desktop when measured. A
  // fixed 6s wait caught an interim value and passed only because the CSS
  // min-height floored it — a check that passes by luck is worse than none.
  const settleDeadline = Date.now() + 30000;
  let settled = 0;
  while (Date.now() < settleDeadline) {
    settled = await page.evaluate(() => {
      const f = document.querySelector(".cs-cal-embed iframe");
      return f ? Math.round(f.getBoundingClientRect().height) : 0;
    });
    if (settled >= 700) break;   // comfortably past both CSS floors (660/560)
    await page.waitForTimeout(500);
  }

  const m = await page.evaluate(() => {
    const host = document.querySelector('.cs-cal-embed');
    const f = host && host.querySelector('iframe');
    const wrap = document.querySelector('.cs-cal-wrap');
    const box = document.querySelector('.modal-overlay.open .modal-box');
    const r = (el) => (el ? Math.round(el.getBoundingClientRect().height) : null);
    return {
      iframe: r(f),
      hostH: r(host),
      hostInline: host ? host.style.height : null,
      wrap: r(wrap),
      boxScroll: box ? box.scrollHeight : null,
      boxClient: box ? box.clientHeight : null,
      src: f ? f.getAttribute('src') : null,
    };
  });

  rec(`${vp.label}: iframe is the real calendly.com embed`,
    typeof m.src === 'string' && m.src.includes('calendly.com'), m.src ? m.src.slice(0, 60) : 'no src');
  rec(`${vp.label}: iframe height >= ${vp.min}px`, (m.iframe ?? 0) >= vp.min, `${m.iframe}px`);
  rec(`${vp.label}: container matches the iframe (no empty dark space)`,
    m.hostH != null && m.iframe != null && Math.abs(m.hostH - m.iframe) <= 4, `host ${m.hostH}px vs iframe ${m.iframe}px`);
  rec(`${vp.label}: skeleton resolved`, (await page.locator('.cs-cal-skeleton').count()) === 0);
  rec(`${vp.label}: button fallback did NOT take over`, (await page.locator('.cs-book-btn').count()) === 0);
  console.log(`     page_height applied: ${m.hostInline || '(none — CSS default)'}; modal scrollHeight ${m.boxScroll} / client ${m.boxClient}`);

  await ctx.close();
}

await browser.close();
const bad = results.filter((r) => !r.p);
console.log(`\n${results.length - bad.length}/${results.length} passed against ${URL_UNDER_TEST}`);
if (bad.length) { console.log('FAILED: ' + bad.map((f) => f.n).join('; ')); process.exit(1); }
