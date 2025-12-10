import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Casting process to any to avoid TS errors if @types/node isn't perfectly resolved
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Define process.env.API_KEY globally for the browser build
      // This ensures code using process.env.API_KEY works on Vercel
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});