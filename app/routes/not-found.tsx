import type { Route } from "./+types/not-found";

// A catch-all route so that every URL has a match. Without it, unknown URLs
// fall through to the root ErrorBoundary, which the SPA fallback document
// cannot hydrate. The content must not depend on the URL, because the
// prerendered document is served for any unknown path.
export function meta({}: Route.MetaArgs) {
  return [
    { title: "404" },
    { name: "description", content: "The requested page could not be found." },
    { name: "robots", content: "noindex" },
  ];
}

export default function NotFound() {
  return (
    <main className="error-page">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  );
}
