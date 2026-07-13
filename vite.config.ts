import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Expõe ao bundle somente as credenciais públicas sincronizadas pelo Vercel.
// SUPABASE_SECRET_KEY e demais segredos continuam indisponíveis no navegador.
export default defineConfig({
  plugins: [react()],
  envPrefix: [
    'VITE_',
    'SUPABASE_URL',
    'SUPABASE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
