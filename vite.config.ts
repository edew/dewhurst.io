import mdx from "@mdx-js/rollup";
import { reactRouter } from "@react-router/dev/vite";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    mdx({ remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter] }),
    reactRouter(),
  ],
  build: {
    rolldownOptions: {
      output: {
        // One chunk for all framework code, instead of several small shared
        // chunks (jsx-runtime, errorBoundaries, lib, ...)
        codeSplitting: {
          groups: [{ name: "framework", test: /node_modules/ }],
        },
      },
    },
  },
});
