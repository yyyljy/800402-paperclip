# Onboarding v0 Design System Engineering Intake

## Purpose

This note converts the design contract in
[`design-system-foundation.md`](./design-system-foundation.md) into the first
engineering plan for code tokens and primitive component delivery.

Use [`onboarding-screen-compositions.md`](./onboarding-screen-compositions.md)
and [`onboarding-copy-source-of-truth.md`](./onboarding-copy-source-of-truth.md)
alongside this note for the actual first-screen module assembly, action
hierarchy, and locked v0 copy across AI agent, ERC-8004, and x402 entry flows.

It stays within the current platform boundary from
[`platform-foundation.md`](./platform-foundation.md): the web-first skeleton and
CI baseline now exist locally, but the canonical remote repository is still
pending. The package paths below are the active landing shape for the next
implementation slice, not a hypothetical bootstrap path anymore.

## Source Of Truth And Package Shape

Use semantic tokens as the authoring source of truth and generate runtime
artifacts from one canonical token object.

### Proposed package split

| Package | Responsibility | First outputs |
| --- | --- | --- |
| `packages/design-tokens` | semantic token source, typed exports, CSS variable generation | `tokens.ts`, `tokens.css`, `tokens.json` |
| `packages/ui-primitives` | shared presentational primitives that consume semantic tokens | shell, buttons, notices, fields, protocol cards |
| `apps/web` | onboarding flow composition on the landed web-first skeleton | AI agent, ERC-8004, x402 screens |

If the eventual repository layout uses a different workspace manager, preserve
the package boundaries even if the exact paths change.

### Canonical token naming

Use the dot-path names from the design contract as canonical authoring keys:

- `color.bg.canvas`
- `color.text.primary`
- `font.size.md`
- `space.4`
- `radius.md`
- `shadow.card`
- `motion.base`

Generate runtime aliases from those keys:

| Form | Example |
| --- | --- |
| TypeScript access | `tokens.color.bg.canvas` |
| CSS custom property | `--ds-color-bg-canvas` |
| JSON export | `"color.bg.canvas": "#F4F1EA"` |

Rules:

- keep semantic names, not raw palette names, in authored source
- ship one `default` theme first, but keep the token object nested by theme so
  future protocol or brand themes can be added without renaming keys
- keep breakpoints in the same package, but as layout constants rather than
  theme-swappable color tokens
- do not add component alias tokens until at least two primitives need the same
  derived value; start with semantic tokens only

## Token Schema Recommendation

### Color

Author colors under these groups:

- `color.bg`
- `color.border`
- `color.text`
- `color.action`
- `color.feedback`
- `color.focus`

Implementation notes:

- `color.action.primary` and `color.action.primaryHover` should map directly to
  interactive states for the single next-step CTA
- `color.feedback.*` should be shared by `InlineNotice`, `StatusBadge`, and
  protocol-status cards so async states do not drift visually
- keep protocol branding out of the base token file; protocol-specific badges
  can compose iconography or copy while still using the shared semantic colors

### Typography

Author typography as separate families, sizes, and optional line-height pairs:

- `font.family.display`
- `font.family.ui`
- `font.family.mono`
- `font.size.{xs|sm|md|lg|xl}`

Add engineering-owned companions during implementation:

- `font.weight.{regular|medium|semibold|bold}`
- `lineHeight.{xs|sm|md|lg|xl}`

Those companions are not specified in the design doc today, but they are needed
to make primitive APIs deterministic.

### Layout And Motion

Author these groups:

- `space`
- `radius`
- `shadow`
- `motion`
- `breakpoint`

Recommended breakpoint constants:

- `breakpoint.mobileMax = 767`
- `breakpoint.tabletMin = 768`
- `breakpoint.desktopMin = 1280`

Keep breakpoint values exportable in TypeScript for layout logic and mirror them
into CSS custom properties only if the eventual styling system needs them.

## Primitive Architecture

Build `packages/ui-primitives` in layers so onboarding flows can compose shared
modules before protocol-specific panels arrive.

### Layer 1: Foundation shell and feedback

| Primitive | Required variants | Implementation notes |
| --- | --- | --- |
| `AppShell` | desktop, tablet, mobile | owns page frame, sticky mobile action zone, optional side context slot |
| `SectionHeader` | default, compact | title, description, optional status slot |
| `StepRail` | vertical, horizontal, condensed | same data model across layouts so responsive switch is view-only |
| `PrimaryButton` | idle, loading, disabled | width lock while loading; one strong CTA style only |
| `SecondaryButton` | default, subtle | no competing emphasis with primary CTA |
| `StatusBadge` | info, success, warning, error, neutral | compact label primitive shared across flows |
| `InlineNotice` | info, warning, error, success | supports icon, title, body, and optional action |

### Layer 2: Form and decision primitives

| Primitive | Required variants | Implementation notes |
| --- | --- | --- |
| `TextField` | default, error, disabled | label, helper, error, prefix or suffix slots kept optional |
| `TextArea` | default, error, disabled | shared message area for long prompts or callback text |
| `SelectField` | default, disabled | wrapper around whichever select implementation wins later |
| `SegmentedControl` | two-option, three-option | use for tight mutually exclusive choices only |
| `ChecklistGroup` | compact, descriptive | stateful rows with title and support copy |
| `OptionCard` | default, selected, disabled | large-choice primitive for path or mode selection |
| `ReviewTable` | standard, dense | confirmation summary with mono-safe values |

### Layer 3: Protocol and transaction primitives

| Primitive | Required variants | Contract dependency |
| --- | --- | --- |
| `WalletConnectionCard` | disconnected, connected, wrong network, error | wallet provider state and reconnect actions |
| `NetworkBadge` | neutral, success, warning | normalized chain or environment enum |
| `QuoteSummaryCard` | fresh, stale, loading, error | quote payload, timestamps, fee fields |
| `CredentialScopeCard` | minimal, detailed | capability or permission payload shape |
| `CallbackStatusCard` | pending, success, failed | async callback or settlement event model |
| `KeyValueList` | stacked, inline | common protocol metadata renderer |
| `EventTimeline` | compact, full | ordered async status history |

Implementation rule: finish Layers 1 and 2 before investing in Layer 3 beyond
API contracts and story fixtures.

## Shared Component Contracts

Use these cross-cutting rules in all primitive APIs:

- every field-like primitive accepts `label`, `description`, `error`, and
  `disabled` consistently
- every async primitive uses the same `status` vocabulary where possible:
  `idle`, `loading`, `success`, `warning`, `error`
- mono-safe values such as hashes, wallet addresses, callback URLs, and API keys
  should flow through one truncation or chunking utility rather than ad hoc logic
- stateful cards should separate `tone` from `status` so warning and error
  visuals are shared without hard-coding protocol semantics into the primitive
- responsive changes belong in the primitive internals, not duplicated in each
  onboarding flow screen

## First Implementation Slice

Decompose the first deliverable into three execution slices:

1. Token pipeline
   - create the semantic token source
   - generate typed TypeScript exports plus CSS variables
   - wire a no-frills documentation example or fixture page once `apps/web`
     exists
2. Shared primitives
   - land `AppShell`, `SectionHeader`, `StepRail`, button, badge, and notice
     primitives first
   - land field and option primitives second
   - cover loading, error, disabled, and responsive states before visual polish
3. Flow composition starter
   - compose one reference onboarding screen using shared primitives only
   - defer protocol-specific cards until payload contracts are stable

This keeps the first coding milestone focused on reusable foundations instead of
locking prematurely into ERC-8004 or x402 integration details.

## Missing Contracts And Risks

The following items are not blockers for this intake, but they are blockers for
parts of implementation beyond the shared primitive layer:

| Area | Risk | Owner path |
| --- | --- | --- |
| Workspace bootstrap | canonical remote is still missing, but the app skeleton and `pnpm` workspace are now present locally | existing platform work in [`platform-foundation.md`](./platform-foundation.md) and [CMP-13](/CMP/issues/CMP-13) |
| Wallet integration | no agreed provider abstraction, connect lifecycle, or wrong-network contract | Product engineering plus CTO |
| ERC-8004 metadata | signer summary and contract metadata payload shape undefined | Product engineering plus protocol owner |
| x402 quotes | quote freshness, fee breakdown, and settlement callback payloads undefined | Product engineering plus protocol owner |
| Credential scopes | capability grant shape for AI-agent onboarding not specified | Product engineering |
| Typography delivery | display and UI font loading strategy not yet chosen for runtime | Product engineering during token implementation |

Recommended rule: do not block the token pipeline or shared primitives on these
unknowns; instead, build protocol cards against mocked fixtures once screen
composition starts.

## Recommended Follow-Up Issues

1. Land `packages/design-tokens` and publish the first semantic token exports.
2. Land `packages/ui-primitives` Layer 1 primitives against those tokens.
3. Land Layer 2 field and decision primitives plus one reference onboarding
   screen composition.
4. Open protocol-specific card tasks only after payload contracts are defined.

## Definition Of Done For The Next Coding Milestone

The next implementation milestone should be considered complete when:

- semantic tokens are available in both TypeScript and CSS form
- Layer 1 and Layer 2 primitives render from shared tokens without flow-specific
  styling forks
- one onboarding screen demonstrates the responsive shell, primary action,
  notices, and review summary behaviors from the design contract
- protocol-card tasks are either implemented against stable contracts or remain
  explicitly tracked as follow-up issues
