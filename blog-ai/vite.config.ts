import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { federation } from "@module-federation/vite";

export default defineConfig(() => {
  const mapleSharesRemote =
    "/maple-shares/remote/remoteEntry.js";

  return {
    base: "/ai/",
    plugins: [
      federation({
        name: "blogAi",
        remotes: {
          mapleShares: {
            type: "module",
            name: "mapleShares",
            entry: mapleSharesRemote,
            entryGlobalName: "mapleShares",
            shareScope: "default",
          },
        },
        shared: ["vue"],
        moduleParseIdleTimeout: 30,
      }),
      vue(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@layouts": path.resolve(__dirname, "./src/layouts"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@services": path.resolve(__dirname, "./src/services"),
        "@types": path.resolve(__dirname, "./src/types"),
      },
    },
    build: {
      target: "chrome89",
    },
  };
});
