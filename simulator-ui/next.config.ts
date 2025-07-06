/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config: any) {
    config.experiments = {
      asyncWebAssembly: true, // ✅ enables WebAssembly in Webpack
      ...config.experiments,
    };

    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });

    return config;
  },
};

export default nextConfig;
