import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const envDir = resolve(__dirname, "../..");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, "");
  const port = Number(env.PORT ?? "3000");

  return {
    envDir,
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: Number.isFinite(port) ? port : 3000,
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
