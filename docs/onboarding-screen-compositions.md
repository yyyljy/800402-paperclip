# Onboarding First-Screen Composition Pass

## Purpose

This document applies the v0 system from
[design-system-foundation.md](./design-system-foundation.md) to the first
screen composition for the three onboarding entry points:

- AI agent
- ERC-8004
- x402

Use it as the screen-level companion to the foundation contract. The foundation
defines the system primitives; this document defines how those primitives should
be assembled when each flow opens. Use
[onboarding-copy-source-of-truth.md](./onboarding-copy-source-of-truth.md) for
the locked first-screen headline, support, CTA, and state copy.

## Shared Screen Contract

All three entry points should open inside the same shell so users understand
that the product is one system with different protocol paths.

### Shared Layout Slots

| Slot | Role | Required content |
| --- | --- | --- |
| top notice | environment or prerequisite state | warning or info banner only when action is needed |
| header block | explains the immediate job | step label, plain-language headline, 1-2 sentence support copy |
| progress rail | shows current position | current step, upcoming steps, completion state |
| primary work area | main decision or form content | one or two stacked modules tied to the current step |
| context rail | trust-building context | summary, metadata, helper guidance, or protocol state |
| action footer | next-step control | one primary action, optional secondary action, helper text |

### Cross-Flow Action Hierarchy

1. Primary action advances the current step only.
2. Secondary action can reveal more context or return to a safer state, but must
   never compete visually with the primary action.
3. Tertiary links should stay inside support copy or contextual cards.
4. Blocking prerequisites should disable the primary action and explain the
   reason in the same viewport.

### Shared Step Pattern

Each entry path should use a three-step first pass:

| Flow | Step 1 | Step 2 | Step 3 |
| --- | --- | --- | --- |
| AI agent | define capability and credential method | add integration details and prompt context | review scope and activate |
| ERC-8004 | confirm wallet, network, and signer readiness | add contract and settlement metadata | review request and sign |
| x402 | confirm quote and payment path | define callback and settlement handling | review commercial details and enable |

## AI Agent Onboarding

### Step Map

| Step | User goal | Required modules | Exit condition |
| --- | --- | --- | --- |
| 1. Capability setup | understand what the agent can do and how it will authenticate | `SectionHeader`, `ChecklistGroup`, `CredentialScopeCard`, `InlineNotice`, `PrimaryButton` | at least one capability selected and one credential method chosen |
| 2. Integration details | provide the key, webhook, or runtime details needed to connect | `TextField`, `TextArea`, `KeyValueList`, `InlineNotice` | required connection fields validate |
| 3. Review and activate | confirm permissions and launch state | `ReviewTable`, `StatusBadge`, `PrimaryButton` | user confirms activation |

### First-Screen Composition

| Slot | Content | Component mapping | Guidance |
| --- | --- | --- | --- |
| top notice | optional environment warning | `InlineNotice` | show only for missing permissions, unsupported environment, or required org policy |
| header block | `Choose what this agent can do.` plus scope explanation | `SectionHeader` | keep the headline plain-language; avoid model or provider jargon here |
| progress rail | step 1 active, steps 2-3 visible | `StepRail` | on desktop show short step names plus completion dots |
| primary work area A | capability selection | `ChecklistGroup` | list 4-6 capabilities max before a "show more" affordance is needed |
| primary work area B | authentication method choice and scope summary | `OptionCard`, `CredentialScopeCard` | present key and webhook paths as mutually exclusive cards before exposing detailed fields |
| context rail | what happens after activation | `KeyValueList`, prompt-context panel pattern | summarize where prompts, callbacks, or credentials will be used; avoid long prose blocks |
| action footer | continue once scope is valid | `PrimaryButton`, `SecondaryButton` | secondary action should be a low-emphasis requirements review, not another setup branch |

### First-Screen Action Rules

- Before capability selection, the primary action remains disabled with helper
  text below the footer.
- After a capability is selected but no credential method is chosen, keep focus
  inside the authentication cards rather than moving the user to a new step.
- Use warning notice treatment for broad permission grants; reserve error
  treatment for invalid or blocked setup states only.

### Responsive Notes

- On mobile, move the context rail below the credential scope card so the
  capability checklist remains above the fold.
- On tablet, keep the context panel below the checklist unless both modules fit
  without pushing the footer off-screen.
- On desktop, pin the context rail beside the primary work area only when the
  helper content stays shorter than the capability list.

### Copy Source

Use [onboarding-copy-source-of-truth.md](./onboarding-copy-source-of-truth.md#ai-agent)
for the locked v0 copy.

## ERC-8004 Onboarding

### Step Map

| Step | User goal | Required modules | Exit condition |
| --- | --- | --- | --- |
| 1. Wallet readiness | verify wallet, chain, and signer state | `SectionHeader`, `WalletConnectionCard`, `NetworkBadge`, `InlineNotice`, `PrimaryButton` | wallet connected, supported network selected, signer state readable |
| 2. Contract context | capture contract and request metadata | `TextField`, `KeyValueList`, contract metadata panel | required contract metadata validates |
| 3. Review and sign | confirm chain action and authorization scope | `ReviewTable`, signer summary, `PrimaryButton` | user approves the signing action |

### First-Screen Composition

| Slot | Content | Component mapping | Guidance |
| --- | --- | --- | --- |
| top notice | unsupported network or signer warning | `InlineNotice` | use warning state for wrong network, escalate to error only when the user cannot continue |
| header block | `Connect the wallet that will approve this request.` | `SectionHeader` | support copy should explain why chain and signer context are needed before contract details |
| progress rail | step 1 active, steps 2-3 visible | `StepRail` | use concise step names: wallet, contract, review |
| primary work area A | wallet connection and address state | `WalletConnectionCard` | include reconnect and switch-network affordances inside the card, not the footer |
| primary work area B | signer summary and contract-readiness checklist | `KeyValueList`, `ChecklistGroup` | show expected chain, signer type, and required prerequisites together |
| context rail | contract metadata preview | contract metadata panel, `StatusBadge` | hold a placeholder summary for contract name, environment, and settlement mode even before full metadata entry |
| action footer | connect or continue depending on state | `PrimaryButton`, `SecondaryButton` | when disconnected, the primary action is connect wallet; once connected, it advances to contract details |

### First-Screen Action Rules

- Do not expose contract fields until the wallet state is known.
- Keep the connect-wallet action inside the main card and mirror it in the
  footer only when needed for mobile reachability.
- Use success treatment after wallet connection, but do not auto-advance; users
  should still confirm chain and signer context before moving on.

### Responsive Notes

- On mobile, stack wallet state, signer checklist, and contract preview in one
  column and collapse long addresses into chunked mono rows.
- On tablet, allow the contract preview to sit below the wallet card if the
  signer checklist is longer than four rows.
- On desktop, keep the contract preview in the context rail so the user can
  verify environment and contract mode without leaving step 1.

### Copy Source

Use [onboarding-copy-source-of-truth.md](./onboarding-copy-source-of-truth.md#erc-8004)
for the locked v0 copy.

## x402 Onboarding

### Step Map

| Step | User goal | Required modules | Exit condition |
| --- | --- | --- | --- |
| 1. Quote and payment path | confirm commercial intent and payment mode | `SectionHeader`, `QuoteSummaryCard`, `OptionCard`, `InlineNotice`, `PrimaryButton` | quote is fresh and payment path selected |
| 2. Callback and settlement | define the post-payment handling path | `CallbackStatusCard`, `TextField`, settlement checklist | callback or settlement requirements validate |
| 3. Review and enable | confirm quote, timing, and settlement behavior | `ReviewTable`, `EventTimeline`, `PrimaryButton` | user enables the payment flow |

### First-Screen Composition

| Slot | Content | Component mapping | Guidance |
| --- | --- | --- | --- |
| top notice | stale quote, unsupported method, or pending verification | `InlineNotice` | stale quotes should default to warning, not error, when refresh is available |
| header block | `Choose how this flow should quote and collect payment.` | `SectionHeader` | support copy should frame x402 as payment-routing setup, not protocol trivia |
| progress rail | step 1 active, steps 2-3 visible | `StepRail` | use concise step names: quote, settlement, review |
| primary work area A | commercial quote summary | `QuoteSummaryCard` | show amount, timing, fee summary, and refresh state before payment method selection |
| primary work area B | payment method selection | `OptionCard`, `StatusBadge` | present methods as large cards with short benefit/risk labels rather than dense table rows |
| context rail | callback and settlement preview | `CallbackStatusCard`, settlement checklist | establish trust by previewing settlement sequence and callback expectations before configuration |
| action footer | continue when quote is fresh and method is selected | `PrimaryButton`, `SecondaryButton` | secondary action should refresh or review quote assumptions, not branch into a separate commercial flow |

### First-Screen Action Rules

- If the quote is stale, refresh becomes the highest-priority action until the
  quote is usable again.
- Payment method cards should expose one short rationale line so users can
  compare speed, control, or operational complexity quickly.
- Pending callback verification belongs in the context rail; do not block the
  quote summary unless settlement cannot proceed at all.

### Responsive Notes

- On mobile, keep the quote summary above payment cards and convert settlement
  preview into a compact stacked checklist.
- On tablet, show payment method cards in two columns only when each card still
  preserves a clear rationale line.
- On desktop, keep quote summary and settlement preview visible at once so users
  can compare commercial and operational consequences in a single scan.

### Copy Source

Use [onboarding-copy-source-of-truth.md](./onboarding-copy-source-of-truth.md#x402)
for the locked v0 copy.

## Cross-Flow Content Guardrails

- Keep every first-screen headline focused on the user's job, not the internal
  system name.
- Support copy should explain the consequence of continuing, not repeat the
  headline in different words.
- Every flow should expose its blocking prerequisite in the first viewport.
- Context rails should summarize "what happens next" or "what this affects,"
  never duplicate the full primary form.

## Follow-Up Dependencies

The composition pass is ready for implementation handoff. The remaining tracked
dependency is engineering payload and state-shape confirmation already tracked
in
[CMP-18](/CMP/issues/CMP-18) for contract metadata, wallet states, quote
freshness, and settlement callback details. The locked UX copy source now lives
in [onboarding-copy-source-of-truth.md](./onboarding-copy-source-of-truth.md).
