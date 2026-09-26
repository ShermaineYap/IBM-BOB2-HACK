# DevPulse — don't trust an AI security audit. Measure it.

**Live demo:** https://ibm-bob-2-hack.vercel.app/ · **Video:** _(link)_ · **Built for** the IBM Bob 2.0 Hackathon, 25–27 September 2026

DevPulse turns **IBM Bob 2.0** into a security auditor whose work is
**scored against a hidden answer key** and whose fixes are **proven to apply**
before anyone merges them.

Most AI code-review demos show a scan that finds everything. That proves
nothing, because nobody can see what it missed or how often it cries wolf.
DevPulse seeds a real codebase with known defects *and decoys*, has Bob audit
and fix it as a multi-step agent, then measures recall, precision, decoy hits
and whether every fix actually applies.

## Results

Every number below is computed by `scripts/score_audit.mjs` and stored in
`audit/**/metrics.json`. Nothing is hand-entered.

| | Round 1 — Baseline | Round 2 — Hard mode |
| --- | --- | --- |
| Target | `sample_app/` — Express account API | `ledger_app/` — invoicing & file API |
| Seeded defects | 10 (SQLi, XSS, MD5, hardcoded secret…) | 12 (IDOR, `jwt.decode` bypass, SSRF, path traversal, command injection, prototype pollution, mass assignment, ReDoS…) |
| Decoys (safe code that looks unsafe) | 0 | 7 |
| **Caught (recall)** | **10 / 10** | **12 / 12** |
| **False positives (precision)** | **0 — 100%** | **0 — 100%** |
| **Decoys Bob wrongly flagged** | — | **0 / 7** |
| Fixes that pass `git apply --check` | 2 / 10 as first written → 10 / 10 after hunk headers regenerated | _pending_ |
| Bob mode | Agent | 🛡️ Security Auditor (custom mode) |
| Subagents | 7 explore (audit) · 10 general (fixes) | 6 explore (audit) · _pending_ |
| Bobcoins | 0.668 audit · 1.09 fixes · 1.73 stopped repair | 1.01 audit · _pending_ |

**The finding that matters most is the fix row.** In round 1 every fix Bob
wrote was the right remedy, but 8 of 10 diffs had wrong hunk line counts and
would not have applied. The `git apply --check` step caught it. The headers
were regenerated mechanically from Bob's own edits (content unchanged) and the
lesson went back into the `generate-fixes` skill as a mandatory self-check
before Bob may mark anything fixed. Round 2 tests whether that holds.

## How it works

```
Seed ──► Audit (Bob) ──► Fix (Bob) ──► Verify ──► Score ──► Dashboard + SARIF
```

1. **Seed.** Each target has an answer key (`audit/**/ground_truth.json`) that
   lists every planted defect and every decoy. Bob is told never to read it,
   and `.bobignore` removes it from Bob's context anyway.
2. **Audit.** In the **🛡️ Security Auditor** custom mode, Bob runs the
   `security-audit` skill: one read-only *explore* subagent per source file,
   in parallel, checking a 23-class OWASP ASVS checklist. Bob merges the
   candidates, re-reads every evidence line, and writes `findings.json`.
3. **Fix.** The `generate-fixes` skill spawns one *general* subagent per
   finding (`fork_context: false`). Each returns a minimal unified diff; Bob
   must pass `git apply --check` before marking it fixed. Targets are never
   modified.
4. **Score.** `node scripts/score_audit.mjs <round>` matches findings to the
   answer key (same category, same file, line ±3), reports recall, precision
   and decoy hits, and re-checks every diff.
5. **Ship.** `node scripts/to_sarif.mjs <round>` exports SARIF 2.1.0 for
   GitHub code scanning. The dashboard renders the same files.

### IBM Bob 2.0 features used

| Feature | Where |
| --- | --- |
| **Custom mode** — read everything, write only `^audit/.*\.(json\|diff)$` | `.bob/custom_modes.yaml` |
| **Agent mode + parallel subagents** — explore per file, general per fix | both skills |
| **Skills** — reusable audit and fix workflows with checklist, severity guide, output contract | `.bob/skills/` |
| **Custom rules** — targets are read-only, never read answer keys | `.bob/rules/devpulse.md`, `.bobrules` |
| **AGENTS.md** — persistent project context | `AGENTS.md` |
| **.bobignore** — answer keys and metrics kept out of context | `.bobignore` |
| **Task session evidence** — every task, with Bobcoin cost | `bob_sessions/`, `audit/runs.json` |

## For judges — where to look

| Criterion | Evidence |
| --- | --- |
| **Application of technology** | Bob is the auditor and the fixer, not a code generator: custom mode, two skills, parallel subagents, rules. See the *How Bob does it* tab and `.bob/`. Every task is in `bob_sessions/`. |
| **Presentation** | Live dashboard with a 60-second tour; 5-minute video; README results table. |
| **Business value** | Teams that bought AI coding can't certify its output. DevPulse gives a recall/precision number on *their* code before an AI reviewer gates a release, and ships findings as SARIF into GitHub code scanning. |
| **Originality** | The audit is not the product — the *measurement* is. Hidden answer keys, decoys to measure false alarms, and patch verification turn "the AI found stuff" into a benchmark. The verify step caught Bob's broken diffs in round 1. |

## Reproduce

```bash
git clone https://github.com/ShermaineYap/IBM-BOB2-HACK && cd IBM-BOB2-HACK
npm install

# In Bob IDE, 🛡️ Security Auditor mode:
#   "Run the security-audit skill on ledger_app/, write audit/hard/findings.json"
#   "Run the generate-fixes skill on audit/hard/findings.json"

node scripts/score_audit.mjs audit/hard   # recall, precision, decoys, fixes that apply
node scripts/to_sarif.mjs audit/hard      # SARIF for GitHub code scanning
npm run dev                               # dashboard at http://localhost:5173
```

## Repository layout

```
.bob/custom_modes.yaml        🛡️ Security Auditor mode
.bob/skills/security-audit/   audit workflow, 23-class checklist, severity guide
.bob/skills/generate-fixes/   one-diff-per-finding workflow with self-verification
.bob/rules/                   project rules Bob loads automatically
sample_app/                   round 1 target (10 seeded defects)
ledger_app/                   round 2 target (12 subtle defects + 7 decoys)
audit/                        round 1: ground truth, findings, fixes, metrics, SARIF
audit/hard/                   round 2: same structure
audit/runs.json               every Bob task: mode, subagents, Bobcoins, outcome
scripts/score_audit.mjs       scorer (recall, precision, decoys, git apply --check)
scripts/to_sarif.mjs          SARIF 2.1.0 exporter
bob_sessions/                 task session summary screenshots (mandatory deliverable)
index.html, src/              the dashboard (Vite, vanilla JS)
```

## Data

Both targets and all answer keys were written for this project. No external,
client, personal or social-media data is used. Secrets in the targets are
fake and deliberate (they are the defects).

## Roadmap

Run as a pull-request check via Bob Shell's non-interactive mode; let teams
seed their own answer keys to benchmark AI reviewers on their stack; track
recall and precision across Bob versions.

## Team

Shermaine Yap · Caiting

## Licence

MIT — see [LICENSE](LICENSE).
