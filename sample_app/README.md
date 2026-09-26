# Shoply API — audit target

A small, realistic Express account service. It is the codebase that DevPulse
audits. It contains **seeded security defects** whose locations are recorded
in `../audit/ground_truth.json`, so the audit can be scored honestly.

Do not read `ground_truth.json` before running the audit. The point is to see
what Bob finds on its own.

Routes: `POST /auth/register`, `POST /auth/login`, `GET /users/:id`,
`GET /users/search`, `GET /admin/users`, `GET /health`.
