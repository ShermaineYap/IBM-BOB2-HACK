# Audit checklist — OWASP ASVS 4.0 subset

Report only these classes. The `category` value is what goes in the JSON.

| category | ASVS | What to look for |
| --- | --- | --- |
| `sqli` | V5.3.4 | SQL built by string concatenation or template literals with any request-derived value. Parameterised queries (`?` placeholders with a params array) are fine. |
| `xss` | V5.3.3 | Request-derived values written into HTML or `res.send` of markup without encoding. |
| `weak-password-policy` | V2.1.1 | Password acceptance rule shorter than 12 characters or with no length rule. |
| `weak-hashing` | V2.4.1 | Passwords stored with MD5, SHA-1, SHA-256 or any unsalted fast hash. bcrypt/scrypt/argon2 are fine. |
| `hardcoded-secret` | V6.4.1 | Signing keys, API keys or passwords as literals in source. Reading from `process.env` is fine. |
| `missing-rate-limit` | V2.2.1 | Login or credential-checking endpoints with no rate limiting, lockout or delay. |
| `missing-authz` | V4.1.3 | Routes that expose privileged data (admin listings, other users' records) with no authentication or role check. |
| `info-leak` | V7.4.1 | Error handlers or responses that return stack traces, internal paths or raw exception messages to clients. |
| `session-ttl` | V3.3.2 | Session tokens with lifetimes over 24 hours and no refresh or revocation. Low severity. |
| `other` | — | Anything else clearly exploitable. Justify in `explanation`. Use sparingly. |
