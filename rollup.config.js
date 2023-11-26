import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

/** @type {import('rollup').RollupOptions} */
const config = {
  input: "server.ts",
  output: {
    file: "dist/server.mjs",
    format: "es",
  },
  plugins: [typescript({ exclude: ["**/*.test.ts"] }), terser()],
};
export default config;
