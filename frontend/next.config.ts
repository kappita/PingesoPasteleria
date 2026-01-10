import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Desactiva la optimización solo en desarrollo para evitar el error de IP privada
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      // Configuración para Localhost (HTTP)
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/wp-content/uploads/**",
      },
      // Configuración para Producción (HTTPS)
      {
        protocol: "https",
        hostname: process.env.WORDPRESS_URL
          ? new URL(process.env.WORDPRESS_URL).hostname
          : "tudominio.com", // Puedes poner tu dominio real aquí como respaldo
        port: "",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
