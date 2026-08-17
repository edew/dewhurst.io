# dewhurst.io

A blog for me, built with [React Router](https://reactrouter.com/) in framework
mode and pre-rendered to static files.

- Posts in `posts/*.mdx` (frontmatter: `title`, `date`,
  `description`) and are compiled by Vite via `@mdx-js/rollup`.
- Each MDX file is registered as its own route in `app/routes.ts`, nested
  under the post layout (`app/routes/post.tsx`), at `/YYYY/MM/DD/<filename>`
  with the date taken from the frontmatter. The framework code-splits each
  post and links its CSS in the document head.
- Interactive posts (French, Pulsar clone) are React components in
  `app/components/`, imported and rendered by their post's MDX file.
- `app/posts.server.ts` reads frontmatter from disk. The `.server` suffix is
  the React Router convention for code that must never reach the browser —
  here it runs only at build time.

New posts are picked up from `posts/` when the dev server (re)starts or the
site is built.

## Development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

The static site is written to `build/client/` — deploy that directory to any
static file server.
