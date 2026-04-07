# Release Controls

The managed workspace now has a local git root, but the canonical upstream repository is still pending in [CMP-16](/CMP/issues/CMP-16). Remote-enforced release controls stay blocked until that decision lands.

## Controls To Apply Once The Remote Exists

- protect `main` as the default branch
- require the `CI` workflow to pass before merge
- require at least one code review on application changes
- restrict direct pushes to platform owners or repository administrators
- keep production promotion manual from a staging-validated artifact

## Current Local Baseline

- the repository includes a CI workflow skeleton
- environment and secret contracts are documented in source control
- service-check automation is wired to detect the first root-level Node skeleton without another workflow rewrite

## Remaining Remote-Dependent Steps

- attach the canonical remote repository
- enable branch protection and required checks on that remote
- wire deployment identities and environment-scoped secrets in the chosen hosting platform
