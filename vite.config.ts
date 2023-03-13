import react from '@vitejs/plugin-react-swc';
import * as path from 'path';
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { VitePWA } from 'vite-plugin-pwa';

const title = 'Python playground';
const description = '🐍 A python playground running on broswer.';

export default defineConfig({
  plugins: [
    react(),
    // 分包加载
    splitVendorChunkPlugin(),
    // html 压缩 + 元数据替换
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title,
          description,
        },
      },
    }),
    // PWA
    VitePWA({
      outDir: 'dist/pwa',
      registerType: 'autoUpdate', //'prompt',
      workbox: {
        globPatterns: ['../**/*.{js,css,html,jpg,png,svg,gif}'],
        globIgnores: ['**/node_modules/**/*', 'pwa/sw.js', 'pwa/workbox-*.js'],
      },
      manifest: {
        lang: 'zh-CN',
        name: title,
        short_name: title,
        description: description,
        theme_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa/logo-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa/logo-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa/logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  envPrefix: 'k',
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src/') }],
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    open: false,
  },
  build: {
    minify: true,
    chunkSizeWarningLimit: 1024, // 1MB
  },
});
