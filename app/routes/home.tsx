import { Link } from "react-router";

import type { Route } from "./+types/home";
import { getPosts } from "../posts.server";
import { Clouds } from "../components/clouds";
import { StarField } from "../components/star-field";
import { Strata } from "../components/strata";

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
      <Strata />
      <main>
        <header className="hero">
          <Clouds />
          <StarField />
          <h1>For Me</h1>
          <p>a blog for me</p>
        </header>
        <ol className="posts">
          {loaderData.posts.map((post) => (
            <li className="stratum" key={post.path}>
              <time className="m" dateTime={post.date}>
                {post.dateFormatted}
              </time>
              <h2>
                <Link to={post.path}>{post.title}</Link>
              </h2>
              <p>{post.description}</p>
            </li>
          ))}
        </ol>
      </main>
    </>
  );
}
