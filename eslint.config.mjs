// Native flat config. Next 16 removed `next lint` and eslint-config-next ships
// real flat configs (the old FlatCompat shim throws against v16). Mirrors the
// sibling consoles.
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules/**"]),
]);

export default eslintConfig;
