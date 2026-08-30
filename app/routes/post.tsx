import { Link, Outlet, data } from "react-router";

import type { Route } from "./+types/post";
import { getPost } from "../posts.server";

export async function loader({ request }: Route.LoaderArgs) {
  // Data prerender requests carry a .data suffix on the pathname
  const path = new URL(request.url).pathname
    .replace(/\.data$/, "")
    .replace(/\/$/, "");
  const slug = path.split("/").pop() ?? "";
  const post = await getPost(slug);

  if (!post || post.path !== path) {
    throw data("Not Found", { status: 404 });
  }

  return post;
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) {
    return [{ title: "For Me" }];
  }

  return [
    { title: `${loaderData.title} | For Me` },
    { name: "description", content: loaderData.description },
    {
      tagName: "link",
      rel: "canonical",
      href: `https://www.dewhurst.io${loaderData.path}`,
    },
  ];
}

export default function Post({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <header className="site-header" role="banner">
        <Link to="/">For Me</Link>
      </header>
      <main>
        <article>
          <header>
            <time dateTime={loaderData.date}>{loaderData.dateFormatted}</time>
            <h1>{loaderData.title}</h1>
          </header>
          <section>
            <Outlet />
          </section>
        </article>
      </main>
    </>
  );
}
