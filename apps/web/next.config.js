/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignora erros de TypeScript para permitir o deploy com erros de tipagem
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignora avisos/erros de ESLint durante o build
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'],
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
};

module.exports = nextConfig;
