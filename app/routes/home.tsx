import { Link } from "react-router";

import type { Route } from "./+types/home";
import { getPosts } from "../posts.server";
import { Clouds } from "../components/clouds";
import { StarField } from "../components/star-field";
import { Hills } from "../components/hills";

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
    <>
      <Hills />
      <main>
        <header className="hero">
          <Clouds />
          <StarField />
          <h1>For Me</h1>
        </header>
        <ol className="posts">
          {loaderData.posts.map((post) => (
            <li className="post" key={post.path}>
              <time dateTime={post.date}>{post.dateFormatted}</time>
              <h2>
                <Link to={post.path}>{post.title}</Link>
              </h2>
            </li>
          ))}
        </ol>
      </main>
    </>
  );
}
