import type { NextConfig } from "next";
const path = require('path')

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = {
  turbopack: {
    root: path.join(__dirname, '..'),
  },
}
export default nextConfig;
