import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({
  options: {
    // `remark-frontmatter` recognizes `---` YAML blocks at the top of an MDX
    // file so the MDX compiler ignores them (we parse frontmatter separately
    // with `gray-matter` in `lib/blog/posts.ts`).
    remarkPlugins: [["remark-frontmatter"], ["remark-gfm"]],
    rehypePlugins: [],
  },
});

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https",
        hostname: "html.tailus.io",
      },
    ],
  },
  async redirects() {
    // Legacy URLs for posts that used to live at the top level under
    // `app/(blog)/<slug>/page.tsx`. They're now MDX files under
    // `content/blog/` rendered at `/blog/<slug>`.
    return [
      {
        source: "/segundo-cerebro-cursor",
        destination: "/blog/segundo-cerebro-cursor",
        permanent: true,
      },
      {
        source: "/guia-openclaw",
        destination: "/blog/guia-openclaw",
        permanent: true,
      },
      {
        source: "/integracion-google",
        destination: "/blog/integracion-google",
        permanent: true,
      },
    ];
  },
};

export default withMDX(nextConfig);
