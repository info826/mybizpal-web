#!/usr/bin/env node
// build-legal.js — stamp company/contact details from env into the BUILT legal pages.
// The {{TOKEN}} versions in public/*.html are the committed source of truth; vite copies them
// into dist/ during the build, and this script then replaces the tokens in dist/*.html in place.
// Runs as the second half of `npm run build` (vite build && node scripts/build-legal.js).

const { readFileSync, writeFileSync, existsSync } = require("node:fs");
const { join } = require("node:path");

// Load .env if dotenv is installed; otherwise rely on the ambient environment.
try {
  require("dotenv").config();
} catch {
  // dotenv not installed — env vars must already be present in process.env.
}

const DIST_DIR = join(__dirname, "..", "dist");

// dist/ is produced by `vite build`. If it's missing, the build step hasn't run yet.
if (!existsSync(DIST_DIR)) {
  console.error("dist/ not found — run `vite build` before stamping legal pages.");
  console.error("(Use `npm run build`, which runs vite first, then this script.)");
  process.exit(1);
}

const FILES = [
  "terms.html",
  "privacy.html",
  "gdpr.html",
  "cookies.html",
  "about.html",
  "contact.html",
  "acceptable-use.html",
];

// token → env var name. Several tokens intentionally map to the same env var.
const TOKEN_ENV = {
  "{{SUPPORT_PHONE}}": "VITE_SUPPORT_PHONE",
  "{{WA_NUMBER_DISPLAY}}": "VITE_SUPPORT_PHONE",
  "{{WA_NUMBER_LINK}}": "VITE_WA_NUMBER",
  "{{COMPANY_EMAIL}}": "VITE_COMPANY_EMAIL",
  "{{COMPANY_NAME}}": "VITE_COMPANY_NAME",
  "{{COMPANY_NO}}": "VITE_COMPANY_NO",
  "{{ICO_REG}}": "VITE_ICO_REG",
  "{{COMPANY_ADDRESS}}": "VITE_COMPANY_ADDRESS",
  "{{WEBSITE}}": "VITE_WEBSITE",
};

// Verify all required env vars are present before touching any file.
const requiredVars = [...new Set(Object.values(TOKEN_ENV))];
const missing = requiredVars.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error("Missing required environment variable(s):");
  for (const name of missing) console.error(`  - ${name}`);
  console.error("\nSet them in .env (or the environment) and re-run. No files were modified.");
  process.exit(1);
}

// Escape a string for use as a literal in a RegExp.
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// MyBizPal favicon links, injected into each page's <head> after the <title> so every
// legal page (and any future page added to FILES) shows the logo in the browser tab.
const FAVICON_LINKS =
  '\n<link rel="icon" type="image/png" href="https://res.cloudinary.com/dp8novljz/image/upload/c_fit,w_32,h_32/v1780837471/MyBizPal_Logo_Light_BG.png" />' +
  '\n<link rel="apple-touch-icon" href="https://res.cloudinary.com/dp8novljz/image/upload/c_fit,w_180,h_180/v1780837471/MyBizPal_Logo_Light_BG.png" />';

let hadUnreplaced = false;

for (const file of FILES) {
  const path = join(DIST_DIR, file);

  let html;
  try {
    html = readFileSync(path, "utf8");
  } catch (err) {
    console.error(`✗ ${file}: could not read (${err.message})`);
    process.exit(1);
  }

  for (const [token, envName] of Object.entries(TOKEN_ENV)) {
    html = html.replace(new RegExp(escapeRegExp(token), "g"), process.env[envName]);
  }

  // Ensure the favicon links are present (idempotent — skip if already in the source head).
  if (!html.includes("apple-touch-icon")) {
    html = html.replace(/<\/title>/i, `</title>${FAVICON_LINKS}`);
  }

  writeFileSync(path, html, "utf8");
  console.log(`✓ updated ${file}`);

  // Flag any remaining {{...}} tokens that weren't in our replacement map.
  const leftover = html.match(/\{\{[^}]+\}\}/g);
  if (leftover) {
    hadUnreplaced = true;
    const unique = [...new Set(leftover)];
    console.warn(`  ⚠ ${file} still contains unreplaced token(s): ${unique.join(", ")}`);
  }
}

if (hadUnreplaced) {
  console.warn("\n⚠ One or more files contain unreplaced tokens (see warnings above).");
}
