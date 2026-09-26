# Submission — values and checklist

## lablab.ai form

| Field | Value |
| --- | --- |
| Project title | DevPulse — Don't trust an AI security audit. Measure it. |
| Short description | IBM Bob 2.0 audits and fixes seeded codebases in a custom Security Auditor mode with parallel subagents; DevPulse scores it against a hidden answer key with decoys and verifies every fix applies. 22/22 defects, 0 false positives, 0/7 decoys flagged. |
| Technology tags | IBM Bob IDE 2.0, JavaScript, Node.js, Express, Vite, OWASP ASVS, SARIF |
| Category | Developer tools · Code review · DevSecOps |
| Demo platform | Vercel |
| Application URL | https://ibm-bob-2-hack.vercel.app/ |
| Repository | https://github.com/ShermaineYap/IBM-BOB2-HACK |
| Video | _(MP4, ≤ 5 min)_ |
| Slides | _(PDF)_ |
| Cover image | 16:9 PNG of the Overview page |

## Long description (paste)

Every AI code-review demo shows a scan that finds everything. That proves
nothing, because you can't see what it missed or how often it cries wolf.
DevPulse measures instead.

We seed real Express codebases with known OWASP ASVS defects — and, in hard
mode, with decoys: code that looks dangerous but is safe. The answer key is
hidden from Bob. IBM Bob 2.0 then works as a multi-step agent inside a custom
🛡️ Security Auditor mode that can read everything but only write under
audit/. A project skill fans out one read-only explore subagent per file in
parallel, merges and re-verifies every evidence line, and writes structured
findings. A second skill spawns one general subagent per finding to write a
minimal fix diff that must pass git apply --check.

A scorer compares Bob's output with the answer key. Results: round 1, 10/10
defects with no false positives; round 2 (hard mode), 12/12 including IDOR,
jwt.decode auth bypass, SSRF, path traversal, command injection and prototype
pollution — with 0 false positives and none of the 7 decoys flagged.

The most useful moment came from the verification step: in round 1 every fix
Bob wrote was the right remedy, but 8 of 10 diffs would not apply. DevPulse
caught it, and the rule went back into the Bob skill. Findings export as
SARIF for GitHub code scanning, and the dashboard renders only files Bob and
the scorer wrote. All Bob tasks, with Bobcoin cost, are in bob_sessions/.

## Before you submit

- [x] Findings for both rounds written by Bob
- [ ] Round 2 fixes written by Bob and scored
- [x] Real task session PNGs in `bob_sessions/` for every Bob task so far
- [x] `bash scripts/check_secrets.sh` passes
- [x] Deployed to Vercel: https://ibm-bob-2-hack.vercel.app/
- [x] Repo is public, MIT LICENSE present
- [ ] Video ≤ 5 min, MP4
- [ ] Slides PDF
- [ ] Cover image 16:9
- [ ] Submit by ~7 PM Sunday (deadline 11 PM MYT)
- [ ] After results: fill in the lablab feedback form (participant reward)

## Video script — 4:45

**0:00–0:25 — Problem.** "Every AI security demo shows a scan that finds
everything. That tells you nothing — you can't see what it missed, or how
often it cries wolf. We wanted a number you could trust before letting an AI
gate your releases."

**0:25–0:50 — Setup.** Show `ledger_app/`. "A real invoicing API. We planted
twelve subtle vulnerabilities — and seven decoys, code that looks dangerous
but is safe. The answer key is hidden from Bob."

**0:50–1:50 — Bob audits.** Screen-record Bob IDE. Show the 🛡️ Security
Auditor mode: "It can read everything, but it can only write under audit/ —
the auditor can't touch the code it audits." Run the skill; show six explore
subagents fanning out in parallel; show findings.json appear.

**1:50–2:20 — Score.** Run `node scripts/score_audit.mjs audit/hard`. Read the
numbers aloud: 12 of 12, zero false positives, zero decoys flagged. Show the
Benchmark tab with the decoys marked "left alone".

**2:20–3:10 — The catch.** "Round one taught us something." Show the Overview
bar: 2 of 10 fixes applied as first written. "Every fix was the right remedy —
but the patches were broken. Without verification, that's an afternoon of
rework the AI was supposed to save. So verification became a rule inside the
Bob skill." Show round 2's fix result.

**3:10–3:50 — Why it matters.** "Engineering leads bought AI code generation.
What they can't do is certify it. DevPulse gives them recall and precision on
their own code, and ships findings as SARIF straight into GitHub code
scanning."

**3:50–4:25 — Built with Bob.** Evidence tab: every task, its Bobcoin cost —
under six Bobcoins for everything. Show `.bob/` — custom mode, two skills,
rules.

**4:25–4:45 — Close.** "Next: run it on every pull request with Bob Shell.
DevPulse — don't trust an AI security audit, measure it." Team names, URL.

## Slides — 9, PDF, ≤ 25 words each

1. DevPulse — Don't trust an AI security audit. Measure it.
2. The problem: demos that find everything prove nothing
3. The method: seed defects + decoys, hide the answer key
4. Bob as auditor: custom mode, skills, parallel subagents (diagram)
5. Round 2 results: 12/12, 0 false positives, 0/7 decoys
6. The catch: 2/10 fixes applied → verification became a Bob rule
7. Who pays and why: certify AI output; SARIF into GitHub
8. Built with Bob: tasks, Bobcoins, `.bob/` config
9. Roadmap, team, links
