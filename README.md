# dewhurst.io

A blog for me. The site is the files in `site/`, written by hand or in the
browser and deployed as they are: there is nothing to install and nothing to
build.

- A post is `site/YYYY/MM/DD/<name>.html`, published at `/YYYY/MM/DD/<name>`.
  Its date is its path; its title and description are the ones in its
  `<head>`.
- `site/style.css` is the styling every page shares, and is kept small: black
  on ivory (the reverse in the dark), one centred column of 80 characters, and
  the few browser defaults worth changing.
- `site/fonts/` holds Libre Baskerville, the one font the site loads.
- `site/title.svg` is the name at the top of every page, drawn in the colour
  of the text. `site/favicon.svg` is its "d"; `favicon.ico` and
  `apple-touch-icon.png` are pictures of it.
- A post that needs more brings its own CSS and JS, kept beside it and linked
  from its `<head>` (see `site/2026/07/09/`).
- Anything interactive is a custom element written with
  [Lit](https://lit.dev): the post editor, and the elements of the
  interactive posts. Lit itself is the one file
  `site/lit.js`.
- `site/site.js` is the one script every page loads. Each page also carries
  its own speculation rules, so that the browser starts loading a page of the
  site when its link is hovered.

## Writing a post

```bash
node serve.js
```

serves the site at http://localhost:8000. To start a post, copy the baseline
and open it:

```bash
mkdir -p site/2026/11/16 && cp post.html site/2026/11/16/my-post.html
```

Served from this computer, a post has an "Edit" button in its bottom right
corner (`site/post-editor.js`). While editing:

- Type into the post. Enter starts a new paragraph.
- Hover a block for its menu, which sits just above it. The
  first group of buttons makes the block a paragraph, heading, subheading,
  list, numbered list, code block or quote. The second marks the selected text
  as bold, italic, code or a link. The third adds a paragraph below, moves the
  block up or down, or removes it.
- "Pin menu" keeps the block menu on show when the mouse is elsewhere, which
  helps when working on the menu's own styles (they are at the top of the
  `PostEditor` class in `site/post-editor.js`).
- Ctrl+Z and Ctrl+Shift+Z undo and redo. Typing is undone by the browser, and
  what the menu did to blocks by the editor.
- "Save" (or Ctrl+S) writes the article, the title (from the `# heading`) and
  the description into the post's HTML file. The rest of the file is left as
  it was, so the `<head>` and anything else can still be edited by hand.

`serve.js` rewrites the list of posts in `site/index.html` and `site/feed.xml`
from the posts themselves, when it starts and after every save. Both files are
committed, so after adding, renaming or removing a post by hand, run it once.

## Deploying

Pushing to `master` uploads `site/` to GitHub Pages.

## Lit

`site/lit.js` is Lit's core and the few directives the site uses, bundled into
one file. To make it again from a newer Lit, in an empty directory:

```bash
npm install lit esbuild
```

```bash
cat > entry.js <<'END'
export * from "lit";
export { classMap } from "lit/directives/class-map.js";
export { ifDefined } from "lit/directives/if-defined.js";
export { live } from "lit/directives/live.js";
export { repeat } from "lit/directives/repeat.js";
END
```

```bash
npx esbuild entry.js --bundle --format=esm --minify --conditions=production --legal-comments=none --outfile=lit.js
```

and keep the comment at the top of the file, with its version changed.
