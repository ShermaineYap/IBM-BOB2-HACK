---
name: generate-fixes
description: For each open finding in audit/findings.json, produce a minimal, correct fix as a unified diff under audit/fixes/ and mark the finding fixed. Use after the security-audit skill has run.
---

# Generate fixes

Input: `audit/findings.json` with findings whose `status` is `open`.
Output: one unified diff per finding at `audit/fixes/<id>.diff`, and the
finding updated with `fix_diff` and `status: "fixed"`.

## Method

1. Read `audit/findings.json`. Do not re-audit; work only from the findings.
2. For each finding, spawn a **general subagent** with `fork_context: false`
   and give it only: the finding object, the file it points at, and the rules
   below. Run subagents in parallel.
3. Each subagent returns a unified diff (`--- a/<path>` / `+++ b/<path>`,
   standard hunks) that fixes **only that finding**. It must not touch other
   lines, reformat, or rename things.
4. Write each diff to `audit/fixes/<id>.diff`. Do **not** apply it to
   `sample_app/` — the sample app stays vulnerable so the audit remains
   reproducible. The dashboard shows before/after from the diff.
5. Update the finding: `fix_diff: "audit/fixes/<id>.diff"`, `status: "fixed"`.
6. Report in one paragraph: how many fixes written, any finding you could not
   fix and why.

## Fix rules

- Smallest correct change. A parameterised query, not a new ORM.
- Prefer standard, well-known remedies: `?` placeholders; `bcrypt` with cost
  12; `express-rate-limit`; reading secrets from `process.env` with a startup
  check; HTML-escaping helper for reflected values; `requireAuth` plus an
  admin check; error handler that logs the stack and returns a generic message.
- If a fix needs a new dependency, add it to `sample_app/package.json` in the
  same diff.
- A diff that would change behaviour beyond the finding is wrong. Leave a
  note in `explanation` instead.
