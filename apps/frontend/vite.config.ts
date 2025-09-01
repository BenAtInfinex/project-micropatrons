import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";
import manifestSRI from "vite-plugin-manifest-sri";
import generateFile from "vite-plugin-generate-file";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { headers, isNodeProduction } from "./_headers";

process.env.VITE_INDEX_ENV_SCRIPT = isNodeProduction
  ? "__TEMPLATE_VAR_VITE_INDEX_ENV_SCRIPT__"
  : "";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    nodePolyfills({
      // Only include what you actually need in the browser.
      // Add/remove modules as required by your deps.
      include: ["buffer", "process", "events", "util", "stream", "path"],
      // Make sure inspector is not polyfilled/aliased.
      exclude: [
        "inspector",
        "node:inspector",
        "inspector/promises",
        "node:inspector/promises",
      ],
      globals: { Buffer: true, process: true, global: true },
      protocolImports: true,
    }),
    react(),
    svgr(),
    manifestSRI({ algorithms: ["sha512"] }),
    generateFile([
      {
        type: "template",
        output: "./_headers",
        template: "./_headers.ejs",
        data: { headers },
      },
    ]),
  ],
  assetsInclude: ["**/*.md"],
  build: { sourcemap: true },
  server: {
    port: Number(process.env.VITE_PORT!),
    headers: Object.fromEntries(headers["/*"].map((h) => [h.key, h.value])),
  },
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
    APP_NAME: JSON.stringify(process.env.npm_package_name),
  },
});
