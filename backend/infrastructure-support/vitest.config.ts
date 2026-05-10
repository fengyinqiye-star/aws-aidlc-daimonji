import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@shared/types": fileURLToPath(
        new URL("../../shared/types/src/index.ts", import.meta.url)
      ),
      "@shared/adapters": fileURLToPath(
        new URL("../../shared/adapters/src/index.ts", import.meta.url)
      )
    }
  },
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
