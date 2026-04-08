type RuntimeConfigOverride = {
  API_BASE_URL?: string;
  APP_ENV?: string;
  BASE_URL?: string;
};

type RuntimeConfigGlobal = typeof globalThis & {
  __ONBOARDING_RUNTIME_CONFIG__?: RuntimeConfigOverride;
};

const runtimeOverride =
  (globalThis as RuntimeConfigGlobal).__ONBOARDING_RUNTIME_CONFIG__ ?? {};

export const runtimeConfig = {
  appEnv: runtimeOverride.APP_ENV ?? __APP_ENV__,
  baseUrl: runtimeOverride.BASE_URL ?? __BASE_URL__,
  apiBaseUrl: runtimeOverride.API_BASE_URL ?? __API_BASE_URL__,
} as const;
