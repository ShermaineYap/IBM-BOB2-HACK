# DevPulse

**Live site:** https://ibm-bob-2-hack.vercel.app/ · **Video:** _(link)_

We hid 22 security bugs in two small Express apps, asked IBM Bob 2.0 to find
and fix them, and graded its work against an answer key it never saw.

We built this for the IBM Bob 2.0 Hackathon (September 2026) because every AI
code review demo we'd seen had the same gap. The tool lists a bunch of
problems and everyone nods, but nobody knows what it missed or how many of
those problems were real. If you're deciding whether to let an AI reviewer
anywhere near your pull requests, those are the two numbers you need.

## What happened

| | Round 1 (warm-up) | Round 2 (hard) |
| --- | --- | --- |
| App | `sample_app/`, a login and user API | `ledger_app/`, an invoicing and file API |
| Bugs we planted | 10 | 12 |
| Traps (safe code that looks risky) | none | 7 |
| Bugs Bob found | 10 of 10 | 12 of 12 |
| False alarms | 0 | 0 |
| Traps Bob fell for | n/a | 0 of 7 |
| Patches that applied | 2 of 10 as written, 10 of 10 after we fixed the line numbers | _in progress_ |
| Bobcoins | 3.49 (including one task we abandoned) | 1.01 so far |

Round 1's bugs are the textbook kind: SQL built with string concatenation,
MD5 password hashes, a hardcoded JWT secret. Round 2 is harder. It has an
IDOR on invoices, an admin check that uses `jwt.decode` instead of
`jwt.verify`, SSRF, path traversal, command injection, prototype pollution,
mass assignment and a regex that can be made to hang. It also has seven traps,
like a SQL `ORDER BY` built from a template string that's actually safe
because the column comes from a fixed list.

The part we didn't expect was the patches. In round 1 Bob picked the right
fix every time, but 8 of its 10 diffs wouldn't apply because the line counts
in the hunk headers were wrong. We tried asking Bob to repair them. That
didn't go well, so we stopped it and regenerated the headers with
`git diff --no-index` (the code in the patches stayed the same). Then we
added a rule to Bob's fix skill: a patch doesn't count until it passes
`git apply --check`. Round 2 tells us whether that rule works.

All the numbers above come from `scripts/score_audit.mjs`, which writes them
to `audit/**/metrics.json`. We didn't type any of them in by hand.

## How it works

1. **We plant the bugs.** Each app has an answer key in
   `audit/**/ground_truth.json`. Bob's rules tell it not to open those files,
   and `.bobignore` hides them from it anyway.
2. **Bob audits.** It runs in a custom Security Auditor mode
   (`.bob/custom_modes.yaml`) that can read the whole repo but can only save
   files under `audit/`. The `security-audit` skill gives each file its own
   read-only subagent, runs them in parallel, then merges the results and
   re-reads every line it's about to report.
3. **Bob fixes.** The `generate-fixes` skill gives each finding its own
   subagent, which writes a small patch and checks it applies.
4. **A script marks it.** A finding counts if it names the right kind of bug
   in the right file, within three lines of where we put it. Everything else
   is a false alarm. The script also tries every patch.
5. **The results go somewhere useful.** `scripts/to_sarif.mjs` turns the
   findings into a SARIF file that GitHub code scanning can read, and the
   website shows the same data.

### The Bob features we leaned on

- **A custom mode** that physically can't edit the apps it's auditing
- **Subagents** running in parallel, one per file for audits and one per
  finding for fixes
- **Skills** so Bob follows the same checklist and output format every time
- **Rules** and **AGENTS.md** for project context
- **`.bobignore`** to keep the answer keys out of Bob's context
- **Task summaries** for every run, saved in `bob_sessions/`

## If you're judging

- **How Bob is used:** Bob does the auditing and the fixing. Our code only
  sets up the test and marks it. See `.bob/` and the *How it works* page.
- **Presentation:** the live site has a short "if you only have a minute"
  list on the front page.
- **Why it's useful:** teams already using AI to write code need a way to
  decide how far to trust it. This gives them a hit rate on their own code,
  and the findings drop straight into GitHub.
- **What's new here:** the audit itself isn't the point. Grading it is. The
  traps measure false alarms, and checking the patches caught a real problem
  in round 1.

## Run it yourself

```bash
git clone https://github.com/ShermaineYap/IBM-BOB2-HACK && cd IBM-BOB2-HACK
npm install

# In Bob IDE, switch to the Security Auditor mode, then ask:
#   "Run the security-audit skill on ledger_app/ and write audit/hard/findings.json"
#   "Run the generate-fixes skill on audit/hard/findings.json"

node scripts/score_audit.mjs audit/hard
node scripts/to_sarif.mjs audit/hard
npm run dev
```

## What's in the repo

```
.bob/                  Bob's custom mode, skills and rules
sample_app/            round 1 app
ledger_app/            round 2 app
audit/                 round 1 answer key, findings, patches, scores, SARIF
audit/hard/            same for round 2
audit/runs.json        every Bob task we ran and what it cost
scripts/               the scoring and SARIF scripts
bob_sessions/          screenshots of each Bob task summary
index.html, src/       the website
```

## About the data

We wrote both apps and both answer keys ourselves. There's no client data,
personal data or anything scraped. The "secrets" in the apps are fake and are
there on purpose.

## What we'd do next

Run it on every pull request using Bob Shell's non-interactive mode, and let
teams plant their own bugs so they can test an AI reviewer on their own stack.

## Team

Shermaine Yap and Caiting.

## Licence

MIT. See [LICENSE](LICENSE).
