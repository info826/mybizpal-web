#!/usr/bin/env node
// Pre-commit secret scan: blocks the commit if any staged ADDED line carries
// a secret-shaped string (Stripe sk_/rk_/whsec_, OpenAI sk-, JWT). Runs from
// .githooks/pre-commit; activate in a fresh clone with `npm install` (the
// package.json prepare script) or `git config core.hooksPath .githooks`.
// A provable placeholder can be waived by appending: pragma: allowlist secret
'use strict';
const { execSync } = require('node:child_process');

const PATTERNS = [
  { name: 'Stripe secret key', re: /\bsk_(?:live|test)_[A-Za-z0-9]{10,}/ },
  { name: 'Stripe restricted key', re: /\brk_(?:live|test)_[A-Za-z0-9]{10,}/ },
  { name: 'Stripe webhook secret', re: /\bwhsec_[A-Za-z0-9]{10,}/ },
  { name: 'OpenAI-style secret key', re: /\bsk-[A-Za-z0-9_-]{20,}/ },
  { name: 'JWT-shaped token', re: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/ },
];

let diff;
try {
  diff = execSync('git diff --cached --unified=0 --no-color', {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
} catch (err) {
  console.error('[check-secrets] could not read the staged diff — blocking the commit to be safe.');
  process.exit(1);
}

const findings = [];
let file = '';
let lineNo = 0;
for (const raw of diff.split('\n')) {
  if (raw.startsWith('+++ b/')) { file = raw.slice(6); continue; }
  const hunk = raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)/);
  if (hunk) { lineNo = Number(hunk[1]) - 1; continue; }
  if (!raw.startsWith('+') || raw.startsWith('+++')) continue;
  lineNo += 1;
  const line = raw.slice(1);
  if (line.includes('pragma: allowlist secret')) continue;
  for (const { name, re } of PATTERNS) {
    const m = line.match(re);
    if (m) findings.push({ file, lineNo, name, sample: m[0].slice(0, 10) + '…' });
  }
}

if (findings.length) {
  console.error('✖ [check-secrets] potential secret(s) in staged changes — COMMIT BLOCKED:');
  for (const f of findings) {
    console.error(`   ${f.file}:${f.lineNo}  ${f.name}  (starts "${f.sample}")`);
  }
  console.error('  Real secret: unstage it and move it to env. Provable placeholder:');
  console.error('  append "pragma: allowlist secret" to that line.');
  process.exit(1);
}
process.exit(0);
