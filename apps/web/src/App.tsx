import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  AppShell,
  ChecklistGroup,
  InlineNotice,
  OptionCard,
  PrimaryButton,
  ReviewTable,
  SecondaryButton,
  SectionHeader,
  SegmentedControl,
  StatusBadge,
  StepRail,
  type ChecklistItem,
  type ReviewRow,
  type StepRailItem,
} from "@onboarding/ui-primitives";
import { runtimeConfig } from "./runtime-config";

const aiStepItems: StepRailItem[] = [
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

const ercStepItems: StepRailItem[] = [
  {
    id: "wallet",
    label: "Wallet",
    description: "Confirm wallet, chain, and signer readiness.",
    state: "current",
  },
  {
    id: "contract",
    label: "Contract",
    description: "Add contract and settlement metadata.",
    state: "upcoming",
  },
  {
    id: "review",
    label: "Review",
    description: "Review the request before signing.",
    state: "upcoming",
  },
];

const x402StepItems: StepRailItem[] = [
  {
    id: "quote",
    label: "Quote",
    description: "Confirm the current quote and payment path.",
    state: "current",
  },
  {
    id: "settlement",
    label: "Settlement",
    description: "Define callback and settlement handling.",
    state: "upcoming",
  },
  {
    id: "review",
    label: "Review",
    description: "Review commercial details and enable the flow.",
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

const paymentPathOptions = [
  {
    value: "automatic-callback",
    label: "Automatic settlement",
    description:
      "Fastest path. Best when your callback endpoint can confirm payment right away.",
  },
  {
    value: "manual-review",
    label: "Manual settlement review",
    description:
      "More control. Best when an operator should confirm each payment before settlement completes.",
  },
] as const;

const flowOptions = [
  { value: "ai-agent", label: "AI agent" },
  { value: "erc-8004", label: "ERC-8004" },
  { value: "x402", label: "x402" },
] as const;

const stateBadgeTones = [
  "info",
  "success",
  "warning",
  "error",
  "neutral",
] as const;

type FlowId = (typeof flowOptions)[number]["value"];
type NoticeTone = "info" | "warning" | "error";
type BadgeTone = (typeof stateBadgeTones)[number];
type ErcWalletState =
  | "disconnected"
  | "wrong-network"
  | "ready"
  | "read-only";
type X402QuoteState = "fresh" | "stale" | "callback-pending" | "error";
type PaymentPath = (typeof paymentPathOptions)[number]["value"];

type FlowCopyState = {
  badge: string;
  badgeTone: BadgeTone;
  footer: string;
  primaryLabel: string;
  secondaryLabel: string;
  title: string;
  notice?: {
    body: string;
    title: string;
    tone: NoticeTone;
  };
};

type StatusItem = {
  description: string;
  label: string;
  status: string;
  tone: BadgeTone;
};

type FactRow = {
  label: string;
  value: ReactNode;
};

type AppProps = {
  initialFlow?: FlowId;
  initialSelectedCapabilities?: string[];
  initialSelectedCredential?: string | null;
  initialErcWalletState?: ErcWalletState;
  initialX402QuoteState?: X402QuoteState;
  initialSelectedPaymentPath?: PaymentPath | null;
};

const defaultSelectedCapabilities: string[] = [];
const defaultSelectedCredential: string | null = null;

function getNoticeIcon(tone: NoticeTone) {
  if (tone === "warning") {
    return "!";
  }

  if (tone === "error") {
    return "×";
  }

  return "i";
}

function buildAiHelperState(
  selectedCapabilities: string[],
  selectedCredential: string | null,
): FlowCopyState & { accessReview: string } {
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
      primaryLabel: "Continue",
      secondaryLabel: "Review requirements",
    };
  }

  if (!selectedCredential) {
    return {
      accessReview: "Waiting on required choices",
      badge: "Connection needed",
      badgeTone: "info",
      title: "Choose how this agent will connect",
      footer: "Choose how this agent will connect before you continue.",
      primaryLabel: "Continue",
      secondaryLabel: "Review requirements",
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
      primaryLabel: "Continue",
      secondaryLabel: "Review requirements",
      notice: {
        body:
          "This setup can act across multiple capabilities. Confirm that the selected access matches your internal policy.",
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
    primaryLabel: "Continue",
    secondaryLabel: "Review requirements",
  };
}

function buildErcHelperState(walletState: ErcWalletState): FlowCopyState {
  if (walletState === "disconnected") {
    return {
      badge: "Wallet needed",
      badgeTone: "info",
      title: "Connect a supported wallet",
      footer: "Open a supported wallet to continue.",
      primaryLabel: "Connect wallet",
      secondaryLabel: "Review requirements",
    };
  }

  if (walletState === "wrong-network") {
    return {
      badge: "Wrong network",
      badgeTone: "warning",
      title: "Switch to Base Sepolia",
      footer:
        "This wallet is connected to the wrong network. Switch to the supported network before you continue.",
      primaryLabel: "Switch network",
      secondaryLabel: "Review supported networks",
      notice: {
        body:
          "This wallet is connected to the wrong network. Switch to the supported network before you continue.",
        title: "Unsupported network detected",
        tone: "warning",
      },
    };
  }

  if (walletState === "read-only") {
    return {
      badge: "Signer unavailable",
      badgeTone: "error",
      title: "Reconnect with a signing wallet",
      footer:
        "This wallet can view the request but cannot approve it. Reconnect with a supported signing account.",
      primaryLabel: "Reconnect wallet",
      secondaryLabel: "Review requirements",
      notice: {
        body:
          "This wallet can view the request but cannot approve it. Reconnect with a supported signing account.",
        title: "Signer approval required",
        tone: "error",
      },
    };
  }

  return {
    badge: "Wallet ready",
    badgeTone: "success",
    title: "Signer context confirmed",
    footer:
      "Wallet ready. Confirm the network and signer, then continue to contract setup.",
    primaryLabel: "Continue",
    secondaryLabel: "Review wallet details",
  };
}

function buildX402HelperState(
  quoteState: X402QuoteState,
  selectedPaymentPath: PaymentPath | null,
): FlowCopyState {
  if (quoteState === "stale") {
    return {
      badge: "Needs refresh",
      badgeTone: "warning",
      title: "Refresh the quote before continuing",
      footer: "This quote is out of date. Refresh it before you continue.",
      primaryLabel: "Refresh quote",
      secondaryLabel: "Review quote assumptions",
      notice: {
        body: "This quote is out of date. Refresh it before you continue.",
        title: "Quote needs refresh",
        tone: "warning",
      },
    };
  }

  if (quoteState === "error" && selectedPaymentPath !== "manual-review") {
    return {
      badge: "Quote unavailable",
      badgeTone: "error",
      title: "Review payment setup",
      footer:
        "We couldn't confirm the payment configuration for this quote. Refresh the quote or fix the callback settings before you continue.",
      primaryLabel: "Review payment setup",
      secondaryLabel: "Review quote assumptions",
      notice: {
        body:
          "We couldn't reach the callback endpoint. Fix the endpoint or choose manual review before you continue.",
        title: "Callback check failed",
        tone: "error",
      },
    };
  }

  if (!selectedPaymentPath) {
    return {
      badge: "Payment path needed",
      badgeTone: "info",
      title: "Choose a payment path",
      footer: "Choose a payment path to continue.",
      primaryLabel: "Continue",
      secondaryLabel: "Review quote assumptions",
    };
  }

  if (quoteState === "callback-pending") {
    return {
      badge: "Callback pending",
      badgeTone: "warning",
      title: "Callback verification is still pending",
      footer:
        "Callback verification is still pending. You can continue, but settlement will pause until the callback is confirmed.",
      primaryLabel: "Continue",
      secondaryLabel: "Review callback requirements",
    };
  }

  return {
    badge: "Quote ready",
    badgeTone: "success",
    title: "Quote and payment path ready",
    footer:
      "Quote is current and your payment path is selected. Continue to settlement setup.",
    primaryLabel: "Continue",
    secondaryLabel: "Review quote assumptions",
  };
}

function ActionFooter({
  body,
  onPrimaryClick,
  onSecondaryClick,
  primaryDisabled,
  primaryLabel,
  secondaryLabel,
  title,
}: {
  body: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  primaryDisabled?: boolean;
  primaryLabel: string;
  secondaryLabel: string;
  title: string;
}) {
  return (
    <div className="action-footer">
      <div className="action-footer__copy">
        <p className="action-footer__eyebrow">Action footer</p>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
      <div className="action-footer__buttons">
        <SecondaryButton onClick={onSecondaryClick}>
          {secondaryLabel}
        </SecondaryButton>
        <PrimaryButton disabled={primaryDisabled} onClick={onPrimaryClick}>
          {primaryLabel}
        </PrimaryButton>
      </div>
    </div>
  );
}

function FactGrid({ rows }: { rows: FactRow[] }) {
  return (
    <dl className="fact-grid">
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function StatusList({ items }: { items: StatusItem[] }) {
  return (
    <ul className="status-list">
      {items.map((item) => (
        <li key={item.label}>
          <div className="status-list__row">
            <strong>{item.label}</strong>
            <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
          </div>
          <p>{item.description}</p>
        </li>
      ))}
    </ul>
  );
}

function buildErcWalletRows(walletState: ErcWalletState): FactRow[] {
  if (walletState === "disconnected") {
    return [
      { label: "Wallet address", value: "Not connected" },
      { label: "Current network", value: "Pending wallet connection" },
      { label: "Signer", value: "Unavailable until a wallet is connected" },
      { label: "Request type", value: "ERC-8004 approval request" },
    ];
  }

  if (walletState === "wrong-network") {
    return [
      {
        label: "Wallet address",
        value: <span className="fact-grid__value--mono">0x71F6...94B2</span>,
      },
      { label: "Current network", value: "Ethereum Mainnet" },
      { label: "Signer", value: "Externally owned account" },
      { label: "Request type", value: "ERC-8004 approval request" },
    ];
  }

  if (walletState === "read-only") {
    return [
      {
        label: "Wallet address",
        value: <span className="fact-grid__value--mono">0x71F6...94B2</span>,
      },
      { label: "Current network", value: "Base Sepolia" },
      { label: "Signer", value: "Read-only session" },
      { label: "Request type", value: "ERC-8004 approval request" },
    ];
  }

  return [
    {
      label: "Wallet address",
      value: <span className="fact-grid__value--mono">0x71F6...94B2</span>,
    },
    { label: "Current network", value: "Base Sepolia" },
    { label: "Signer", value: "Externally owned account" },
    { label: "Request type", value: "ERC-8004 approval request" },
  ];
}

function buildErcReadinessItems(walletState: ErcWalletState): StatusItem[] {
  const walletConnected = walletState !== "disconnected";
  const supportedNetwork =
    walletState === "ready" || walletState === "read-only";
  const signerReady = walletState === "ready";

  return [
    {
      label: "Wallet connection",
      description: "Read the account that will review and approve this request.",
      status: walletConnected ? "Connected" : "Missing",
      tone: walletConnected ? "success" : "neutral",
    },
    {
      label: "Supported network",
      description:
        "Use Base Sepolia before contract details and settlement metadata appear.",
      status: supportedNetwork
        ? "Base Sepolia"
        : walletState === "wrong-network"
          ? "Switch required"
          : "Pending",
      tone: supportedNetwork
        ? "success"
        : walletState === "wrong-network"
          ? "warning"
          : "neutral",
    },
    {
      label: "Signing capability",
      description:
        "The signer must be able to approve the request instead of only viewing it.",
      status: signerReady
        ? "Ready to approve"
        : walletState === "read-only"
          ? "Read-only"
          : "Pending",
      tone: signerReady
        ? "success"
        : walletState === "read-only"
          ? "error"
          : "neutral",
    },
  ];
}

function buildErcReviewRows(walletState: ErcWalletState): ReviewRow[] {
  return [
    {
      label: "Connected wallet",
      value:
        walletState === "disconnected"
          ? "Not connected"
          : "0x71F6...94B2 on Base-linked environment",
    },
    {
      label: "Network",
      value:
        walletState === "wrong-network"
          ? "Ethereum Mainnet"
          : walletState === "disconnected"
            ? "Awaiting wallet context"
            : "Base Sepolia",
    },
    {
      label: "Signer state",
      value:
        walletState === "ready"
          ? "Signer ready"
          : walletState === "read-only"
            ? "Read-only session"
            : "Pending review",
    },
    {
      label: "Next step",
      value: "Add contract and settlement metadata.",
    },
  ];
}

function buildErcContractPreviewRows(walletState: ErcWalletState): ReviewRow[] {
  return [
    {
      label: "Contract name",
      value:
        walletState === "disconnected"
          ? "Awaiting wallet context"
          : "Escrow request approval",
    },
    {
      label: "Environment",
      value:
        walletState === "wrong-network"
          ? "Expected: Base Sepolia"
          : "Base Sepolia",
    },
    {
      label: "Settlement mode",
      value: "Signer confirmation required",
    },
    {
      label: "Metadata state",
      value: "Placeholder preview until step 2 details are entered.",
    },
  ];
}

function getQuoteBadge(
  quoteState: X402QuoteState,
  selectedPaymentPath: PaymentPath | null,
) {
  if (quoteState === "stale") {
    return {
      label: "Needs refresh",
      tone: "warning" as const,
    };
  }

  if (quoteState === "error" && selectedPaymentPath !== "manual-review") {
    return {
      label: "Quote unavailable",
      tone: "error" as const,
    };
  }

  return {
    label: "Fresh",
    tone: "success" as const,
  };
}

function getSelectedPaymentLabel(selectedPaymentPath: PaymentPath | null) {
  return (
    paymentPathOptions.find((option) => option.value === selectedPaymentPath)
      ?.label ?? "Not selected"
  );
}

function buildX402QuoteRows(
  quoteState: X402QuoteState,
  selectedPaymentPath: PaymentPath | null,
): ReviewRow[] {
  return [
    {
      label: "Amount due",
      value: "$240.00",
    },
    {
      label: "Processing fee",
      value: "$6.40",
    },
    {
      label: "Quote valid until",
      value:
        quoteState === "stale" ? "Expired 4 minutes ago" : "16 minutes remaining",
    },
    {
      label: "Settlement timing",
      value:
        quoteState === "callback-pending"
          ? "Waits for callback confirmation"
          : selectedPaymentPath === "manual-review"
            ? "Operator confirms before settlement"
            : "Under 5 minutes after confirmation",
    },
  ];
}

function buildX402SettlementItems(
  quoteState: X402QuoteState,
  selectedPaymentPath: PaymentPath | null,
): StatusItem[] {
  const callbackBlocked =
    quoteState === "error" && selectedPaymentPath !== "manual-review";

  return [
    {
      label: "Collect payment using the selected path.",
      description:
        selectedPaymentPath === "automatic-callback"
          ? "Automatic settlement will request and confirm payment in one path."
          : selectedPaymentPath === "manual-review"
            ? "Manual review adds an operator checkpoint before settlement completes."
            : "Choose automatic or manual settlement to preview the next step.",
      status: getSelectedPaymentLabel(selectedPaymentPath),
      tone: selectedPaymentPath ? "success" : "neutral",
    },
    {
      label: "Send the settlement callback.",
      description: callbackBlocked
        ? "The callback endpoint could not be reached. Choose manual review or fix the callback before continuing."
        : quoteState === "callback-pending"
          ? "Verification is still pending. Settlement can continue later after the callback confirms."
          : selectedPaymentPath === "manual-review"
            ? "Manual review keeps the callback path out of the critical first-step decision."
            : "The callback path is ready to confirm payment after collection finishes.",
      status: callbackBlocked
        ? "Blocked"
        : quoteState === "callback-pending"
          ? "Pending"
          : selectedPaymentPath === "manual-review"
            ? "Optional"
            : "Ready",
      tone: callbackBlocked
        ? "error"
        : quoteState === "callback-pending"
          ? "warning"
          : selectedPaymentPath
            ? "success"
            : "neutral",
    },
    {
      label: "Mark settlement complete after confirmation returns.",
      description:
        "Step 2 will capture callback and settlement guardrails before this flow goes live.",
      status: "Next step",
      tone: "info",
    },
  ];
}

function buildX402ReviewRows(
  quoteState: X402QuoteState,
  selectedPaymentPath: PaymentPath | null,
): ReviewRow[] {
  return [
    {
      label: "Payment path",
      value: getSelectedPaymentLabel(selectedPaymentPath),
    },
    {
      label: "Callback status",
      value:
        quoteState === "error" && selectedPaymentPath !== "manual-review"
          ? "Callback check failed"
          : quoteState === "callback-pending"
            ? "Verification pending"
            : selectedPaymentPath === "manual-review"
              ? "Operator-managed"
              : "Verified",
    },
    {
      label: "Quote status",
      value:
        quoteState === "stale"
          ? "Needs refresh"
          : quoteState === "error" && selectedPaymentPath !== "manual-review"
            ? "Unavailable"
            : "Current",
    },
    {
      label: "Next step",
      value: "Define callback and settlement handling.",
    },
  ];
}

export function App({
  initialFlow = "ai-agent",
  initialSelectedCapabilities = defaultSelectedCapabilities,
  initialSelectedCredential = defaultSelectedCredential,
  initialErcWalletState = "ready",
  initialX402QuoteState = "fresh",
  initialSelectedPaymentPath = null,
}: AppProps = {}) {
  const reviewRef = useRef<HTMLDivElement | null>(null);
  const x402PaymentRef = useRef<HTMLDivElement | null>(null);
  const [selectedFlow, setSelectedFlow] = useState<FlowId>(initialFlow);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>(
    () => [...initialSelectedCapabilities],
  );
  const [selectedCredential, setSelectedCredential] = useState<string | null>(
    initialSelectedCredential,
  );
  const [ercWalletState, setErcWalletState] =
    useState<ErcWalletState>(initialErcWalletState);
  const [x402QuoteState, setX402QuoteState] =
    useState<X402QuoteState>(initialX402QuoteState);
  const [selectedPaymentPath, setSelectedPaymentPath] =
    useState<PaymentPath | null>(initialSelectedPaymentPath);

  const capabilityLabels = useMemo(
    () =>
      capabilityItems
        .filter((item) => selectedCapabilities.includes(item.value))
        .map((item) => item.label),
    [selectedCapabilities],
  );

  const aiHelperState = buildAiHelperState(
    selectedCapabilities,
    selectedCredential,
  );
  const ercHelperState = buildErcHelperState(ercWalletState);
  const x402HelperState = buildX402HelperState(
    x402QuoteState,
    selectedPaymentPath,
  );

  const canContinueAi =
    selectedCapabilities.length > 0 && selectedCredential !== null;
  const canContinueX402 =
    x402QuoteState !== "stale" &&
    !(x402QuoteState === "error" && selectedPaymentPath !== "manual-review") &&
    selectedPaymentPath !== null;
  const selectedCredentialLabel =
    credentialOptions.find((option) => option.value === selectedCredential)
      ?.label ?? "Not selected";
  const selectedFlowLabel =
    flowOptions.find((option) => option.value === selectedFlow)?.label ??
    "AI agent";
  const currentShellState =
    selectedFlow === "ai-agent"
      ? aiHelperState.badge
      : selectedFlow === "erc-8004"
        ? ercHelperState.badge
        : x402HelperState.badge;

  const aiReviewRows: ReviewRow[] = [
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
      value: aiHelperState.accessReview,
    },
    {
      label: "Next step",
      value: "Add the connection details and runtime context.",
    },
  ];

  function scrollToReview() {
    reviewRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function toggleCapability(value: string) {
    setSelectedCapabilities((current) =>
      current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value],
    );
  }

  function handleErcPrimaryAction() {
    if (ercWalletState !== "ready") {
      setErcWalletState("ready");
    }
  }

  function handleX402PrimaryAction() {
    if (x402QuoteState === "stale") {
      setX402QuoteState("fresh");
      return;
    }

    if (
      x402QuoteState === "error" &&
      selectedPaymentPath !== "manual-review"
    ) {
      x402PaymentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  const introPanel = (
    <div className="app-page__intro">
      <p className="app-page__eyebrow">Successor MVP step 1 reference</p>
      <div className="app-page__intro-grid">
        <div>
          <h2>
            {selectedFlow === "ai-agent"
              ? "Calm shared shell for the first onboarding step."
              : selectedFlow === "erc-8004"
                ? "Wallet-first shell for ERC-8004 step 1."
                : "Quote-first shell for x402 step 1."}
          </h2>
          <p>
            {selectedFlow === "ai-agent"
              ? "This reference keeps capability scope, connection choice, review summary, and the sticky footer inside the same flattened shell."
              : selectedFlow === "erc-8004"
                ? "This reference reuses the same shell, progress rail, and context rail while swapping in wallet, network, and signer readiness before contract metadata."
                : "This reference keeps the same shell contract while changing the first-step decision to quote freshness, payment path, and settlement preview."}
          </p>
        </div>
        <dl className="runtime-card">
          <div>
            <dt>REFERENCE_FLOW</dt>
            <dd>{selectedFlowLabel}</dd>
          </div>
          <div>
            <dt>SHELL_STATE</dt>
            <dd>{currentShellState}</dd>
          </div>
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
  );

  let notice: ReactNode | undefined;
  let header: ReactNode;
  let progress: ReactNode;
  let main: ReactNode;
  let aside: ReactNode;
  let footer: ReactNode;

  if (selectedFlow === "ai-agent") {
    notice = aiHelperState.notice ? (
      <InlineNotice
        action={
          <StatusBadge tone={aiHelperState.badgeTone}>
            {aiHelperState.badge}
          </StatusBadge>
        }
        body={aiHelperState.notice.body}
        icon={
          <span aria-hidden="true">
            {getNoticeIcon(aiHelperState.notice.tone)}
          </span>
        }
        title={aiHelperState.notice.title}
        tone={aiHelperState.notice.tone}
      />
    ) : undefined;

    header = (
      <SectionHeader
        description="Select the jobs this agent should handle, then choose how it will connect. You'll review the exact access before activation."
        statusSlot={
          <StatusBadge tone={aiHelperState.badgeTone}>
            {aiHelperState.badge}
          </StatusBadge>
        }
        stepLabel="Step 1 of 3"
        title="Choose what this agent can do."
      />
    );

    progress = <StepRail steps={aiStepItems} />;

    main = (
      <div className="screen-stack">
        <section className="screen-panel">
          <div className="screen-panel__header">
            <p className="screen-panel__eyebrow">Primary work area A</p>
            <h3>Capability selection</h3>
            <p>
              Start with the jobs this agent should be allowed to perform. Keep
              the first pass focused and add broader access only when it is
              operationally necessary.
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
              Present direct and callback-driven connection paths as large cards
              before exposing any detailed fields in the next step.
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
    );

    aside = (
      <div className="screen-stack">
        <section className="screen-panel" ref={reviewRef}>
          <div className="screen-panel__header">
            <p className="screen-panel__eyebrow">Context rail</p>
            <h3>Review summary</h3>
            <p>
              Keep the first-screen summary focused on scope, connection method,
              and what unlocks next.
            </p>
          </div>
          <ReviewTable rows={aiReviewRows} />
        </section>

        <section className="screen-panel">
          <div className="screen-panel__header">
            <p className="screen-panel__eyebrow">What happens next</p>
            <h3>Immediate downstream path</h3>
          </div>
          <ul className="helper-list">
            <li>Use the same shell for AI agent, ERC-8004, and x402 entry paths.</li>
            <li>Unlock connection details only after scope and access are valid.</li>
            <li>Keep broad capability sets visible and route them through policy review.</li>
          </ul>
        </section>
      </div>
    );

    footer = (
      <ActionFooter
        body={aiHelperState.footer}
        onSecondaryClick={scrollToReview}
        primaryDisabled={!canContinueAi}
        primaryLabel={aiHelperState.primaryLabel}
        secondaryLabel={aiHelperState.secondaryLabel}
        title={aiHelperState.title}
      />
    );
  } else if (selectedFlow === "erc-8004") {
    notice = ercHelperState.notice ? (
      <InlineNotice
        action={
          <StatusBadge tone={ercHelperState.badgeTone}>
            {ercHelperState.badge}
          </StatusBadge>
        }
        body={ercHelperState.notice.body}
        icon={
          <span aria-hidden="true">
            {getNoticeIcon(ercHelperState.notice.tone)}
          </span>
        }
        title={ercHelperState.notice.title}
        tone={ercHelperState.notice.tone}
      />
    ) : undefined;

    header = (
      <SectionHeader
        description="We'll confirm the network and signer first so you can verify that this flow is using the right wallet before any contract details appear."
        statusSlot={
          <StatusBadge tone={ercHelperState.badgeTone}>
            {ercHelperState.badge}
          </StatusBadge>
        }
        stepLabel="Step 1 of 3"
        title="Connect the wallet that will approve this request."
      />
    );

    progress = <StepRail steps={ercStepItems} />;

    main = (
      <div className="screen-stack">
        <section className="screen-panel">
          <div className="screen-panel__header">
            <p className="screen-panel__eyebrow">Primary work area A</p>
            <h3>Wallet connection and address state</h3>
            <p>
              Keep wallet context in one place so the user can confirm the
              approving account before contract fields appear.
            </p>
          </div>
          <FactGrid rows={buildErcWalletRows(ercWalletState)} />
          {ercWalletState !== "ready" ? (
            <div className="screen-panel__actions">
              <PrimaryButton onClick={handleErcPrimaryAction}>
                {ercWalletState === "disconnected"
                  ? "Open wallet"
                  : ercWalletState === "wrong-network"
                    ? "Switch to Base Sepolia"
                    : "Reconnect as signer"}
              </PrimaryButton>
            </div>
          ) : null}
        </section>

        <section className="screen-panel">
          <div className="screen-panel__header">
            <p className="screen-panel__eyebrow">Primary work area B</p>
            <h3>Signer and contract-readiness checklist</h3>
            <p>
              Show wallet connection, network, and signer prerequisites together
              before the contract metadata step opens.
            </p>
          </div>
          <StatusList items={buildErcReadinessItems(ercWalletState)} />
        </section>
      </div>
    );

    aside = (
      <div className="screen-stack">
        <section className="screen-panel" ref={reviewRef}>
          <div className="screen-panel__header">
            <p className="screen-panel__eyebrow">Context rail</p>
            <h3>Wallet review summary</h3>
            <p>
              Keep the first-screen review focused on the connected account, the
              network, and what unlocks next.
            </p>
          </div>
          <ReviewTable rows={buildErcReviewRows(ercWalletState)} />
        </section>

        <section className="screen-panel">
          <div className="screen-panel__header">
            <p className="screen-panel__eyebrow">Contract preview</p>
            <h3>Contract metadata placeholder</h3>
            <p>
              Hold the environment, contract name, and settlement mode in view
              even before full metadata entry begins.
            </p>
          </div>
          <ReviewTable rows={buildErcContractPreviewRows(ercWalletState)} />
        </section>
      </div>
    );

    footer = (
      <ActionFooter
        body={ercHelperState.footer}
        onPrimaryClick={handleErcPrimaryAction}
        onSecondaryClick={scrollToReview}
        primaryLabel={ercHelperState.primaryLabel}
        secondaryLabel={ercHelperState.secondaryLabel}
        title={ercHelperState.title}
      />
    );
  } else {
    const quoteBadge = getQuoteBadge(x402QuoteState, selectedPaymentPath);

    notice = x402HelperState.notice ? (
      <InlineNotice
        action={
          <StatusBadge tone={x402HelperState.badgeTone}>
            {x402HelperState.badge}
          </StatusBadge>
        }
        body={x402HelperState.notice.body}
        icon={
          <span aria-hidden="true">
            {getNoticeIcon(x402HelperState.notice.tone)}
          </span>
        }
        title={x402HelperState.notice.title}
        tone={x402HelperState.notice.tone}
      />
    ) : undefined;

    header = (
      <SectionHeader
        description="Start with the current quote, then pick the payment path that matches how you want settlement to work. You'll review callback and settlement details next."
        statusSlot={
          <StatusBadge tone={x402HelperState.badgeTone}>
            {x402HelperState.badge}
          </StatusBadge>
        }
        stepLabel="Step 1 of 3"
        title="Choose how this flow should quote and collect payment."
      />
    );

    progress = <StepRail steps={x402StepItems} />;

    main = (
      <div className="screen-stack">
        <section className="screen-panel">
          <div className="screen-panel__header">
            <p className="screen-panel__eyebrow">Primary work area A</p>
            <h3>Quote summary</h3>
            <p>
              Keep amount, timing, fee summary, and quote freshness visible
              before the payment path decision.
            </p>
          </div>
          <div className="screen-panel__status-row">
            <StatusBadge tone={quoteBadge.tone}>{quoteBadge.label}</StatusBadge>
          </div>
          <ReviewTable
            rows={buildX402QuoteRows(x402QuoteState, selectedPaymentPath)}
          />
          {x402QuoteState === "stale" ? (
            <div className="screen-panel__actions">
              <PrimaryButton onClick={() => setX402QuoteState("fresh")}>
                Reload quote
              </PrimaryButton>
            </div>
          ) : null}
        </section>

        <section className="screen-panel" ref={x402PaymentRef}>
          <div className="screen-panel__header">
            <p className="screen-panel__eyebrow">Primary work area B</p>
            <h3>Payment path selection</h3>
            <p>
              Present settlement modes as large cards with one rationale line so
              the tradeoff is obvious before callback setup begins.
            </p>
          </div>
          <div className="option-grid">
            {paymentPathOptions.map((option) => (
              <OptionCard
                key={option.value}
                description={option.description}
                meta={
                  selectedPaymentPath === option.value ? (
                    <StatusBadge tone="success">Selected</StatusBadge>
                  ) : (
                    <StatusBadge tone="neutral">Available</StatusBadge>
                  )
                }
                onSelect={() => setSelectedPaymentPath(option.value)}
                selected={selectedPaymentPath === option.value}
                title={option.label}
              />
            ))}
          </div>
        </section>
      </div>
    );

    aside = (
      <div className="screen-stack">
        <section className="screen-panel" ref={reviewRef}>
          <div className="screen-panel__header">
            <p className="screen-panel__eyebrow">Context rail</p>
            <h3>Settlement preview</h3>
            <p>
              Establish trust by previewing the settlement sequence and callback
              expectations before configuration begins.
            </p>
          </div>
          <StatusList
            items={buildX402SettlementItems(
              x402QuoteState,
              selectedPaymentPath,
            )}
          />
        </section>

        <section className="screen-panel">
          <div className="screen-panel__header">
            <p className="screen-panel__eyebrow">Review summary</p>
            <h3>Commercial and callback state</h3>
            <p>
              Keep the selected payment path, callback status, and next step in
              view alongside the shared shell.
            </p>
          </div>
          <ReviewTable
            rows={buildX402ReviewRows(x402QuoteState, selectedPaymentPath)}
          />
        </section>
      </div>
    );

    footer = (
      <ActionFooter
        body={x402HelperState.footer}
        onPrimaryClick={handleX402PrimaryAction}
        onSecondaryClick={scrollToReview}
        primaryDisabled={
          x402HelperState.primaryLabel === "Continue" && !canContinueX402
        }
        primaryLabel={x402HelperState.primaryLabel}
        secondaryLabel={x402HelperState.secondaryLabel}
        title={x402HelperState.title}
      />
    );
  }

  return (
    <main className="app-page">
      <section className="screen-panel app-page__controls">
        <div className="screen-panel__header">
          <p className="screen-panel__eyebrow">Reference flow</p>
          <h3>Shared step-1 entry shell</h3>
          <p>
            Switch between the three entry flows while keeping the flattened
            shell, progress rail, context rail, and sticky footer consistent.
          </p>
        </div>
        <SegmentedControl
          label="Entry flow"
          onChange={(value) => setSelectedFlow(value as FlowId)}
          options={flowOptions.map((option) => ({
            label: option.label,
            value: option.value,
          }))}
          value={selectedFlow}
        />
      </section>

      <div className="app-page__shell">
        <AppShell
          aside={aside}
          footer={footer}
          header={header}
          main={main}
          notice={notice}
          progress={progress}
        />
      </div>
      {introPanel}
    </main>
  );
}
