import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Fix for react-keyed-file-browser expecting lodash/flow
      "lodash/flow": "lodash.flow",
    },
  },
  optimizeDeps: {
    include: ["lodash.flow"], // Force Vite to pre-bundle it correctly
  },
});
