# Runtime Control Plane

Validated on 2026-04-08 against the approved MVP stack in [CMP-129](/CMP/issues/CMP-129).

## Selected GCP Layout

Use one shared artifact project plus one runtime project per environment:

- artifact project: `cmp-mvp-artifacts`
- staging project: `cmp-mvp-staging`
- production project: `cmp-mvp-production`
- Artifact Registry repository: `mvp-runtime`
- default runtime region: `asia-northeast3`

This keeps one immutable image path for promotion while preserving separate
runtime IAM, secrets, and blast radius between `staging` and `production`.

## Naming Contract

### Images

- repository path:
  `${GCP_ARTIFACT_REGION}-docker.pkg.dev/${GCP_ARTIFACT_PROJECT_ID}/${GCP_ARTIFACT_REPOSITORY}`
- first web image name: `web`
- immutable release tags: `${GITHUB_SHA}`
- deploy target: image digest returned from Artifact Registry, never a mutable tag

### Cloud Run Services

- `mvp-web-staging`
- `mvp-web-production`
- `mvp-api-staging`
- `mvp-api-production`
- `mvp-worker-staging`
- `mvp-worker-production`
- `mvp-protocol-adapter-staging`
- `mvp-protocol-adapter-production`

### Service Accounts

- GitHub Actions deployer: `gha-runtime-promoter@cmp-mvp-artifacts.iam.gserviceaccount.com`
- staging web runtime: `cr-web-staging@cmp-mvp-staging.iam.gserviceaccount.com`
- production web runtime: `cr-web-production@cmp-mvp-production.iam.gserviceaccount.com`
- future API runtime: `cr-api-<env>@<project>.iam.gserviceaccount.com`
- future worker runtime: `cr-worker-<env>@<project>.iam.gserviceaccount.com`
- future protocol adapter runtime: `cr-protocol-adapter-<env>@<project>.iam.gserviceaccount.com`

The protocol adapter must stay on its own runtime service account in both
environments. Do not reuse the web or API identity for wallet, signer,
settlement, or webhook paths.

## Build And Promotion Path

1. `main` is the only release branch.
2. GitHub Actions authenticates to Google Cloud with Workload Identity
   Federation through `gha-runtime-promoter`.
3. The workflow builds `apps/web/Dockerfile` once, pushes it to Artifact
   Registry, and captures the resulting image digest.
4. Staging deploys that digest to `mvp-web-staging`.
5. A staging smoke step validates `/` plus `runtime-config.js`.
6. The production job waits on GitHub Environment approval and then deploys the
   exact staging-validated digest to `mvp-web-production`.

The web image now reads `APP_ENV`, `BASE_URL`, and `API_BASE_URL` at container
startup instead of baking them into the Vite bundle. That change is required for
exact-digest promotion.

## GitHub Configuration Contract

Repository-level variables:

- `GCP_ARTIFACT_PROJECT_ID`
- `GCP_ARTIFACT_REGION`
- `GCP_ARTIFACT_REPOSITORY`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_GITHUB_SERVICE_ACCOUNT`
- `CLOUD_RUN_REGION`

Environment-scoped variables for both `staging` and `production`:

- `GCP_PROJECT_ID`
- `CLOUD_RUN_SERVICE_WEB`
- `CLOUD_RUN_RUNTIME_SERVICE_ACCOUNT`
- `WEB_BASE_URL`
- `API_BASE_URL`
- `OBSERVABILITY_DSN_SECRET_NAME`

GitHub should not store live runtime secrets for this path. Use Workload
Identity Federation plus environment variables that point at Google-managed
resources.

## Secret Delivery Contract

Use Google Secret Manager as the only source of deploy-time secret values for
runtime surfaces.

- `OBSERVABILITY_DSN` maps to the Sentry DSN secret for each runtime and
  environment.
- `OPENAI_API_KEY`, `DATABASE_URL`, `REDIS_URL`, and future queue credentials
  stay out of GitHub and land only in runtimes that consume them.
- `WALLET_*`, `SIGNER_*`, settlement, and webhook secrets must only be attached
  to `mvp-protocol-adapter-*` runtimes.
- production signer, wallet, settlement, and callback secrets must never be
  attached to `mvp-web-production` or `mvp-api-production`.

Recommended Secret Manager naming:

- `web-obs-dsn`
- `api-obs-dsn`
- `worker-obs-dsn`
- `protocol-adapter-obs-dsn`
- `protocol-adapter-wallet-signer-key-ref`
- `protocol-adapter-x402-webhook-secret`
- `protocol-adapter-settlement-secret`

Each secret should exist separately in `cmp-mvp-staging` and
`cmp-mvp-production`.

## Observability Baseline

Use Google Cloud for platform telemetry and Sentry for application exceptions:

- Cloud Logging for request and deployment logs
- Cloud Monitoring dashboards for request latency, error rate, and container
  restart signals per Cloud Run service
- alert policies for 5xx rate, latency regression, and no-traffic-after-deploy
- Sentry DSN injected per runtime through Secret Manager

Minimum production alerts:

- `mvp-web-production` request 5xx rate above threshold
- failed deploy or revision health regression
- `mvp-protocol-adapter-production` exception burst
- Secret Manager access denial on any production runtime service account

## Rollout Order

1. Create the three GCP projects and Artifact Registry repository.
2. Provision Workload Identity Federation for GitHub Actions.
3. Create Cloud Run runtime service accounts for `web` in `staging` and
   `production`.
4. Create `web-obs-dsn` in both environment projects.
5. Populate GitHub repository and environment variables.
6. Run the workflow from `main` to build, deploy `staging`, smoke it, and wait
   for production approval.
7. Add `api`, `worker`, and `protocol-adapter` only after Product Engineering
   declares their env and secret contracts.

## Remaining Board-Managed Blockers

These items still require manager or board action outside source control:

- create or confirm the real GCP project IDs that back the selected naming plan
- provision the GitHub Workload Identity Provider and deployer service account
- create Cloud Run runtime service accounts in `staging` and `production`
- create the first `web-obs-dsn` secrets in Secret Manager
- populate the GitHub `staging` and `production` environment variables with the
  real base URLs and service-account names

Once those are in place, [CMP-131](/CMP/issues/CMP-131) can bind its staging URL
and smoke hook expectations to the deployed `web` runtime instead of a paper
contract.
