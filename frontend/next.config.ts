import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilitar modo standalone para Docker
  output: 'standalone',
  
  // Configurações para ambiente de produção
  poweredByHeader: false,
  
  // Configurações de imagem (se necessário)
  images: {
    unoptimized: true, // Desabilitar otimização de imagem se não usar CDN
  },
};

export default nextConfig;
