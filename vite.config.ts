import { defineConfig } from "vite";
import { publishToApi, publishToLocal } from "./deploy";

export default defineConfig(({ mode }) => {
  return {
    plugins: [],
    build: {
      sourcemap: true,
      lib: {
        entry: "src/main.ts",
        name: "ScreepsWorld",
        fileName: "main",
        formats: ["cjs"],
      },
      rollupOptions: {
        external: [],
        output: {
          globals: {},
        },
        plugins: [
          {
            name: "deploy",
            writeBundle: async () => {
              mode === "loc" ? await publishToLocal() : await publishToApi();
            },
          },
        ],
      },
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});
