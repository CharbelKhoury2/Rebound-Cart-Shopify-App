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
    // Fix "process is not defined" error by using string replacements
    'process.env.NODE_ENV': JSON.stringify(mode || 'development'),
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3001/api'),
    'process.env.JWT_SECRET': JSON.stringify(process.env.JWT_SECRET || ''),
    'process.env.DATABASE_URL': JSON.stringify(process.env.DATABASE_URL || ''),
    'process.env.DIRECT_URL': JSON.stringify(process.env.DIRECT_URL || ''),
    'process.env.VITE_SHOPIFY_APP_URL': JSON.stringify(process.env.VITE_SHOPIFY_APP_URL || ''),
    'process.env.VITE_API_KEY': JSON.stringify(process.env.VITE_API_KEY || ''),
    'process.env.VITE_WS_URL': JSON.stringify(process.env.VITE_WS_URL || ''),
    'process.env.VITE_DASHBOARD_URL': JSON.stringify(process.env.VITE_DASHBOARD_URL || ''),
    'process.env.VITE_NODE_ENV': JSON.stringify(process.env.VITE_NODE_ENV || 'development')
  },
  optimizeDeps: {
    include: [],
  },
}));
