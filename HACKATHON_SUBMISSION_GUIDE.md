# Submission — values and checklist

## lablab.ai form

| Field | Value |
| --- | --- |
| Project title | DevPulse — Security audit by IBM Bob 2.0, scored honestly |
| Short description | Bob audits a seeded codebase as a multi-step agent with parallel subagents, writes structured findings and fixes, and is scored for recall and precision against the answer key. No claimed numbers — only measured ones. |
| Technology tags | IBM Bob IDE 2.0, JavaScript, Node.js, Express, Vite, OWASP ASVS |
| Category | Developer tools / DevSecOps |
| Demo platform | Vercel |
| Application URL | _(Vercel URL)_ |
| Repository | https://github.com/ShermaineYap/IBM-BOB2-HACK |
| Video | _(MP4, ≤ 5 min)_ |
| Slides | _(PDF)_ |
| Cover image | 16:9 PNG — screenshot of the Findings tab with real results |

## Long description (paste)

Most AI code-audit demos show a scan that finds everything, which proves
nothing because you can't see what it missed. DevPulse does the opposite. We
seeded a real Express API with ten known OWASP ASVS defects — two SQL
injections, reflected XSS, MD5 password hashing, a hardcoded JWT secret, a
missing admin check and more — then gave IBM Bob 2.0 a project skill that
tells it exactly how to audit: one read-only explore subagent per file,
running in parallel, a fixed checklist, verbatim evidence lines, and a JSON
output contract. A second skill has Bob fan out one general subagent per
finding to produce a minimal unified diff. A scorer then compares Bob's
findings against the answer key and reports recall and precision.

The dashboard renders exactly what Bob wrote — findings, before/after diffs,
the score, and the task session screenshots. Nothing is simulated. Bob 2.0's
agent mode, parallel subagents, project skills and rules are the core of the
workflow, not a wrapper around it.

Results: _(recall X/10, precision Y%, N fixes — fill in from audit/metrics.json)_.

## Before you submit

- [ ] `audit/findings.json` written by Bob, not by hand
- [ ] `audit/fixes/*.diff` written by Bob
- [ ] `node scripts/score_audit.mjs` run; numbers copied into README "Results"
- [ ] Real task session PNGs in `bob_sessions/` for every Bob task
- [ ] `bash scripts/check_secrets.sh` passes
- [ ] Deployed to Vercel; URL opens in an incognito window on another device
- [ ] Repo is public
- [ ] Video ≤ 5 min, MP4; slides PDF; cover image 16:9
- [ ] Every number in the video and slides comes from `audit/metrics.json`

## Video script — 4:30

**0:00–0:25 Problem.** "Every AI security demo shows a scan that finds
everything. That tells you nothing, because you can't see what it missed.
We wanted a number you could actually trust."

**0:25–0:50 Setup.** Show `sample_app/`. "A real Express API. We seeded it
with ten known defects before Bob ever saw it. Bob is told not to read the
answer key."

**0:50–1:50 Bob audits.** Screen-record Bob IDE, Agent mode: "Run the
security-audit skill on sample_app/". Show the subagents fanning out in
parallel, the merge, and `audit/findings.json` appearing. Show the task
session summary popping up — "that screenshot goes straight into
bob_sessions."

**1:50–2:30 Bob fixes.** "Run the generate-fixes skill." Show diffs landing
in `audit/fixes/`. Open one in the dashboard: before, after.

**2:30–3:10 The score.** Run `node scripts/score_audit.mjs`. Read the real
numbers out loud. Show the Score tab: caught, missed, false positives.
"This is what Bob actually did, not what we say it did."

**3:10–3:50 Why it matters.** "Engineering leads have bought AI code
generation. What they can't do is certify the output. Recall and precision
on a seeded target is the first honest benchmark of an AI auditor on your
own stack — and it's built entirely from Bob's own skills, subagents and
rules."

**3:50–4:30 Evidence and close.** Evidence tab with the real session
screenshots. Team names. "Roadmap: run it on every pull request." Repo and
live URL.

## Slides — 8, PDF, ≤ 25 words each

1. Title
2. The problem: demos that find everything prove nothing
3. The idea: seed first, audit, score
4. What Bob does: the pipeline diagram
5. Findings tab — real screenshot
6. Score tab — real numbers
7. Bob 2.0 features used: agent mode, parallel subagents, skills, rules
8. Roadmap, team, links
