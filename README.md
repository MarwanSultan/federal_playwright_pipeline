# Federal Security Playwright Platform

Security-focused, auditable Playwright automation for approved non-production environments.

## Setup and test execution

### Local setup

1. Install Node.js 22.x and npm.
2. Copy `.env.example` to `.env` and replace placeholders only with approved non-secret target configuration.
3. Install dependencies with `npm ci`.
4. Install the Chromium browser with `npm run install:browsers`.

Run the quality gates with `npm run format:check`, `npm run lint`, `npm run typecheck`, and `npm run traceability:validate`. Run all tests with `npm test`, smoke tests with `npm run test:smoke`, security tests with `npm run test:security`, or the five mission-critical tests with `npm run test:critical`. View the HTML report with `npm run test:report`.

### Docker setup

Install Docker Desktop or another compatible Docker Engine. Build and run the complete container pipeline with `npm run docker:pipeline`. Run individual container services with `npm run docker:validate`, `npm run docker:test`, `npm run docker:security`, or `docker compose run --rm critical-tests`. Reports are written to `playwright-report/` and `test-results/`.

### CI execution

Every commit pushed to any branch and every pull request triggers the GitHub Actions workflows. The Playwright workflow builds the pinned Docker image, runs validation in the `validate` container, runs the complete suite in the `framework` container, and uploads reports. The security workflow runs dependency, secret, SAST, Semgrep, and workflow security checks.

### Mission-critical test configuration

Five contract-driven cases are defined in `tests/critical/mission-critical.spec.ts`:

1. `MCF-001` — authenticate an approved synthetic user.
2. `MCF-002` — complete the primary user journey.
3. `MCF-003` — submit and confirm a critical business transaction.
4. `MCF-004` — enforce the critical role and privilege boundary.
5. `MCF-005` — complete the session and expose its audit confirmation.

These cases intentionally do not invent application endpoints or acceptance criteria. Set `CRITICAL_WORKFLOWS_READY=true`, `BASE_URL`, and the five approved path/marker pairs in `.env` only after the application owner provides the contract and authorizes the non-production target. Markers must be synthetic, non-sensitive UI text. Tests skip with an explicit onboarding reason until all required values are present.

The default smoke test performs no network request and verifies only that an optional `BASE_URL` uses HTTP(S). Concrete application tests require an approved API/UI contract, configured target, and synthetic role/resource fixtures.

## Container execution

The framework is built and executed in the pinned Playwright image defined by `Dockerfile`. The image installs dependencies from `package-lock.json`, includes the matching Playwright browsers, runs as the non-root `pwuser`, drops Linux capabilities, enables `no-new-privileges`, and uses a read-only filesystem with a temporary `/tmp` under Compose.

Use the Compose services `validate`, `framework`, and `security-tests` for source validation, all tests, and security tests. Reports are written to the local `playwright-report/` and `test-results/` directories through explicit volumes. Do not pass secrets through the image or bake them into layers; provide only approved non-production values at runtime through a protected environment.

The complete local container pipeline is available through the `docker:pipeline` npm script. Docker Desktop or another compatible Docker Engine must be running. In CI, the workflow builds the image with `--pull`, validates it, executes all tests in it, and uploads the resulting evidence.

## FedRAMP-oriented testing strategy

This repository provides repeatable automated assurance and reviewable evidence for an application intended for a federal environment. It is **not** a FedRAMP certification, authorization, agency ATO, SSP, POA&M, or independent assessment.

The official [FedRAMP Marketplace guide](https://www.fedramp.gov/marketplace/guide) states that certification provides security materials for agency ATO decisions and does not grant an ATO. The [FedRAMP disclaimers](https://www.fedramp.gov/disclaimers) warn that program information changes; reviewers must verify current guidance before release.

The strategy is contract-driven: use actual application requirements, synthetic data, and authorized non-production environments. Test source validation, functional UI/API behavior, authentication, authorization, session management, audit events, input handling, security configuration, supply chain, and evidence. Do not invent endpoints, roles, workflows, or control applicability.

The framework can validate application behavior, selected identity/access behavior, security regression, API/input handling, audit-event behavior, configuration behavior, dependency checks, and secure-development pipeline practices. It cannot independently establish organizational policy, personnel or physical controls, infrastructure authorization, complete FedRAMP authorization, agency risk acceptance, SSP/POA&M completeness, or independent assessor conclusions.

## Security control traceability

The machine-readable source is [`traceability/security-controls.json`](traceability/security-controls.json). Each record links a security objective to a requirement, test identifier, automation, CI stage, evidence, and status.

| Control/objective      | Requirement                                     | Test          | Automation                        | CI stage            | Evidence                                  | Status                          |
| ---------------------- | ----------------------------------------------- | ------------- | --------------------------------- | ------------------- | ----------------------------------------- | ------------------------------- |
| AC — least privilege   | Actual role/resource contract required          | SEC-AUTHZ-001 | Authorization onboarding template | security-validation | Sanitized trace, JUnit, redacted response | Partially implemented           |
| AU — accountability    | Attributable, reviewable test evidence          | EVID-001      | Evidence reporters and redaction  | evidence            | HTML/JUnit/trace/screenshot               | Implemented                     |
| IA — secret protection | No secrets or production PII in artifacts       | EVID-002      | Redaction tests and scanning      | security            | Scan and test results                     | Partially implemented           |
| SI/SR — supply chain   | Pinned dependencies and vulnerability scans     | SCA-001       | npm audit and approved scanners   | security            | Machine-readable scan                     | Partially implemented           |
| CA — boundary          | Automation does not establish ATO/certification | MANUAL-001    | Architecture review               | release-gate        | Review record                             | Independent assessment required |

Statuses distinguish implemented, partially implemented, not applicable, organizational/process control, infrastructure control, and independent assessment required. Update mappings with actual application requirements.

## Security test catalog

All tests require an authorized non-production target and synthetic data.

| ID            | Area               | Expected assurance                                                            | Evidence                                |
| ------------- | ------------------ | ----------------------------------------------------------------------------- | --------------------------------------- |
| SEC-AUTHN-001 | Authentication     | Valid synthetic user authenticates; invalid credentials fail safely           | Sanitized UI/API result and trace       |
| SEC-AUTHN-002 | Session            | Expiry, refresh, logout, and invalidation match the contract                  | Redacted response and timestamps        |
| SEC-AUTHN-003 | MFA/lockout        | MFA and lockout match the identity contract                                   | Result and identity-provider evidence   |
| SEC-AUTHZ-001 | Authorization      | Least privilege and horizontal/vertical escalation protections                | Role matrix and redacted response       |
| SEC-AUDIT-001 | Audit              | Events contain timestamp, actor, type, context, result, and resource          | Safe event record                       |
| SEC-INPUT-001 | Input validation   | Malformed, excessive, and authorized boundary inputs are safe                 | Status/result without sensitive payload |
| SEC-API-001   | API security       | Protected endpoints reject missing, invalid, expired, or tampered credentials | Redacted API result                     |
| SEC-NEG-001   | Critical workflows | Five highest-risk workflows have authorized abuse-case coverage               | Matrix and artifacts                    |

Concrete selectors, endpoints, roles, data, and expected status codes must come from the application contract. Do not run destructive penetration tests against production.

## DevSecOps and CI security

The pipeline stages are source validation (format, lint, strict TypeScript, lockfile), security (SAST, SCA, secret/configuration scanning), functional UI/API/smoke tests, security validation, broader regression, sanitized evidence, and configurable release gates. The Playwright validation and test stages build and execute the framework inside Docker; security scanners use their own pinned or vendor-managed scanner containers/actions.

Every push and pull request triggers both workflows. Security validation includes GitHub CodeQL (JavaScript/TypeScript), Semgrep rulesets, Gitleaks secret detection, OSV-Scanner lockfile analysis, `npm audit`, and zizmor GitHub Actions analysis. Pull requests from forks receive no repository secrets; Semgrep publishes findings only when the optional protected `SEMGREP_APP_TOKEN` is available, while local scan results remain enforced.

Dependencies are pinned in `package.json` and `package-lock.json`. Third-party actions must be reviewed and pinned by commit SHA according to production policy. Workflows use explicit least-privilege permissions, do not expose secrets to untrusted fork pull requests, avoid untrusted shell interpolation, and treat caches/artifacts as untrusted inputs.

Default engineering guidance is: Critical findings fail the pipeline; High findings fail or require an explicitly approved exception; Medium and Low findings are reported and tracked. The owning organization must supply the authoritative risk-acceptance and remediation policy.

Enable only justified schedules for smoke/critical journeys, authentication/authorization regression, dependency scans, and deeper periodic security validation. Record tool versions, timestamps, commit/run identifiers, status, and safe artifact references.

## Secure development and vulnerability reporting

Use synthetic data, approved non-production targets, strict review, pinned dependencies, lockfile changes, SAST/SCA/secret scanning, and least-privilege CI. Never commit credentials, tokens, cookies, private keys, API keys, PII, or sensitive federal information.

Secrets must come from an approved local secret store or protected CI environment. Do not print them, include them in screenshots/traces, or place them in fixtures. Review artifacts before retention and apply organizational retention/access policy.

Do not disclose suspected vulnerabilities in public issues. Use the owning organization's approved vulnerability-reporting channel and include only minimum safe reproduction details. Test only systems and environments for which authorization exists.

## Onboarding checklist

Before enabling concrete security tests, obtain the target URL/API contract, identity provider and MFA behavior, roles/resources, five critical workflows, audit-event contract, security headers/cookies/CORS/CSP expectations, data classification, authorized environments, and evidence-retention requirements. Then replace placeholders with source-anchored tests, synthetic users/resources, and updated traceability records.

## Author

Marwan Sultan

## References

- [FedRAMP](https://www.fedramp.gov/)
- [FedRAMP Marketplace guide](https://www.fedramp.gov/marketplace/guide)
- [FedRAMP 2026 updates](https://www.fedramp.gov/changelog)
- NIST SP 800-53, SP 800-53A, SP 800-218 (SSDF), SP 800-161, and SP 800-63
- OWASP ASVS and OWASP API Security Top 10
