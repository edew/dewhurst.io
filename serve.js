#!/usr/bin/env node
// The site is the files in site/, served as they are. This serves them on this
// computer the way GitHub Pages does, and adds the two things that make a post
// editable in the browser:
//
// - PUT /YYYY/MM/DD/<name> overwrites that post's HTML file, which is how the
//   editor (site/post-editor.js) saves.
// - The list of posts in site/index.html and site/feed.xml is rewritten from
//   the posts themselves, when this starts and after every save.
//
//   node serve.js [port]

import { createServer } from "node:http";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";

const ROOT = join(import.meta.dirname, "site");
const PORT = Number(process.argv[2] ?? 8000);
const SITE = "https://www.dewhurst.io";
const POST = /^\/(\d{4})\/(\d{2})\/(\d{2})\/([^/.]+)$/;

const TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

/* ---------------- the list of posts ---------------- */

function decode(text) {
  const named = { amp: "&", apos: "'", gt: ">", lt: "<", quot: '"' };

  return text.replace(/&(?:#(\d+)|#x([0-9a-f]+)|(\w+));/gi, (all, dec, hex, name) =>
    dec ? String.fromCodePoint(Number(dec))
    : hex ? String.fromCodePoint(parseInt(hex, 16))
    : (named[name] ?? all),
  );
}

function escape(text) {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

// A post is site/YYYY/MM/DD/<name>.html. Its date is its path; its title and
// description are the ones in its <head>.
async function posts() {
  const found = [];

  for (const file of await readdir(ROOT, { recursive: true })) {
    const path = "/" + file.split(sep).join("/").replace(/\.html$/, "");

    if (!file.endsWith(".html") || !POST.test(path)) {
      continue;
    }

    const html = await readFile(join(ROOT, file), "utf8");
    const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? "";
    const description = /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? "";

    found.push({
      date: path.slice(1, 11).replaceAll("/", "-"),
      description: decode(description).trim(),
      path,
      title: decode(title).replace(/ \| For Me$/, "").trim(),
    });
  }

  // Newest first, and by name within a day
  return found.sort((a, b) => b.date.localeCompare(a.date) || a.path.localeCompare(b.path));
}

async function writeIfChanged(file, content) {
  if ((await readFile(file, "utf8").catch(() => null)) !== content) {
    await writeFile(file, content);
    console.log(`wrote ${file}`);
  }
}

async function index() {
  const all = await posts();

  const items = all.map(
    (post) => `
        <li>
          <a href="${post.path}">${escape(post.title)}</a>
          <p>${escape(post.description)}</p>
        </li>`,
  );
  const file = join(ROOT, "index.html");
  const html = await readFile(file, "utf8");

  await writeIfChanged(
    file,
    html.replace(
      /(<ol class="posts">)[\s\S]*?(\n *<\/ol>)/,
      (all, open, close) => open + items.join("") + close,
    ),
  );

  const entries = all.map(
    (post) => `
    <item>
      <title>${escape(post.title)}</title>
      <link>${SITE}${post.path}</link>
      <guid>${SITE}${post.path}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escape(post.description)}</description>
    </item>`,
  );

  await writeIfChanged(
    join(ROOT, "feed.xml"),
    `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>For Me</title>
    <link>${SITE}/</link>
    <description>A blog for me</description>${entries.join("")}
  </channel>
</rss>
`,
  );
}

/* ---------------- the server ---------------- */

// /2025/06/30/git-wip is site/2025/06/30/git-wip.html, and / is index.html
async function resolve(pathname) {
  const path = normalize(join(ROOT, decodeURIComponent(pathname)));

  if (path !== ROOT && !path.startsWith(ROOT + sep)) {
    return null;
  }

  const candidates = extname(path) ? [path] : [path + ".html", join(path, "index.html")];

  for (const candidate of candidates) {
    if ((await stat(candidate).catch(() => null))?.isFile()) {
      return candidate;
    }
  }

  return null;
}

// Only a page this server served may save, so that no other site open in the
// browser can write to these files.
function local(request) {
  const host = request.headers.host ?? "";
  const origin = request.headers.origin;

  return (
    /^(localhost|127\.0\.0\.1|\[::1\]):\d+$/.test(host) &&
    (origin === undefined || origin === `http://${host}`)
  );
}

async function body(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

const server = createServer(async (request, response) => {
  const send = (status, type, content) => {
    response.writeHead(status, { "Cache-Control": "no-store", "Content-Type": type });
    response.end(content);
  };

  try {
    const { pathname } = new URL(request.url, "http://localhost");
    const file = await resolve(pathname);

    if (request.method === "PUT") {
      if (!local(request) || !POST.test(pathname) || !file) {
        return send(403, TYPES[".html"], "Only an existing post can be saved.");
      }

      await writeFile(file, await body(request));
      console.log(`saved ${file}`);
      await index();

      return send(204, TYPES[".html"], "");
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return send(405, TYPES[".html"], "");
    }

    if (!file) {
      return send(404, TYPES[".html"], await readFile(join(ROOT, "404.html")));
    }

    send(200, TYPES[extname(file)] ?? "application/octet-stream", await readFile(file));
  } catch (error) {
    console.error(error);
    send(500, TYPES[".html"], "");
  }
});

await index();

server.listen(PORT, "127.0.0.1", () => {
  console.log(`http://localhost:${PORT}`);
});
