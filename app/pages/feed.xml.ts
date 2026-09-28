import type { APIRoute } from "astro";

import { getPosts, postPath } from "../posts";

function escape(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export const GET: APIRoute = async ({ site }) => {
  const items = (await getPosts()).map((post) => {
    const link = new URL(postPath(post), site).href;

    return `
    <item>
      <title>${escape(post.data.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${post.data.date.toUTCString()}</pubDate>
      <description>${escape(post.data.description)}</description>
    </item>`;
  });

  const feed = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>For Me</title>
    <link>${new URL("/", site).href}</link>
    <description>A blog for me</description>${items.join("")}
  </channel>
</rss>
`;

  return new Response(feed, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
