const nextConfig = {
  output: "standalone",
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  experimental: {
    serverComponentsExternalPackages: ["gray-matter", "js-yaml"]
  }
};

export default nextConfig;
