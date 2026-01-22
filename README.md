<div align="center">

# 🍲 Banco de Alimentos ULEAM

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Status](https://img.shields.io/badge/Status-En_Desarrollo-yellow?style=for-the-badge)](https://github.com)

**Sistema integral de gestión para bancos de alimentos que conecta donantes, beneficiarios y administradores en una plataforma unificada, facilitando la distribución eficiente de alimentos con trazabilidad completa y control de inventario en tiempo real.**

[📖 Ver Documentación](#-documentación-técnica) • [🚀 Comenzar](#-quick-start) • [🛠️ Stack](#%EF%B8%8F-stack-tecnológico) • [📂 Estructura](#-estructura-del-proyecto)

</div>

---

## 📚 Documentación Técnica

La documentación técnica completa del proyecto se encuentra organizada en módulos especializados:

| Documento | Descripción | Enlace |
|-----------|-------------|--------|
| **🏗️ Arquitectura** | Estructura del sistema, patrones de diseño, middleware de autenticación (`proxy.ts`), arquitectura modular monolítica y modelo de seguridad con RLS | [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) |
| **🔄 Flujos de Trabajo** | Flujos de usuario por rol (beneficiario, donante, operador, admin), ciclo de vida de requests, secuencias de autenticación y flujos de negocio end-to-end | [docs/WORKFLOW.md](./docs/WORKFLOW.md) |
| **🗄️ Base de Datos** | Diagrama ER completo, diccionario de datos de 20+ tablas, funciones SQL, triggers automáticos, políticas RLS y estrategias de optimización | [docs/DATABASE.md](./docs/DATABASE.md) |
| **🎨 Componentes Frontend** | Sistema de diseño, componentes UI reutilizables, hooks personalizados, patrones de composición y configuración de Tailwind CSS | [docs/COMPONENTS.md](./docs/COMPONENTS.md) |

> 💡 **Nota para desarrolladores:** Cada documento incluye diagramas técnicos, código comentado y explicaciones detalladas del funcionamiento interno del sistema.

---

## 🚀 Quick Start

### **Prerrequisitos**

Asegúrate de tener instalado:

- **Node.js** 18 o superior
- **npm** o **yarn**
- Cuenta activa en [Supabase](https://supabase.com)
- *(Opcional)* Token de [Mapbox](https://mapbox.com) para geolocalización

### **Instalación**

1. **Clonar el repositorio:**

```bash
git clone https://github.com/tu-usuario/banco-alimentos.git
cd banco-alimentos
```

2. **Instalar dependencias:**

```bash
npm install
```

3. **Configurar variables de entorno:**

Crear archivo `.env.local` en la raíz:

```env
# Supabase (Requerido)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica
SUPABASE_SERVICE_ROLE_KEY=tu_clave_privada

# Validación de Identidad - Ecuador (Requerido)
NEXT_PUBLIC_SERVICIO_CONSULTAS_RUC=https://api-ruc.ec
NEXT_PUBLIC_SERVICIO_CONSULTAS_DINARAP=https://api-cedula.ec

# Email (Requerido para notificaciones)
EMAIL_PROVIDER=gmail
EMAIL_GMAIL_USER=tu-cuenta@gmail.com
EMAIL_GMAIL_PASS=tu_password_de_aplicacion

# Mapbox (Opcional)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=tu_token_mapbox
```

> 📧 **Gmail:** Habilita verificación en dos pasos y genera una [contraseña de aplicación](https://support.google.com/accounts/answer/185833).

4. **Configurar base de datos:**

- Crea un proyecto en Supabase
- Ejecuta los scripts SQL de `database/01.Create_BD_Structure.sql`
- Habilita autenticación por email en Supabase Auth

5. **Ejecutar en desarrollo:**

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🛠️ Stack Tecnológico

### **Core Framework**
- **Next.js** - App Router, SSR, API Routes, Turbopack
- **React** - Server Components y Client Components
- **TypeScript** - Tipado estricto end-to-end

### **Backend & Database**
- **Supabase** - PostgreSQL, Auth, Row Level Security (RLS), Storage
- **Node.js** - Runtime server-side

### **Frontend & Styling**
- **Tailwind CSS** - Utility-first CSS con sistema de diseño custom
- **Lucide React** - Iconografía moderna
- **Mapbox GL** - Mapas interactivos y geolocalización

### **Herramientas de Desarrollo**
- **ESLint** - Linting con configuración Next.js
- **PostCSS** - Procesamiento CSS avanzado

---

## 📂 Estructura del Proyecto

```
banco-alimentos/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 api/                # API Routes (endpoints REST)
│   │   ├── 📁 auth/               # Autenticación (login, registro, verificación)
│   │   ├── 📁 admin/              # Panel administrativo
│   │   ├── 📁 donante/            # Portal de donantes
│   │   ├── 📁 user/               # Portal de beneficiarios
│   │   ├── 📁 operador/           # Portal de operadores
│   │   └── 📁 components/         # Componentes globales UI
│   │
│   ├── 📁 modules/                # Lógica de negocio modular
│   │   ├── 📁 admin/              # Servicios admin
│   │   ├── 📁 auth/               # AuthService, hooks
│   │   ├── 📁 donante/            # Servicios donaciones
│   │   ├── 📁 operador/           # Servicios inventario
│   │   └── 📁 shared/             # Utilidades compartidas
│   │
│   ├── 📁 lib/                    # Configuraciones y utilidades
│   │   ├── supabase.ts            # Cliente Supabase
│   │   ├── supabase-server.ts     # Cliente server-side
│   │   ├── constantes.ts          # Constantes globales
│   │   └── 📁 email/              # Sistema de emails
│   │
│   └── proxy.ts                   # Middleware de autenticación
│
├── 📁 docs/                       # 📚 Documentación técnica
│   ├── ARCHITECTURE.md            # Arquitectura del sistema
│   ├── WORKFLOW.md                # Flujos de trabajo
│   ├── DATABASE.md                # Esquema de base de datos
│   └── COMPONENTS.md              # Componentes frontend
│
├── 📁 database/                   # Scripts SQL
│   └── 01.Create_BD_Structure.sql # Estructura completa
│
└── 📁 public/                     # Archivos estáticos
```

> 🔍 **Arquitectura:** El proyecto sigue un patrón **Modular Monolith** con separación clara entre capas de presentación (`app/`) y lógica de negocio (`modules/`). Ver detalles en [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## ✨ Características Principales

- 🔐 **Autenticación robusta** con Supabase Auth y validación de identidad (RUC/Cédula Ecuador)
- 👥 **Multi-rol:** Beneficiarios, Donantes, Operadores y Administradores
- 🎁 **Gestión de donaciones** con cálculo automático de impacto social
- 📋 **Solicitudes de alimentos** con aprobación y trazabilidad
- 📊 **Inventario en tiempo real** con múltiples depósitos y alertas de vencimiento
- 📈 **Trazabilidad completa** de todos los movimientos de inventario
- 📧 **Sistema de notificaciones** por email y en tiempo real
- 🌍 **Geolocalización** con Mapbox para puntos de entrega
- 🎨 **Interfaz responsiva** mobile-first con sistema de diseño consistente

---

## 📝 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Modo desarrollo con hot-reload (Turbopack) |
| `npm run build` | Construir para producción |
| `npm start` | Ejecutar versión de producción |
| `npm run lint` | Verificar código con ESLint |

---

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'feat: descripción'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

**Convención de commits:**
```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
refactor: refactorización de código
test: agregar/actualizar tests
```

---

## 📊 Estado del Proyecto

| Módulo | Estado |
|--------|--------|
| Sistema de autenticación | ✅ Completo |
| Gestión de donaciones | ✅ Completo |
| Sistema de solicitudes | ✅ Completo |
| Control de inventario | ✅ Completo |
| Trazabilidad de movimientos | ✅ Completo |
| Reportes y análisis | ✅ Completo |
| Notificaciones en tiempo real | 🔄 En desarrollo |

---

## 👥 Equipo

Proyecto desarrollado como parte del programa de vinculación de la **Universidad Laica Eloy Alfaro de Manabí (ULEAM)**.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](./LICENSE) para más detalles.

---

## 📞 Soporte

- 📧 Email: soporte@bancoalimentos-uleam.edu.ec
- 📝 Issues: [GitHub Issues](https://github.com/tu-usuario/banco-alimentos/issues)
- 📖 Documentación: [`/docs`](./docs/)

---

<div align="center">

**🍲 Banco de Alimentos ULEAM**

*Nutriendo vidas, construyendo esperanza*

[⬆ Volver arriba](#-banco-de-alimentos-uleam)

</div>
