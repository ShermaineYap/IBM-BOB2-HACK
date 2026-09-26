---
name: generate-fixes
description: For each open finding in audit/findings.json, produce a minimal, correct fix as a unified diff under audit/fixes/ and mark the finding fixed. Use after the security-audit skill has run.
---

# Generate fixes

Input: a findings file (default `audit/findings.json`) with findings whose
`status` is `open`.
Output: one unified diff per finding in the `fixes/` folder next to that
findings file (e.g. `audit/hard/fixes/<id>.diff`), and the finding updated
with `fix_diff` and `status: "fixed"`.

## Method

1. Read `audit/findings.json`. Do not re-audit; work only from the findings.
2. For each finding, spawn a **general subagent** with `fork_context: false`
   and give it only: the finding object, the file it points at, and the rules
   below. Run subagents in parallel.
3. Each subagent returns a unified diff (`--- a/<path>` / `+++ b/<path>`,
   standard hunks) that fixes **only that finding**. It must not touch other
   lines, reformat, or rename things.
4. Write each diff to the fixes folder. Do **not** apply it to the target —
   targets stay vulnerable so the audit remains reproducible.
5. **Verify every diff before reporting it**: run `git apply --check <diff>`
   from the repository root. If it fails, the hunk headers or context are
   wrong — regenerate the diff by copying the target file to a scratch
   location, editing the copy, and producing the patch with
   `git diff --no-index`, then rewrite the paths to `a/<target>/…` and
   `b/<target>/…`. A diff that does not apply is not a fix.
6. Update the finding: `fix_diff: "audit/fixes/<id>.diff"`, `status: "fixed"`.
7. Report in one paragraph: how many fixes written, any finding you could not
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
