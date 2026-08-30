import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  // The splat route has no static path of its own, so its document is asked
  // for by hand. It becomes the 404 page that GitHub Pages serves.
  prerender: ({ getStaticPaths }) => [...getStaticPaths(), "/404"],
} satisfies Config;
