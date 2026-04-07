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

## Environment Promotion Path

- `staging` exists as a GitHub Environment and accepts deployments from `main` only
- `production` exists as a GitHub Environment, accepts protected branches only, and requires manual reviewer approval before deployment
- production promotion should consume the staging-validated artifact from the protected branch rather than rebuilding a different commit

## Deployment Identity Baseline

- runtime environment names remain limited to `local`, `staging`, and `production` per `docs/environment-contract.md`
- repository-level and environment-level GitHub secrets are intentionally empty in the scaffolded baseline
- deployment identities and runtime credentials must be provisioned outside source control using the contract in `docs/environment-contract.md` and the ownership model in `docs/secret-manifest.md`
