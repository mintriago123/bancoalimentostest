/** @type {import('next').NextConfig} */
const nextConfig = {
  // La configuración de eslint se movió a .eslintrc o eslint.config.mjs
  // Para ignorar errores de ESLint durante build, usa: next lint --ignore-during-builds
  
  // Suprimir console.log en desarrollo (mantener error y warn)
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn']
    }
  },
  
  // Suprimir warnings de DevTools y HMR
  reactStrictMode: true,
};

module.exports = nextConfig;
