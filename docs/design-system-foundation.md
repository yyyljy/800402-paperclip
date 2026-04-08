# Onboarding v0 Design System Foundation

## Purpose

This document defines the first-pass design-system foundation for onboarding
surfaces across the AI agent, ERC-8004, and x402 product entry points.

It is intentionally implementation-ready but platform-agnostic. It establishes
the visual and interaction contract that engineering can build against once the
repository baseline from [platform-foundation.md](./platform-foundation.md) is
in place.

Pair it with [onboarding-screen-compositions.md](./onboarding-screen-compositions.md)
and [onboarding-copy-source-of-truth.md](./onboarding-copy-source-of-truth.md)
for the locked first-screen content,
for the first-step screen layouts and
[design-system-engineering-intake.md](./design-system-engineering-intake.md)
for the first coding intake.

## Design Direction

Use a visual system that feels operational, trustworthy, and protocol-aware:

- calm light surfaces instead of dark-console styling
- strong information hierarchy over decorative chrome
- one primary action per step
- explicit system feedback for network, payment, and credential states
- reusable primitives before flow-specific one-offs

## Token Recommendation

### Color

Use semantic tokens in implementation, with these v0 reference values:

| Token | Value | Usage |
| --- | --- | --- |
| `color.bg.canvas` | `#F4F1EA` | app background |
| `color.bg.surface` | `#FCFAF5` | cards, forms, drawers |
| `color.bg.surfaceStrong` | `#EFE7D8` | highlighted panels and summaries |
| `color.border.default` | `#D6CCBA` | standard borders and dividers |
| `color.text.primary` | `#14202B` | primary body and heading text |
| `color.text.secondary` | `#4C5A67` | helper text and labels |
| `color.text.inverse` | `#FFFDF8` | text on strong actions |
| `color.action.primary` | `#0F766E` | primary actions and active indicators |
| `color.action.primaryHover` | `#0B5C56` | primary hover state |
| `color.action.secondary` | `#D8E8E5` | secondary action surfaces |
| `color.feedback.info` | `#2C6E9E` | informational banners and status |
| `color.feedback.success` | `#2E7D4F` | success states |
| `color.feedback.warning` | `#AD7A1F` | warnings and pending confirmations |
| `color.feedback.error` | `#B4492D` | destructive and error states |
| `color.focus.ring` | `#1F8A81` | keyboard focus outline |

Rules:

- reserve `color.action.primary` for the next critical step only
- never use red for passive metadata; it must always imply an actionable error
- success and warning states must remain readable on low-quality mobile screens
- protocol or chain branding can appear only inside scoped badges, not as the
  system accent color

### Typography

| Token | Recommendation | Usage |
| --- | --- | --- |
| `font.family.display` | `"Space Grotesk", "IBM Plex Sans", sans-serif` | hero titles and step headers |
| `font.family.ui` | `"IBM Plex Sans", "Inter", sans-serif` | interface text |
| `font.family.mono` | `"IBM Plex Mono", monospace` | wallet addresses, hashes, API keys |
| `font.size.xs` | `12px` | captions and dense metadata |
| `font.size.sm` | `14px` | helper text |
| `font.size.md` | `16px` | body text, default controls |
| `font.size.lg` | `20px` | section headers |
| `font.size.xl` | `28px` | page titles |

Rules:

- body copy should stay at `16px` minimum on all breakpoints
- mono text should be paired with chunked formatting for long identifiers
- headings should use weight and spacing changes before color changes

### Spacing, Radius, Elevation, Motion

| Token | Value | Usage |
| --- | --- | --- |
| `space.1` | `4px` | dense gaps |
| `space.2` | `8px` | icon-label spacing |
| `space.3` | `12px` | field internals |
| `space.4` | `16px` | default component gap |
| `space.6` | `24px` | card sections |
| `space.8` | `32px` | page sections |
| `radius.sm` | `10px` | fields and chips |
| `radius.md` | `16px` | cards |
| `radius.lg` | `24px` | drawers and hero panels |
| `shadow.card` | `0 8px 24px rgba(20, 32, 43, 0.08)` | default surface elevation |
| `shadow.overlay` | `0 16px 48px rgba(20, 32, 43, 0.14)` | modal or summary overlay |
| `motion.fast` | `120ms ease-out` | hover and focus feedback |
| `motion.base` | `180ms ease-out` | panel transitions |

Rules:

- radius should signal containment, not novelty; do not mix many corner styles
- motion should clarify state changes, not decorate idle UI
- loading skeletons should pulse softly and stop immediately when content lands

## Flow Composition Map

Build three entry paths from a shared shell:

| Flow | Core job | Required shared modules | Flow-specific modules |
| --- | --- | --- | --- |
| AI agent onboarding | connect agent capability and credentials | page shell, step rail, alert banner, form fields, review summary, action footer | capability checklist, webhook or key block, prompt context panel |
| ERC-8004 onboarding | prepare identity, wallet, and contract context | page shell, step rail, alert banner, form fields, review summary, action footer | wallet connection card, network badge, signer summary, contract metadata panel |
| x402 onboarding | configure quote, payment, and settlement path | page shell, step rail, alert banner, form fields, review summary, action footer | quote summary card, payment method selector, callback state card, settlement checklist |

## Reusable Component Inventory

### Foundation Primitives

| Component | Purpose | Required variants |
| --- | --- | --- |
| `AppShell` | page frame with header, content rail, and footer action area | desktop, tablet, mobile |
| `SectionHeader` | title, supporting text, optional inline status | default, compact |
| `StepRail` | communicates progress and upcoming steps | vertical, horizontal, condensed |
| `PrimaryButton` | advances the main task | idle, loading, disabled |
| `SecondaryButton` | secondary path or review action | default, subtle |
| `StatusBadge` | short protocol or state label | info, success, warning, error, neutral |
| `InlineNotice` | contextual information or warning | info, warning, error, success |

### Form And Decision Components

| Component | Purpose | Required variants |
| --- | --- | --- |
| `TextField` | short-form input | default, error, disabled |
| `TextArea` | long-form input or agent instructions | default, error, disabled |
| `SelectField` | network, environment, or mode selection | default, disabled |
| `SegmentedControl` | small mutually exclusive mode switches | two-option, three-option |
| `ChecklistGroup` | prerequisite or permission checklist | compact, descriptive |
| `OptionCard` | large tap target for choosing onboarding path or payment mode | default, selected, disabled |
| `ReviewTable` | final summary before confirmation | standard, dense |

### Protocol And Transaction Components

| Component | Purpose | Required variants |
| --- | --- | --- |
| `WalletConnectionCard` | wallet state, address, chain, reconnect action | disconnected, connected, wrong network, error |
| `NetworkBadge` | active chain or environment indicator | neutral, success, warning |
| `QuoteSummaryCard` | pricing, timing, and fee explanation | fresh, stale, loading, error |
| `CredentialScopeCard` | shows what data or capability access is being granted | minimal, detailed |
| `CallbackStatusCard` | asynchronous settlement or verification state | pending, success, failed |
| `KeyValueList` | hashes, ids, wallet addresses, callback URLs | stacked, inline |
| `EventTimeline` | multi-step protocol progress where async state matters | compact, full |

## Interaction And State Matrix

Apply these rules across all interactive components:

| State | Visual treatment | Behavior rule |
| --- | --- | --- |
| Hover | surface tint or border emphasis only | never shift layout; use color and shadow only |
| Focus | `2px` focus ring using `color.focus.ring` plus preserved border | visible only for keyboard or assistive focus, not generic mouse click |
| Disabled | reduced contrast, no elevation, helper text when action loss is ambiguous | disabled controls must explain the unmet prerequisite nearby |
| Loading | inline spinner or skeleton on the affected module only | keep previous data visible when safe; do not blank the whole page |
| Success | success badge or panel accent with persistent confirmation text | success should advance the step or unlock the next action |
| Error | border plus inline message plus summary banner for blocking failures | message must say what failed and what to do next |

Component-specific notes:

- `PrimaryButton`: loading replaces label with spinner and status text, width locked
- `OptionCard`: selected state uses border, subtle fill, and check indicator; never
  rely on color alone
- `WalletConnectionCard`: wrong-network state is warning first, error only when the
  user cannot continue
- `QuoteSummaryCard`: stale quotes should show timestamp and refresh action rather
  than silently recomputing
- `CallbackStatusCard`: pending states should include last update time to build trust

## Responsive Rules

Use three breakpoints:

- `mobile`: `0-767px`
- `tablet`: `768-1279px`
- `desktop`: `1280px+`

Rules:

- on mobile, the step rail becomes a horizontal progress strip above content
- on tablet and desktop, keep primary content left and review or status context
  right only when the summary can remain visible without crowding fields
- option cards stack to one column on mobile, two columns on tablet, and up to
  three on desktop
- confirmation actions should become a sticky bottom action bar on mobile
- protocol metadata such as hashes, chain ids, or callback URLs must wrap inside
  a mono field block rather than forcing horizontal scroll on the main page
- modal usage should be minimal on mobile; prefer full-height sheets for wallet,
  quote, and permission review flows

## Accessibility And Content Rules

- target WCAG AA contrast for all text and interactive states
- every step needs a single plain-language headline that explains the user's job
- error copy must name the failing object, not just the generic action
- success copy must describe the completed system state, not just celebrate
- motion must respect reduced-motion preferences by disabling pulses and large
  transitions

## Handoff Boundary

### DesignSystemsLead Owns

- token recommendations and semantic token intent
- component anatomy, variants, and usage rules
- interaction, state, and responsive specifications
- accessibility intent and content-shape guidance
- design doc updates when onboarding flows add new states or modules

### CTO And Implementation Owners Own

- code-level token schema, naming conventions, and package structure
- component APIs, state management, and application architecture
- protocol provider integrations, validation rules, and telemetry wiring
- performance budgets, build tooling, and delivery sequencing
- conversion of this foundation into production UI code and test coverage

### Shared Contract

Engineering should treat this document as the source of truth for:

- semantic token categories
- required component variants
- non-negotiable interaction states
- responsive behavior expectations

Design must review any implementation change that:

- removes a documented state
- changes component anatomy
- compresses a mobile flow into hidden or inaccessible UI
- introduces protocol-specific styling that conflicts with the system tokens

## Blockers

There is no blocker for design-system direction.

Current constraints that affect implementation timing but do not block design work:

- canonical remote now exists, but the deployment, secrets, and observability stack is still undecided
- web-first application skeleton now exists locally, but package implementation is still pending
- exact wallet, contract, and payment provider payload shapes are still pending
  engineering definition

These constraints should be handled as engineering follow-ups, not as reasons to
delay the v0 system baseline.

## Next Execution Tasks

1. Use [design-system-engineering-intake.md](./design-system-engineering-intake.md)
   to land the first code-level token and primitive component plan.
2. Use [onboarding-copy-source-of-truth.md](./onboarding-copy-source-of-truth.md)
   when wiring fixture content, first-screen composition details, and
   implementation stories.
