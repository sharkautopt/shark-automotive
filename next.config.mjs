/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["sharp", "@react-pdf/renderer"],
  images: {
    unoptimized: true,
  },
}

export default nextConfig
