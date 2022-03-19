import { defineConfig } from "vite";
const path = require("path");

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
      "@img": path.resolve(__dirname, "../src/_resource/img"),
      "@schema": path.resolve(__dirname, "../src/state/schema"),
    },
  },
});
