# Severity

- **high** — remotely exploitable by an unauthenticated user, or leads to
  account takeover or bulk data exposure. Examples: SQL injection, reflected
  XSS on a public route, hardcoded signing secret, unauthenticated admin
  endpoint, unsalted fast-hash password storage.
- **medium** — exploitable but needs volume, luck or a second weakness.
  Examples: no rate limiting on login, weak password policy, stack traces
  returned to clients.
- **low** — weakens defence in depth. Examples: long session lifetime.
