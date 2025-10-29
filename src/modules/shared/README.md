# Módulos Compartidos (Shared)

Este directorio contiene componentes, hooks y utilidades compartidos entre múltiples roles (Admin y Operador).

## Estructura

```
src/modules/shared/
├── components/           # Componentes UI reutilizables
├── hooks/               # Hooks compartidos
├── dashboard/           # Módulo de dashboard compartido
│   ├── components/
│   ├── hooks/
│   └── index.ts
├── donaciones/          # Módulo de donaciones compartido
│   ├── components/
│   ├── hooks/
│   ├── types/
│   └── index.ts
└── index.ts
```

## Módulos Compartidos

### 📊 Dashboard (`@/modules/shared/dashboard`)

Componentes y hooks para visualización de métricas del dashboard.

**Componentes:**
- `RequestStatus` - Visualización del estado de solicitudes con barras de progreso

**Hooks:**
- `useDashboardData` - Obtiene datos del dashboard (métricas, contadores, gráficos)

**Usado por:**
- ✅ Admin Dashboard
- ✅ Operador Dashboard

**Características:**
- Solo visualización de datos
- Sin acciones restringidas
- Mismo comportamiento para todos los roles

---

### 🎁 Donaciones (`@/modules/shared/donaciones`)

Componentes y hooks para gestión de donaciones.

**Componentes:**
- `DonationsHeader` - Encabezado con contadores de donaciones
- `DonationsFilters` - Filtros de búsqueda y estado
- `DonationsTable` - Tabla principal con acciones
- `DonationsErrorState` - Estado de error con reintentar
- `DonationDetailModal` - Modal con detalles completos

**Hooks:**
- `useDonationsData` - Gestión de datos y filtros
- `useDonationActions` - Acciones de actualización de estado

**Tipos:**
- `Donation`, `DonationEstado`, `DonationFilters`, etc.

**Usado por:**
- ✅ Admin - Reporte de Donaciones
- ✅ Operador - Gestión de Donaciones

**Características:**
- Ambos roles pueden actualizar estados
- Ambos roles pueden cancelar donaciones
- Mismo conjunto de permisos

---

## Principios de Diseño

### ✅ Cuándo Usar Shared

Un módulo debe estar en `shared` cuando:
1. Es usado por **múltiples roles** (Admin, Operador, etc.)
2. Tiene el **mismo comportamiento** para todos los roles
3. **No requiere restricciones** específicas por rol

### ❌ Cuándo NO Usar Shared

Un módulo debe estar en su carpeta específica cuando:
1. Solo lo usa **un rol**
2. Requiere **restricciones o permisos** diferentes por rol
3. Tiene **comportamiento específico** del rol

## Ejemplos

### ✅ Compartido Correctamente

**Dashboard:**
```ts
// Admin y Operador importan desde shared
import { useDashboardData, RequestStatus } from '@/modules/shared/dashboard';
```

**Donaciones:**
```ts
// Admin y Operador importan desde shared
import { DonationsTable, useDonationsData } from '@/modules/shared/donaciones';
```

### ❌ NO Compartido (Correcto)

**Solicitudes:**
```ts
// Admin usa su propio módulo (con revertir)
import { SolicitudesTable } from '@/modules/admin/reportes/solicitudes';

// Operador usa su propio módulo (sin revertir)
import { SolicitudesTable } from '@/modules/operador/solicitudes';
```

Razón: El operador NO puede revertir solicitudes, requiere UI diferente.

---

## Migración de Admin a Shared

Los módulos en `shared` actualmente **re-exportan** desde `admin`:

```ts
// src/modules/shared/dashboard/hooks/index.ts
export { useDashboardData } from '@/modules/admin/dashboard/hooks/useDashboardData';
```

Esto permite:
1. **Centralizar** las importaciones
2. **Mantener** el código original en admin (por ahora)
3. **Facilitar** migración futura si es necesario

En el futuro, podríamos mover físicamente el código de `admin` a `shared` si lo deseamos.

---

## Mantenimiento

Al agregar un nuevo módulo compartido:
1. Crear estructura en `src/modules/shared/[modulo]/`
2. Crear archivos de re-exportación o código nuevo
3. Actualizar este README
4. Actualizar importaciones en páginas
5. Verificar que no haya errores de compilación
