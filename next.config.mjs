/** @type {import('next').NextConfig} */
const nextConfig = {
    // Silence warnings
    // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
    webpack: (config) => {
      config.externals.push('pino-pretty', 'lokijs', 'encoding');
      return config;
    },
    // Disable ESLint during builds
    eslint: {
      ignoreDuringBuilds: true,
    },
    // ✅ Add security headers
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'on'
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=63072000; includeSubDomains; preload'
            },
            {
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN'
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block'
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin'
            },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=()'
            },
            {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://pay.coinbase.com https://crypto-js.stripe.com https://js.stripe.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "img-src 'self' data: https: blob:",
                "font-src 'self' data: https://fonts.gstatic.com",
                "connect-src 'self' https://*.coinbase.com https://api.developer.coinbase.com wss://*.walletconnect.com https://*.walletconnect.org wss://*.walletlink.org https://api.coingecko.com https://*.base.org https://*.merkle.io https://*.checkout.com",
                "frame-src 'self' https://pay.coinbase.com https://*.checkout.com https://*.coinbase.com",
                "frame-ancestors 'none'",
              ].join('; ')
            }
          ],
        },
      ];
    },
  };
  
  export default nextConfig;
  