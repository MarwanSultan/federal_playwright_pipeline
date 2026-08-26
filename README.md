# Federal Security Playwright Platform

Security-focused, auditable Playwright test automation for **authorized non-production federal applications**.

Built with modern Quality Engineering, DevSecOps, and software engineering practices for scalable, repeatable, and evidence-driven testing.

## Technology

- **Playwright + TypeScript** — UI and API automation
- **Node.js + npm** — runtime and dependency management
- **Docker** — reproducible test execution
- **GitHub Actions** — CI/CD automation
- **ESLint + Prettier + TypeScript** — code quality and static validation
- **CodeQL, Semgrep, Gitleaks, OSV-Scanner, npm audit, zizmor** — security and supply-chain validation
- **HTML/JUnit/trace artifacts** — test evidence and diagnostics

## Quality Engineering

The framework applies:

- Shift-left testing and pull-request quality gates
- UI, API, smoke, regression, and security testing
- Contract-driven critical workflow validation
- Test isolation and deterministic execution
- Reusable automation components
- Traceability from requirements to tests and evidence
- Containerized and reproducible execution
- Least-privilege CI/CD permissions
- Dependency and secret protection
- Automated security and code-quality gates

## Project Structure

```text
.github/workflows/     CI/CD and security automation
scripts/               Validation and automation utilities
specs/                 Test and application specifications
src/evidence/          Evidence generation and handling
tests/                 UI, API, smoke, security, and critical tests
traceability/          Requirement/control-to-test mappings
Dockerfile             Containerized execution environment
docker-compose.yml     Local multi-stage test execution
playwright.config.ts   Playwright configuration
eslint.config.mjs      Static analysis configuration
```

## Quick Start

```bash
npm ci
npm run install:browsers

npm run format:check
npm run lint
npm run typecheck
npm run traceability:validate

npm test
```

### Targeted Testing

```bash
npm run test:smoke
npm run test:security
npm run test:critical
npm run test:report
```

### Docker

```bash
npm run docker:pipeline
```

Reports and execution evidence are generated under:

```text
playwright-report/
test-results/
```

### CI/CD

GitHub Actions validates source quality, security, Docker execution, automated tests, and evidence generation on repository changes. The pipeline is designed to provide fast feedback while enforcing security and quality gates before delivery.

## Mission-Critical Workflows

The framework provides contract-driven coverage for five high-risk workflows:

| ID      | Workflow                   |
| ------- | -------------------------- |
| MCF-001 | Authentication             |
| MCF-002 | Primary user journey       |
| MCF-003 | Critical transaction       |
| MCF-004 | Authorization boundary     |
| MCF-005 | Audit/session confirmation |

Concrete endpoints, roles, expected behavior, and test data must come from an **approved application contract**. Tests use synthetic data and authorized non-production environments.

## Security

Security is integrated throughout the SDLC through:

- SAST
- Software composition analysis
- Secret detection
- GitHub Actions security analysis
- Dependency scanning
- Secure container execution
- Least-privilege CI permissions
- Artifact/evidence protection

Never commit credentials, tokens, cookies, private keys, API keys, PII, or sensitive federal information.

## Traceability

Security objectives and requirements are mapped to:

**Requirement → Test → Automation → CI Stage → Evidence**

Machine-readable mappings are maintained in:

```text
traceability/security-controls.json
```

## Important Scope

This project provides **automated testing and security assurance capabilities**. It does **not** constitute FedRAMP authorization, certification, an ATO, an SSP, a POA&M, or an independent security assessment.

All testing must be performed only against systems and environments for which explicit authorization exists.

## Engineering Principles

**Secure by default • Automated quality gates • Reproducible execution • Test isolation • Traceability • Least privilege • Evidence-driven testing • Shift-left security**

## Author

**Marwan Sultan**
