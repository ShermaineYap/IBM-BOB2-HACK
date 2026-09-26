---
name: security-audit
description: Audit a Node/Express codebase against a focused OWASP ASVS 4.0 checklist and write structured findings to audit/findings.json. Use when asked to audit, security-review, or scan sample_app/ or any route/service code for vulnerabilities.
---

# Security audit

You are auditing `sample_app/` (or the directory the user names) for security
defects. Your output is a **file**, not a chat message: `audit/findings.json`
by default, or the findings path the user names (for example
`audit/hard/findings.json` for `ledger_app/`). It must conform to
`audit/findings.schema.json`.

## Method

1. Read `checklist.md` in this skill folder. It lists the exact defect classes
   to look for, the ASVS requirement id for each, and the `category` tag you
   must use. Only report categories on that list, or `other` with a clear
   justification.
2. Enumerate every `.js` file under the target. For each file, spawn an
   **explore subagent** (read-only) that reads the file and returns candidate
   findings as JSON. Run the subagents **in parallel**, one per file. Do not
   read all files into the main conversation, because that wastes context and
   Bobcoins.
3. Merge the candidates. Remove duplicates. For each remaining candidate,
   re-open only the lines around it to confirm the `evidence` string is
   verbatim and the `line` number is exact (1-based, the first line of the
   offending statement).
4. Assign severity using `severity-guide.md`.
5. Write the findings file. Set `run.date` to now in ISO 8601,
   `run.mode` to the mode you are in, `run.subagents` to the subagent names
   you spawned, and `run.task_session_screenshot` to the filename the user
   will save under `bob_sessions/` for this task.
6. Report in chat, in one paragraph: how many files scanned, how many
   findings, the highest severity, and the path written. Nothing else.

## Rules for findings

- One finding per distinct defect. Two SQL injections in different functions
  are two findings.
- `evidence` is the offending source line(s) copied exactly. Never paraphrase.
- `explanation` is one or two sentences: what an attacker can do, in plain
  English. No boilerplate.
- `title` is under 100 characters and names the defect class and location,
  e.g. "SQL injection in login query".
- Do **not** report style issues, missing tests, or missing comments. This is
  a security audit.
- Do **not** report the same category twice for the same line.
- If you are unsure whether something is a defect, leave it out. Precision is
  scored.
- Do **not** read any `ground_truth.json` file. It is the answer key used to score
  you afterwards, and reading it invalidates the score.

## Output contract

The file must parse as JSON and validate against `audit/findings.schema.json`.
Finding ids are `F01`, `F02`, … in file order then line order. `status` is
`open` for every finding. Fixing is a separate skill.
