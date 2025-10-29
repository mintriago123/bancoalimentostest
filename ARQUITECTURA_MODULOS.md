# Arquitectura de Módulos - Resumen

## 📐 Estructura Final

```
src/modules/
│
├── shared/                    # ⭐ Componentes compartidos entre roles
│   ├── dashboard/             # Dashboard (Admin + Operador)
│   │   ├── components/
│   │   │   └── RequestStatus
│   │   ├── hooks/
│   │   │   └── useDashboardData
│   │   └── index.ts
│   │
│   ├── donaciones/            # Donaciones (Admin + Operador)
│   │   ├── components/
│   │   │   ├── DonationsHeader
│   │   │   ├── DonationsFilters
│   │   │   ├── DonationsTable
│   │   │   ├── DonationsErrorState
│   │   │   └── DonationDetailModal
│   │   ├── hooks/
│   │   │   ├── useDonationsData
│   │   │   └── useDonationActions
│   │   ├── types/
│   │   └── index.ts
│   │
│   └── components/            # Componentes UI generales
│
├── admin/                     # 👨‍💼 Módulos exclusivos de Admin
│   ├── dashboard/             # Dashboard con componentes admin-only
│   ├── reportes/
│   │   ├── solicitudes/       # ⚠️ CON botón revertir
│   │   └── donaciones/        # (fuente de shared/donaciones)
│   └── shared/
│
└── operador/                  # 👷 Módulos exclusivos de Operador
    ├── solicitudes/           # ⚠️ SIN botón revertir
    │   ├── components/
    │   │   ├── SolicitudesTable (sin revertir)
    │   │   ├── SolicitudesHeader
    │   │   ├── SolicitudesFilters
    │   │   └── SolicitudDetailModal
    │   ├── hooks/ (re-exporta de admin)
    │   └── types/
    │
    └── inventario/            # Control de inventario
```

## 🎯 Reglas de Importación

### ✅ Admin

```tsx
// Dashboard (usa shared)
import { useDashboardData, RequestStatus } from '@/modules/shared/dashboard';

// Donaciones (usa shared)
import { DonationsTable, useDonationsData } from '@/modules/shared/donaciones';

// Solicitudes (usa módulo admin - CON revertir)
import { SolicitudesTable } from '@/modules/admin/reportes/solicitudes';
```

### ✅ Operador

```tsx
// Dashboard (usa shared)
import { useDashboardData, RequestStatus } from '@/modules/shared/dashboard';

// Donaciones (usa shared)
import { DonationsTable, useDonationsData } from '@/modules/shared/donaciones';

// Solicitudes (usa módulo operador - SIN revertir)
import { SolicitudesTable } from '@/modules/operador/solicitudes';
```

## 📊 Comparativa de Permisos

| Funcionalidad | Admin | Operador | Módulo |
|--------------|-------|----------|---------|
| **Dashboard** | ✅ Ver métricas | ✅ Ver métricas | `shared/dashboard` |
| **Donaciones - Ver** | ✅ | ✅ | `shared/donaciones` |
| **Donaciones - Actualizar** | ✅ | ✅ | `shared/donaciones` |
| **Donaciones - Cancelar** | ✅ | ✅ | `shared/donaciones` |
| **Solicitudes - Ver** | ✅ | ✅ | (ambos) |
| **Solicitudes - Aprobar** | ✅ | ✅ | (ambos) |
| **Solicitudes - Rechazar** | ✅ | ✅ | (ambos) |
| **Solicitudes - Revertir** | ✅ | ❌ | `admin/` vs `operador/` |
| **Inventario - Ajustar** | ❌ | ✅ | `operador/inventario` |

## 🔑 Diferencias Clave

### Solicitudes
- **Admin**: `@/modules/admin/reportes/solicitudes` → Incluye botón "Revertir"
- **Operador**: `@/modules/operador/solicitudes` → NO incluye botón "Revertir"

### Dashboard y Donaciones
- **Shared**: `@/modules/shared/{dashboard|donaciones}` → Mismo comportamiento para ambos

## 📝 Ventajas de esta Arquitectura

1. **DRY (Don't Repeat Yourself)**
   - Código compartido está en un solo lugar
   - Cambios se propagan a todos los roles

2. **Separación de Responsabilidades**
   - Cada rol tiene sus módulos específicos
   - Permisos claramente definidos

3. **Mantenibilidad**
   - Fácil identificar qué es compartido
   - Fácil agregar nuevos roles

4. **Type Safety**
   - TypeScript previene uso incorrecto
   - Errores en tiempo de compilación

5. **Escalabilidad**
   - Fácil agregar nuevos módulos
   - Fácil modificar permisos por rol
