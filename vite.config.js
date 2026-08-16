import { defineConfig } from 'vite'
import { resolve } from 'path'

const PRAXLY_PATH = process.env.PRAXLY_PATH || "/";
console.log("\n\n\nPRAXLY_PATH", PRAXLY_PATH, '\n\n\n');

// https://vitejs.dev/config/
export default defineConfig({
  base: PRAXLY_PATH,
  server: {
    // Praxly2 lives in a separate repo and deploys to /v2 on the same server,
    // so it isn't available from this dev server. Proxy /v2 to production and
    // drop its Content-Security-Policy: frame-ancestors only lists the real
    // site, which would block the landing page's v2 iframe on localhost.
    // In production /v2 is served directly and this proxy is not involved.
    proxy: {
      '/v2': {
        target: 'https://praxly.cs.jmu.edu',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            delete proxyRes.headers['content-security-policy'];
          });
        },
      },
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        embed: resolve(__dirname, 'embed.html'),
        mainPage: resolve(__dirname, 'main.html')
      }
    },
  },
});
