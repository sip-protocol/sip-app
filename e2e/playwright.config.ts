import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: ".",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "demo",
      testMatch: ["tracks/**/*.spec.ts", "showcase.spec.ts"],
      use: { browserName: "chromium" },
    },
    {
      name: "mainnet",
      testMatch: ["mainnet/**/*.spec.ts"],
      timeout: 90_000,
      use: { browserName: "chromium" },
    },
  ],
})
