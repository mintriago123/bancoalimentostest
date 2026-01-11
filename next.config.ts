/** @type {import('next').NextConfig} */
const nextConfig = {
  // La configuración de eslint se movió a .eslintrc o eslint.config.mjs
  // Para ignorar errores de ESLint durante build, usa: next lint --ignore-during-builds
  
  // Suprimir console.log SOLO en producción (mantener en desarrollo)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false
  },
  
  reactStrictMode: true,
};

module.exports = nextConfig;
