import { Link } from "react-router";

import type { Route } from "./+types/home";
import { getPosts } from "../posts.server";

export async function loader() {
  return { posts: await getPosts() };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "For Me" },
    { name: "description", content: "A blog for me" },
    { tagName: "link", rel: "canonical", href: "https://www.dewhurst.io" },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <nav>
      {loaderData.posts.map((post) => (
        <li key={post.path}>
          <Link to={post.path}>{post.title}</Link>
          <time dateTime={post.date}>{post.dateFormatted}</time>
        </li>
      ))}
    </nav>
  );
}
