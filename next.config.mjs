/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: false,
        followSymlinks: false,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/storage/**',
          'C:/**',
          'C:/*.*',
          '**/dev.db*',
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
