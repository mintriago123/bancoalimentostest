# Módulo User/Solicitante

Este módulo contiene toda la lógica, componentes y servicios relacionados con el usuario solicitante (beneficiario) del sistema del Banco de Alimentos.

## Estructura

```
user/
├── types/
│   └── index.ts                 # Definiciones de tipos TypeScript
├── constants/
│   └── index.ts                 # Constantes y configuraciones
├── services/
│   ├── solicitudesService.ts    # Servicio para gestión de solicitudes
│   ├── perfilService.ts         # Servicio para gestión del perfil
│   ├── alimentosService.ts      # Servicio para catálogo de alimentos
│   └── unidadesService.ts       # Servicio para unidades de medida
├── hooks/
│   ├── useSolicitudes.ts        # Hook para manejo de solicitudes
│   ├── usePerfilUsuario.ts      # Hook para manejo del perfil
│   ├── useAlimentos.ts          # Hook para búsqueda de alimentos
│   ├── useUnidades.ts           # Hook para unidades de medida
│   ├── useUbicacion.ts          # Hook para geolocalización
│   ├── useDatosBasicosUsuario.ts # Hook para datos básicos
│   └── useInventoryStock.ts     # Hook para verificación de stock
├── components/
│   ├── SolicitudCard.tsx        # Tarjeta de solicitud individual
│   ├── SolicitudesList.tsx      # Lista de solicitudes con filtros
│   ├── DashboardUserCards.tsx   # Tarjetas del dashboard
│   ├── UserInfoCard.tsx         # Información del usuario
│   ├── UbicacionCard.tsx        # Mapa de ubicación
│   ├── AlimentoSelector.tsx     # Selector de alimentos
│   ├── InventarioInfo.tsx       # Información de inventario
│   ├── CantidadUnidadInputs.tsx # Inputs de cantidad/unidad
│   └── ComentariosInput.tsx     # Input de comentarios
├── utils/
│   └── index.ts                 # Utilidades y validaciones
└── index.ts                     # Exportaciones centralizadas
```

## Tipos Principales

### Solicitud
- `Solicitud`: Representa una solicitud de alimentos
- `SolicitudEstado`: Estados posibles (pendiente, aprobada, rechazada)
- `SolicitudFormData`: Datos para crear solicitud
- `SolicitudEditData`: Datos para editar solicitud

### Perfil
- `UserProfile`: Perfil completo del usuario
- `UserProfileFormData`: Datos editables del perfil

### Otros
- `Alimento`: Producto del catálogo
- `Unidad`: Unidad de medida
- `StockInfo`: Información de inventario disponible
- `Ubicacion`: Coordenadas geográficas

## Servicios

### SolicitudesService
Gestiona las operaciones CRUD de solicitudes:
- `getSolicitudesByUsuario()`: Obtener solicitudes del usuario
- `createSolicitud()`: Crear nueva solicitud
- `updateSolicitud()`: Actualizar solicitud existente
- `deleteSolicitud()`: Eliminar solicitud

### PerfilService
Gestiona el perfil del usuario:
- `getPerfilUsuario()`: Obtener perfil completo
- `updatePerfilUsuario()`: Actualizar perfil
- `getDatosBasicosUsuario()`: Obtener datos básicos

### AlimentosService
Gestiona el catálogo de alimentos:
- `getAlimentos()`: Obtener todos los alimentos
- `getAlimentoById()`: Obtener alimento por ID
- `getCategorias()`: Obtener categorías únicas

### UnidadesService
Gestiona unidades de medida:
- `getUnidades()`: Obtener todas las unidades
- `getUnidadById()`: Obtener unidad por ID

## Hooks Personalizados

### useSolicitudes
Hook principal para gestionar solicitudes:
```typescript
const {
  solicitudes,
  loading,
  error,
  createSolicitud,
  updateSolicitud,
  deleteSolicitud,
  refetch
} = useSolicitudes(supabase, usuarioId, filtroEstado);
```

### usePerfilUsuario
Hook para gestionar el perfil:
```typescript
const {
  profile,
  loading,
  message,
  updateProfile,
  setMessage
} = usePerfilUsuario(supabase, usuarioId);
```

### useAlimentos
Hook para búsqueda y filtrado de alimentos:
```typescript
const {
  alimentos,
  alimentosFiltrados,
  categorias,
  busqueda,
  filtroCategoria,
  setBusqueda,
  setFiltroCategoria,
  filtrarAlimentos
} = useAlimentos(supabase);
```

### useUnidades
Hook para unidades de medida:
```typescript
const {
  unidades,
  loading,
  error,
  getUnidadById
} = useUnidades(supabase);
```

### useUbicacion
Hook para obtener ubicación del usuario:
```typescript
const {
  ubicacion,
  error,
  setUbicacion
} = useUbicacion();
```

### useInventoryStock
Hook para verificar stock disponible:
```typescript
const {
  stockInfo,
  loadingState,
  errorMessage,
  checkStock,
  clearStock,
  isStockSufficient,
  getStockMessage
} = useInventoryStock(supabase);
```

## Componentes

### SolicitudCard
Tarjeta individual de solicitud con opciones de edición y eliminación.

**Props:**
- `solicitud`: Solicitud a mostrar
- `onDelete`: Callback para eliminar
- `onEdit`: Callback para editar
- `canEdit`: Si se puede editar
- `canDelete`: Si se puede eliminar

### SolicitudesList
Lista completa de solicitudes con filtros.

**Props:**
- `solicitudes`: Array de solicitudes
- `filtroEstado`: Estado actual del filtro
- `onFiltroChange`: Callback para cambiar filtro
- `onDelete`: Callback para eliminar
- `onEdit`: Callback para editar
- `mensaje`: Mensaje de feedback

### AlimentoSelector
Selector de alimentos con búsqueda y filtros por categoría.

**Props:**
- `alimentos`: Lista completa de alimentos
- `alimentosFiltrados`: Lista filtrada
- `alimentoSeleccionado`: Alimento seleccionado actualmente
- `busqueda`: Término de búsqueda
- `filtroCategoria`: Categoría seleccionada
- `categorias`: Lista de categorías
- `mostrarDropdown`: Si mostrar el dropdown
- Callbacks: `onBusquedaChange`, `onCategoriaChange`, `onAlimentoSelect`, etc.

### InventarioInfo
Muestra información del inventario disponible para un producto.

**Props:**
- `stockInfo`: Información de stock
- `loadingState`: Estado de carga
- `errorMessage`: Mensaje de error
- `cantidad`: Cantidad solicitada
- `isStockSufficient`: Función para validar stock
- `getStockMessage`: Función para mensaje
- `onUseMaxStock`: Callback para usar máximo stock

## Constantes

### Estados
- `ESTADOS_SOLICITUD`: Configuración de estados y colores
- `FILTROS_ESTADO`: Opciones de filtros

### Mensajes
- `MESSAGES.SOLICITUD.*`: Mensajes para solicitudes
- `MESSAGES.PERFIL.*`: Mensajes para perfil
- `MESSAGES.VALIDATION.*`: Mensajes de validación
- `MESSAGES.AUTH.*`: Mensajes de autenticación

### Configuración
- `FORM_CONFIG`: Configuración de formularios
- `MAP_CONFIG`: Configuración de mapas

## Utilidades

### Validaciones
- `validatePerfilForm()`: Valida formulario de perfil
- `validateCantidad()`: Valida cantidad
- `validateStock()`: Valida stock disponible

### Helpers
- `getUserInitials()`: Obtiene iniciales del usuario
- `formatDate()`: Formatea fechas

## Uso

### Importación
```typescript
import {
  // Types
  Solicitud,
  SolicitudFormData,
  UserProfile,
  // Hooks
  useSolicitudes,
  usePerfilUsuario,
  useAlimentos,
  // Components
  SolicitudesList,
  AlimentoSelector,
  // Constants
  MESSAGES,
  // Utils
  validatePerfilForm,
} from '@/modules/user';
```

### Ejemplo: Página de Solicitudes
```typescript
export default function SolicitudesPage() {
  const { supabase, user } = useSupabase();
  const [filtro, setFiltro] = useState<FiltroEstadoSolicitud>('TODOS');
  
  const { solicitudes, updateSolicitud, deleteSolicitud } = 
    useSolicitudes(supabase, user?.id, filtro);
  
  return (
    <SolicitudesList
      solicitudes={solicitudes}
      filtroEstado={filtro}
      onFiltroChange={setFiltro}
      onDelete={deleteSolicitud}
      onEdit={updateSolicitud}
    />
  );
}
```

## Flujo de Datos

1. **Dashboard** → Muestra tarjetas de acceso rápido
2. **Formulario** → Usuario crea solicitud con validación de stock
3. **Solicitudes** → Usuario ve/edita/elimina sus solicitudes
4. **Perfil** → Usuario actualiza su información personal

## Características

- ✅ Arquitectura modular y escalable
- ✅ Separación de responsabilidades (Services, Hooks, Components)
- ✅ Validación de stock en tiempo real
- ✅ Búsqueda y filtrado de alimentos
- ✅ Geolocalización integrada
- ✅ Estados de carga y error manejados
- ✅ Mensajes de feedback consistentes
- ✅ Tipos TypeScript completos
- ✅ Reutilización de componentes
- ✅ Optimización de rendimiento

## Dependencias

- `@supabase/supabase-js`: Cliente de Supabase
- `lucide-react`: Iconos
- `@heroicons/react`: Iconos adicionales
- Componentes globales: `DashboardLayout`, `MapboxMap`, `SupabaseProvider`

## Notas

- El módulo sigue el patrón de diseño de los módulos `admin` y `operador`
- Todos los servicios retornan `{ data, error }` para manejo consistente de errores
- Los hooks manejan automáticamente los estados de carga y error
- Los componentes son completamente controlados por sus props
