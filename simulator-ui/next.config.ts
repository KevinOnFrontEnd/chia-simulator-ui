/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    wasm: true, // ✅ This enables WebAssembly support
  },
  webpack(config:any) {
    config.experiments = {
      asyncWebAssembly: true,
      ...config.experiments,
    };

    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    return config;
  },
};

export default nextConfig;
