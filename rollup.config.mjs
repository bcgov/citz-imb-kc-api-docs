import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        dir: "build",
        format: "commonjs",
        sourcemap: true,
      },
    ],
    external: ["express"],
    plugins: [
      copy({
        targets: [{ src: "src/static/*", dest: "build/static" }],
      }),
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json", outputToFilesystem: true }),
    ],
  },
];
