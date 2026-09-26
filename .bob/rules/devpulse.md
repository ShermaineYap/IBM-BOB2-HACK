# DevPulse project rules

- This repository has two parts: `sample_app/` (the audit target, kept
  deliberately vulnerable) and everything else (the DevPulse dashboard and
  tooling). Never "fix" `sample_app/` in place — fixes go to `audit/fixes/`
  as diffs.
- Never read `audit/ground_truth.json` unless the user explicitly asks you to
  score results. It is the answer key.
- Findings and fixes are written to files under `audit/`, in the formats the
  skills define. Do not put findings in chat only.
- Use subagents for per-file work and run them in parallel. Keep the main
  conversation for merging and decisions.
- Prefer the smaller model for read-only exploration.
- Every task that touches this repo gets a task session summary screenshot in
  `bob_sessions/` before the next task starts.
- Never commit `.env`, tokens, or keys. `scripts/check_secrets.sh` must pass.
