import { runtimeConfig } from "./runtime-config";

const activeWorkspace = [
  {
    name: "apps/web",
    role: "Active runtime",
    detail:
      "Owns the onboarding shell, reference screens, and future browser-side composition for the shared token and primitive work.",
  },
  {
    name: "packages/design-tokens",
    role: "Queued shared package",
    detail:
      "Canonical token source for TypeScript exports and generated CSS variables. The next token task lands here.",
  },
  {
    name: "packages/ui-primitives",
    role: "Queued shared package",
    detail:
      "Reusable presentational primitives that consume semantic tokens before flow-specific protocol cards exist.",
  },
];

const deferredRuntimes = [
  {
    name: "apps/api",
    boundary: "Future synchronous orchestration boundary",
    detail:
      "Reserved for validated form submission, durable state changes, and server-side integrations once real domain contracts exist.",
  },
  {
    name: "apps/worker",
    boundary: "Future async execution boundary",
    detail:
      "Reserved for retries, callbacks, long-running tasks, and non-blocking background processing.",
  },
  {
    name: "apps/protocol-adapter",
    boundary: "Future isolated signing/payment boundary",
    detail:
      "Reserved for signer, wallet, x402, and settlement operations that need the narrowest secret and network access.",
  },
];

const reasons = [
  "Current downstream work is token, primitive, and screen composition, so a web-first runtime unlocks the next three tickets immediately.",
  "Protocol payload contracts are still being defined separately, so a placeholder API tier would add code ownership without stable inputs.",
  "The repository baseline already reserves API, queue, wallet, and protocol environment namespaces, so later service separation does not require a layout reset.",
];

export function App() {
  return (
    <main className="page-shell">
      <section className="hero-panel">
        <p className="eyebrow">First executable application skeleton</p>
        <div className="hero-copy">
          <div>
            <h1>Web-first workspace, shared packages next.</h1>
            <p className="lede">
              The repository now runs from a single deployable web surface while
              keeping explicit boundaries for the future API, worker, and
              protocol adapter runtimes.
            </p>
          </div>

          <div className="runtime-card">
            <span className="runtime-label">Runtime wiring</span>
            <dl>
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
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="section-heading">
            <p className="eyebrow">Why this shape</p>
            <h2>Start where the next milestone actually lives.</h2>
          </div>
          <ul className="stack-list">
            {reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <div className="section-heading">
            <p className="eyebrow">Active workspace</p>
            <h2>Directories that should move now.</h2>
          </div>
          <div className="card-stack">
            {activeWorkspace.map((item) => (
              <section key={item.name} className="boundary-card">
                <div className="boundary-header">
                  <h3>{item.name}</h3>
                  <span>{item.role}</span>
                </div>
                <p>{item.detail}</p>
              </section>
            ))}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <p className="eyebrow">Reserved boundaries</p>
          <h2>Separated later, not guessed early.</h2>
        </div>
        <div className="card-grid">
          {deferredRuntimes.map((item) => (
            <section key={item.name} className="boundary-card">
              <div className="boundary-header">
                <h3>{item.name}</h3>
                <span>{item.boundary}</span>
              </div>
              <p>{item.detail}</p>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
