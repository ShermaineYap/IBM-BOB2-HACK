# Audit checklist — OWASP ASVS 4.0 subset

Report only these classes. The `category` value is what goes in the JSON.
This list is general-purpose: most targets will contain only a few of them.

| category | ASVS | What to look for |
| --- | --- | --- |
| `sqli` | V5.3.4 | SQL built by concatenation or template literals with any request-derived value. Parameterised values are fine; identifiers chosen from a fixed allow-list are fine. |
| `xss` | V5.3.3 | Request- or database-derived values written into HTML without encoding. Values passed through a proper escape function are fine. |
| `command-injection` | V5.3.8 | `exec`/`execSync`/shell strings containing request-derived values. `execFile`/`spawn` with a fixed argument array are fine. |
| `path-traversal` | V12.3.1 | File paths built from request input without `basename` or a resolved-prefix containment check. |
| `ssrf` | V12.6.1 | Server-side HTTP requests to user-supplied URLs without an allow-list. |
| `open-redirect` | V5.1.5 | Redirects to user-supplied URLs without restricting to same-site relative paths. |
| `prototype-pollution` | V5.1.5 | Recursive merge/assign of untrusted objects without guarding `__proto__`, `constructor`, `prototype`. |
| `mass-assignment` | V5.1.2 | Request bodies copied wholesale onto models (`Object.assign`, spread) where privileged fields can be set. |
| `missing-authz` | V4.1.3 / V4.2.1 | Routes that expose or modify other users' records or privileged data without an ownership or role check (includes IDOR). |
| `broken-auth` | V3.5.3 | Tokens decoded without signature verification, algorithm not pinned, or auth decisions on unverified claims. |
| `csrf` | V4.2.2 | Cookie-authenticated state-changing routes without CSRF protection. Bearer-token APIs are not CSRF-prone. |
| `cors-misconfig` | V14.5.3 | Reflecting arbitrary origins with credentials allowed. |
| `insecure-deserialization` | V5.5.1 | `eval`, `Function`, unsafe YAML or serialisation of untrusted input. |
| `weak-password-policy` | V2.1.1 | Password acceptance rule shorter than 12 characters or with no length rule. |
| `weak-hashing` | V2.4.1 | Passwords stored with MD5, SHA-1, SHA-256 or any unsalted fast hash. bcrypt/scrypt/argon2 are fine. |
| `weak-random` | V6.3.1 | `Math.random()` for tokens, ids or secrets. `crypto.randomBytes`/`randomUUID` are fine. |
| `insecure-compare` | V2.9.1 | Secrets, keys or signatures compared with `===`/`==` instead of a constant-time comparison. |
| `hardcoded-secret` | V6.4.1 | Signing keys, API keys or passwords as literals in source. Reading from `process.env` is fine. |
| `missing-rate-limit` | V2.2.1 | Login or credential-checking endpoints with no rate limiting, lockout or delay. |
| `info-leak` | V7.1.1 / V7.4.1 | Stack traces or raw errors returned to clients; sensitive request data written to logs. |
| `session-ttl` | V3.3.2 | Session tokens with lifetimes over 24 hours and no refresh or revocation. |
| `redos` | V5.1.4 | Regular expressions with nested quantifiers applied to user input. |
| `other` | — | Anything else clearly exploitable. Justify in `explanation`. Use sparingly. |

**Safe patterns are common in real code.** Before reporting, check whether the
code already neutralises the risk (allow-list, escape, containment check,
constant-time compare, pinned algorithm). If it does, do not report it.
Precision is scored.
