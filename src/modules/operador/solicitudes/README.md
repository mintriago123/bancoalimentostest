# Módulo de Solicitudes - Operador

Este módulo contiene los componentes, hooks y utilidades específicos para la gestión de solicitudes por parte de los **operadores**.

## Estructura

```
src/modules/operador/solicitudes/
├── components/           # Componentes UI específicos del operador
│   ├── SolicitudesHeader.tsx
│   ├── SolicitudesFilters.tsx
│   ├── SolicitudesTable.tsx      # Sin botón de revertir
│   └── SolicitudDetailModal.tsx
├── hooks/               # Re-exporta hooks de admin
│   └── index.ts
├── utils/               # Re-exporta utilidades de admin
│   └── index.ts
├── constants/           # Constantes específicas del operador
│   └── index.ts
├── types/              # Tipos TypeScript
│   └── index.ts
└── index.ts            # Exportaciones principales
```

## Diferencias con el módulo de Admin

### Permisos y Restricciones

**Operadores PUEDEN:**
- ✅ Ver todas las solicitudes (pendientes, aprobadas, rechazadas)
- ✅ Aprobar solicitudes pendientes (descuenta del inventario)
- ✅ Rechazar solicitudes pendientes
- ✅ Ver detalles de cualquier solicitud
- ✅ Agregar comentarios administrativos

**Operadores NO PUEDEN:**
- ❌ Revertir solicitudes aprobadas o rechazadas a estado pendiente
- ❌ Modificar solicitudes ya procesadas

### Componentes Propios

#### `SolicitudesTable.tsx`
- **Diferencia clave**: NO incluye el botón de "Revertir a pendiente"
- Para solicitudes **aprobadas**: solo muestra botón de detalle + badge de confirmación
- Para solicitudes **rechazadas**: solo muestra botón de detalle
- Para solicitudes **pendientes**: muestra botones de aprobar y rechazar

#### `constants/index.ts`
- **Diferencia clave**: NO incluye el mensaje de `revertSuccess`
- Mantiene los mensajes de error y estados

### Código Compartido

Los siguientes elementos se **reutilizan** del módulo de admin mediante re-exportación:

- **Hooks**: `useSolicitudesData`, `useSolicitudActions`, `useInventarioDisponible`
- **Utils**: `formatDateTime`
- **Lógica de negocio**: servicios y validaciones

Esto garantiza:
1. **DRY (Don't Repeat Yourself)**: La lógica de negocio no se duplica
2. **Consistencia**: Mismas validaciones y comportamientos
3. **Mantenibilidad**: Cambios en la lógica se aplican a ambos roles
4. **Separación de concerns**: La UI está modularizada según permisos

## Uso

```tsx
import {
  SolicitudesHeader,
  SolicitudesFilters,
  SolicitudesTable,
  SolicitudDetailModal,
  useSolicitudesData,
  useSolicitudActions,
  useInventarioDisponible,
  formatDateTime
} from '@/modules/operador/solicitudes';
```

## Notas Importantes

1. **No intentar llamar funciones de revertir**: El operador no tiene acceso a estas funciones
2. **UI adaptada**: Los componentes están diseñados específicamente para los permisos del operador
3. **Mensajes claros**: Se informa al usuario cuando intenta realizar acciones no permitidas
