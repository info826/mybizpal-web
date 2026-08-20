#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Chat panel + plan-aware copy pins.
//
//   npm run check:chat
//   npm run check:chat -- https://mybizpal.ai/
//
// Law 17 pins for the two behaviours that are REQUIREMENTS rather than taste:
//   * the reassurance line names the plan the visitor clicked, and never leaks
//     the raw internal key;
//   * declining WhatsApp keeps the conversation in the panel — the input
//     survives, a further message still gets a reply, and what the visitor
//     types is still recorded.
//
// Also pins the opening arriving as two bubbles and multi-part replies arriving
// as more than one, because "it reads human" is otherwise unfalsifiable.
//
// The widget-session POSTs are intercepted, so running this never writes a real
// session row — and interception is also how the "nothing said is lost" claim
// is checked rather than assumed.
// ─────────────────────────────────────────────────────────────────────────────
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const URL_UNDER_TEST = process.argv[2] || process.env.LAUNCHER_URL || 'http://localhost:4173/';
const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean).find(existsSync);
if (!CHROME) { console.error('No Chrome/Edge found. Set CHROME_PATH.'); process.exit(2); }

const results = [];
const rec = (n, p, d) => { results.push({ n, p }); console.log(`  ${p ? 'PASS' : 'FAIL'}  ${n}${d ? `  (${d})` : ''}`); };

const browser = await chromium.launch({ executablePath: CHROME, headless: true });

async function openPage() {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const sessionPosts = [];
  await page.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch {} }, ['mbp_cookie_consent', 'all']);
  // Never write a real widget session; record what would have been sent.
  await page.route('**/api/widget-session**', (r) => {
    try { sessionPosts.push(JSON.parse(r.request().postData() || '{}')); } catch { sessionPosts.push({}); }
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{"session_ref":"TESTREF"}' });
  });
  await page.route('**/api/sales-lead', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }));
  await page.goto(URL_UNDER_TEST, { waitUntil: 'domcontentloaded', timeout: 60000 });
  return { ctx, page, sessionPosts };
}

const bubbles = (page) => page.locator('.sofi-msg.sofi');
const say = async (page, text) => {
  await page.locator('.sofi-input').fill(text);
  await page.locator('.sofi-send').click();
};
const waitForBubbles = async (page, n, timeout = 12000) => {
  await page.waitForFunction(
    (want) => document.querySelectorAll('.sofi-msg.sofi').length >= want,
    n, { timeout }
  ).catch(() => {});
  return bubbles(page).count();
};

// ── Panel: identity, paced opening, rhythm ──────────────────────────────────
{
  console.log('\n=== chat panel');
  const { ctx, page } = await openPage();
  await page.locator('.sofi-fab-btn').click();
  await page.waitForSelector('.sofi-panel-header', { timeout: 10000 });

  rec('header shows Sofi, not "MyBizPal AI"',
    (await page.locator('.sofi-header-text h4').innerText()).trim() === 'Sofi');
  const sub = (await page.locator('.sofi-header-text p').innerText()).trim();
  rec('subtitle keeps the online dot and drops WhatsApp branding',
    sub.includes('Online') && sub.includes('from MyBizPal') && !/whatsapp/i.test(sub), sub);
  rec('header avatar is Sofi\u2019s picture, not the WhatsApp glyph',
    (await page.locator('.sofi-panel-header .sofi-avatar-img').count()) === 1 &&
    (await page.locator('.sofi-panel-header svg').count()) === 0);

  // PIN: the opening is two bubbles, greeting then question.
  const openCount = await waitForBubbles(page, 2);
  rec('opening arrives as TWO messages, not one block', openCount === 2, `${openCount} bubbles`);
  const first = (await bubbles(page).nth(0).innerText()).trim();
  const second = (await bubbles(page).nth(1).innerText()).trim();
  rec('first message is the Art. 50 disclosure and carries no feature list',
    /I'?m Sofi/i.test(first) && /AI assistant/i.test(first) && !/book appointments/i.test(first), first);
  rec('second message is the ruled question',
    second === 'What kind of business do you run?', second);

  // PIN: a multi-part reply renders as more than one bubble.
  const before = await bubbles(page).count();
  await say(page, 'I run a dental practice');
  const after = await waitForBubbles(page, before + 2);
  rec('a multi-part reply renders as separate bubbles', after - before >= 2, `+${after - before}`);
  await ctx.close();
}

// ── Decline keeps the conversation in the panel ─────────────────────────────
{
  console.log('\n=== WhatsApp is an offer, not an exit');
  const { ctx, page, sessionPosts } = await openPage();
  await page.locator('.sofi-fab-btn').click();
  await page.waitForSelector('.sofi-panel-header', { timeout: 10000 });
  await waitForBubbles(page, 2);

  for (const msg of ['A dental practice', 'Missed calls', 'About 60 a week']) {
    await say(page, msg);
    await page.waitForTimeout(2600);
  }

  rec('the WhatsApp offer appears after the script completes',
    (await page.locator('.sofi-handoff').count()) === 1);
  rec('the input SURVIVES the offer (it used to be removed)',
    (await page.locator('.sofi-input').count()) === 1);

  await page.locator('.sofi-handoff-dismiss').click();
  await page.waitForTimeout(300);
  rec('declining dismisses the offer', (await page.locator('.sofi-handoff').count()) === 0);
  rec('WhatsApp stays reachable in the header bar after declining',
    (await page.locator('.sofi-wa-direct').count()) === 1);

  const before = await bubbles(page).count();
  await say(page, 'Also we have two locations');
  const after = await waitForBubbles(page, before + 1);
  rec('a message sent AFTER declining still gets a reply', after > before, `+${after - before}`);

  const last = (await bubbles(page).nth(after - 1).innerText()).trim();
  rec('the holding reply is honest — it never claims to understand',
    /WhatsApp|note|Noted/i.test(last) && !/I see|got it|understood/i.test(last), last);

  const logged = sessionPosts.some((p) =>
    JSON.stringify(p).includes('two locations'));
  rec('what the visitor types after declining is still recorded', logged);
  await ctx.close();
}

// ── Plan-aware reassurance copy ─────────────────────────────────────────────
{
  console.log('\n=== plan-aware reassurance line');
  const { ctx, page } = await openPage();
  const openCard = async (tier) => {
    // Match on the card's own .p-tier, anchored and case-insensitive. Two traps:
    // Playwright's hasText does case-insensitive SUBSTRING matching, so
    // { hasText: 'Bespoke' } also matched the ELITE card via its "…bespoke build"
    // locked line and silently tested Elite twice while reporting a Bespoke
    // failure; and .p-tier is text-transform:uppercase, so its innerText is
    // "EXCLUSIVE" and an exact 'Exclusive' match fails too. An anchored /i regex
    // handles both, and does not depend on card order (the cards carry
    // desktopOrder/mobileOrder, so index would be brittle).
    const card = page.locator('.p-card').filter({ has: page.locator('.p-tier', { hasText: tier }) });
    await card.getByRole('button', { name: /contact sales/i }).first().click();
    await page.waitForSelector('.modal-overlay.open .modal-box', { timeout: 10000 });
    const note = (await page.locator('.modal-overlay.open .form-note').first().innerText()).trim();
    await page.locator('.modal-overlay.open .modal-close').click();
    await page.waitForTimeout(400);
    return note;
  };

  const bespoke = await openCard(/^exclusive$/i);
  rec('opened from the Exclusive card, the line says Exclusive', /your Exclusive plan/.test(bespoke), bespoke);
  // The label and the raw key are now the same word for this tier, so the only
  // thing distinguishing "we used the map" from "we printed req.body" is
  // capitalisation: the key is lowercase 'exclusive', the label is 'Exclusive'.
  // Weaker than it was, and said so rather than dropped.
  rec('the mapped label is displayed, not the raw lowercase key',
    /your Exclusive plan/.test(bespoke) && !/your exclusive plan/.test(bespoke), bespoke);

  // PIN: one tier, one name. The badge, the tier field and the reassurance line
  // must all say Exclusive. Any two of them agreeing while the third drifts is
  // exactly how the card ended up calling itself Bespoke while the form called
  // it Elite.
  const exclusiveCard = page.locator('.p-card').filter({ has: page.locator('.p-tier', { hasText: /^exclusive$/i }) });
  const exTier = (await exclusiveCard.locator('.p-tier').innerText()).trim();
  const exBadge = (await exclusiveCard.locator('.p-tier-badge').innerText()).trim();
  rec('tier and badge agree on the name',
    /^exclusive$/i.test(exTier) && /exclusive/i.test(exBadge) && !/bespoke/i.test(exBadge),
    `tier "${exTier}" / badge "${exBadge}"`);
  rec('the reassurance line agrees with them',
    /your Exclusive plan/.test(bespoke) && !/bespoke/i.test(bespoke), bespoke);

  // The descriptor must SURVIVE the rename — 'bespoke' is still the right word
  // for what the tier does, just not its name.
  const featureText = (await exclusiveCard.innerText());
  rec('"bespoke" survives as a descriptor in the card copy',
    /bespoke/i.test(featureText));

  const elite = await openCard(/^elite$/i);
  rec('opened from Elite, the line says Elite', /your Elite plan/.test(elite), elite);
  await ctx.close();
}

await browser.close();
const bad = results.filter((r) => !r.p);
console.log(`\n${results.length - bad.length}/${results.length} passed against ${URL_UNDER_TEST}`);
if (bad.length) { console.log('FAILED: ' + bad.map((f) => f.n).join('; ')); process.exit(1); }
