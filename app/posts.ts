import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

export async function getPosts() {
  const posts = await getCollection("posts");

  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function postParams(post: Post) {
  const [year, month, day] = isoDate(post).split("-");

  return { year, month, day, slug: post.id };
}

export function postPath(post: Post) {
  const { year, month, day, slug } = postParams(post);

  return `/${year}/${month}/${day}/${slug}`;
}

export function isoDate(post: Post) {
  return post.data.date.toISOString().slice(0, 10);
}

export function formatDate(post: Post) {
  return post.data.date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
