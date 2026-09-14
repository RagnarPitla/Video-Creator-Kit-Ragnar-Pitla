import path from "path";
import type { BundlerOverrideFn } from "@remotion/bundler";

/**
 * The Remotion CLI bundles `remotion.config.ts` into its own dist directory before
 * evaluating it, so `__dirname` here is `node_modules/@remotion/cli/dist`, not this
 * project. `process.cwd()` is the Remotion root -- the CLI resolves the config file
 * relative to it -- and is the only reliable anchor from inside a config module.
 */
const ENGINE_MODULES = path.resolve(process.cwd(), "node_modules");

/**
 * The component library lives outside this project, at
 * `../shared/brand/ailabs-explainer`, so it can be dropped into any other video repo
 * unchanged. That means its files import `react`, `remotion` and
 * `@remotion/google-fonts` from a directory with no `node_modules` anywhere above
 * it, and the bundler's default upward resolution never reaches `engine/node_modules`.
 *
 * Adding the engine's own `node_modules` as an absolute resolution root fixes that
 * and, just as importantly, guarantees a single React instance -- two copies would
 * break hooks the moment a library component called `useTheme()`.
 *
 * Registered through `overrideBundlerConfig`, not `overrideWebpackConfig`: with
 * `Config.setRspack(true)` the webpack hook is never called. See
 * `@remotion/bundler/dist/rspack-config.js`, which only invokes `bundlerOverride`
 * and `rspackOverride`. The bundler hook runs under both bundlers.
 *
 * The TypeScript half of the same problem is solved by `paths` in tsconfig.json.
 */
export const enableSharedLibraryResolution: BundlerOverrideFn = (config) =>
  ({
    ...config,
    resolve: {
      ...config.resolve,
      modules: [ENGINE_MODULES, "node_modules"],
    },
    // The generic signature demands the exact input type back. webpack and rspack
    // spell `resolve` slightly differently, so the widened object needs re-asserting.
  }) as typeof config;
