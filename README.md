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
