# Documentación del Sistema de Estilos Global

Este documento explica la estructura y componentes del archivo `global.css`, que contiene el sistema de diseño completo para el proyecto Banco de Alimentos.

## 📋 Tabla de Contenidos

- [Variables CSS Globales](#variables-css-globales)
- [Estilos Base](#estilos-base)
- [Sistema de Tipografía](#sistema-de-tipografía)
- [Fondos y Gradientes](#fondos-y-gradientes)
- [Efectos Glassmorphism](#efectos-glassmorphism)
- [Componentes de Botones](#componentes-de-botones)
- [Componentes de Formularios](#componentes-de-formularios)
- [Componentes de Cards](#componentes-de-cards)
- [Componentes de Navegación](#componentes-de-navegación)
- [Componentes de Tablas](#componentes-de-tablas)
- [Layouts y Contenedores](#layouts-y-contenedores)
- [Estados y Notificaciones](#estados-y-notificaciones)
- [Utilidades Responsivas](#utilidades-responsivas)

## 🎨 Variables CSS Globales

### Paleta de Colores

El sistema utiliza una paleta de colores bien definida basada en variables CSS:

#### Colores Principales (Primary)
```css
--color-primary-50: #eff6ff;  /* Más claro */
--color-primary-500: #3b82f6; /* Color base */
--color-primary-900: #1e3a8a; /* Más oscuro */
```

#### Colores Secundarios (Secondary)
```css
--color-secondary-50: #f0fdf4; /* Verde muy claro */
--color-secondary-500: #22c55e; /* Verde base */
--color-secondary-900: #14532d; /* Verde oscuro */
```

#### Colores de Estado
- **Danger (Peligro)**: Rojos para errores y acciones destructivas
- **Warning (Advertencia)**: Naranjas para alertas y advertencias
- **Gray (Grises)**: Escala completa de grises para texto y fondos

### Tipografía
```css
--font-sans: Geist Sans, sistema sans-serif
--font-mono: Geist Mono, fuentes monoespaciadas
```

### Espaciado
Sistema de espaciado consistente:
```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
```

### Bordes y Sombras
- **Border Radius**: Desde `sm` (0.375rem) hasta `3xl` (1.75rem)
- **Shadows**: Cinco niveles de sombras desde sutiles hasta pronunciadas
- **Transiciones**: Tres velocidades predefinidas (fast, normal, slow)

## 🏗️ Estilos Base

### Configuración Global
```css
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { 
  background: gris muy claro
  color: gris oscuro
  fuente: sans-serif del sistema
}
```

## ✍️ Sistema de Tipografía

### Jerarquía de Encabezados
- **`.heading-xl`**: 2.25rem, peso 800 - Para títulos principales
- **`.heading-lg`**: 1.875rem, peso 700 - Para títulos de sección
- **`.heading-md`**: 1.5rem, peso 600 - Para subtítulos
- **`.heading-sm`**: 1.25rem, peso 600 - Para títulos menores

### Texto de Cuerpo
- **`.text-body-lg`**: 1.125rem - Texto destacado
- **`.text-body`**: 1rem - Texto normal
- **`.text-body-sm`**: 0.875rem - Texto pequeño
- **`.text-caption`**: 0.75rem - Texto muy pequeño/anotaciones

## 🌈 Fondos y Gradientes

### Gradientes Predefinidos
- **`.bg-gradient-primary`**: Gradiente azul principal
- **`.bg-gradient-auth`**: Gradiente para páginas de autenticación
- **`.bg-gradient-dashboard`**: Gradiente para dashboard
- **`.bg-gradient-hero`**: Gradiente para secciones hero

## ✨ Efectos Glassmorphism

### Clases de Vidrio
- **`.glass`**: Efecto básico de vidrio con blur
- **`.glass-card`**: Tarjetas con efecto glassmorphism intenso
- **`.glass-header`**: Headers con efecto glassmorphism sutil

**Características:**
- Fondo semi-transparente
- Filtro de desenfoque (backdrop-filter)
- Bordes sutiles
- Sombras elegantes

## 🔘 Componentes de Botones

### Clase Base
```css
.btn {
  /* Flexbox centrado */
  /* Padding, border-radius */
  /* Transiciones suaves */
  /* Cursor pointer */
}
```

### Variantes de Color
- **`.btn-primary`**: Azul principal con hover y efectos
- **`.btn-secondary`**: Verde secundario
- **`.btn-danger`**: Rojo para acciones destructivas
- **`.btn-warning`**: Naranja para advertencias
- **`.btn-outline`**: Botón con borde, sin relleno
- **`.btn-ghost`**: Botón transparente

### Tamaños
- **`.btn-sm`**: Botón pequeño
- **`.btn`**: Tamaño normal (por defecto)
- **`.btn-lg`**: Botón grande

### Estados
- **`:hover`**: Elevación y cambio de color
- **`:disabled`**: Opacidad reducida y cursor deshabilitado

## 📝 Componentes de Formularios

### Estructura Base
```css
.form-group       /* Contenedor del campo */
.form-label       /* Etiqueta del campo */
.form-input       /* Campo de entrada */
.form-error       /* Mensaje de error */
```

### Estados del Input
- **Normal**: Fondo semi-transparente, borde sutil
- **`:focus`**: Borde azul, sombra de enfoque
- **`.form-input-error`**: Borde rojo para errores

### Mensajes
- **`.form-success`**: Mensajes de éxito (verde)
- **`.form-error-message`**: Mensajes de error (rojo)

### Campo de Contraseña Especial
```css
.password-field {
  /* Posición relativa para el botón de mostrar/ocultar */
}
.password-toggle {
  /* Botón posicionado absolutamente */
  /* Icono de ojo para mostrar/ocultar */
}
```

## 🃏 Componentes de Cards

### Estructura
- **`.card`**: Tarjeta básica con sombra y bordes redondeados
- **`.card-header`**: Encabezado de tarjeta con borde inferior
- **`.card-body`**: Cuerpo de la tarjeta con padding

## 🧭 Componentes de Navegación

### Links de Navegación
```css
.nav-link {
  /* Padding uniforme */
  /* Transiciones suaves */
  /* Estados hover */
}
```

### Variantes
- **`.nav-link-danger`**: Para acciones destructivas (cerrar sesión)

### Dropdown
- **`.dropdown`**: Contenedor con posición relativa
- **`.dropdown-menu`**: Menú desplegable posicionado

## 📊 Componentes de Tablas

### Estructura
```css
.table {
  /* Tabla completa con sombra */
}
.table th {
  /* Encabezados con fondo gris */
}
.table td {
  /* Celdas con padding y bordes */
}
```

### Interactividad
- **Hover en filas**: Cambio de color de fondo
- **Bordes**: Separadores sutiles entre filas

## 📐 Layouts y Contenedores

### Contenedores Principales
- **`.container`**: Contenedor centrado con max-width
- **`.page-container`**: Contenedor de página completa (min-height: 100vh)
- **`.main-content`**: Contenido principal con flex: 1

### Layouts de Autenticación
```css
.auth-container {
  /* Centrado vertical y horizontal */
  /* Altura completa de viewport */
}
.auth-card {
  /* Ancho máximo para formularios */
}
.auth-header {
  /* Header centrado con logo y título */
}
```

### Elementos Especiales
- **`.home-button`**: Botón flotante para volver al inicio
- **`.auth-logo`**: Logo circular con sombra
- **`.auth-title/.auth-subtitle`**: Títulos estilizados para auth

## 🔔 Estados y Notificaciones

### Loading States
```css
.loading-skeleton {
  /* Animación de pulse */
  /* Fondo gris placeholder */
}
```

### Notificaciones
Base común con variantes de color:
- **`.notification-success`**: Verde para éxito
- **`.notification-error`**: Rojo para errores
- **`.notification-warning`**: Naranja para advertencias
- **`.notification-info`**: Azul para información

## 📱 Utilidades Responsivas

### Breakpoint Principal
```css
@media (max-width: 640px) {
  /* Ajustes para móviles */
  /* Padding reducido */
  /* Tamaños de fuente ajustados */
  /* Elementos ocultos (.hidden-sm) */
}
```

### Utilidades Extendidas
```css
.text-balance      /* Equilibrio de texto */
.transition-transform /* Transiciones de transformación */
.hover-lift:hover  /* Elevación en hover */
.focus-ring:focus  /* Anillo de enfoque accesible */
```

## 🎯 Filosofía de Diseño

### Principios Aplicados
1. **Consistencia**: Variables globales para colores, espaciado y tipografía
2. **Accesibilidad**: Contrastes adecuados, focus states, transiciones suaves
3. **Modernidad**: Glassmorphism, gradientes, sombras elegantes
4. **Responsividad**: Diseño adaptable a diferentes pantallas
5. **Mantenibilidad**: Estructura modular y bien documentada

### Metodología
- **Sistema de Componentes**: Cada sección representa componentes reutilizables
- **Variables CSS**: Centralización de valores para fácil mantenimiento
- **Cascada Inteligente**: Uso apropiado de especificidad
- **Mobile-First**: Consideraciones responsivas desde el diseño base

## 🚀 Uso Recomendado

### Para Desarrolladores
1. Utilizar las variables CSS en lugar de valores hardcodeados
2. Combinar clases base con modificadores (ej: `.btn.btn-primary.btn-lg`)
3. Seguir la convención de nomenclatura establecida
4. Aprovechar los estados hover y focus predefinidos

### Para Diseñadores
1. Respetar la paleta de colores establecida
2. Utilizar el sistema de espaciado consistente
3. Aplicar la jerarquía tipográfica definida
4. Mantener coherencia con los efectos glassmorphism

---

*Este sistema de estilos está diseñado para proporcionar una base sólida y escalable para el proyecto Banco de Alimentos, priorizando la experiencia del usuario, la accesibilidad y la mantenibilidad del código.*
