# Onboarding Workspace

Web-first monorepo scaffold for the MVP onboarding project.

Current verified scope:

- `apps/web` is the only runnable application surface today
- the current web app is a single onboarding reference screen for agent capability setup
- `packages/design-tokens` provides the semantic token source plus generated CSS and JSON artifacts
- `packages/ui-primitives` provides the shared Layer 1 and Layer 2 React primitives used by `apps/web`
- `apps/api`, `apps/worker`, and `apps/protocol-adapter` remain reserved runtime boundaries only

Verified repository baseline:

- canonical remote: `https://github.com/yyyljy/800402-paperclip.git`
- protected default branch: `main`
- active repository workflow: `.github/workflows/ci.yml`
- workspace package manager: `pnpm@10.18.3`
- repo-specific service checks live at `scripts/ci/service-checks.sh`
- web runtime container scaffolding is present at `apps/web/Dockerfile`, `apps/web/nginx/default.conf`, and `apps/web/docker/40-runtime-config.sh`
- runtime readiness and control-plane decisions are documented in `docs/mvp-platform-readiness.md` and `docs/runtime-control-plane.md`

## Runtime Status

This branch includes the web image scaffold and the runtime configuration bridge,
but it does not include `.github/workflows/runtime-control-plane.yml`.

Current state:

- baseline CI on `main` is active through `Repository Baseline` and `Service Checks`
- `scripts/ci/service-checks.sh` installs dependencies, runs root `typecheck`, `test`, and `build` hooks, and then looks for an optional smoke command
- no root or `apps/web` smoke command is defined yet, so smoke validation is still a documented follow-up rather than an active gate
- staging and production runtime names, IAM boundaries, secret delivery, and rollout order are documented, but live deploy wiring still depends on external provisioning

## Repository Layout

```text
apps/
  web/                # runnable onboarding reference screen
  api/                # reserved synchronous API boundary
  worker/             # reserved async job boundary
  protocol-adapter/   # reserved wallet, signer, payment, and settlement boundary
packages/
  design-tokens/      # semantic token source and generated artifacts
  ui-primitives/      # shared React primitives and styles
docs/                 # platform, release, design, and onboarding reference docs
scripts/ci/           # baseline verification and service-check helpers
ops/secrets/          # secret manifest examples
```

## Local Commands

- `corepack enable`
- `pnpm install`
- `pnpm dev`
- `pnpm typecheck`
- `pnpm build`
- `pnpm --filter @onboarding/design-tokens generate`
- `pnpm --filter @onboarding/web preview`
- `bash scripts/ci/run-service-checks.sh`

The repo-level environment file is `.env.example`. `apps/web` reads `APP_ENV`,
`BASE_URL`, and `API_BASE_URL` from the workspace root and exposes them through
`runtime-config.js` at container startup.

## Environment Contract

Supported environment names:

- `local`
- `staging`
- `production`

Shared variables already defined in `.env.example`:

- `APP_ENV`
- `APP_NAME`
- `LOG_LEVEL`
- `PORT`
- `BASE_URL`
- `API_BASE_URL`
- `OPENAI_API_KEY`
- `OBSERVABILITY_DSN`
- `X402_NETWORK`
- `X402_API_BASE_URL`
- `ERC8004_CHAIN_ID`
- `ERC8004_RPC_URL`
- `PROTOCOL_CALLBACK_BASE_URL`
- `DATABASE_URL`
- `REDIS_URL`
- `QUEUE_URL`
- `WALLET_SIGNER_KEY_REF`

Production signer, wallet, settlement, and webhook secrets stay out of `apps/web`
and belong to the future `protocol-adapter` runtime.

## Reference Docs

- `docs/platform-foundation.md`
- `docs/application-skeleton.md`
- `docs/environment-contract.md`
- `docs/secret-manifest.md`
- `docs/release-controls.md`
- `docs/runtime-control-plane.md`
- `docs/mvp-platform-readiness.md`
- `docs/design-system-foundation.md`
- `docs/onboarding-screen-compositions.md`
- `docs/onboarding-copy-source-of-truth.md`
- `docs/design-system-engineering-intake.md`
