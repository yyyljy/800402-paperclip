import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const envDir = resolve(__dirname, "../..");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, "");

  return {
    envDir,
    plugins: [react()],
    resolve: {
      alias: {
        "@onboarding/ui-primitives": resolve(
          __dirname,
          "../../packages/ui-primitives/src/index.tsx",
        ),
      },
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV ?? "local"),
      __BASE_URL__: JSON.stringify(env.BASE_URL ?? "http://localhost:3000"),
      __API_BASE_URL__: JSON.stringify(
        env.API_BASE_URL ?? "http://localhost:4000",
      ),
    },
    test: {
      css: true,
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/test/setup.ts",
    },
  };
});
