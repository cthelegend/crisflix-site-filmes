import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { publicApi } from "./server/publicApi.js";
import { createAdminApi } from "./server/adminApi.js";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const adminApi = createAdminApi(env, true);
  return {
  server: {
    host: "127.0.0.1",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), {
    name: "local-public-api",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split("?")[0] === "/api/admin") void adminApi(req, res);
        else if (req.url?.split("?")[0] === "/api/site-content") void adminApi(req, res, true);
        else if (req.url?.split("?")[0] === "/api/tmdb") void publicApi(req, res, "tmdb", env.TMDB_READ_ACCESS_TOKEN);
        else if (req.url?.startsWith("/api/futebol/")) void publicApi(req, res, "football");
        else next();
      });
    },
  }],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core"
    ],
  },
  };
});
