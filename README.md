# dewhurst.io

A blog for me, built with [Astro](https://astro.build/) into static HTML.

- Posts are `posts/*.mdx` (frontmatter: `title`, `date`, `description`),
  loaded as a content collection (`app/content.config.ts`) and published at
  `/YYYY/MM/DD/<filename>` with the date taken from the frontmatter.
- Pages are in `app/pages/`, sharing the document in
  `app/layouts/Document.astro`.
- Interactive posts use React components from `app/components/`, marked
  `client:load` in the post so that Astro hydrates them. Every other page
  ships no JS at all.
- Navigating between pages is sped up by the browser: speculation rules
  prerender a page when its link is hovered, and a view transition cross-fades
  between pages.

## Development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

The static site is written to `dist/` — deploy that directory to any static
file server.
