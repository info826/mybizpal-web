#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Contact Sales success step — the calendar-first booking surface.
//
//   npm run check:success
//   npm run check:success -- https://mybizpal.ai/
//
// The lead POST is always intercepted, so running this NEVER writes a real sales
// lead. Calendly's CDN is intercepted too, which is what makes the interesting
// cases testable at all: script blocked, and iframe that never loads.
//
// The success step is now the primary booking path, so its FALLBACKS matter more
// than its happy path. Every route out of it is asserted here: embed, no
// consent, blocked script, and a stalled iframe hitting the 6s timeout. There is
// no assertion-free path that could leave a blank modal or a permanent skeleton.
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

const M = '.modal-overlay.open .modal-box';
const EMBED = '.cs-cal-wrap';
const SKELETON = '.cs-cal-skeleton';
const BUTTON = '.cs-book-btn';
const SECONDARY = '.cs-book-secondary';

const VIEWPORTS = [
  { label: 'desktop 1280x900', viewport: { width: 1280, height: 900 }, isMobile: false, hasTouch: false },
  { label: 'mobile 375x740', viewport: { width: 375, height: 740 }, isMobile: true, hasTouch: true },
  { label: 'mobile 390x844', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
];

const results = [];
const rec = (n, p, d) => { results.push({ n, p }); console.log(`  ${p ? 'PASS' : 'FAIL'}  ${n}${d ? `  (${d})` : ''}`); };

const browser = await chromium.launch({ executablePath: CHROME, headless: true });

// A stand-in for Calendly's widget.js. It points the iframe at the REAL
// calendly.com URL, which is itself intercepted below — that matters because
// our code only trusts postMessages whose origin is https://calendly.com, so a
// stub that posts from the page origin could never exercise the message paths
// at all. 'stall' renders no iframe, which is what the 6s timeout is for.
const widgetStub = (mode) => `
  window.Calendly = {
    initInlineWidget: function (o) {
      window.__inline = { url: o.url, prefill: o.prefill, utm: o.utm };
      ${mode === 'stall' ? '' : `
      var f = document.createElement('iframe');
      f.src = o.url + (o.url.indexOf('?') > -1 ? '&' : '?') + 'embed_domain=test';
      f.style.width = '100%'; f.style.border = '0';
      o.parentElement.appendChild(f);`}
    },
    initPopupWidget: function (o) { window.__popup = o; }
  };`;

// The document served inside the iframe. 'healthy' announces an event type,
// which is the signal a real calendar rendered. 'unavailable' deliberately
// does NOT — that is exactly Calendly's "this calendar is currently
// unavailable" screen: a perfectly loaded iframe that is an error.
const iframeDoc = (mode) => `<!doctype html><html><body style="margin:0;background:#101024">
<script>
  parent.postMessage({ event: 'calendly.page_height', payload: { height: '900px' } }, '*');
  ${mode === 'unavailable' ? '' : "parent.postMessage({ event: 'calendly.event_type_viewed' }, '*');"}
</script></body></html>`;
/**
 * Drive the form to the success step.
 * consent: 'all' | 'essential' | null   calendly: 'ok' | 'stall' | 'blocked'
 */
async function reachSuccess({ viewport, isMobile, hasTouch }, consent, calendly) {
  const ctx = await browser.newContext({ viewport, isMobile, hasTouch });
  const page = await ctx.newPage();
  const cdnHits = [];

  if (consent) {
    await page.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch {} },
      ['mbp_cookie_consent', consent]);
  }
  // The booked flag is best-effort client-side signalling; stub it so a check
  // never marks a real lead, and record the bodies so we can assert exactly one
  // POST per booking.
  const bookedPosts = [];
  await page.route('**/api/sales-lead/booked', (r) => {
    try { bookedPosts.push(JSON.parse(r.request().postData() || '{}')); } catch { bookedPosts.push({ unparsable: true }); }
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.route('**/api/sales-lead', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }));
  await page.route('**/assets.calendly.com/**', (r) => {
    cdnHits.push(r.request().url());
    if (calendly === 'blocked') return r.abort('blockedbyclient');
    if (r.request().url().endsWith('.css')) return r.fulfill({ status: 200, contentType: 'text/css', body: '' });
    return r.fulfill({ status: 200, contentType: 'application/javascript', body: widgetStub(calendly) });
  });
  // The iframe document itself, served from calendly.com so its postMessages
  // carry the origin our handler requires.
  await page.route('https://calendly.com/**', (r) =>
    r.fulfill({ status: 200, contentType: 'text/html', body: iframeDoc(calendly) }));

  await page.goto(URL_UNDER_TEST, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByRole('button', { name: /contact sales/i }).first().click();
  await page.waitForSelector('.modal-overlay.open', { timeout: 10000 });

  await page.locator(`${M} input[placeholder="you@company.com"]`).fill('success.check@example.com');
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
  await page.locator(`${M} textarea`).first().fill('Success step check.');
  const submit = page.locator(`${M} button.form-submit`);
  await submit.scrollIntoViewIfNeeded();
  await submit.click({ timeout: 15000 });
  await page.waitForSelector('.cs-success', { timeout: 15000 });
  return { ctx, page, cdnHits, bookedPosts };
}

const dl = (page, event) =>
  page.evaluate((e) => (window.dataLayer || []).filter((x) => x.event === e), event);

for (const vp of VIEWPORTS) {
  console.log(`\n=== ${vp.label}`);

  // ── 1. Consent + working embed: the primary path ──────────────────────────
  {
    const { ctx, page } = await reachSuccess(vp, 'all', 'ok');
    rec(`${vp.label}: header line present`,
      (await page.locator('.cs-success-title').innerText()).startsWith('Enquiry received.'));
    rec(`${vp.label}: small tick beside the header`, (await page.locator('.cs-tick').count()) === 1);
    await page.waitForSelector(`${EMBED} iframe`, { timeout: 10000 }).catch(() => {});
    rec(`${vp.label}: inline embed mounted`, (await page.locator(`${EMBED} iframe`).count()) === 1);
    rec(`${vp.label}: button version NOT shown`, (await page.locator(BUTTON).count()) === 0);
    rec(`${vp.label}: secondary close link kept`, (await page.locator(SECONDARY).count()) === 1);

    const cfg = await page.evaluate(() => window.__inline || null);
    rec(`${vp.label}: embed prefill + utm_content`,
      cfg?.prefill?.name === 'Ada Lovelace' &&
      cfg?.prefill?.email === 'success.check@example.com' &&
      cfg?.utm?.utmContent === 'success.check@example.com',
      JSON.stringify(cfg?.utm));

    await page.waitForTimeout(700);
    rec(`${vp.label}: skeleton resolves once loaded`, (await page.locator(SKELETON).count()) === 0);

    const booked = await dl(page, 'contact_sales_book_call');
    rec(`${vp.label}: analytics fired once, method=inline`,
      booked.length === 1 && booked[0].method === 'inline', JSON.stringify(booked));

    // Calendly's scheduled event → the second analytics push.
    await page.evaluate(() => window.postMessage({ event: 'calendly.event_scheduled' }, '*'));
    await page.waitForTimeout(300);
    const sameOrigin = await dl(page, 'contact_sales_call_booked');
    rec(`${vp.label}: a same-origin forgery does NOT count as a booking`, sameOrigin.length === 0);

    // The real thing arrives from the iframe's origin; simulate it faithfully by
    // dispatching a MessageEvent whose origin is calendly.com.
    await page.evaluate(() => {
      const e = new MessageEvent('message', {
        data: { event: 'calendly.event_scheduled' },
        origin: 'https://calendly.com',
      });
      window.dispatchEvent(e);
    });
    await page.waitForTimeout(300);
    const real = await dl(page, 'contact_sales_call_booked');
    rec(`${vp.label}: calendly.event_scheduled pushes contact_sales_call_booked`, real.length === 1);
    await ctx.close();
  }

  // ── 1b. Booked state: copy flips, and the lead is flagged exactly once ─────
  {
    const { ctx, page, bookedPosts } = await reachSuccess(vp, 'all', 'ok');
    await page.waitForSelector(`${EMBED} iframe`, { timeout: 10000 }).catch(() => {});

    // Calendly announces the booking. Dispatched with calendly.com as the
    // origin, because that is the only origin our handler trusts.
    const fireScheduled = () => page.evaluate(() => {
      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://calendly.com',
        data: { event: 'calendly.event_scheduled', payload: { event: { uri: 'https://api.calendly.com/scheduled_events/EVT123' } } },
      }));
    });

    await fireScheduled();
    await page.waitForTimeout(600);

    rec(`${vp.label}: booked header replaces the prompt`,
      (await page.locator('.cs-success-title').innerText()).trim() === 'You’re booked — see you then.',
      (await page.locator('.cs-success-title').innerText()).trim());
    rec(`${vp.label}: secondary link becomes plain Close`,
      (await page.locator(SECONDARY).innerText()).trim() === 'Close',
      (await page.locator(SECONDARY).innerText()).trim());

    rec(`${vp.label}: one POST to /api/sales-lead/booked`, bookedPosts.length === 1,
      `${bookedPosts.length} post(s)`);
    if (bookedPosts.length) {
      const b = bookedPosts[0];
      rec(`${vp.label}: POST body carries email, booked and event_uri`,
        b.business_email === 'success.check@example.com' && b.booked === true &&
        b.event_uri === 'https://api.calendly.com/scheduled_events/EVT123',
        JSON.stringify(b));
    }

    // A repeated event_scheduled for the SAME booking must not post again —
    // Calendly can and does repeat these.
    await fireScheduled();
    await page.waitForTimeout(600);
    rec(`${vp.label}: a repeated event_scheduled does not post twice`, bookedPosts.length === 1,
      `${bookedPosts.length} post(s)`);

    await ctx.close();
  }


  // ── 2. Stalled iframe → 6s timeout flips to the button ────────────────────
  {
    const { ctx, page } = await reachSuccess(vp, 'all', 'stall');
    rec(`${vp.label}: skeleton shown while stalled`, (await page.locator(SKELETON).count()) === 1);
    await page.waitForSelector(BUTTON, { timeout: 12000 }).catch(() => {});
    rec(`${vp.label}: stalled embed falls back to the button within the timeout`,
      (await page.locator(BUTTON).count()) === 1);
    rec(`${vp.label}: no permanent skeleton left behind`, (await page.locator(SKELETON).count()) === 0);
    await ctx.close();
  }

  // ── 2b. Loaded iframe that is really the "currently unavailable" screen ───
  // No calendly.event_type_viewed ever arrives. Everything else looks healthy:
  // the script loaded, the iframe loaded, page_height even came through. This
  // is the case every earlier fallback was blind to.
  {
    const { ctx, page } = await reachSuccess(vp, 'all', 'unavailable');
    await page.waitForTimeout(1500);
    rec(`${vp.label}: unavailable embed is shown at first (looks healthy)`,
      (await page.locator(`${EMBED} iframe`).count()) === 1);
    await page.waitForSelector(BUTTON, { timeout: 15000 }).catch(() => {});
    rec(`${vp.label}: no event_type_viewed within 8s falls back to the button`,
      (await page.locator(BUTTON).count()) === 1);
    rec(`${vp.label}: tells the user the calendar is busy`,
      (await page.locator('.cs-success-sub-warn').count()) === 1,
      (await page.locator('.cs-success-sub-warn').innerText().catch(() => '')).slice(0, 48));
    const un = await dl(page, 'contact_sales_calendar_unavailable');
    rec(`${vp.label}: unavailable logged once with a timestamp`,
      un.length === 1 && typeof un[0].at === 'string' && !Number.isNaN(Date.parse(un[0].at)),
      JSON.stringify(un));
    await ctx.close();
  }

  // ── 3. Script blocked (ad blocker) → button, immediately ──────────────────
  {
    const { ctx, page } = await reachSuccess(vp, 'all', 'blocked');
    await page.waitForSelector(BUTTON, { timeout: 12000 }).catch(() => {});
    rec(`${vp.label}: blocked script falls back to the button`, (await page.locator(BUTTON).count()) === 1);
    rec(`${vp.label}: no embed left on screen`, (await page.locator(`${EMBED} iframe`).count()) === 0);
    await ctx.close();
  }

  // ── 4. No marketing consent → button, and NO Calendly script on our page ──
  for (const consent of ['essential', null]) {
    const { ctx, page, cdnHits } = await reachSuccess(vp, consent, 'ok');
    const label = consent ?? 'unset';
    rec(`${vp.label}: consent=${label} shows the button version`, (await page.locator(BUTTON).count()) === 1);
    rec(`${vp.label}: consent=${label} never requests Calendly's script`, cdnHits.length === 0);
    // The host element is now mounted permanently and parked off-screen — that
    // is what makes the warm path possible. "No embed" therefore means no
    // iframe was ever created and the host is still off-screen, not that the
    // node is absent.
    const frames = await page.locator(`${EMBED} iframe`).count();
    const parked = await page.locator(".cs-cal-wrap.cs-cal-warm").count();
    rec(`${vp.label}: consent=${label} shows no embed`, frames === 0 && parked === 1,
      `iframes ${frames}, off-screen ${parked}`);
    await ctx.close();
  }
}

await browser.close();
const bad = results.filter((r) => !r.p);
console.log(`\n${results.length - bad.length}/${results.length} passed against ${URL_UNDER_TEST}`);
if (bad.length) { console.log('FAILED: ' + bad.map((f) => f.n).join('; ')); process.exit(1); }
