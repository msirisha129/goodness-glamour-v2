import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
        ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
              m.cartographer(),
          ),
        ]
        : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules/react")) return "vendor";
          if (
              id.includes("node_modules/lucide-react") ||
              id.includes("node_modules/@radix-ui/react-dialog") ||
              id.includes("node_modules/@radix-ui/react-select")
          ) {
            return "ui";
          }
        },
      },
    },
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },
  server: {
    // ✅ FIXED: Removed wrong proxy, backend serves everything on port 3000
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    hmr: {
      overlay: false,
    },
  },
});