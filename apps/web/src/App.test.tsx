import { fireEvent, render, screen } from "@testing-library/react";
import { App } from "./App";

function getReviewValue(label: string) {
  const labelNode = screen.getByText(label);
  const row = labelNode.closest(".ds-review-table__row");

  if (!row) {
    throw new Error(`Review row not found for ${label}`);
  }

  const value = row.querySelector("dd");

  if (!value) {
    throw new Error(`Review value not found for ${label}`);
  }

  return value;
}

describe("shared onboarding smoke suite", () => {
  it("renders the default AI-agent shell and flow switcher", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Choose what this agent can do.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Progress rail")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Review summary" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Successor MVP step 1 reference"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ERC-8004" }),
    ).toBeInTheDocument();
  });

  it("starts in the empty-state gate on the default AI flow", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    expect(
      screen.getByText("Select at least one capability"),
    ).toBeInTheDocument();
    expect(getReviewValue("Selected capabilities")).toHaveTextContent(
      "Not selected",
    );
    expect(getReviewValue("Connection method")).toHaveTextContent(
      "Not selected",
    );
    expect(getReviewValue("Access review")).toHaveTextContent(
      "Waiting on required choices",
    );
  });

  it("shows the credential-required state when connection method is missing", () => {
    render(
      <App
        initialSelectedCapabilities={["answer-questions"]}
        initialSelectedCredential={null}
      />,
    );

    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    expect(
      screen.getByText("Choose how this agent will connect"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Connection needed").length).toBeGreaterThan(0);
    expect(getReviewValue("Connection method")).toHaveTextContent(
      "Not selected",
    );
    expect(getReviewValue("Access review")).toHaveTextContent(
      "Waiting on required choices",
    );
  });

  it("keeps the ready path and review summary aligned with scoped selections", () => {
    render(
      <App
        initialSelectedCapabilities={["answer-questions"]}
        initialSelectedCredential={null}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Use a webhook/i }));
    fireEvent.click(
      screen.getByRole("checkbox", { name: /Trigger workflows/i }),
    );

    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
    expect(screen.getByText("Scope ready")).toBeInTheDocument();
    expect(getReviewValue("Selected capabilities")).toHaveTextContent(
      "Answer questions, Trigger workflows",
    );
    expect(getReviewValue("Connection method")).toHaveTextContent(
      "Use a webhook",
    );
    expect(getReviewValue("Access review")).toHaveTextContent(
      "Scoped access ready",
    );
  });

  it("surfaces a broad-access warning for elevated capability mixes", () => {
    render(
      <App
        initialSelectedCapabilities={["answer-questions", "use-external-tools"]}
        initialSelectedCredential="api-key"
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Broad access needs an extra check",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Policy review recommended").length).toBeGreaterThan(
      1,
    );
    expect(getReviewValue("Access review")).toHaveTextContent(
      "Broad access warning",
    );
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
  });

  it("renders the ERC-8004 shell and clears the wrong-network state", () => {
    render(<App initialFlow="erc-8004" initialErcWalletState="wrong-network" />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Connect the wallet that will approve this request.",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Wrong network").length).toBeGreaterThan(0);
    fireEvent.click(
      screen.getByRole("button", { name: "Switch to Base Sepolia" }),
    );
    expect(screen.getAllByText("Wallet ready").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
    expect(getReviewValue("Signer state")).toHaveTextContent("Signer ready");
  });

  it("requires a payment path before the x402 flow can continue", () => {
    render(<App initialFlow="x402" />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Choose how this flow should quote and collect payment.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    fireEvent.click(
      screen.getByRole("button", { name: /Automatic settlement/i }),
    );
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
    expect(getReviewValue("Payment path")).toHaveTextContent(
      "Automatic settlement",
    );
  });

  it("refreshes a stale x402 quote before continuing", () => {
    render(
      <App
        initialFlow="x402"
        initialSelectedPaymentPath="automatic-callback"
        initialX402QuoteState="stale"
      />,
    );

    expect(screen.getByRole("button", { name: "Refresh quote" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Reload quote" }));
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
    expect(screen.getAllByText("Quote ready").length).toBeGreaterThan(0);
  });
});
