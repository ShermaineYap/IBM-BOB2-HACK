# bob_sessions/

This folder holds the **real** IBM Bob IDE task session consumption summary
screenshots for every Bob task that produced this project. Nothing else goes
here, and nothing in here is generated or mocked.

## How to capture one

1. In Bob IDE, open the chat panel and click **Tasks**.
2. Select the task.
3. Click the **task header**. The Task Session Consumption Summary opens.
4. Screenshot it. PNG only.
5. Save it here as `devpulse_taskNN_<short-description>_summary.png`, e.g.
   `devpulse_task01_seed_sample_app_summary.png`.

Do this **immediately after each task**, not at the end.

## Expected tasks

| # | Task | File |
| --- | --- | --- |
| 01 | Run the security-audit skill on `sample_app/` (Agent mode, subagents) | `devpulse_task01_security_audit_summary.png` |
| 02 | Generate fixes for each finding into `audit/fixes/` | `devpulse_task02_generate_fixes_summary.png` |
| 03 | Any further Bob task that touched this repo | `devpulse_task03_..._summary.png` |

The dashboard's Evidence tab picks up every PNG in this folder automatically.
