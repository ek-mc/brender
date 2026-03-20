# Security Policy

## Reporting a Vulnerability

If you discover a security issue, please open a GitHub issue or PR in this repository.

Include:
- Description of the issue
- Reproduction steps
- Potential impact
- Suggested mitigation/fix (if available)

## Scope

Security-sensitive areas in this project include:
- HTTP request handling and input parsing
- CLI argument handling
- Any auth tokens/environment variables
- Output written to local files

## Hardening Notes

- Do not commit secrets or API tokens.
- Use environment variables for credentials.
- Validate and sanitize user-provided input.
- Keep dependencies up to date.
