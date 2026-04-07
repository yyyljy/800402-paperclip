# Platform Foundation

## Current State

- Managed Paperclip workspace was empty at kickoff.
- A local git repository now exists so follow-on work has a stable root.
- Repository-local baseline files now define CI, environment, secret, and release-control scaffolding.
- A web-first `pnpm` workspace skeleton now exists locally under `apps/web`.
- No canonical remote repository or deployment target is attached yet.

## Recommended Bootstrap Path

1. Keep this repository as the managed working root and attach a canonical remote as soon as the CTO decides where ownership lives.
2. Use the landed web-first workspace skeleton before building stack-specific automation.
3. Add CI, secrets wiring, deployment configuration, and observability as shared platform layers instead of baking them into the first app service.

The missing canonical remote is the main blocker for production-grade CI/CD because branch protections, deployment identities, and merge-based release automation need an upstream source of truth.

## Minimum Environment Model

Use three environments first:

- `local`: developer and agent execution with local stubs or test credentials only
- `staging`: shared integration environment for agent flows, ERC-8004/x402 test paths, and release validation
- `production`: locked environment with manual promotion and tightly scoped credentials

Do not create long-lived `dev` or `qa` environments yet. Add preview environments later only if the first product milestone needs PR-level UX review.

## Secrets Ownership Boundary

- Platform owns secret storage, rotation process, runtime injection, and access policy.
- Product engineering defines which secrets each service requires and removes unused secrets.
- QA uses environment-specific test credentials but does not own production secret material.
- Private keys, wallet credentials, webhook signing secrets, and payment-provider credentials must be isolated per environment.
- Production signing or treasury-impacting secrets should be injected only into the narrow protocol adapter or signer runtime, not the general web or API tier.

## CI/CD Baseline

Start with one shared pipeline and expand by deployable unit:

- pull request checks: format or lint, type check, unit tests, and build verification
- main branch: create immutable build artifacts and deploy automatically to staging
- production: manual promotion from the exact staging artifact after smoke validation

Recommended shape once code lands:

- reusable workflow primitives for install, test, build, and deploy
- per-service jobs for `web`, `api`, `worker`, and `protocol-adapter` only when those units exist
- required status checks on `main`
- dependency and secret scanning enabled in CI, but kept non-blocking until the first stable pipeline exists

## Observability And Incident Readiness Baseline

- structured logs everywhere with request, workflow, and transaction correlation IDs
- error tracking for web, API, and background workers
- metrics for request latency, job latency, queue depth, deployment health, and external dependency failures
- uptime and synthetic checks for the primary user flow plus protocol callback paths
- a lightweight incident runbook covering deploy rollback, degraded dependency mode, and key rotation

For ERC-8004/x402 work, also emit domain events for quote creation, payment intent, signature request, settlement callback, and final on-chain or off-chain confirmation so failures can be traced across systems.

## Initial Deployment Topology

Keep the first topology small but separated by blast radius:

- `web`: user-facing frontend
- `api`: primary synchronous application API
- `worker`: background jobs for async agent tasks and retries
- `protocol-adapter`: isolated runtime for wallet, payment, and settlement integrations

Run staging and production in a single cloud provider first. Keep stateful dependencies managed unless a product requirement forces self-hosting. The protocol adapter should have the narrowest network and secret access of any runtime.

## First Executable Skeleton

The repository starts with `apps/web` as the only runnable service plus shared
package boundaries for tokens and primitives. This is a deliberate staging step:

- it unblocks the UI-token and component work already queued behind the current milestone
- it keeps `api`, `worker`, and `protocol-adapter` visible as future runtime seams
- it avoids inventing server contracts before protocol payload ownership is settled

## Operating Boundary

Platform Reliability Lead owns:

- repository and environment conventions
- CI/CD, secret handling, deploy mechanics, observability, and reliability controls

Product Engineering Lead owns:

- application architecture, service boundaries, runtime contracts, and milestone-level implementation sequencing

QA Automation Lead owns:

- release gate definitions, automated smoke coverage, regression strategy, and ship-readiness policy

UX scope stays outside this document.

## Next Executable Tasks

1. Attach or create the canonical remote repository and connect it to this managed workspace.
2. Land `packages/design-tokens` and `packages/ui-primitives` against the web-first skeleton so the baseline CI can tighten from repo-hygiene checks to service-specific verification.
