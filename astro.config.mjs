import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.dewhurst.io",
  srcDir: "./app",
  integrations: [mdx(), react()],
  server: { port: 8000 },
});
