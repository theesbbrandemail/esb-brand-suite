// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";
import type { Plugin } from "vite";

const silenceModuleLevelDirectivePlugin = (): Plugin => ({
  name: "silence-module-level-directive",
  enforce: "post",
  config(config) {
    const filterLog = (_level: string, log: any, defaultHandler: any) => {
      if (
        log?.code === "MODULE_LEVEL_DIRECTIVE" ||
        log?.message?.includes("MODULE_LEVEL_DIRECTIVE") ||
        log?.message?.includes("use client") ||
        log?.message?.includes("use server")
      ) {
        return;
      }
      if (typeof defaultHandler === "function") {
        defaultHandler(_level, log);
      }
    };

    const filterWarn = (warning: any, defaultHandler: any) => {
      if (
        warning?.code === "MODULE_LEVEL_DIRECTIVE" ||
        warning?.message?.includes("MODULE_LEVEL_DIRECTIVE") ||
        warning?.message?.includes("use client") ||
        warning?.message?.includes("use server")
      ) {
        return;
      }
      if (typeof defaultHandler === "function") {
        defaultHandler(warning);
      }
    };

    config.build = config.build || {};
    (config.build as any).rolldownOptions = (config.build as any).rolldownOptions || {};
    (config.build as any).rolldownOptions.onLog = filterLog;

    config.build.rollupOptions = config.build.rollupOptions || {};
    (config.build.rollupOptions as any).onLog = filterLog;
    config.build.rollupOptions.onwarn = filterWarn;

    if (config.environments) {
      for (const env of Object.values(config.environments)) {
        if (env && typeof env === "object") {
          const envObj = env as any;
          envObj.build = envObj.build || {};
          envObj.build.rolldownOptions = envObj.build.rolldownOptions || {};
          envObj.build.rolldownOptions.onLog = filterLog;
          envObj.build.rollupOptions = envObj.build.rollupOptions || {};
          envObj.build.rollupOptions.onLog = filterLog;
          envObj.build.rollupOptions.onwarn = filterWarn;
        }
      }
    }
  },
});

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [mcpPlugin(), silenceModuleLevelDirectivePlugin()],
  },
});
