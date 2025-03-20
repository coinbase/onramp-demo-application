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
  };
  
  export default nextConfig;
  