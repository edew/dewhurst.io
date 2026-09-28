import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.dewhurst.io",
  srcDir: "./app",
  integrations: [mdx(), react()],
  // Quotes and dashes are published exactly as typed, and code blocks are left
  // uncoloured (no post names a language on one)
  markdown: { smartypants: false, syntaxHighlight: false },
  server: { port: 8000 },
  // astro check prebundles React in production mode. Given the dev server's
  // cache, it would break every island in dev with "_jsxDEV is not a function".
  vite: {
    cacheDir: process.argv.includes("check") ? "node_modules/.vite-check" : undefined,
  },
});
