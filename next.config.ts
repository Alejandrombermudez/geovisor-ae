import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false, // Leaflet doesn't support Strict Mode double-mount
  transpilePackages: ['react-leaflet', 'leaflet'],
}

export default nextConfig
