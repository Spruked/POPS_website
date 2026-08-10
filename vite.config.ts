import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    host: "0.0.0.0",
    port: 18030,
    strictPort: true,
    allowedHosts: ["pops.spruked.com"],
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true
      }
    }
  }
});
