# MVP QA Gate And Smoke Coverage

## Purpose

This document sets the minimum QA gate for the first shippable MVP slice and
defines how smoke coverage should expand as the repository grows beyond the
current web-first implementation.

It works with:

- [`application-skeleton.md`](./application-skeleton.md) for current runtime
  boundaries
- [`release-controls.md`](./release-controls.md) for protected-branch and
  promotion policy
- [`onboarding-screen-compositions.md`](./onboarding-screen-compositions.md)
  for the first-screen behavior contract
- [`onboarding-copy-source-of-truth.md`](./onboarding-copy-source-of-truth.md)
  for locked copy expectations
- [`protocol-card-payload-contracts.md`](./protocol-card-payload-contracts.md)
  for future protocol-card fixture coverage

## Current Scope

The first executable MVP slice is still the browser-first onboarding surface in
`apps/web`.

- `apps/web` is the only runnable user-facing surface today
- `apps/api`, `apps/worker`, and `apps/protocol-adapter` remain reserved seams
- release readiness is currently driven by repository baseline checks plus
  workspace build verification

Because only the web shell is executable, the first blocking smoke suite should
cover the AI agent onboarding reference flow before API, worker, or protocol
paths become release-critical.

## Verified Baseline On 2026-04-08

The following commands were verified successfully in the managed workspace on
April 8, 2026:

- `pnpm --filter @onboarding/web test`
- `pnpm run smoke:ci`
- `pnpm typecheck`
- `pnpm build`
- `bash scripts/ci/run-service-checks.sh`

The current baseline is stronger than the original scaffold:

- the step-1 web flow now has executable Vitest coverage for shell render,
  gating, warning state, and review-summary integrity
- the repository-specific service checks path already runs install, typecheck,
  test, and build from the root
- the repository now exposes root `smoke:ci`, which delegates to the
  `apps/web` smoke suite and is auto-detected inside `Service Checks`

That means the current release gate can rely on install, type safety, test, and
build verification today, and it now also carries an explicit smoke entrypoint.
The staged release checkpoint still depends on platform provisioning rather than
on inventing new local-only checks.

## Blocking Gate For The First MVP Release

Treat these items as the minimum ship bar for the first MVP release candidate.

### Automated checks

1. `Repository Baseline` remains required on every protected-branch change.
2. `Service Checks` must continue to run frozen install, workspace typecheck,
   workspace test, workspace build, and the root `smoke:ci` entrypoint from the
   repository root.
3. The current web onboarding smoke coverage must stay in the protected release
   path and must also become part of staged release validation before the first
   MVP promotion.

### Minimum web smoke coverage

The first automated smoke suite should cover the current AI agent first-screen
reference flow in `apps/web`:

1. shell render: app shell, step rail, header copy, and footer actions render
   without runtime failure
2. gating logic: `Continue` stays disabled when no capability is selected
3. credential requirement: `Continue` stays disabled when capability selection
   exists but no credential method is selected
4. ready path: selecting at least one capability plus one credential method
   enables `Continue`
5. broad-access warning: selecting four or more capabilities, or selecting
   `Use external tools`, surfaces the warning notice and warning badge
6. review integrity: the review summary mirrors the selected capability labels
   and credential label

These cases match the current state logic in `apps/web/src/App.tsx` and should
be implemented against stable fixture inputs before protocol integrations are
introduced.

### Manual release smoke

Manual smoke remains required for the first MVP slice even after the web smoke
suite exists.

1. verify the first-screen flow in a desktop viewport and a mobile viewport
2. confirm the runtime config values render the expected environment targets
3. confirm keyboard navigation reaches checklist rows, option cards, and footer
   actions in a usable order
4. confirm copy still matches
   [`onboarding-copy-source-of-truth.md`](./onboarding-copy-source-of-truth.md)
5. confirm no fatal render issues or blocker-state regressions appear during
   the happy path and warning path

### Manual smoke checklist for the first MVP slice

Use this checklist against the exact release-candidate artifact that is being
considered for promotion.

| ID | Area | What to do | Pass criteria |
| --- | --- | --- | --- |
| `MS-01` | desktop viewport | open the first onboarding screen at a desktop width and verify the step rail, capability list, authentication cards, review summary, intro panel, and action footer | no overlap, clipping, or horizontal scroll; `Continue` only enables when capability and credential requirements are met |
| `MS-02` | mobile viewport | repeat the same flow on a narrow mobile viewport | primary work areas stay readable, the context rail drops below the main content, the footer remains reachable, and no horizontal scroll appears |
| `MS-03` | runtime-config sanity | verify the intro panel renders `APP_ENV`, `BASE_URL`, and `API_BASE_URL` values for the target environment | all values are non-empty and match the staged runtime being validated |
| `MS-04` | keyboard flow | tab through checklist items, credential cards, `Review requirements`, and `Continue`; toggle checklist rows without using a pointer | visible focus is present, focus order is usable, no control is skipped, and no keyboard trap appears |
| `MS-05` | warning path | select four or more capabilities, or enable `Use external tools`, with one credential method selected | the warning notice appears, the warning badge changes to `Policy review recommended`, and `Access review` changes to `Broad access warning` |
| `MS-06` | review path | verify the review summary after both a scoped selection and a broad-access selection; use `Review requirements` to jump back to the summary | selected capability labels, credential label, and access-review state match the current UI state in every case |

The manual pass is a release blocker until the first deployed staging flow has
repeatable smoke automation against the same artifact.

## MVP Regression Matrix

| Surface | Current blocking status | Current automated gate | Current manual gate | Trigger that expands coverage | Required upstream input |
| --- | --- | --- | --- | --- | --- |
| `apps/web` | blocking for the first MVP release | `pnpm --filter @onboarding/web test`, plus root typecheck, build, and `bash scripts/ci/run-service-checks.sh` | `MS-01` through `MS-06` | step-2 or step-3 UI lands, or staging becomes the release candidate source of truth | Product Engineering keeps fixture-friendly state coverage; Platform Reliability runs the staged artifact against the same release candidate |
| `apps/api` | not blocking yet | none until a real route exists | none yet | first real submission, orchestration, or validation endpoint is reachable in CI or staging | health endpoint, request/response contract fixtures, invalid-input expectations, and staging base URL |
| `apps/worker` | not blocking yet | none until a real queue consumer exists | none yet | first queued job, retry loop, or callback processor exists in staging | enqueue fixture, retry fixture, queue visibility, and correlation-id logging expectations |
| `apps/protocol-adapter` | not blocking yet | none until wallet, signer, quote, or settlement code is executable | none yet | first testnet or sandbox quote, wallet, signer, or settlement callback path exists | sandbox wallet or signer access, quote fixture freshness rules, callback secrets, and failure-state contracts |

Rule: a surface becomes release-blocking when it is executable in CI or
reachable in staging. Once it is reachable, its automated smoke and manual
validation path become part of the protected release gate.

## QA Release Signoff Checkpoint

The named checkpoint for the first MVP slice is `MVP Slice 1 QA Signoff`.

Run that checkpoint only on one release candidate commit and one staged
artifact. It becomes actionable once [CMP-130](/CMP/issues/CMP-130) and
[CMP-131](/CMP/issues/CMP-131) are both satisfied.

### Entry conditions

1. `Repository Baseline` and `Service Checks` are green on the release
   candidate commit.
2. the web onboarding smoke coverage from
   [CMP-130](/CMP/issues/CMP-130) is still passing on that candidate.
3. staging is validating the exact artifact produced from that same commit.
4. the staging environment exposes the expected runtime-config values and any
   smoke-only credentials needed for the active flow.

### Signoff execution

1. run the automated gate on the release candidate commit
2. deploy that same artifact to staging
3. execute `MS-01` through `MS-06` against staging
4. log pass or fail plus any severity-1 or severity-2 defect against the same
   candidate

### Signoff outcome

QA signs off only when all of the following are true:

1. the automated gate is green
2. the manual smoke checklist passes on staging
3. runtime-config values match the target environment
4. the warning path and review path both behave as expected
5. no open severity-1 or severity-2 defect remains in the shipped slice

If any of those fail, the candidate stays on hold and the blocking defect or
platform gap must be called out before promotion continues.

## Missing Hooks And Environment Prerequisites

The current release-signoff checkpoint still depends on one remaining platform
provisioning input plus normal product-side selector stability.

### Product Engineering

- no extra test hook is required for the current step-1 slice because the
  shipped smoke coverage can target accessible labels and review-row copy
- when step 2 or step 3 UI lands, keep stable accessible names or introduce
  durable selectors so the smoke suite does not become copy-fragile

### Platform Reliability

- [CMP-131](/CMP/issues/CMP-131) now has the repo-side gate wiring in place:
  `Service Checks` can run the explicit root `smoke:ci` entrypoint, and the
  staged promotion contract is documented
- the remaining external blocker is [CMP-145](/CMP/issues/CMP-145), which still
  needs to provision the first staging base URL, immutable artifact promotion
  path, and environment-specific smoke credentials
- until [CMP-145](/CMP/issues/CMP-145) lands, `MVP Slice 1 QA Signoff` is
  defined and locally verifiable, but it cannot be executed end-to-end against
  staging

## Ownership And Handoff

| Owner | Required handoff |
| --- | --- |
| QA Automation Lead | owns this gate, release signoff policy, regression matrix, and manual smoke checklist |
| ProductEngineeringLead | owns the first `apps/web` smoke harness already landed for step 1, and extends fixture-driven state coverage as the web, API, and protocol surfaces grow |
| PlatformReliabilityLead | wires smoke commands into CI, keeps protected checks current, and provisions staging URLs plus environment-specific test credentials |

The immediate cross-team handoff is:

1. product engineering keeps the step-1 smoke suite aligned with stable UI
   labels and future fixture expansion points
2. platform reliability makes that suite part of the staged validation flow for
   the same protected release candidate artifact
3. QA signs off only after the automated smoke and manual staging pass both run
   against the same release candidate

## Release Exit Criteria

The first MVP slice can move from staging validation toward production review
only when all of the following are true:

1. protected-branch checks are green
2. the web smoke suite passes on the release candidate commit
3. the manual desktop and mobile staging smoke pass
4. no open severity-1 or severity-2 defect remains in the shipped slice
5. API, worker, and protocol-adapter paths are either still non-user-reachable
   or explicitly covered by their own smoke checks

## Immediate Follow-Ups

1. finish [CMP-145](/CMP/issues/CMP-145) so QA receives the first staging base
   URL, immutable artifact promotion path, and smoke-only credentials
2. expand the regression matrix when step 2, step 3, `apps/api`,
   `apps/worker`, or `apps/protocol-adapter` become executable
