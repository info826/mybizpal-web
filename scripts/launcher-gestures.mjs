#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Sofi launcher gesture harness.
//
// This repo has no test runner, so "verified" has historically meant "it built".
// A build check cannot catch a gesture regression: on 18 Aug 2026 the launcher
// shipped green and was untappable on every real phone. This harness exists so
// that class of failure cannot ship again.
//
//   npm run check:launcher                      # against a local preview build
//   npm run check:launcher -- https://mybizpal.ai/
//
// Requires Chrome (or Edge) installed. playwright-core drives the browser you
// already have — it does NOT download one. Override with CHROME_PATH=...
//
// WHY REAL TOUCH EVENTS: playwright's touchscreen.tap() moves 0px, which no
// finger does. It passed while the live site was demonstrably broken on device.
// Taps here are dispatched through CDP with a few px of jitter, which is what
// actually exercises the tap-vs-drag threshold.
//
// WHAT IT CANNOT TELL YOU: this is headless Chrome with touch emulation, not
// iOS Safari. It proves the gesture logic; it does not prove WebKit specifics
// (autoplay policy, fullscreen video, momentum scroll). Those still need a
// human with a phone.
// ─────────────────────────────────────────────────────────────────────────────
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const URL_UNDER_TEST = process.argv[2] || process.env.LAUNCHER_URL || 'http://localhost:4173/';

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

const executablePath = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!executablePath) {
  console.error('No Chrome/Edge found. Set CHROME_PATH to a browser executable.');
  process.exit(2);
}

const CONSENT_KEY = 'mbp_cookie_consent';
const FAB = '.sofi-fab-btn';
const LABEL = '.sofi-fab-label';
const LABEL_X = '.sofi-fab-label-x';
const PANEL = '.sofi-panel, [class*="sofi-panel"]';

const IPHONE = {
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 3,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
};

const results = [];
const record = (name, pass, detail) => {
  results.push({ name, pass });
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};

const browser = await chromium.launch({ executablePath, headless: true });

/**
 * Fresh page. consent:'seeded' stores consent before first paint so the cookie
 * banner never appears; consent:'none' leaves it to show, which is the first-
 * visit case where the banner used to cover the launcher entirely.
 */
async function openPage({ consent }) {
  const ctx = await browser.newContext(IPHONE);
  const page = await ctx.newPage();
  if (consent === 'seeded') {
    await page.addInitScript(
      ([k]) => { try { localStorage.setItem(k, 'all'); } catch { /* ignore */ } },
      [CONSENT_KEY]
    );
  }
  // NOT networkidle: the page has a looping avatar video and a marquee ticker,
  // so the network never goes idle and the wait times out.
  await page.goto(URL_UNDER_TEST, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector(FAB, { timeout: 20000 });
  const cdp = await ctx.newCDPSession(page);
  const touch = (type, x, y) =>
    cdp.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: type === 'touchEnd' ? [] : [{ x, y, radiusX: 12, radiusY: 12, force: 1 }],
    });
  return { ctx, page, touch };
}

const centreOf = async (page, sel) => {
  const b = await page.locator(sel).boundingBox();
  if (!b) throw new Error(`no bounding box for ${sel}`);
  return [b.x + b.width / 2, b.y + b.height / 2];
};

// A tap that travels `jitter` px diagonally between down and up, like a finger.
async function tap(touch, x, y, jitter = 0) {
  await touch('touchStart', x, y);
  if (jitter > 0) {
    await touch('touchMove', x + jitter / 2, y + jitter / 2);
    await touch('touchMove', x + jitter, y + jitter);
  }
  await touch('touchEnd', x + jitter, y + jitter);
}

const panelOpen = async (page) => (await page.locator(PANEL).count()) > 0;

// ── 1-3. A tap opens the panel, at every realistic amount of finger roll ─────
for (const jitter of [0, 6, 9]) {
  const { ctx, page, touch } = await openPage({ consent: 'seeded' });
  const [x, y] = await centreOf(page, FAB);
  await tap(touch, x, y, jitter);
  await page.waitForTimeout(800);
  record(`tap with ${jitter}px jitter opens the panel`, await panelOpen(page));
  await ctx.close();
}

// ── 4-5. A deliberate drag still drags, and is not mistaken for a tap ────────
{
  const { ctx, page, touch } = await openPage({ consent: 'seeded' });
  const [x, y] = await centreOf(page, FAB);
  const before = await page.locator('.sofi-fab').boundingBox();
  await touch('touchStart', x, y);
  for (let i = 1; i <= 12; i++) await touch('touchMove', x - i * 8, y - i * 9);
  await touch('touchEnd', x - 96, y - 108);
  await page.waitForTimeout(600);
  const after = await page.locator('.sofi-fab').boundingBox();
  const moved = Math.hypot(after.x - before.x, after.y - before.y);
  record('drag moves the launcher', moved > 40, `${Math.round(moved)}px`);
  record('drag does NOT open the panel', !(await panelOpen(page)));
  await ctx.close();
}

// ── 6-7. The bubble's ✕ dismisses it, and does not open the panel ────────────
{
  const { ctx, page, touch } = await openPage({ consent: 'seeded' });
  await page.waitForSelector(LABEL, { timeout: 8000 }).catch(() => {});
  if ((await page.locator(LABEL).count()) === 0) {
    record('greeting bubble appears', false, 'never rendered');
  } else {
    record('greeting bubble appears', true);
    const [x, y] = await centreOf(page, LABEL_X);
    await tap(touch, x, y);
    await page.waitForTimeout(600);
    record('✕ dismisses the bubble', (await page.locator(LABEL).count()) === 0);
    record('✕ does NOT open the panel', !(await panelOpen(page)));
  }
  await ctx.close();
}

// ── 8-10. First visit, cookie banner up: the launcher must still work ────────
// The banner is position:fixed bottom:0 z-index:9999 and full width. It used to
// cover the launcher (z-index 500, bottom-right) outright, so on a first visit
// nothing in that corner was tappable. CookieBanner now publishes its measured
// height as --mbp-banner-h and the launcher lifts by it; no z-index changed.
{
  const { ctx, page, touch } = await openPage({ consent: 'none' });
  await page.waitForTimeout(2600); // banner appears at 800ms, bubble at 2s
  const bannerUp = await page.evaluate(
    () => !!document.querySelector('div[style*="9999"]')
  );
  const covered = await page.evaluate((sel) => {
    const b = document.querySelector(sel).getBoundingClientRect();
    const top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    return !(top && top.closest('.sofi-fab'));
  }, FAB);
  record('cookie banner is up (precondition)', bannerUp);
  record('banner up: launcher is not covered', !covered);

  const [x, y] = await centreOf(page, FAB);
  await tap(touch, x, y, 6);
  await page.waitForTimeout(800);
  record('banner up: tap opens the panel', await panelOpen(page));
  await ctx.close();
}

// ── 11. First visit, banner up: the bubble's ✕ is still reachable ────────────
{
  const { ctx, page, touch } = await openPage({ consent: 'none' });
  await page.waitForSelector(LABEL, { timeout: 9000 }).catch(() => {});
  if ((await page.locator(LABEL).count()) === 0) {
    record('banner up: ✕ dismisses the bubble', false, 'bubble never rendered');
  } else {
    const [x, y] = await centreOf(page, LABEL_X);
    await tap(touch, x, y);
    await page.waitForTimeout(600);
    record('banner up: ✕ dismisses the bubble', (await page.locator(LABEL).count()) === 0);
  }
  await ctx.close();
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed against ${URL_UNDER_TEST}`);
if (failed.length) {
  console.log('FAILED: ' + failed.map((f) => f.name).join('; '));
  process.exit(1);
}
