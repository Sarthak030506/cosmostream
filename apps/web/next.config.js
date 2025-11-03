/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      // Space news image sources - both bare domains and subdomains
      {
        protocol: 'https',
        hostname: 'spacex.com',
      },
      {
        protocol: 'https',
        hostname: '**.spacex.com',
      },
      {
        protocol: 'https',
        hostname: 'nasa.gov',
      },
      {
        protocol: 'https',
        hostname: '**.nasa.gov',
      },
      {
        protocol: 'https',
        hostname: 'nasaspaceflight.com',
      },
      {
        protocol: 'https',
        hostname: '**.nasaspaceflight.com',
      },
      {
        protocol: 'https',
        hostname: 'spacenews.com',
      },
      {
        protocol: 'https',
        hostname: '**.spacenews.com',
      },
      {
        protocol: 'https',
        hostname: '**.wp.com',
      },
      {
        protocol: 'https',
        hostname: 'esa.int',
      },
      {
        protocol: 'https',
        hostname: '**.esa.int',
      },
      {
        protocol: 'https',
        hostname: 'spaceflightnow.com',
      },
      {
        protocol: 'https',
        hostname: '**.spaceflightnow.com',
      },
      {
        protocol: 'http',
        hostname: 'spaceflightnow.com',
      },
      {
        protocol: 'http',
        hostname: '**.spaceflightnow.com',
      },
      {
        protocol: 'https',
        hostname: 'europeanspaceflight.com',
      },
      {
        protocol: 'https',
        hostname: '**.europeanspaceflight.com',
      },
      {
        protocol: 'https',
        hostname: 'arstechnica.net',
      },
      {
        protocol: 'https',
        hostname: '**.arstechnica.net',
      },
      {
        protocol: 'https',
        hostname: 'spacescout.info',
      },
      {
        protocol: 'https',
        hostname: '**.spacescout.info',
      },
      {
        protocol: 'https',
        hostname: 'spacepolicyonline.com',
      },
      {
        protocol: 'https',
        hostname: '**.spacepolicyonline.com',
      },
      // WordPress emoji and image CDN
      {
        protocol: 'https',
        hostname: 's.w.org',
      },
      {
        protocol: 'https',
        hostname: '**.w.org',
      },
      // YouTube thumbnails
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      // Common CDNs and image hosts
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
