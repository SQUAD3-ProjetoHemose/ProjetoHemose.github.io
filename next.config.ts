// Importação do tipo NextConfig do Next.js
import type { NextConfig } from "next";
import path from 'path'; // Importação moderna do path

// Configuração do Next.js
const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Imagens não otimizadas
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignorar ESLint durante builds
  },
};

export default nextConfig; // Exportação padrão da configuração

// 
//   __  ____ ____ _  _ 
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
//
