/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["sharp"],
  images: {
    unoptimized: true,
  },
}

export default nextConfig
