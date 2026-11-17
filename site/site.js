// The one script every page loads, from its <head>, before the body is parsed.

// Setting localStorage.theme = "dark" in a browser shows that browser the dark
// theme whatever its preference, so it can be checked by day. Done here, the
// light theme never flashes first.
try {
  if (localStorage.theme === "dark") {
    document.documentElement.dataset.theme = "dark";
    for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
      meta.content = "#000000";
    }
  }
} catch {}

// Served from this computer, a post can be edited in place: see serve.js.
if (["localhost", "127.0.0.1", "[::1]"].includes(location.hostname)) {
  import("/post-editor.js");
}
