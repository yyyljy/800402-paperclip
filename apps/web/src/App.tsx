import { useMemo, useRef, useState } from "react";
import {
  AppShell,
  ChecklistGroup,
  InlineNotice,
  OptionCard,
  PrimaryButton,
  ReviewTable,
  SecondaryButton,
  SectionHeader,
  StatusBadge,
  StepRail,
  type ChecklistItem,
  type ReviewRow,
  type StepRailItem,
} from "@onboarding/ui-primitives";
import { runtimeConfig } from "./runtime-config";

const stepItems: StepRailItem[] = [
  {
    id: "capabilities",
    label: "Capabilities",
    description: "Choose the jobs this agent can handle.",
    state: "current",
  },
  {
    id: "details",
    label: "Details",
    description: "Add the connection details and runtime context.",
    state: "upcoming",
  },
  {
    id: "review",
    label: "Review",
    description: "Confirm scope and activate the agent.",
    state: "upcoming",
  },
];

const capabilityItems: ChecklistItem[] = [
  {
    value: "answer-questions",
    label: "Answer questions",
    description: "Respond to user or operator prompts using approved context.",
  },
  {
    value: "draft-content",
    label: "Draft content",
    description: "Create first-pass copy, summaries, or structured responses for review.",
  },
  {
    value: "trigger-workflows",
    label: "Trigger workflows",
    description: "Start approved actions in connected tools or internal systems.",
  },
  {
    value: "read-system-data",
    label: "Read system data",
    description: "Pull the records or state this agent needs to complete a task.",
  },
  {
    value: "send-updates",
    label: "Send updates",
    description: "Post status changes, alerts, or summaries back to your team.",
  },
  {
    value: "use-external-tools",
    label: "Use external tools",
    description: "Call connected services to complete multi-step tasks.",
  },
];

const credentialOptions = [
  {
    value: "api-key",
    label: "Use an API key",
    description: "Best when this agent runs inside one trusted service.",
  },
  {
    value: "webhook",
    label: "Use a webhook",
    description: "Best when another system should receive or approve each action.",
  },
];

const stateBadgeTones = [
  "info",
  "success",
  "warning",
  "error",
  "neutral",
] as const;

type NoticeTone = "warning" | "error";
type BadgeTone = (typeof stateBadgeTones)[number];

function getNoticeIcon(tone: NoticeTone) {
  if (tone === "warning") {
    return "!";
  }

  return "×";
}

type HelperState = {
  accessReview: string;
  badge: string;
  badgeTone: BadgeTone;
  footer: string;
  title: string;
  notice?: {
    body: string;
    title: string;
    tone: NoticeTone;
  };
};

function buildHelperState(
  selectedCapabilities: string[],
  selectedCredential: string | null,
): HelperState {
  const broadAccess =
    selectedCapabilities.length >= 4 ||
    selectedCapabilities.includes("use-external-tools");

  if (selectedCapabilities.length === 0) {
    return {
      accessReview: "Waiting on required choices",
      badge: "Waiting on scope",
      badgeTone: "neutral",
      title: "Select at least one capability",
      footer: "Select at least one capability to continue.",
    };
  }

  if (!selectedCredential) {
    return {
      accessReview: "Waiting on required choices",
      badge: "Connection needed",
      badgeTone: "info",
      title: "Choose how this agent will connect",
      footer: "Choose how this agent will connect before you continue.",
    };
  }

  if (broadAccess) {
    return {
      accessReview: "Broad access warning",
      badge: "Policy review recommended",
      badgeTone: "warning",
      title: "Broad access needs an extra check",
      footer:
        "This setup can act across multiple capabilities. Confirm that the selected access matches your internal policy.",
      notice: {
        body: "This setup can act across multiple capabilities. Confirm that the selected access matches your internal policy.",
        title: "Broad access needs an extra check",
        tone: "warning",
      },
    };
  }

  return {
    accessReview: "Scoped access ready",
    badge: "Step 1 ready",
    badgeTone: "success",
    title: "Scope ready",
    footer: "Scope is ready. Continue to add connection details.",
  };
}

export function App() {
  const reviewRef = useRef<HTMLDivElement | null>(null);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([
    "answer-questions",
    "send-updates",
  ]);
  const [selectedCredential, setSelectedCredential] = useState<string | null>(
    "api-key",
  );

  const capabilityLabels = useMemo(
    () =>
      capabilityItems
        .filter((item) => selectedCapabilities.includes(item.value))
        .map((item) => item.label),
    [selectedCapabilities],
  );

  const helperState = buildHelperState(
    selectedCapabilities,
    selectedCredential,
  );
  const canContinue =
    selectedCapabilities.length > 0 && selectedCredential !== null;
  const selectedCredentialLabel =
    credentialOptions.find((option) => option.value === selectedCredential)
      ?.label ?? "Not selected";

  const reviewRows: ReviewRow[] = [
    {
      label: "Selected capabilities",
      value:
        capabilityLabels.length > 0 ? capabilityLabels.join(", ") : "Not selected",
    },
    {
      label: "Connection method",
      value: selectedCredentialLabel,
    },
    {
      label: "Access review",
      value: helperState.accessReview,
    },
    {
      label: "Next step",
      value: "Add the connection details and runtime context.",
    },
  ];

  function toggleCapability(value: string) {
    setSelectedCapabilities((current) =>
      current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value],
    );
  }

  return (
    <main className="app-page">
      <div className="app-page__intro">
        <p className="app-page__eyebrow">Onboarding v0 reference screen</p>
        <div className="app-page__intro-grid">
          <div>
            <h2>Shared primitives driving one real onboarding surface.</h2>
            <p>
              This reference composition uses semantic tokens and reusable
              Layer 1 and Layer 2 primitives instead of screen-local styling.
            </p>
          </div>
          <dl className="runtime-card">
            <div>
              <dt>APP_ENV</dt>
              <dd>{runtimeConfig.appEnv}</dd>
            </div>
            <div>
              <dt>BASE_URL</dt>
              <dd>{runtimeConfig.baseUrl}</dd>
            </div>
            <div>
              <dt>API_BASE_URL</dt>
              <dd>{runtimeConfig.apiBaseUrl}</dd>
            </div>
          </dl>
        </div>
      </div>

      <AppShell
        notice={
          helperState.notice ? (
            <InlineNotice
              action={
                <StatusBadge tone={helperState.badgeTone}>
                  {helperState.badge}
                </StatusBadge>
              }
              body={helperState.notice.body}
              icon={
                <span aria-hidden="true">
                  {getNoticeIcon(helperState.notice.tone)}
                </span>
              }
              title={helperState.notice.title}
              tone={helperState.notice.tone}
            />
          ) : undefined
        }
        header={
          <SectionHeader
            description="Select the jobs this agent should handle, then choose how it will connect. You'll review the exact access before activation."
            statusSlot={
              <StatusBadge tone={helperState.badgeTone}>
                {helperState.badge}
              </StatusBadge>
            }
            stepLabel="Step 1 of 3"
            title="Choose what this agent can do."
          />
        }
        progress={<StepRail steps={stepItems} />}
        main={
          <div className="screen-stack">
            <section className="screen-panel">
              <div className="screen-panel__header">
                <p className="screen-panel__eyebrow">Primary work area A</p>
                <h3>Capability selection</h3>
                <p>
                  Start with the jobs this agent should be allowed to perform.
                  Keep the first pass focused and add broader access only when
                  it is operationally necessary.
                </p>
              </div>
              <ChecklistGroup
                description="Hide unsupported options instead of relabeling them. This starter pass keeps the checklist constrained to six decisions."
                items={capabilityItems}
                legend="Choose one or more approved capabilities."
                onToggle={toggleCapability}
                selectedValues={selectedCapabilities}
              />
            </section>

            <section className="screen-panel">
              <div className="screen-panel__header">
                <p className="screen-panel__eyebrow">Primary work area B</p>
                <h3>Authentication choice</h3>
                <p>
                  Present direct and callback-driven connection paths as large
                  cards before exposing any detailed fields in the next step.
                </p>
              </div>
              <div className="option-grid">
                {credentialOptions.map((option) => (
                  <OptionCard
                    key={option.value}
                    description={option.description}
                    meta={
                      selectedCredential === option.value ? (
                        <StatusBadge tone="success">Selected</StatusBadge>
                      ) : (
                        <StatusBadge tone="neutral">Available</StatusBadge>
                      )
                    }
                    onSelect={() => setSelectedCredential(option.value)}
                    selected={selectedCredential === option.value}
                    title={option.label}
                  />
                ))}
              </div>
            </section>
          </div>
        }
        aside={
          <div className="screen-stack">
            <section className="screen-panel" ref={reviewRef}>
              <div className="screen-panel__header">
                <p className="screen-panel__eyebrow">Context rail</p>
                <h3>Review summary</h3>
                <p>
                  Keep the first-screen summary focused on scope, connection
                  method, and what unlocks next.
                </p>
              </div>
              <ReviewTable rows={reviewRows} />
            </section>

            <section className="screen-panel">
              <div className="screen-panel__header">
                <p className="screen-panel__eyebrow">What happens next</p>
                <h3>Immediate downstream path</h3>
              </div>
              <ul className="helper-list">
                <li>Connection details unlock only after scope is selected.</li>
                <li>Broad capability sets stay in place and require policy review.</li>
                <li>The review step confirms exact access before activation.</li>
              </ul>
            </section>

            <section className="screen-panel">
              <div className="screen-panel__header">
                <p className="screen-panel__eyebrow">Layer 1 state coverage</p>
                <h3>Feedback and control variants</h3>
                <p>
                  Keep loading, disabled, warning, success, and error treatments
                  in shared primitives before protocol-specific cards arrive.
                </p>
              </div>
              <div className="state-showcase">
                <div className="badge-row">
                  {stateBadgeTones.map((tone) => (
                    <StatusBadge key={tone} tone={tone}>
                      {tone[0].toUpperCase()}
                      {tone.slice(1)}
                    </StatusBadge>
                  ))}
                </div>
                <InlineNotice
                  action={
                    <SecondaryButton variant="subtle">
                      Review guidelines
                    </SecondaryButton>
                  }
                  body="The shared error treatment is ready before protocol-specific payload contracts land."
                  icon={<span aria-hidden="true">{getNoticeIcon("error")}</span>}
                  title="Error handling stays inside the primitive layer"
                  tone="error"
                />
                <div className="button-row">
                  <PrimaryButton loading loadingLabel="Validating">
                    Validate scope
                  </PrimaryButton>
                  <PrimaryButton disabled>Continue locked</PrimaryButton>
                </div>
              </div>
            </section>
          </div>
        }
        footer={
          <div className="action-footer">
            <div className="action-footer__copy">
              <p className="action-footer__eyebrow">Action footer</p>
              <strong>{helperState.title}</strong>
              <p>{helperState.footer}</p>
            </div>
            <div className="action-footer__buttons">
              <SecondaryButton
                onClick={() =>
                  reviewRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
              >
                Review requirements
              </SecondaryButton>
              <PrimaryButton disabled={!canContinue}>Continue</PrimaryButton>
            </div>
          </div>
        }
      />
    </main>
  );
}
