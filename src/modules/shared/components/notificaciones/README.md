# Componentes de Notificaciones

Esta carpeta contiene todos los componentes reutilizables relacionados con el sistema de notificaciones de la aplicación.

## 📁 Estructura

```
notificaciones/
├── NotificacionCard.tsx            # Tarjeta individual de notificación
├── EstadisticasNotificaciones.tsx  # Panel de estadísticas (total, no leídas, leídas)
├── FiltrosNotificaciones.tsx       # Filtros (tipo, categoría, estado)
├── AccionesNotificaciones.tsx      # Botones de acciones masivas
├── EmptyStateNotificaciones.tsx    # Estado vacío cuando no hay notificaciones
├── ConfiguracionCategoriaItem.tsx  # Item de configuración por categoría
├── Switch.tsx                      # Componente Switch reutilizable
├── AccionesRapidas.tsx            # Acciones rápidas (activar/desactivar todas)
├── InformacionNotificaciones.tsx  # Panel informativo sobre notificaciones
├── index.ts                       # Exportaciones
└── README.md                      # Esta documentación
```

## 🧩 Componentes

### NotificacionCard
Renderiza una tarjeta individual de notificación con todos sus detalles y acciones.

**Props:**
```typescript
{
  notificacion: {
    id: string;
    titulo: string;
    mensaje: string;
    tipo: 'success' | 'error' | 'warning' | 'info';
    categoria: string;
    leida: boolean;
    fecha_creacion: string;
    url_accion?: string;
  };
  seleccionada?: boolean;
  onSeleccionar?: (id: string) => void;
  onClick: (notificacion) => void;
  onMarcarLeida: (id: string) => void;
  onEliminar: (id: string) => void;
}
```

**Uso:**
```tsx
<NotificacionCard
  notificacion={notificacion}
  seleccionada={selected}
  onSeleccionar={handleSelect}
  onClick={handleClick}
  onMarcarLeida={handleMarkRead}
  onEliminar={handleDelete}
/>
```

### EstadisticasNotificaciones
Muestra un panel con 3 tarjetas de estadísticas: total, no leídas y leídas.

**Props:**
```typescript
{
  total: number;
  noLeidas: number;
  leidas: number;
}
```

**Uso:**
```tsx
<EstadisticasNotificaciones 
  total={100}
  noLeidas={25}
  leidas={75}
/>
```

### FiltrosNotificaciones
Componente de filtros con selectores para tipo, categoría y estado.

**Props:**
```typescript
{
  filtros: {
    tipo: string;
    categoria: string;
    estado: string;
  };
  onFiltrosChange: (filtros) => void;
}
```

**Uso:**
```tsx
<FiltrosNotificaciones 
  filtros={filtros}
  onFiltrosChange={setFiltros}
/>
```

### AccionesNotificaciones
Botones de acción para marcar como leídas y eliminar notificaciones.

**Props:**
```typescript
{
  conteoNoLeidas: number;
  seleccionadas: number;
  onMarcarTodasLeidas: () => void;
  onMarcarSeleccionadasLeidas: () => void;
  onEliminarSeleccionadas: () => void;
}
```

**Uso:**
```tsx
<AccionesNotificaciones
  conteoNoLeidas={10}
  seleccionadas={5}
  onMarcarTodasLeidas={handleMarkAll}
  onMarcarSeleccionadasLeidas={handleMarkSelected}
  onEliminarSeleccionadas={handleDeleteSelected}
/>
```

### EmptyStateNotificaciones
Estado vacío cuando no hay notificaciones o no hay resultados de filtros.

**Props:**
```typescript
{
  hayNotificaciones: boolean; // true si hay notificaciones pero están filtradas
}
```

**Uso:**
```tsx
<EmptyStateNotificaciones hayNotificaciones={total > 0} />
```

### ConfiguracionCategoriaItem
Item de configuración para cada categoría de notificaciones con switches de email, push y sonido.

**Props:**
```typescript
{
  config: {
    categoria: string;
    nombre: string;
    descripcion: string;
    email_activo: boolean;
    push_activo: boolean;
    sonido_activo: boolean;
  };
  onCambiar: (categoria, tipo, valor) => void;
  guardando: boolean;
}
```

**Uso:**
```tsx
<ConfiguracionCategoriaItem
  config={configuracion}
  onCambiar={handleChange}
  guardando={saving}
/>
```

### Switch
Componente switch/toggle reutilizable.

**Props:**
```typescript
{
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}
```

**Uso:**
```tsx
<Switch
  checked={isEnabled}
  onChange={setIsEnabled}
  disabled={loading}
/>
```

### AccionesRapidas
Panel de acciones rápidas para activar/desactivar todas las notificaciones.

**Props:**
```typescript
{
  onActivarTodas: () => void;
  onDesactivarTodas: () => void;
  guardando: boolean;
}
```

**Uso:**
```tsx
<AccionesRapidas
  onActivarTodas={handleEnableAll}
  onDesactivarTodas={handleDisableAll}
  guardando={saving}
/>
```

### InformacionNotificaciones
Panel informativo con detalles sobre el funcionamiento de las notificaciones.

**Props:** Ninguno (componente sin estado)

**Uso:**
```tsx
<InformacionNotificaciones />
```

## 📦 Importación

Todos los componentes se pueden importar desde el índice:

```typescript
import {
  NotificacionCard,
  EstadisticasNotificaciones,
  FiltrosNotificaciones,
  AccionesNotificaciones,
  EmptyStateNotificaciones,
  ConfiguracionCategoriaItem,
  Switch,
  AccionesRapidas,
  InformacionNotificaciones
} from '@/modules/shared/components/notificaciones';
```

## 🎨 Estilos

Todos los componentes utilizan Tailwind CSS y siguen la guía de estilos de la aplicación:
- Colores: blue (principal), green (éxito), red (error), yellow (advertencia)
- Espaciado consistente
- Responsive design (mobile-first)
- Transiciones suaves

## 🔄 Estado Compartido

Estos componentes están diseñados para trabajar con el hook `useNotificaciones` de `@/modules/shared`:

```typescript
const {
  notificaciones,
  loading,
  conteoNoLeidas,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion,
  configuracion,
  actualizarConfiguracion
} = useNotificaciones(supabase, user);
```

## 📄 Páginas que usan estos componentes

- `/src/app/notificaciones/page.tsx` - Vista principal de notificaciones
- `/src/app/configuracion-notificaciones/page.tsx` - Configuración de notificaciones
- `/src/app/components/NotificacionesDropdown.tsx` - Dropdown en el navbar (usa lógica similar)

## 🔧 Mantenimiento

Para agregar nuevos componentes de notificaciones:

1. Crear el componente en esta carpeta
2. Exportarlo en `index.ts`
3. Documentarlo en este README
4. Asegurar que siga las convenciones de tipos y estilos
5. Usar `readonly` en todas las props

## 🎯 Buenas Prácticas

- ✅ Componentes pequeños y enfocados en una sola responsabilidad
- ✅ Props tipadas con TypeScript
- ✅ Uso de `readonly` para inmutabilidad
- ✅ Accesibilidad (aria-labels, keyboard navigation)
- ✅ Responsive design
- ✅ Manejo de estados de carga y error
