import { defineConfig } from 'vite'
import { resolve } from 'path'

const PRAXLY_PATH = process.env.PRAXLY_PATH || "/";
console.log("\n\n\nPRAXLY_PATH", PRAXLY_PATH, '\n\n\n');

// https://vitejs.dev/config/
export default defineConfig({
  base: PRAXLY_PATH,
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
