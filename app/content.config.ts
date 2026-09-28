import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Posts are posts/*.mdx, published at /YYYY/MM/DD/<filename> with the date
// taken from the frontmatter.
const posts = defineCollection({
  loader: glob({ pattern: "*.mdx", base: "./posts" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().trim(),
  }),
});

export const collections = { posts };
