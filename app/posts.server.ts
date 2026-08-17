import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";

import matter from "gray-matter";

const POSTS_DIR = join(process.cwd(), "posts");

export interface PostMeta {
  date: string;
  dateFormatted: string;
  description: string;
  path: string;
  slug: string;
  title: string;
}

function toDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value));
}

// Posts live at /YYYY/MM/DD/<slug>, with the date taken from the frontmatter
function postPath(date: Date, slug: string): string {
  const [year, month, day] = date.toISOString().slice(0, 10).split("-");

  return `/${year}/${month}/${day}/${slug}`;
}

async function readPostMeta(file: string): Promise<PostMeta> {
  const { data } = matter(await readFile(join(POSTS_DIR, file), "utf-8"));
  const date = toDate(data.date);
  const slug = basename(file, ".mdx");

  return {
    date: date.toISOString().slice(0, 10),
    dateFormatted: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }),
    description: String(data.description ?? "").trim(),
    path: postPath(date, slug),
    slug,
    title: String(data.title ?? ""),
  };
}

export async function getPosts(): Promise<PostMeta[]> {
  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith(".mdx"));
  const posts = await Promise.all(files.map(readPostMeta));

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string): Promise<PostMeta | null> {
  if (!/^[\w-]+$/.test(slug)) {
    return null;
  }

  try {
    return await readPostMeta(`${slug}.mdx`);
  } catch {
    return null;
  }
}
