## Rutas
- /
![Ruta / ](images/Screenshot%202025-06-20%20at%2017-40-26%20Banco%20de%20Alimentos.png)
- /auth/iniciar-sesion
![Ruta /auth/iniciar-sesion ](images/Screenshot%202025-06-20%20at%2017-42-19%20Banco%20de%20Alimentos.png)
- /auth/registrar
![Ruta /auth/registrar ](images/Screenshot%202025-06-20%20at%2017-43-45%20Banco%20de%20Alimentos.png)
![Ruta /auth/registrar ](images/Screenshot%202025-06-20%20at%2017-48-09%20Banco%20de%20Alimentos.png)
![Ruta /auth/registrar ](images/Screenshot%202025-06-20%20at%2017-49-44%20Banco%20de%20Alimentos.png)
- /auth/olvide-contrasena
![Ruta /auth/olvide-contrasena ](images/Screenshot%202025-06-20%20at%2017-51-23%20Banco%20de%20Alimentos.png)

## Esquema de Base de Datos
![Esquema de Base de Datos](images/supabase-schema-bfjmwjvzsywhmyruerxi.png)

## Tecnologías Utilizadas

- **Next.js 15.3.4**
  - App Router (nueva arquitectura)
  - Server-Side Rendering (SSR)
  - Static Site Generation (SSG)
  - API Routes integradas
  - Turbopack para desarrollo rápido

- **React ^19.0.0**
  - Hooks modernos (useState, useEffect, useCallback)
  - Componentes funcionales
  - Context API para gestión de estado

- **TypeScript ^5**
  - Tipado estricto habilitado
  - Interfaces y tipos personalizados
  - Mejor experiencia de desarrollo

### **Estilos y UI**

- **Tailwind CSS ^4**
  - Diseño responsive
  - Componentes personalizables
  - Sistema de colores y espaciado consistente
  - PostCSS integrado

### **Base de Datos y Autenticación**

- **Supabase**
  - **@supabase/supabase-js ^2.50.0** - Cliente JavaScript
  - **@supabase/ssr ^0.6.1** - Soporte para Server-Side Rendering
  - Base de datos PostgreSQL
  - Autenticación integrada
  - Row Level Security (RLS)
  - APIs automáticas

### **Herramientas de Desarrollo**

- **ESLint ^9** - Linter de código JavaScript/TypeScript
  - **eslint-config-next 15.3.4** - Configuración específica para Next.js
  - **@eslint/eslintrc ^3** - Configuración moderna de ESLint

- **Node.js** - Runtime de JavaScript
  - **ts-node ^10.9.2** - Ejecución directa de TypeScript

### **Tipos y Definiciones**

- **@types/node ^20.19.1** - Tipos para Node.js
- **@types/react ^19** - Tipos para React
- **@types/react-dom ^19** - Tipos para React DOM

## Arquitectura del Proyecto

```
banco-alimentos/
├── src/
│   ├── app/                   # App Router de Next.js
│   │   ├── api/               # API Routes
│   │   ├── auth/              # Páginas de autenticación
│   │   ├── dashboard/         # Panel de control
│   │   ├── components/        # Componentes reutilizables
│   │   └── globals.css        # Estilos globales
│   ├── lib/                   # Utilidades y configuraciones
│   └── middleware.ts          # Middleware de Next.js
├── public/                    # Archivos estáticos
└── configuraciones/           # Archivos de configuración
```

## Comandos Disponibles

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start

# Ejecutar linter
npm run lint
```

## Variables de Entorno

Crear un archivo `.env` con las siguientes variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio_supabase
```
