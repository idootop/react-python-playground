import react from '@vitejs/plugin-react-swc';
import { minify } from 'html-minifier';
import { resolve } from 'path';
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const title = 'Python playground';
const description = '🐍 A python playground running on broswer.';

export default defineConfig({
  plugins: [
    react(),
    // 分包加载
    splitVendorChunkPlugin(),
    // PWA
    VitePWA({
      outDir: resolve(__dirname, 'dist/pwa'),
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
    // Web worker
    {
      name: 'replace-string',
      transform(code, id) {
        if (id.includes('worker.ts')) {
          const newCode = code.replace(
            'export class PythonWorker',
            'class PythonWorker',
          );
          return {
            code: newCode,
            map: null,
          };
        }
      },
    },
    // html 压缩
    {
      name: 'compress-html',
      transformIndexHtml(html) {
        return minify(html, {
          removeComments: true, // 移除HTML中的注释
          collapseWhitespace: true, // 折叠空白区域
          minifyJS: true, // 压缩页面JS
          minifyCSS: true, // 压缩页面CSS
        });
      },
    },
  ],
  root: 'src/pages',
  publicDir: resolve(__dirname, 'public'),
  envDir: resolve(__dirname, '.'),
  envPrefix: 'k',
  resolve: {
    alias: [{ find: '@', replacement: resolve(__dirname, 'src/') }],
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    open: false,
  },
  build: {
    minify: true,
    outDir: resolve(__dirname, 'dist'),
    chunkSizeWarningLimit: 1024, // 1MB
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/pages/index.html'),
        test: resolve(__dirname, 'src/pages/test/index.html'),
      },
    },
  },
});
