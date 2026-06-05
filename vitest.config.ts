import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/newsletter/**/*.test.ts"],
    environment: "node",
  },
});
