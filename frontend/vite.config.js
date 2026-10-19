import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ["heartfelt-empathy-production-24ad.up.railway.app"]
  }
});
