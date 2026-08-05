/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sohbet cevapları akış (stream) halinde geldiği için API rotaları Node
  // ortamında çalışmalı; Edge runtime'da SDK'lar sorun çıkarabiliyor.
  serverExternalPackages: ["@anthropic-ai/sdk"],
};

export default nextConfig;
