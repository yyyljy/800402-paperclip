/// <reference types="vite/client" />

declare global {
  const __APP_ENV__: string;
  const __BASE_URL__: string;
  const __API_BASE_URL__: string;

  var __ONBOARDING_RUNTIME_CONFIG__:
    | {
        APP_ENV?: string;
        BASE_URL?: string;
        API_BASE_URL?: string;
      }
    | undefined;
}

export {};
