/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    return config
  },
  // Add this to allow the API route to handle binary responses
  experimental: {
    serverComponentsExternalPackages: ["pdfkit"],
  },
}

module.exports = nextConfig
