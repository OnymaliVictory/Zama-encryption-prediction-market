/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 🔐 REQUIRED for FHEVM WASM threads support
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 🔧 Browser polyfills (required for fhevmjs + crypto ops)
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,

        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
      };

      // 🔥 IMPORTANT FIX: prevent FHEVM worker chunk issues
      config.output = {
        ...config.output,
        // helps reduce worker / chunk circular dependency warnings
        globalObject: "self",
      };
    }

    // 🔐 Required for TFHE WASM
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },
};

module.exports = nextConfig;