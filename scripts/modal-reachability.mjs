#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Modal reachability under the cookie banner.
//
//   npm run check:modals
//   npm run check:modals -- https://mybizpal.ai/
//
// Every check runs on a FRESH PROFILE with no stored consent, so the banner is
// showing — the state a first-time lead is actually in. The banner is
// position:fixed bottom:0 z-index:9999 and used to paint over the lower part of
// any tall modal, which on Contact Sales step 2 meant the SUBMIT BUTTON. That
// is the lead-submission path, and anyone who had already accepted cookies
// never saw it.
//
// NO force clicks and NO oversized viewport here. Both are workarounds that
// make a covered element look reachable, and this file exists precisely to
// catch a covered element. Clicks go through Playwright's actionability checks,
// which fail when something else is on top — that is the assertion.
// ─────────────────────────────────────────────────────────────────────────────
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const URL_UNDER_TEST = process.argv[2] || process.env.LAUNCHER_URL || 'http://localhost:4173/';

const CHROME = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean).find(existsSync);

if (!CHROME) { console.error('No Chrome/Edge found. Set CHROME_PATH.'); process.exit(2); }

// Desktop and a small phone. 1280x900 is where the overlap was first caught;
// 375x740 is the worst realistic case — a tall form in a short viewport.
const VIEWPORTS = [
  { label: '1280x900', viewport: { width: 1280, height: 900 }, isMobile: false, hasTouch: false },
  { label: '375x740', viewport: { width: 375, height: 740 }, isMobile: true, hasTouch: true },
];

const M = '.modal-overlay.open .modal-box';
const results = [];
const rec = (n, p, d) => { results.push({ n, p }); console.log(`  ${p ? 'PASS' : 'FAIL'}  ${n}${d ? `  (${d})` : ''}`); };

const browser = await chromium.launch({ executablePath: CHROME, headless: true });

// True when something other than the modal owns the point at an element's
// centre — i.e. the element is visually covered.
//
// Polled, because scrollIntoViewIfNeeded animates: reading the position
// mid-scroll reports "covered" for an element that is merely still moving, and
// live is slow enough to lose that race where a local preview is not. Polling
// cannot mask a real overlap — if the banner is genuinely on top, every poll
// returns covered and the check still fails.
async function isCovered(page, selector, timeoutMs = 3000) {
  const deadline = Date.now() + timeoutMs;
  let last = true;
  while (Date.now() < deadline) {
    last = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return true;
      const r = el.getBoundingClientRect();
      // Off-screen counts as covered for our purposes: unreachable is unreachable.
      if (r.bottom <= 0 || r.top >= window.innerHeight) return true;
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return top && (top === el || el.contains(top) || top.contains(el)) ? false : true;
    }, selector);
    if (last === false) return false;
    await page.waitForTimeout(150);
  }
  return last;
}

for (const { label, viewport, isMobile, hasTouch } of VIEWPORTS) {
  console.log(`\n=== ${label} — fresh profile, cookie banner showing`);
  const ctx = await browser.newContext({ viewport, isMobile, hasTouch });
  const page = await ctx.newPage();
  // Stubbed so a reachability check never writes a real sales lead.
  await page.route('**/api/sales-lead', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }));
  await page.goto(URL_UNDER_TEST, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Banner appears at 800ms; wait past it so the modal opens into the worst case.
  await page.waitForTimeout(1600);
  const bannerUp = await page.evaluate(() => !!document.querySelector('div[style*="9999"]'));
  rec(`${label}: cookie banner is showing (precondition)`, bannerUp);

  await page.getByRole('button', { name: /contact sales/i }).first().click();
  await page.waitForSelector('.modal-overlay.open', { timeout: 10000 });

  rec(`${label}: modal is not covered by the banner`, (await isCovered(page, M)) === false);

  // Step 1 — plain click, no force. If the banner is on top this throws.
  await page.locator(`${M} input[placeholder="you@company.com"]`).fill('reachability@example.com');
  await page.locator(M).getByRole('button', { name: /Next/i }).click({ timeout: 8000 });

  // Step 2 — the tall one. Every field filled through normal actionability.
  await page.locator(`${M} input[placeholder="Jane"]`).fill('Ada');
  await page.locator(`${M} input[placeholder="Smith"]`).fill('Lovelace');
  await page.locator(`${M} input[placeholder="Acme Ltd"]`).fill('Analytical Engines Ltd');
  const sel = page.locator(`${M} select`);
  await sel.nth(0).selectOption({ index: 1 });   // industry
  await sel.nth(1).selectOption({ index: 1 });   // company size
  const tel = page.locator(`${M} input[type="tel"]`);
  await tel.click();
  await page.keyboard.press('Control+A');
  // Typed, not filled: react-phone-number-input is controlled and only updates
  // its E.164 value from real key events, so fill() leaves the form invalid.
  await tel.pressSequentially('+447911123456', { delay: 20 });
  await page.locator(`${M} textarea`).first().fill('Modal reachability check.');
  rec(`${label}: every step-2 field reachable`, true);

  const submit = page.locator(`${M} button.form-submit`);
  await submit.scrollIntoViewIfNeeded();
  rec(`${label}: Submit is not covered by the banner`,
    (await isCovered(page, `${M} button.form-submit`)) === false);

  let clicked = true;
  try {
    await submit.click({ timeout: 15000 });          // no force — this is the assertion
  } catch (err) {
    clicked = false;
    rec(`${label}: Submit is clickable`, false, String(err.message).split('\n')[0]);
  }
  if (clicked) {
    rec(`${label}: Submit is clickable`, true);
    rec(`${label}: submission reaches the success step`,
      await page.waitForSelector('.cs-book-actions', { timeout: 15000 }).then(() => true).catch(() => false));
  }

  await ctx.close();
}

await browser.close();
const bad = results.filter((r) => !r.p);
console.log(`\n${results.length - bad.length}/${results.length} passed against ${URL_UNDER_TEST}`);
if (bad.length) { console.log('FAILED: ' + bad.map((f) => f.n).join('; ')); process.exit(1); }
