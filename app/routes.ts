import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

import { getPosts } from "./posts.server";

// Each post's MDX file is its own route module, nested under the post layout.
// This gives every post its own JS/CSS chunk, linked in the document head by
// the framework — no lazy loading involved.
export default (async () => [
  index("routes/home.tsx"),
  layout(
    "routes/post.tsx",
    (await getPosts()).map((post) =>
      route(post.path.slice(1), `../posts/${post.slug}.mdx`),
    ),
  ),
  route("*", "routes/not-found.tsx"),
])() satisfies RouteConfig;
