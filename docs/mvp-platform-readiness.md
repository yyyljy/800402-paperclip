# MVP Platform Readiness

Validated on 2026-04-08 against the managed workspace and canonical GitHub remote.

## Verified Baseline

- repository remote: `https://github.com/yyyljy/800402-paperclip.git`
- default branch: `main`, confirmed from `origin` with `git ls-remote --symref origin HEAD`
- local tracking branch: `main -> origin/main`
- baseline CI workflow: `.github/workflows/ci.yml`
- verified checks:
  - `bash scripts/ci/verify-baseline.sh`
  - `bash scripts/ci/run-service-checks.sh`

The current repo baseline is healthy enough to support ongoing web-first MVP work.
The remaining gaps are not repository health issues; they are runtime platform
decisions needed before server-side surfaces come online.

## Runtime Rollout Sequence

Use the existing environment contract and release controls as the fixed frame:
`local`, `staging`, `production`, with `main` as the protected release branch.

### Staging

- Deploy automatically from `main` after the baseline checks pass.
- Start with the `web` surface, then add `api` and `worker` when they exist.
- Keep `protocol-adapter` isolated even in staging if it touches signing,
  treasury, settlement callbacks, or wallet credentials.
- Require one smoke pass that covers the primary onboarding route plus one
  protocol callback or quote flow once those surfaces exist.

### Production

- Promote the exact artifact already validated in `staging`.
- Keep manual approval in front of production until automated smoke coverage and
  rollback confidence exist for all deployed runtimes.
- Do not colocate treasury-impacting secrets with the general `web` runtime.

## Secrets Contract To Carry Forward

- Keep `docs/secret-manifest.md` and `ops/secrets/manifest.example.yaml` as the
  source-controlled catalog, not the vault.
- Add service ownership to the manifest only when a runtime becomes real:
  `web`, `api`, `worker`, or `protocol-adapter`.
- Route production signer, wallet, settlement, or webhook secrets only into the
  narrowest runtime that needs them.
- Keep one shared injection pattern across environments so `APP_ENV`,
  `BASE_URL`, `API_BASE_URL`, and reserved integration namespaces stay stable.

## Observability Minimums

- structured logs with request, workflow, and transaction correlation IDs
- error tracking for every deployed runtime
- latency and failure metrics for HTTP requests, jobs, queue depth, and external
  protocol dependencies
- synthetic checks for the primary onboarding path and the first callback flow
- a short rollback and key-rotation runbook before production promotion

## Current Blockers

The first UI-only implementation slice is not blocked.

The control-plane decision is now made and codified for Google Cloud Run,
Artifact Registry, Google Secret Manager, and Sentry. The remaining blockers are
board-managed provisioning steps outside source control:

- create the real GCP projects, Workload Identity Federation binding, and
  GitHub deployer identity
- create the `web` Cloud Run runtime service accounts in `staging` and
  `production`
- create the first `web-obs-dsn` secrets in Secret Manager
- populate the GitHub `staging` and `production` environment variables with the
  real base URLs, service names, and runtime service-account names

Until those are provisioned, platform cannot execute a live staging deploy or
unblock the staging URL handoff required by [CMP-131](/CMP/issues/CMP-131).

## Recommended Follow-Up

1. Board or CTO provisions the GCP and GitHub resources documented in
   `docs/runtime-control-plane.md`.
2. Platform runs the new release workflow from `main` to deploy the first `web`
   revision into `staging`.
3. QA attaches smoke expectations and staging URL validation to
   [CMP-131](/CMP/issues/CMP-131).
4. Product Engineering declares service-specific environment and secret needs as
   `api`, `worker`, and `protocol-adapter` become active.
