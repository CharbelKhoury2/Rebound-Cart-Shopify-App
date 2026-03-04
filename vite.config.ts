import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8082, // Fixed port to match what's expected
    hmr: {
      overlay: false,
      port: 8082, // Ensure HMR uses the same port
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Polyfill Node.js globals for browser compatibility
    global: 'globalThis',
    process: {
      env: {
        NODE_ENV: mode || 'development',
        JWT_SECRET: process.env.JWT_SECRET || '',
        DATABASE_URL: process.env.DATABASE_URL || '',
        DIRECT_URL: process.env.DIRECT_URL || '',
        VITE_SHOPIFY_APP_URL: process.env.VITE_SHOPIFY_APP_URL || '',
        VITE_API_KEY: process.env.VITE_API_KEY || '',
        VITE_WS_URL: process.env.VITE_WS_URL || '',
        VITE_DASHBOARD_URL: process.env.VITE_DASHBOARD_URL || '',
        VITE_NODE_ENV: process.env.VITE_NODE_ENV || 'development'
      }
    },
  },
  optimizeDeps: {
    include: [],
  },
}));
