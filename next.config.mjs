import path from "path";

const nextConfig = {
  basePath: "/R50B3",
  assetPrefix: "/R50B3",
  trailingSlash: false,
  skipTrailingSlashRedirect: true,

  sassOptions: {
    includePaths: [path.join(process.cwd(), "src")],
  },

  webpack: (config) => {
    config.cache = false;
    return config;
  },
};

export default nextConfig;