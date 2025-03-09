import { defineConfig } from "vite";
import { publishToApi, publishToLocal } from "./deploy";
import dotenv from "dotenv";

export default defineConfig(({ mode }) => {
  return {
    plugins: [],
    build: {
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
              dotenv.config();
              mode === "localCopy"
                ? await publishToLocal()
                : await publishToApi();
            },
          },
        ],
      },
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});
