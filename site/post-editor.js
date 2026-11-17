// The editor for a post, in the post. site.js loads this when the page is
// served from this computer (node serve.js), and it adds an "Edit" button to
// any page with an <article>.
//
// While editing, the article is typed into directly. Hovering a block shows a
// small menu just above it, to change what the block is (the
// typography in style.css: paragraph, heading, subheading, list, numbered
// list, code block, quote), to mark the selected text, and to add, move or
// remove blocks. Saving writes the article back into the post's HTML file,
// leaving the rest of the file as it was.
//
// Undo and redo are the browser's own for anything typed. What the menu does
// to blocks the browser does not record, so the editor keeps its own history
// of just those changes, and Ctrl+Z and Ctrl+Shift+Z reach for it only when
// the article is exactly as such a change left it.

import { LitElement, css, html, nothing, svg } from "/lit.js";

const SITE = "https://www.dewhurst.io";

// The menu's icons, drawn on a 16 by 16 grid in the colour of the text.
// Letters stand for what is conventionally a letter: B, I, H2, H3.
const drawn = (shapes) => html`
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes}</svg>
`;
const numeral = (y, digit) => svg`
  <text x="1" y=${y} font-size="5" font-family="sans-serif" font-weight="700"
    fill="currentColor" stroke="none">${digit}</text>
`;

const ICONS = {
  paragraph: drawn(svg`<path d="M7 13.5V9M7 9V2.5M10.5 13.5v-11M12.5 2.5H6.75a3.25 3.25 0 0 0 0 6.5H7"/>`),
  heading: html`<span class="letters"><b>H</b><small>2</small></span>`,
  subheading: html`<span class="letters"><b>H</b><small>3</small></span>`,
  list: drawn(svg`
    <path d="M6 4h8M6 8h8M6 12h8"/>
    <path d="M2.5 4h.01M2.5 8h.01M2.5 12h.01" stroke-width="2.25"/>
  `),
  numbered: drawn(svg`
    <path d="M6.5 4h7.5M6.5 8h7.5M6.5 12h7.5"/>
    ${numeral(5.75, 1)}${numeral(9.75, 2)}${numeral(13.75, 3)}
  `),
  codeBlock: drawn(svg`
    <rect x="1.75" y="2.25" width="12.5" height="11.5" rx="2"/>
    <path d="M6.5 6 4.5 8l2 2M9.5 6l2 2-2 2"/>
  `),
  quote: drawn(svg`
    <path fill="currentColor" stroke="none"
      d="M2 12V7.75A4.25 4.25 0 0 1 6.25 3.5v2A2.25 2.25 0 0 0 4 7.75h2.75V12z
         M9 12V7.75a4.25 4.25 0 0 1 4.25-4.25v2A2.25 2.25 0 0 0 11 7.75h2.75V12z"/>
  `),
  bold: html`<span class="letters"><b>B</b></span>`,
  italic: html`<span class="letters"><em>I</em></span>`,
  code: drawn(svg`<path d="M5 4.5 1.5 8 5 11.5M11 4.5 14.5 8 11 11.5M9.25 3 6.75 13"/>`),
  link: drawn(svg`
    <g transform="rotate(-45 8 8)">
      <rect x="1" y="5.75" width="7.5" height="4.5" rx="2.25"/>
      <rect x="7.5" y="5.75" width="7.5" height="4.5" rx="2.25"/>
    </g>
  `),
  add: drawn(svg`<path d="M8 3v10M3 8h10"/>`),
  up: drawn(svg`<path d="M8 13.5v-11M3.5 7 8 2.5 12.5 7"/>`),
  down: drawn(svg`<path d="M8 2.5v11M3.5 9 8 13.5 12.5 9"/>`),
  remove: drawn(svg`
    <path d="M2.5 4.5h11M6 4.5V2.75h4V4.5M4 4.5l.6 8.75h6.8L12 4.5M6.75 7.25v3.5M9.25 7.25v3.5"/>
  `),
};

// What a block can be: its tag, its icon, its name
const TYPES = [
  ["P", ICONS.paragraph, "Paragraph"],
  ["H2", ICONS.heading, "Heading"],
  ["H3", ICONS.subheading, "Subheading"],
  ["UL", ICONS.list, "List"],
  ["OL", ICONS.numbered, "Numbered list"],
  ["PRE", ICONS.codeBlock, "Code block"],
  ["BLOCKQUOTE", ICONS.quote, "Quote"],
];

const TEXT = new Set(["P", "H1", "H2", "H3", "H4", "BLOCKQUOTE"]);
const LISTS = new Set(["UL", "OL"]);

const isCustom = (element) => element.localName.includes("-");

// Blocks that are typed into. Anything else in an article, such as a custom
// element or a table written by hand, is moved and removed whole.
function isEditable(element) {
  return (
    TEXT.has(element.tagName) ||
    LISTS.has(element.tagName) ||
    element.tagName === "PRE" ||
    (element.tagName === "DIV" && !element.attributes.length)
  );
}

/* ---------------- article to HTML ---------------- */

const BLOCKS = new Set(
  `ADDRESS ASIDE BLOCKQUOTE DD DETAILS DIV DL DT FIELDSET FIGCAPTION FIGURE
   FOOTER FORM H1 H2 H3 H4 H5 H6 HEADER HR LI NAV OL P PRE SECTION SUMMARY
   TABLE TBODY TD TFOOT TH THEAD TR UL`.split(/\s+/),
);
const VOID = new Set(["BR", "HR", "IMG", "INPUT", "WBR"]);
const VERBATIM = new Set(["SCRIPT", "STYLE", "SVG", "TEXTAREA"]);
// What the browser makes when asked for bold or italic, and what is written
const RENAMED = { B: "strong", I: "em" };

const isBlock = (node) =>
  node.nodeType === Node.ELEMENT_NODE && (BLOCKS.has(node.tagName) || isCustom(node));

function escapeText(text) {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function attributes(element) {
  let out = "";

  for (const { name, value } of element.attributes) {
    if (name !== "contenteditable") {
      out += value === ""
        ? ` ${name}`
        : ` ${name}="${value.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}"`;
    }
  }

  return out;
}

// The text of a block as typed, with each line break a newline
function plainText(element) {
  const copy = element.cloneNode(true);

  for (const br of copy.querySelectorAll("br")) {
    br.replaceWith("\n");
  }

  return copy.textContent.replaceAll(" ", " ");
}

// The contents of a block of text, on one line. An editable region collects
// wrappers and non-breaking spaces as it is typed in, which are not kept.
function inline(parent) {
  let out = "";

  for (const node of parent.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      out += escapeText(node.data.replaceAll(" ", " ").replace(/\s+/g, " "));
    } else if (node.nodeType !== Node.ELEMENT_NODE) {
      continue;
    } else if (isCustom(node)) {
      out += `<${node.localName}${attributes(node)}></${node.localName}>`;
    } else if (VERBATIM.has(node.tagName.toUpperCase())) {
      out += node.outerHTML;
    } else if (VOID.has(node.tagName)) {
      out += `<${node.localName}${attributes(node)}>`;
    } else if (
      (node.tagName === "SPAN" || node.tagName === "FONT") &&
      [...node.attributes].every(({ name }) => name === "style")
    ) {
      out += inline(node);
    } else {
      const name = RENAMED[node.tagName] ?? node.localName;
      const content = inline(node);

      if (content.trim() || node.attributes.length) {
        out += `<${name}${attributes(node)}>${content}</${name}>`;
      }
    }
  }

  return out;
}

function trimmed(html) {
  return html.replace(/^(\s|<br>)+|(\s|<br>)+$/g, "");
}

// One node of the article as lines of HTML, or nothing if it is empty
function block(node, indent) {
  if (node.nodeType === Node.COMMENT_NODE) {
    return `${indent}<!--${node.data}-->`;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    const text = escapeText(node.data.replaceAll(" ", " ").replace(/\s+/g, " ").trim());

    return text && `${indent}${text}`;
  }

  if (node.nodeType !== Node.ELEMENT_NODE || node.tagName === "BR") {
    return "";
  }

  const name = node.localName;
  const open = `${indent}<${name}${attributes(node)}>`;

  if (isCustom(node)) {
    // Whatever a custom element has drawn inside itself is its own business
    return `${open}</${name}>`;
  }

  if (VERBATIM.has(node.tagName.toUpperCase())) {
    return indent + node.outerHTML;
  }

  if (VOID.has(node.tagName)) {
    return open;
  }

  if (node.tagName === "PRE") {
    const text = escapeText(plainText(node).replace(/\n+$/, ""));

    // A newline straight after <pre> is dropped when the file is read
    return text && `${open}${text.startsWith("\n") ? "\n" : ""}${text}</pre>`;
  }

  if ([...node.childNodes].some(isBlock)) {
    const lines = [...node.childNodes].map((child) => block(child, indent + "  "));

    return [open, ...lines.filter(Boolean), `${indent}</${name}>`].join("\n");
  }

  const content = trimmed(inline(node));

  return content || node.attributes.length ? `${open}${content}</${name}>` : "";
}

// The inside of an <article>, one block per line with a blank line between
export function serialize(article, indent = "") {
  const blocks = [];

  for (const node of article.childNodes) {
    // Text typed outside any block, and the <div>s some browsers make for new
    // lines, are paragraphs.
    const loose =
      node.nodeType === Node.TEXT_NODE ||
      (node.nodeType === Node.ELEMENT_NODE && !isBlock(node) && node.tagName !== "BR") ||
      (node.tagName === "DIV" && !node.attributes.length && ![...node.childNodes].some(isBlock));

    if (loose) {
      const paragraph = document.createElement("p");

      paragraph.append(node.cloneNode(true));
      if (node.tagName === "DIV") {
        paragraph.replaceChildren(...node.cloneNode(true).childNodes);
      }
      blocks.push(block(paragraph, indent));
    } else {
      blocks.push(block(node, indent));
    }
  }

  return blocks.filter(Boolean).join("\n\n");
}

// The post's HTML file with this page's article, title and description put
// into it. Everything else in the file is kept character for character.
export function updateSource(source, { article, description, path }) {
  const indent = /\n([ \t]*)<article/.exec(source)?.[1] ?? "";
  const body = serialize(article, indent + "  ");
  const title = article.querySelector("h1")?.textContent.replace(/\s+/g, " ").trim();
  const quoted = (text) => escapeText(text).replaceAll('"', "&quot;");

  if (!/<article[^>]*>[\s\S]*<\/article>/.test(source)) {
    throw new Error("the file has no <article>");
  }

  let out = source.replace(
    /(<article[^>]*>)[\s\S]*(<\/article>)/,
    (all, open, close) => `${open}\n${body}\n${indent}${close}`,
  );

  if (title) {
    out = out.replace(/<title>[^<]*<\/title>/, () => `<title>${escapeText(title)} | For Me</title>`);
  }

  return out
    .replace(
      /(<meta name="description" content=")[^"]*(")/,
      (all, before, after) => before + quoted(description.replace(/\s+/g, " ").trim()) + after,
    )
    .replace(
      /(<link rel="canonical" href=")[^"]*(")/,
      (all, before, after) => before + quoted(SITE + path) + after,
    );
}

/* ---------------- changing blocks ---------------- */

function caretIn(element, atEnd = false) {
  const range = document.createRange();

  range.selectNodeContents(element);
  range.collapse(!atEnd);

  const selection = getSelection();

  selection.removeAllRanges();
  selection.addRange(range);
}

// An empty block needs a line break in it to have any height to click on
function emptyParagraph() {
  const paragraph = document.createElement("p");

  paragraph.append(document.createElement("br"));

  return paragraph;
}

// A block as its lines: the items of a list, the lines of a code block, or
// the one run of text of anything else.
function linesOf(element) {
  if (LISTS.has(element.tagName)) {
    return [...element.children].map((item) => [...item.childNodes]);
  }

  if (element.tagName === "PRE") {
    return plainText(element)
      .replace(/\n+$/, "")
      .split("\n")
      .map((line) => [document.createTextNode(line)]);
  }

  return [[...element.childNodes]];
}

// Replaces a block with the same text as another kind of block, and returns
// the blocks it made. The old block is left whole, so that it can be put back.
function retype(element, tag) {
  const lines = linesOf(element.cloneNode(true));
  const made = [];
  const make = (name, nodes) => {
    const created = document.createElement(name);

    created.append(...nodes);

    return created;
  };

  if (tag === "PRE") {
    const text = lines.map((nodes) => plainText(make("div", nodes))).join("\n");

    made.push(make("pre", [text]));
  } else if (LISTS.has(tag)) {
    made.push(make(tag, lines.map((nodes) => make("li", nodes))));
  } else if (LISTS.has(element.tagName)) {
    // Each item of a list becomes a block of its own
    made.push(...lines.map((nodes) => make(tag, nodes)));
  } else {
    const nodes = lines.flatMap((line, i) => (i ? [document.createElement("br"), ...line] : line));

    made.push(make(tag, nodes));
  }

  for (const created of made) {
    if (!created.hasChildNodes() || (LISTS.has(tag) && !created.firstChild.hasChildNodes())) {
      (LISTS.has(tag) ? created.firstChild : created).append(document.createElement("br"));
    }
  }

  element.replaceWith(...made);

  return made;
}

/* ---------------- the editor ---------------- */

class PostEditor extends LitElement {
  static properties = {
    description: { state: true },
    dirty: { state: true },
    editing: { state: true },
    status: { state: true },
    // The block the menu is for
    target: { state: true },
    // Keeps the menu on show when the mouse is elsewhere, for working on how
    // it looks
    pinned: { state: true },
  };

  static styles = css`
    :host {
      --inner: 0.5em;
      --pad: 0.35em;
      --edge: 1px;
      font: 0.8125rem / 1.5 system-ui, sans-serif;
      color: var(--ink);
    }
    * {
      box-sizing: border-box;
      margin: 0;
    }
    .menu,
    .bar {
      position: fixed;
      z-index: 2;
      display: flex;
      align-items: center;
      padding: var(--pad);
      background: var(--ground);
      border: var(--edge) solid var(--rule);
      border-radius: var(--inner);
      gap: var(--pad);
    }
    button,
    input {
      font: inherit;
      color: inherit;
      background: none;
      border: none;
      border-radius: calc(var(--inner) - var(--pad));
    }
    button {
      padding: 0.25em 0.75em;
      cursor: pointer;
    }
    button:hover {
      background: color-mix(in oklab, var(--ground), var(--ink) 30%);
    }
    :is(button, input):focus-visible {
      outline: 1px solid var(--ink);
      outline-offset: -1px;
    }
    .on {
      background: var(--rule);
    }

    /* The menu sits just above its block: a row of square buttons, an icon
       in each */
    .menu button {
      display: grid;
      place-items: center;
      padding: 0.4em;
    }
    .menu svg,
    .letters {
      display: block;
      width: 1.25em;
      height: 1.25em;
    }
    /* B, I, H2 and H3, set like the text they make */
    .letters {
      /* The same box as a drawn icon, measured in its own larger type */
      width: calc(1.25em / 1.15);
      height: calc(1.25em / 1.15);
      font: 1.15em / 1.1 Georgia, "Noto Serif", serif;
      text-align: center;
      white-space: nowrap;
    }
    .letters small {
      font-size: 0.7em;
    }
    /* A rule between groups of buttons */
    .menu i {
      align-self: stretch;
      width: var(--edge);
      background: var(--rule);
    }
    .outline {
      position: fixed;
      z-index: 1;
      pointer-events: none;
      border-left: 1px solid var(--rule);
    }

    /* The bar floats along the bottom of the window */
    .bar {
      inset: auto 1rem 1rem 1rem;
    }
    .bar.closed {
      inset: auto 1rem 1rem auto;
    }
    .bar label {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 1ch;
      padding-left: 0.75em;
      color: var(--dim);
    }
    .bar input {
      flex: 1;
      min-width: 0;
      /* Less the border, so that it is as tall as the buttons beside it */
      padding: calc(0.25em - var(--edge)) 0.75em;
      color: var(--ink);
      border: var(--edge) solid var(--rule);
    }
    .status {
      padding: 0 0.75em;
      color: var(--dim);
    }
    .status:empty {
      display: none;
    }
    .status.bad {
      color: var(--bad);
    }
  `;

  constructor() {
    super();
    this.article = document.querySelector("article");
    this.description =
      document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
    this.dirty = false;
    this.editing = false;
    this.status = "";
    this.target = null;
    this.pinned = false;
    // Changes made by the menu, each as { index, before, count, state }: at
    // `index` among the article's blocks, `count` blocks stand where the
    // blocks `before` stood, and `state` is the article as that left it.
    this.undone = [];
    this.done = [];

    this.onMouseMove = (event) => {
      const found = this.blockOf(event.target);

      clearTimeout(this.hiding);

      if (found && found !== this.target) {
        this.target = found;
      }
    };
    this.hideSoon = () => {
      clearTimeout(this.hiding);
      if (!this.pinned) {
        this.hiding = setTimeout(() => (this.target = null), 300);
      }
    };
    this.onInput = () => {
      // Out of the way while typing; the next move of the mouse brings it back
      if (!this.pinned) {
        this.target = null;
      }
      this.changed();
    };
    // A triple click selects a block up to the start of the next one, and
    // typing over that would join the two. Select just the one clicked.
    this.onClick = (event) => {
      const text = event.target.closest?.("li, p, h1, h2, h3, h4, blockquote, pre");

      if (event.detail === 3 && text && this.article.contains(text)) {
        getSelection().selectAllChildren(text);
      }
    };
    this.onHistoryKey = this.onHistoryKey.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onPaste = this.onPaste.bind(this);
    this.onMoved = () => this.target && this.requestUpdate();
    this.onBeforeUnload = (event) => this.dirty && event.preventDefault();
  }

  connectedCallback() {
    super.connectedCallback();

    try {
      this.pinned = sessionStorage.pinned === "yes";
      if (sessionStorage.editing === location.pathname) {
        this.start();
      }
    } catch {}
  }

  /* ---- starting and stopping ---- */

  start() {
    const { article } = this;

    this.editing = true;
    this.status = "";
    article.contentEditable = "true";
    article.style.outline = "none";
    document.execCommand("defaultParagraphSeparator", false, "p");

    for (const child of article.children) {
      if (!isEditable(child)) {
        child.contentEditable = "false";
      }
    }

    article.addEventListener("mousemove", this.onMouseMove);
    article.addEventListener("mouseleave", this.hideSoon);
    article.addEventListener("input", this.onInput);
    article.addEventListener("click", this.onClick);
    article.addEventListener("keydown", this.onKeyDown);
    article.addEventListener("paste", this.onPaste);
    document.addEventListener("keydown", this.onHistoryKey);
    window.addEventListener("scroll", this.onMoved, { passive: true });
    window.addEventListener("resize", this.onMoved);
    window.addEventListener("beforeunload", this.onBeforeUnload);

    try {
      sessionStorage.editing = location.pathname;
    } catch {}
  }

  stop() {
    const { article } = this;

    if (this.dirty && !confirm("Stop editing without saving? The page keeps the changes until it is reloaded.")) {
      return;
    }

    this.editing = false;
    this.target = null;
    article.removeAttribute("contenteditable");
    article.style.outline = "";
    if (!article.getAttribute("style")) {
      article.removeAttribute("style");
    }

    for (const child of article.children) {
      child.removeAttribute("contenteditable");
    }

    article.removeEventListener("mousemove", this.onMouseMove);
    article.removeEventListener("mouseleave", this.hideSoon);
    article.removeEventListener("input", this.onInput);
    article.removeEventListener("click", this.onClick);
    article.removeEventListener("keydown", this.onKeyDown);
    article.removeEventListener("paste", this.onPaste);
    document.removeEventListener("keydown", this.onHistoryKey);
    window.removeEventListener("scroll", this.onMoved);
    window.removeEventListener("resize", this.onMoved);
    window.removeEventListener("beforeunload", this.onBeforeUnload);

    try {
      delete sessionStorage.editing;
    } catch {}
  }

  // Pinned, the menu always has a block to be for: the one it was last on,
  // or failing that the first under the title.
  willUpdate() {
    if (this.editing && this.pinned && !this.target?.isConnected) {
      this.target = this.article.children[1] ?? this.article.children[0] ?? null;
    }
  }

  pin() {
    this.pinned = !this.pinned;

    try {
      sessionStorage.pinned = this.pinned ? "yes" : "";
    } catch {}
  }

  changed() {
    this.dirty = true;
    this.status = "";
  }

  /* ---- undoing what the menu did ---- */

  indexOf(element) {
    return [...this.article.children].indexOf(element);
  }

  // Call once a change is made: `count` blocks now stand at `index`, where
  // the blocks `before` stood.
  record(index, before, count) {
    this.done.push({ index, before, count, state: serialize(this.article) });
    this.undone = [];
    this.changed();
  }

  // Takes the last change off one history, puts the article back as it was
  // before it, and leaves the opposite change on the other history.
  revert(from, to) {
    const { index, before, count } = from.pop();
    const children = [...this.article.children];
    const current = children.slice(index, index + count);
    const next = children[index + count] ?? null;

    for (const element of current) {
      element.remove();
    }
    for (const element of before) {
      this.article.insertBefore(element, next);
    }

    to.push({ index, before: current, count: before.length, state: serialize(this.article) });
    this.target = null;
    this.changed();
  }

  // Ctrl+Z and Ctrl+Shift+Z (or Ctrl+Y) are the editor's only when the
  // article is just as one of its own changes left it. Otherwise something
  // has been typed since, and undoing that is the browser's business.
  onHistoryKey(event) {
    const key = event.key.toLowerCase();

    // Ctrl+S saves, wherever on the page it is pressed
    if ((event.ctrlKey || event.metaKey) && !event.altKey && key === "s") {
      event.preventDefault();
      this.save();
      return;
    }

    const undo = key === "z" && !event.shiftKey;
    const redo = (key === "z" && event.shiftKey) || key === "y";

    if (
      !(event.ctrlKey || event.metaKey) ||
      event.altKey ||
      !(undo || redo) ||
      // Typing in a field, the editor's own or one in the post
      this.shadowRoot.activeElement ||
      event.target.closest?.("input, textarea, select")
    ) {
      return;
    }

    const [from, to] = undo ? [this.done, this.undone] : [this.undone, this.done];

    if (from.length && from.at(-1).state === serialize(this.article)) {
      event.preventDefault();
      this.revert(from, to);
    }
  }

  /* ---- saving ---- */

  async save() {
    this.status = "Saving...";

    try {
      const path = location.pathname.replace(/\.html$/, "");
      const response = await fetch(path, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`reading the file: ${response.status}`);
      }

      const text = await response.text();

      // Cleared as the article is read, so that anything typed while it is
      // being written still counts as unsaved
      this.dirty = false;

      const source = updateSource(text, {
        article: this.article,
        description: this.description,
        path,
      });
      const saved = await fetch(path, { method: "PUT", body: source });

      if (!saved.ok) {
        throw new Error(`writing the file: ${saved.status}`);
      }

      const title = /<title>([^<]*)<\/title>/.exec(source)?.[1];

      if (title) {
        document.title = new DOMParser().parseFromString(title, "text/html").body.textContent;
      }

      this.status = this.dirty ? "" : "Saved";
    } catch (error) {
      this.dirty = true;
      this.status = `Not saved - ${error.message}`;
    }
  }

  /* ---- the article's events ---- */

  // The child of the article that a node is in
  blockOf(node) {
    while (node && node.parentNode !== this.article) {
      node = node.parentNode;
    }

    return node?.nodeType === Node.ELEMENT_NODE ? node : null;
  }

  onKeyDown(event) {
    const selection = getSelection();
    let current = this.blockOf(selection.focusNode);

    if (!current || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (current.tagName === "PRE") {
      // Code is typed as in a text editor
      if (event.key === "Enter") {
        event.preventDefault();
        document.execCommand("insertLineBreak");
      } else if (event.key === "Tab") {
        event.preventDefault();
        document.execCommand("insertText", false, "\t");
      }
      return;
    }

    if (event.key !== "Enter" || event.shiftKey || !TEXT.has(current.tagName)) {
      return;
    }

    // Enter replaces whatever is selected, as it does anywhere else
    if (!selection.isCollapsed) {
      document.execCommand("delete");
      current = this.blockOf(selection.focusNode);

      if (!current || !TEXT.has(current.tagName)) {
        return;
      }
    }

    const rest = document.createRange();

    rest.selectNodeContents(current);
    rest.setStart(selection.focusNode, selection.focusOffset);

    const atEnd = rest.toString().trim() === "";

    if (current.tagName === "P" && !atEnd) {
      // The browser splits a paragraph in two well enough
      return;
    }

    event.preventDefault();

    if (atEnd || current.tagName === "H1") {
      // Enter at the end of a heading or a quote starts a paragraph, not
      // another of the same. The title is never split.
      const paragraph = emptyParagraph();

      current.after(paragraph);
      caretIn(paragraph);
      this.record(this.indexOf(paragraph), [], 1);
    } else {
      document.execCommand("insertLineBreak");
    }
  }

  // Pasted text arrives as text, without the styles it had where it was copied
  onPaste(event) {
    const text = event.clipboardData?.getData("text/plain");

    if (text === undefined) {
      return;
    }

    event.preventDefault();

    const inCode = this.blockOf(getSelection().focusNode)?.tagName === "PRE";

    document.execCommand("insertText", false, inCode ? text : text.replace(/\s*\n\s*/g, " "));
  }

  /* ---- the menu's actions ---- */

  setType(tag) {
    const { target } = this;

    if (target.tagName !== tag) {
      const index = this.indexOf(target);
      const made = retype(target, tag);

      this.target = made[0];
      this.record(index, [target], made.length);
    }
  }

  insertAfter() {
    const paragraph = emptyParagraph();

    this.target.after(paragraph);
    caretIn(paragraph);
    this.target = paragraph;
    this.record(this.indexOf(paragraph), [], 1);
  }

  move(up) {
    const { target } = this;
    const other = up ? target.previousElementSibling : target.nextElementSibling;

    // Nothing goes above the title
    if (!other || (up && other.tagName === "H1")) {
      return;
    }

    const pair = up ? [other, target] : [target, other];
    const index = this.indexOf(pair[0]);

    other[up ? "before" : "after"](target);
    this.record(index, pair, 2);
    this.requestUpdate();
  }

  remove() {
    const { target } = this;
    const index = this.indexOf(target);

    target.remove();
    this.target = null;
    this.record(index, [target], 0);
  }

  // The selection, if it is in the article
  selectedRange() {
    const selection = getSelection();

    return selection.rangeCount && this.article.contains(selection.anchorNode)
      ? selection.getRangeAt(0)
      : null;
  }

  mark(command) {
    if (this.selectedRange()) {
      document.execCommand(command);
      this.changed();
    }
  }

  code() {
    const range = this.selectedRange();

    if (!range) {
      return;
    }

    const container = range.commonAncestorContainer;
    const within = (container.nodeType === Node.ELEMENT_NODE ? container : container.parentElement)
      .closest("code");
    const changing = this.blockOf(container);
    const before = changing?.cloneNode(true);

    if (!changing) {
      return;
    }

    if (within && this.article.contains(within)) {
      within.replaceWith(...within.childNodes);
    } else if (!range.collapsed) {
      const code = document.createElement("code");

      code.append(range.extractContents());
      range.insertNode(code);
      getSelection().selectAllChildren(code);
    } else {
      return;
    }

    this.record(this.indexOf(changing), [before], 1);
  }

  link() {
    const range = this.selectedRange();

    if (!range) {
      return;
    }

    const container = range.commonAncestorContainer;
    const within = (container.nodeType === Node.ELEMENT_NODE ? container : container.parentElement)
      .closest("a");
    const href = prompt("Link to (empty to remove the link):", within?.getAttribute("href") ?? "https://");

    if (href === null) {
      return;
    }

    if (within) {
      const changing = this.blockOf(within);
      const before = changing.cloneNode(true);

      if (href) {
        within.setAttribute("href", href);
      } else {
        within.replaceWith(...within.childNodes);
      }

      this.record(this.indexOf(changing), [before], 1);
    } else if (href && !range.collapsed) {
      // The browser makes the link, and can undo it
      document.execCommand("createLink", false, href);
      this.changed();
    }
  }

  /* ---- rendering ---- */

  renderMenu() {
    const { target } = this;

    if (!target?.isConnected) {
      return nothing;
    }

    const box = target.getBoundingClientRect();
    const line = parseFloat(getComputedStyle(this).lineHeight) || 24;
    // Its bottom edge on the block's top edge, however tall its styles make
    // it, or below the block where there is no room above
    const place =
      box.top >= 3 * line
        ? `bottom: ${document.documentElement.clientHeight - box.top}px`
        : `top: ${box.bottom}px`;
    const editable = isEditable(target);
    const title = target.tagName === "H1";
    const button = (icon, name, action, on = false) => html`
      <button
        type="button"
        title=${name}
        aria-label=${name}
        class=${on ? "on" : ""}
        @click=${action}
      >
        ${icon}
      </button>
    `;

    return html`
      <div class="outline" style="top: ${box.top}px; left: ${box.left - 12}px; height: ${box.height}px"></div>
      <div
        class="menu"
        style="${place}; left: ${Math.max(box.left, 0)}px"
        @mousedown=${(event) => event.preventDefault()}
        @mouseenter=${() => clearTimeout(this.hiding)}
        @mouseleave=${this.hideSoon}
      >
        ${editable && !title
          ? html`
              ${TYPES.map(([tag, label, name]) =>
                button(label, name, () => this.setType(tag), target.tagName === tag),
              )}
              <i></i>
            `
          : nothing}
        ${editable && target.tagName !== "PRE"
          ? html`
              ${button(ICONS.bold, "Bold the selected text", () => this.mark("bold"))}
              ${button(ICONS.italic, "Italicise the selected text", () => this.mark("italic"))}
              ${button(ICONS.code, "Mark the selected text as code", this.code)}
              ${button(ICONS.link, "Link the selected text", this.link)}
              <i></i>
            `
          : nothing}
        ${button(ICONS.add, "Add a paragraph below", this.insertAfter)}
        ${title
          ? nothing
          : html`
              ${button(ICONS.up, "Move up", () => this.move(true))}
              ${button(ICONS.down, "Move down", () => this.move(false))}
              ${button(ICONS.remove, "Remove", this.remove)}
            `}
      </div>
    `;
  }

  render() {
    if (!this.editing) {
      return html`
        <div class="bar closed">
          <button type="button" @click=${this.start}>Edit</button>
        </div>
      `;
    }

    return html`
      ${this.renderMenu()}
      <div class="bar">
        <label>
          Description
          <input
            type="text"
            autocomplete="off"
            placeholder="A line for the index and the feed"
            .value=${this.description}
            @input=${(event) => {
              this.description = event.target.value;
              this.changed();
            }}
          />
        </label>
        <span class="status ${this.status.startsWith("Not saved") ? "bad" : ""}" role="status"
          >${this.status || (this.dirty ? "Unsaved" : "")}</span
        >
        <button
          type="button"
          title="Keep the block menu on show"
          class=${this.pinned ? "on" : ""}
          aria-pressed=${this.pinned ? "true" : "false"}
          @click=${this.pin}
        >
          Pin menu
        </button>
        <button type="button" title="Save (Ctrl+S)" @click=${this.save}>Save</button>
        <button type="button" @click=${this.stop}>Done</button>
      </div>
    `;
  }
}

customElements.define("post-editor", PostEditor);

function mount() {
  if (document.querySelector("article")) {
    document.body.append(document.createElement("post-editor"));
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
