# DevPulse project rules

- Audit targets are `sample_app/` (round 1) and `ledger_app/` (round 2, hard
  mode with decoys). Both are kept deliberately vulnerable. Never fix a target
  in place — fixes go to the round's `fixes/` folder as diffs.
- Never read any `ground_truth.json` file. They are answer keys.
- Use the Security Auditor mode (`.bob/custom_modes.yaml`) for audits: it
  can only write under `audit/`.
- Findings and fixes are written to files under `audit/`, in the formats the
  skills define. Do not put findings in chat only.
- Use subagents for per-file work and run them in parallel. Keep the main
  conversation for merging and decisions.
- Prefer the smaller model for read-only exploration.
- Every task that touches this repo gets a task session summary screenshot in
  `bob_sessions/` before the next task starts.
- Never commit `.env`, tokens, or keys. `scripts/check_secrets.sh` must pass.
