import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    projects: [
      {
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"]
        }
      },
      {
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"]
        }
      }
    ]
  }
});
