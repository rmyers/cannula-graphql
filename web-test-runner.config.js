import { playwrightLauncher } from "@web/test-runner-playwright";
import { esbuildPlugin } from "@web/dev-server-esbuild";
import { defaultReporter } from "@web/test-runner";

export default {
  files: "tests/**/*.test.js",
  browsers: [
    playwrightLauncher({ product: "chromium" }),
    playwrightLauncher({ product: "firefox" }),
    playwrightLauncher({ product: "webkit" }),
  ],
  nodeResolve: true,
  testFramework: {
    config: {
      timeout: 10000,
    },
  },
  plugins: [
    // Process JS/TS with esbuild
    esbuildPlugin({
      ts: true,
      target: "auto",
      loaders: {
        // Handle HTML and CSS imports
        ".html": "text",
        ".css": "text",
      },
    }),
  ],
};
