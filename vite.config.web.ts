import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Web-only configuration for Vercel deployment
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist-web',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react'],
          store: ['zustand']
        }
      },
      external: [
        // Exclude Electron-specific dependencies
        'electron',
        'keytar'
      ]
    },
    // Optimize for web deployment
    minify: 'terser',
    sourcemap: false,
    target: 'es2020'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    host: 'localhost'
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', 'zustand'],
    exclude: ['electron', 'keytar']
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.PLATFORM': JSON.stringify('web')
  }
});