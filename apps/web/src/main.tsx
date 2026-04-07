import React from "react";
import ReactDOM from "react-dom/client";
import "@onboarding/design-tokens/tokens.css";
import "@onboarding/ui-primitives/primitives.css";
import { App } from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
