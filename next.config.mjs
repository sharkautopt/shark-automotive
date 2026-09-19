/** @type {import('next').NextConfig} */
const nextConfig = {
  // wasm-vips ships its own .wasm binary — keep it external so the bundler
  // doesn't try to inline/process it and instead loads it from node_modules
  // at runtime, same as the sharp workaround it replaces.
  serverExternalPackages: ["wasm-vips"],
  images: {
    unoptimized: true,
  },
}

export default nextConfig
