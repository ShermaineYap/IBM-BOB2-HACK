# DevPulse — security audit by IBM Bob 2.0, scored honestly

**Live demo:** _(Vercel URL goes here)_ · **Video:** _(link)_ · IBM Bob 2.0 Hackathon, 25–27 September 2026

Most AI code-audit demos show a scan that finds everything. That proves
nothing, because nobody knows what it missed. DevPulse seeds a real codebase
with known defects first, lets Bob audit it as a multi-step agent, and then
scores Bob against the answer key. The result is a number a security lead
can act on: *recall* (how many seeded defects Bob found) and *precision*
(how many of Bob's findings were real).

## What Bob does

1. **Audit** — the `security-audit` skill in `.bob/skills/` has Bob spawn one
   read-only *explore* subagent per source file, in parallel, each checking a
   fixed OWASP ASVS 4.0 list. Bob merges the candidates, re-verifies every
   evidence line, and writes `audit/findings.json`.
2. **Fix** — the `generate-fixes` skill has Bob spawn one *general* subagent
   per finding, each returning a minimal unified diff. Diffs land in
   `audit/fixes/`. The sample app itself stays vulnerable so the audit is
   reproducible.
3. **Score** — `node scripts/score_audit.mjs` matches findings to
   `audit/ground_truth.json` and writes `audit/metrics.json`.

The dashboard (`index.html`, Vite) renders those files. It contains no AI
and no simulation — if Bob hasn't run, it says so.

## The audit target

`sample_app/` is Shoply, a small Express account API with **ten seeded
defects**: two SQL injections, reflected XSS, MD5 password hashing, a weak
password policy, a hardcoded JWT secret, no login rate limiting, an
unauthenticated admin endpoint, stack traces returned to clients, and a
30-day session TTL. Three things are deliberately correct so false positives
can be measured.

## Results

_(Filled in after the audit runs — recall, precision, caught/missed, with a
link to the task session screenshot.)_

## Run it

```bash
npm install
npm run dev          # dashboard at http://localhost:5173

# In Bob IDE, Agent mode, in this repo:
#   "Run the security-audit skill on sample_app/"
#   then: "Run the generate-fixes skill"
node scripts/score_audit.mjs
```

## Repository layout

```
.bob/skills/security-audit/   how Bob audits: method, checklist, severity guide
.bob/skills/generate-fixes/   how Bob writes one diff per finding
.bob/rules/                   project rules Bob loads automatically
sample_app/                   Shoply API — the audit target, seeded with defects
audit/ground_truth.json       answer key (Bob is told not to read it)
audit/findings.json           written by Bob
audit/fixes/*.diff            written by Bob
audit/metrics.json            written by the scorer
scripts/score_audit.mjs       recall / precision scorer
scripts/check_secrets.sh      credential scan, run before every commit
bob_sessions/                 task session summary screenshots (mandatory)
index.html, src/              the dashboard
```

## Bob 2.0 features used

Agent mode · parallel subagents (`explore` for read-only file scans,
`general` for fix generation, `fork_context: false` for isolation) · project
skills · project rules · `.bobignore` to keep the answer key and screenshots
out of context.

## Roadmap

Run as a CI check on pull requests; extend the checklist beyond the ASVS
subset; let teams seed their own answer keys to benchmark Bob on their stack.

## Team

Shermaine Yap · Caiting

## Licence

MIT.
