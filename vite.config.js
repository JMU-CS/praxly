import { defineConfig } from 'vite'



const PRAXLY_PATH = process.env.PRAXLY_PATH || "/";
console.log("\n\n\nPRAXLY_PATH", PRAXLY_PATH, '\n\n\n');

// https://vitejs.dev/config/
export default defineConfig({
  base: PRAXLY_PATH,
  build: {
    outDir: "dist",
  },
});