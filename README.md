# mybizpal-web

The MyBizPal marketing site (mybizpal.ai). React + Vite, deployed to Render on
push to `main` (service `srv-d8a8i7jbc2fs73ajacag`).

```bash
npm ci
npm run dev        # local dev server
npm run build      # production build + legal-page generation
npm run preview    # serve the built output
```

`npm run build` needs the `VITE_*` variables in `.env` and will refuse to run
without them, naming the ones it is missing.

## Launcher gesture checks

`npm run check:launcher` drives a **real browser with real touch events** against
a running site and asserts the floating Sofi launcher still works.

This exists because a build check cannot catch a gesture regression. On
18 August 2026 the launcher built clean, deployed green, and was untappable on
every real phone: making the avatar video transparent to pointer events handed
the whole button surface to the drag handler, and a 4px threshold then
classified ordinary finger roll as a drag and discarded the click. The site was
broken for two days. This harness reproduces that class of failure in about a
minute.

```bash
# against a local build
npm run build
npm run preview -- --port 4173          # in one terminal
npm run check:launcher                  # in another (defaults to :4173)

# against any other local port
npm run check:launcher -- http://localhost:5201/

# against the live site
npm run check:launcher -- https://mybizpal.ai/
```

Exits non-zero if any check fails, so it can gate a release.

### What it covers

| # | Check |
|---|---|
| 1-3 | A tap opens the chat panel at 0px, 6px and 9px of finger jitter |
| 4 | A deliberate drag still moves the launcher |
| 5 | A drag does **not** open the panel |
| 6 | The greeting bubble appears |
| 7 | The bubble's ✕ dismisses it |
| 8 | The ✕ does **not** open the panel |
| 9-11 | First visit with the cookie banner up: the launcher is not covered, a tap still opens the panel, and the ✕ still works |

Checks 1-8 run with consent pre-seeded so the cookie banner cannot mask the
result. Checks 9-11 deliberately run with a fresh profile and no consent, which
is the case where the banner used to cover the launcher completely.

## Modal reachability checks

`npm run check:modals` opens Contact Sales on a **fresh profile with the cookie
banner showing** — the state a first-time lead is in — and asserts the whole
form, including **Submit**, is actually reachable. It runs at 1280×900 and
375×740.

```bash
npm run check:modals                          # defaults to :4173
npm run check:modals -- http://localhost:5203/
npm run check:modals -- https://mybizpal.ai/
```

This exists because the banner (`position:fixed; bottom:0; z-index:9999`) used
to paint over the lower part of any tall modal, and Contact Sales step 2 is the
tallest form on the site — so **Submit was covered and unclickable on the
lead-submission path**, at both viewports, for anyone who had not yet answered
the cookie banner. Nobody who had already accepted cookies could see it.

It deliberately uses **no `force` clicks and no oversized viewport**. Both make
a covered element look reachable, and catching a covered element is the entire
point. The lead POST is stubbed, so running it never writes a real sales lead.

## Contact Sales success-step checks

`npm run check:success` drives the whole Contact Sales form to its success step
and asserts the calendar-first booking surface, at 1280×900, 375×740 and
390×844 — 63 checks.

```bash
npm run check:success -- http://localhost:5205/
npm run check:success -- https://mybizpal.ai/
```

The success step is the primary booking path, so its **fallbacks** matter more
than its happy path. All four routes are asserted at every viewport:

| Case | Expected |
|---|---|
| Consent + working embed | inline widget mounts, skeleton resolves, prefill and `utm_content` correct, `contact_sales_book_call` with `method: inline` |
| Booking made | a `calendly.event_scheduled` message **from calendly.com** pushes `contact_sales_call_booked` — a same-origin forgery does not |
| Iframe stalls | 6s timeout flips to the button version; no permanent skeleton |
| Script blocked | falls back to the button immediately |
| No marketing consent (`essential` or unset) | button version, and Calendly's script is **never requested** |

The lead POST is intercepted, so running it never writes a real sales lead.
Calendly's CDN is intercepted too — that is what makes "blocked script" and
"stalled iframe" testable at all, and it keeps the run deterministic.

**Limit:** because the CDN is stubbed, this exercises *our* code against a
stand-in widget, not Calendly's real embed. That the real calendar renders and
takes a booking still needs a human to look once.

### Requirements and limits

- Needs Chrome or Edge **already installed**. `playwright-core` drives the
  browser you have; it does not download one. Override the path with
  `CHROME_PATH=/path/to/chrome`.
- Taps are dispatched via CDP `Input.dispatchTouchEvent` with a few pixels of
  movement. Playwright's own `touchscreen.tap()` moves 0px, which no finger
  does — it passed while the live site was broken on device, so it is not used
  here.
- **This is headless Chrome with touch emulation, not iOS Safari.** It proves
  the gesture logic. It does not prove WebKit specifics — autoplay policy,
  fullscreen video, momentum scrolling. Those still need a human with a phone.
