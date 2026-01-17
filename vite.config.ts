
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // טוען משתני סביבה (כמו API_KEY) מ-Netlify או קובץ .env
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // מזריק את המפתח לקוד. אם לא קיים ב-.env, משתמש במפתח שסופק
      'process.env.API_KEY': JSON.stringify(env.API_KEY || 'AIzaSyAcj6HzHbbbMOBuWcOSuU4l64l3B6XIaHw')
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  };
});
