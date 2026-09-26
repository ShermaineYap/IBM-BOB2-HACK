# Submission notes

## lablab.ai form

| Field | Value |
| --- | --- |
| Project title | DevPulse: grading IBM Bob as a security auditor |
| Short description | We hid 22 security bugs and 7 traps in two apps, had IBM Bob find and fix them, and marked its work against an answer key it never saw. It found all 22 with no false alarms. |
| Technology tags | IBM Bob IDE 2.0, JavaScript, Node.js, Express, Vite, OWASP ASVS, SARIF |
| Category | Developer tools · Code review · Security |
| Demo platform | Vercel |
| Application URL | https://ibm-bob-2-hack.vercel.app/ |
| Repository | https://github.com/ShermaineYap/IBM-BOB2-HACK |
| Video | _(MP4, 5 min max)_ |
| Slides | _(PDF)_ |
| Cover image | 16:9 screenshot of the site's front page |

## Long description (paste)

Every AI code review demo we've watched goes the same way. The tool lists
some problems, everyone's impressed, and nobody asks what it missed or how
many of those problems were real. Those are exactly the things you need to
know before you let an AI reviewer anywhere near your releases.

So we tested IBM Bob like an exam. We wrote two small Express apps and hid
security bugs in them: 10 obvious ones in the first, 12 subtler ones in the
second (an IDOR, an admin check using jwt.decode instead of jwt.verify, SSRF,
path traversal, command injection, prototype pollution and more). The second
app also has seven traps, bits of code that look dangerous but are fine. The
answer keys are hidden from Bob.

Bob does the actual work. We gave it a custom Security Auditor mode that can
read the whole project but can only write to the audit folder, so it can't
touch the code it's checking. A skill splits the audit across subagents, one
per file, running in parallel, and Bob writes its findings to JSON. A second
skill gives each finding to its own subagent to write a patch.

A script then marks everything. Bob found all 22 bugs, raised no false
alarms, and didn't fall for any of the traps. The patches were more
interesting: in round one Bob chose the right fix every time, but 8 of 10
diffs wouldn't apply because the line numbers were off. We added a rule
that every patch has to pass git apply --check, and round two shows whether
that fixed it.

Findings export as SARIF so they show up in GitHub code scanning. The website
only displays files Bob and the scoring script wrote, and every Bob task is
in the bob_sessions folder with what it cost. Everything so far has used
under 6 of our 40 Bobcoins.

## Before you submit

- [x] Findings for both rounds written by Bob
- [ ] Round 2 fixes written by Bob and scored
- [x] Real task session PNGs in `bob_sessions/` for every Bob task so far
- [x] `bash scripts/check_secrets.sh` passes
- [x] Deployed to Vercel: https://ibm-bob-2-hack.vercel.app/
- [x] Repo is public, MIT LICENSE present
- [ ] Video, 5 min max, MP4
- [ ] Slides PDF
- [ ] Cover image 16:9
- [ ] Submit by ~7 PM Sunday (deadline 11 PM MYT)
- [ ] After results: fill in the lablab feedback form (participant reward)

## Video script (about 4:45)

Talk like you're explaining it to a friend. These are notes, not lines to
read word for word.

**0:00 to 0:25, the problem.** "Every AI code review demo looks great. It
finds a bunch of stuff. But you never find out what it missed, or how many of
those were real. That's what we wanted to know about Bob."

**0:25 to 0:50, the setup.** Show `ledger_app/`. "This is a small invoicing
API. We hid twelve bugs in it, and seven traps, code that looks risky but
isn't. Bob doesn't get to see the answer key."

**0:50 to 1:50, Bob audits.** Screen-record Bob IDE. Point at the Security
Auditor mode: "It can read everything, but it can only write to this one
folder, so it can't touch the app." Run the skill. Let the subagents show up
in the panel. Show the findings file appear.

**1:50 to 2:20, the score.** Run `node scripts/score_audit.mjs audit/hard`.
"Twelve out of twelve. No false alarms. It didn't fall for any of the traps."
Show the Scores page with the traps marked "not fooled".

**2:20 to 3:10, the patches.** "Round one taught us something." Show the red
and green bars on the front page. "Bob picked the right fix every time, but
eight of the ten patches wouldn't apply. Nobody would have noticed until
someone tried to merge. So we made checking the patch part of Bob's job."
Show how round two's patches did.

**3:10 to 3:50, why it matters.** "If your team is already using AI to write
code, the question is how much to trust it. This gives you an actual number,
on your own code. And the results go straight into GitHub's code scanning."

**3:50 to 4:25, built with Bob.** Show the Bob sessions page. "Every task we
ran is here, including the one that didn't work, and what it cost. All of
this used about six Bobcoins." Show the `.bob` folder.

**4:25 to 4:45, wrap up.** "Next we'd run this on every pull request with Bob
Shell. Thanks for watching." Names and the link.

## Slides (9, PDF)

Keep each slide to one idea and very few words.

1. DevPulse: grading IBM Bob as a security auditor
2. AI review demos never tell you what they missed
3. So we hid 22 bugs and 7 traps, and kept the answer key
4. How Bob does the work: custom mode, skills, subagents
5. Round 2: 12 of 12 found, no false alarms, no traps triggered
6. Round 1's surprise: right fixes, broken patches
7. Who'd use this, and how it plugs into GitHub
8. What it cost: every Bob task and its Bobcoins
9. What's next, who we are, links
