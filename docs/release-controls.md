# Release Controls

The canonical upstream repository is now attached at `https://github.com/yyyljy/800402-paperclip`, and `main` is the protected default branch for release promotion.

## Verified Default-Branch Controls

- active ruleset: `Default branch release controls`
- target branch: the repository default branch (`main`)
- required pull-request review count: 1
- required review-thread resolution: enabled
- required status checks:
  - `Repository Baseline`
  - `Service Checks`
- history protections:
  - force pushes blocked
  - branch deletion blocked
  - linear history required
- bypass actors: none configured, so direct pushes to `main` stay blocked unless the ruleset is changed

## MVP Smoke Gate Transition

- `Service Checks` remains the protected status that carries install, typecheck,
  test, and build verification from the repository root.
- When smoke coverage lands, that same `Service Checks` job must also execute
  the first blocking smoke command instead of relying on a separate optional
  workflow.
- The repository-specific service-check path now auto-detects the first smoke
  command from the root package or `apps/web` package using this order:
  `smoke:ci`, `smoke`, `@onboarding/web smoke:ci`, `@onboarding/web smoke`.
- Until one of those commands exists, the protected gate remains baseline
  install, typecheck, test, and build only.

## Environment Promotion Path

- `staging` exists as a GitHub Environment and accepts deployments from `main` only
- `production` exists as a GitHub Environment, accepts protected branches only, and requires manual reviewer approval before deployment
- production promotion should consume the staging-validated artifact from the protected branch rather than rebuilding a different commit

## Staging Smoke Validation Contract

Use one release candidate commit and one artifact path all the way through
promotion:

1. merge to `main` only after `Repository Baseline` and `Service Checks` pass on
   the release candidate commit
2. build the immutable staging artifact from that same merged commit
3. deploy that exact artifact to the `staging` environment
4. run the smoke suite against the staged artifact using staging-only URLs and
   test credentials
5. promote the exact staging-validated artifact to `production` after manual
   approval instead of rebuilding a different commit

Current prerequisites for the staged smoke step:

- a real root or `apps/web` smoke command
- a provisioned staging base URL for the deployed web surface
- staging-only smoke credentials and any related environment variables
- a chosen deployment substrate, identity model, and observability path for the
  first runtime stack

## Deployment Identity Baseline

- runtime environment names remain limited to `local`, `staging`, and `production` per `docs/environment-contract.md`
- repository-level and environment-level GitHub secrets are intentionally empty in the scaffolded baseline
- deployment identities and runtime credentials must be provisioned outside source control using the contract in `docs/environment-contract.md` and the ownership model in `docs/secret-manifest.md`

## Runtime Control Plane Workflow

- `.github/workflows/runtime-control-plane.yml` owns build, Artifact Registry
  publish, Cloud Run staging deploy, staging smoke, and production promotion
- the workflow authenticates with GitHub OIDC plus Google Workload Identity
  Federation rather than long-lived JSON keys
- `staging` and `production` GitHub Environments provide non-secret variables
  such as project ID, service name, base URL, and runtime service account
- the production job is gated by GitHub Environment approval and deploys the
  same image digest already validated in `staging`
- `apps/web` now reads runtime config from `runtime-config.js` at container
  startup so `BASE_URL` and `API_BASE_URL` stay environment-specific without
  rebuilding the image

Use `docs/runtime-control-plane.md` as the source of truth for the chosen
resource names, IAM boundaries, and provisioning checklist.
