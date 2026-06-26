import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workshop step 09 — Cache Components. Enables `use cache` + cacheLife, and
  // makes Partial Prerendering the default: a static shell is prerendered and
  // dynamic holes (anything reading cookies/headers/connection or doing an
  // uncached fetch, wrapped in <Suspense>) stream in per request.
  cacheComponents: true,
  images: {
    // Workshop step 06 — the GraphQL "sponsored products" store serves its
    // images from this host, so allow next/image to optimise them.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "graphqlstore.julienfroidefond.com",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
