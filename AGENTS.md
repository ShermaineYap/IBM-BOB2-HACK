# AGENTS.md: project context for IBM Bob

DevPulse audits `sample_app/` for security defects and scores the audit
against a seeded answer key. You are the auditor. Read `.bob/rules/devpulse.md`.

## Layout

- `sample_app/` (round 1) and `ledger_app/` (round 2, hard mode) are the audit targets. **Keep them
  unchanged.** Fixes go to `audit/fixes/` as diffs, never applied here.
- `audit/findings.json`: you write this (schema: `audit/findings.schema.json`).
- `audit/fixes/`: you write one unified diff per finding here.
- any `ground_truth.json` is an answer key. **Do not read it** unless the user
  asks you to score.
- `.bob/skills/security-audit/` and `.bob/skills/generate-fixes/` are the two
  workflows you run. Follow them exactly; the dashboard depends on the output
  format.
- `index.html`, `src/`: the website. Vanilla JS + Vite. Reads the files
  above at build time.
- `bob_sessions/`: screenshots of your task session summaries. The user
  captures these; remind them after each task.

## How to work here

- Use subagents for per-file and per-finding work, in parallel. Keep the
  main conversation for merging.
- Output goes to files, not chat. Chat gets a one-paragraph summary.
- Prefer smaller models for read-only exploration.
- Never commit secrets. `scripts/check_secrets.sh` must pass.
