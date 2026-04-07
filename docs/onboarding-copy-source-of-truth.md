# Onboarding First-Screen Copy Source Of Truth

## Purpose

This document locks the v0 copy for the first onboarding screen across the
three entry flows:

- AI agent
- ERC-8004
- x402

Use it with
[onboarding-screen-compositions.md](./onboarding-screen-compositions.md) for
screen structure and with
[design-system-foundation.md](./design-system-foundation.md) for component and
interaction rules.

## Shared Content Rules

- Headlines describe the user's job in plain language.
- Support copy explains what the next step confirms or unlocks.
- Primary CTAs use a direct verb and keep `Continue` as the default next-step
  label unless the state demands a more specific action.
- Disabled helper text must name the missing prerequisite in the same viewport.
- Warning copy must say whether the user can recover in place.
- Success copy confirms readiness without implying the full flow is complete.
- Error copy names the failing object and the recovery action.

## Shared Step Labels

Use these labels consistently in the step rail:

| Flow | Step 1 | Step 2 | Step 3 |
| --- | --- | --- | --- |
| AI agent | Capabilities | Details | Review |
| ERC-8004 | Wallet | Contract | Review |
| x402 | Quote | Settlement | Review |

## AI Agent

### Header Copy

| Element | Copy |
| --- | --- |
| step label | `Step 1 of 3` |
| headline | `Choose what this agent can do.` |
| support copy | `Select the jobs this agent should handle, then choose how it will connect. You'll review the exact access before activation.` |

### Capability Labels

Use this label set for the first-screen checklist. Hide unsupported options
rather than renaming the remaining labels.

| Label | Supporting line |
| --- | --- |
| `Answer questions` | `Respond to user or operator prompts using approved context.` |
| `Draft content` | `Create first-pass copy, summaries, or structured responses for review.` |
| `Trigger workflows` | `Start approved actions in connected tools or internal systems.` |
| `Read system data` | `Pull the records or state this agent needs to complete a task.` |
| `Send updates` | `Post status changes, alerts, or summaries back to your team.` |
| `Use external tools` | `Call connected services to complete multi-step tasks.` |

### Credential Method Cards

| Method | Label | Supporting line |
| --- | --- | --- |
| API key | `Use an API key` | `Best when this agent runs inside one trusted service.` |
| webhook | `Use a webhook` | `Best when another system should receive or approve each action.` |

### Footer And State Copy

| State | Primary CTA | Secondary CTA | Helper or notice copy |
| --- | --- | --- | --- |
| no capability selected | `Continue` | `Review requirements` | `Select at least one capability to continue.` |
| capability selected, no credential method | `Continue` | `Review requirements` | `Choose how this agent will connect before you continue.` |
| broad access warning | `Continue` | `Review requirements` | `This setup can act across multiple capabilities. Confirm that the selected access matches your internal policy.` |
| ready to advance | `Continue` | `Review requirements` | `Scope is ready. Continue to add connection details.` |
| invalid selection or blocked policy state | `Continue` | `Review requirements` | `We couldn't validate this setup. Update the highlighted choice and try again.` |

### Glossary Guidance

| Term | Plain-language guidance |
| --- | --- |
| capability | `A job the agent is allowed to perform.` |
| API key | `A secret token the agent uses to authenticate directly with one service.` |
| webhook | `A secure endpoint another system calls when it needs to pass work or confirm events.` |
| credential scope | `The exact access this agent receives when it uses the chosen connection method.` |

## ERC-8004

### Header Copy

| Element | Copy |
| --- | --- |
| step label | `Step 1 of 3` |
| headline | `Connect the wallet that will approve this request.` |
| support copy | `We'll confirm the network and signer first so you can verify that this flow is using the right wallet before any contract details appear.` |

### Network Naming Convention

Use `Chain + Network Tier` in all visible labels and warnings. Examples:

- `Ethereum Mainnet`
- `Base Mainnet`
- `Base Sepolia`

Avoid raw chain IDs or shorthand such as `eth`, `base`, or `8453` in first-step
headline, helper, or warning copy.

### Footer And State Copy

| State | Primary CTA | Secondary CTA | Helper or notice copy |
| --- | --- | --- | --- |
| wallet disconnected | `Connect wallet` | `Review requirements` | `Open a supported wallet to continue.` |
| wrong network warning | `Switch network` | `Review supported networks` | `This wallet is connected to the wrong network. Switch to the supported network before you continue.` |
| signer ready | `Continue` | `Review wallet details` | `Wallet ready. Confirm the network and signer, then continue to contract setup.` |
| read-only or unsupported signer | `Reconnect wallet` | `Review requirements` | `This wallet can view the request but cannot approve it. Reconnect with a supported signing account.` |

### Glossary Guidance

| Term | Plain-language guidance |
| --- | --- |
| ERC-8004 request | `A structured contract request your wallet can review and approve.` |
| wallet | `The account that identifies you and can approve the request.` |
| network | `The chain environment this request will run on.` |
| signer | `The part of the wallet that can approve the request.` |

## x402

### Header Copy

| Element | Copy |
| --- | --- |
| step label | `Step 1 of 3` |
| headline | `Choose how this flow should quote and collect payment.` |
| support copy | `Start with the current quote, then pick the payment path that matches how you want settlement to work. You'll review callback and settlement details next.` |

### Quote Summary Labels

| Element | Copy |
| --- | --- |
| amount label | `Amount due` |
| fee label | `Processing fee` |
| timing label | `Quote valid until` |
| settlement timing label | `Settlement timing` |
| fresh quote badge | `Fresh` |
| stale quote badge | `Needs refresh` |
| loading quote badge | `Refreshing quote` |
| error quote badge | `Quote unavailable` |

### Payment Method Comparison Copy

Use these large-card labels and rationale lines on the first screen:

| Method | Label | Rationale line |
| --- | --- | --- |
| automatic callback | `Automatic settlement` | `Fastest path. Best when your callback endpoint can confirm payment right away.` |
| manual review | `Manual settlement review` | `More control. Best when an operator should confirm each payment before settlement completes.` |

### Footer And State Copy

| State | Primary CTA | Secondary CTA | Helper or notice copy |
| --- | --- | --- | --- |
| quote fresh, no payment path selected | `Continue` | `Review quote assumptions` | `Choose a payment path to continue.` |
| stale quote warning | `Refresh quote` | `Review quote assumptions` | `This quote is out of date. Refresh it before you continue.` |
| callback verification pending | `Continue` | `Review callback requirements` | `Callback verification is still pending. You can continue, but settlement will pause until the callback is confirmed.` |
| quote and payment path ready | `Continue` | `Review quote assumptions` | `Quote is current and your payment path is selected. Continue to settlement setup.` |
| quote or callback error | `Review payment setup` | `Review quote assumptions` | `We couldn't confirm the payment configuration for this quote. Refresh the quote or fix the callback settings before you continue.` |

### Settlement Preview Copy

Use this sequence in the context rail when the quote is valid:

1. `Collect payment using the selected path.`
2. `Send the settlement callback.`
3. `Mark settlement complete after confirmation returns.`

Use this error copy when callback verification fails:

- title: `Callback check failed`
- body: `We couldn't reach the callback endpoint. Fix the endpoint or choose manual review before you continue.`

### Glossary Guidance

| Term | Plain-language guidance |
| --- | --- |
| x402 payment path | `The route this flow uses to request and confirm payment.` |
| quote | `The current price, fee, and timing details for this payment.` |
| callback | `The endpoint that receives the payment result so settlement can continue.` |
| settlement | `The final confirmation step that marks the payment flow complete.` |

## Implementation Rule

Treat this file as the canonical copy source for the first screen. Engineering
may adapt punctuation or truncation for specific breakpoints, but should not
paraphrase labels, headlines, or state messages without design review.
