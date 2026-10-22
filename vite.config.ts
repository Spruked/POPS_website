import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), {
    name: "customer-page-indexing",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (/^\/(?:account(?:\/|\?|$)|cart(?:\?|$)|checkout(?:\?|$)|api\/customer(?:\/|$))/.test(request.url || "")) {
          response.setHeader("X-Robots-Tag", "noindex, nofollow");
          response.setHeader("Cache-Control", "no-store");
          response.setHeader("Referrer-Policy", "same-origin");
        }
        next();
      });
    }
  }],
  clearScreen: false,
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    allowedHosts: ["pops.spruked.com"],
    fs: {
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "**/.local/**", "**/.venv-customer/**", "**/backend/**"]
    },
    proxy: {
      "/api/customer": {
        target: "http://127.0.0.1:8787",
        changeOrigin: false
      },
      "/api/checkout": {
        target: "http://127.0.0.1:8787",
        changeOrigin: false
      },
      "/api": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true
      }
    }
  }
});
