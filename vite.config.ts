import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        ViteImageOptimizer({
          test: /\.(jpe?g|png|gif|tiff?|webp|svg)$/i,
          exclude: undefined,
          include: undefined,
          includePublic: true,
          logStats: true,
          ansiColors: true,
          sharp: {
            encodeFormat: 'webp',
            encodeOptions: {
              webp: { quality: 75 },
            },
          },
          svg: {
            multipass: true,
            plugins: [
              {
                name: 'removeViewBox',
              },
              {
                name: 'removeEmptyNS',
              },
              {
                name: 'cleanupNumericValues',
              },
            ],
          },
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});