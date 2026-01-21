# Sistema de Bajas de Productos y Alertas de Vencimiento

## 📋 Descripción General

Se ha implementado un sistema completo para gestionar bajas de productos vencidos o dañados en el inventario del banco de alimentos, incluyendo:

- ✅ Registro de bajas sin eliminar productos (mantiene historial)
- ✅ Registro automático del usuario responsable
- ✅ Motivos de baja categorizados
- ✅ Observaciones detalladas
- ✅ Sistema de alertas de productos próximos a vencer o vencidos
- ✅ Notificaciones en tiempo real
- ✅ Historial completo de bajas

---

## 🗄️ Base de Datos

### Tabla: `bajas_productos`

```sql
CREATE TABLE public.bajas_productos (
  id_baja uuid PRIMARY KEY,
  id_producto uuid NOT NULL,
  id_inventario uuid NOT NULL,
  cantidad_baja numeric NOT NULL,
  motivo_baja text NOT NULL, -- vencido, dañado, contaminado, rechazado, otro
  usuario_responsable_id uuid NOT NULL,
  fecha_baja timestamp with time zone DEFAULT now(),
  observaciones text,
  estado_baja text DEFAULT 'confirmada',
  nombre_producto text,
  cantidad_disponible_antes numeric,
  id_deposito uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### Funciones Principales

#### 1. `dar_baja_producto()`
Registra la baja y actualiza el inventario automáticamente.

**Parámetros:**
- `p_id_inventario`: UUID del registro de inventario
- `p_cantidad`: Cantidad a dar de baja
- `p_motivo`: Motivo de la baja (vencido, dañado, contaminado, rechazado, otro)
- `p_usuario_id`: UUID del usuario responsable
- `p_observaciones`: Observaciones opcionales

**Uso:**
```sql
SELECT * FROM dar_baja_producto(
  'uuid-inventario',
  100,
  'vencido',
  'uuid-usuario',
  'Producto vencido hace 2 días'
);
```

#### 2. `obtener_productos_proximos_vencer()`
Obtiene productos próximos a vencer o ya vencidos.

**Parámetros:**
- `p_dias_umbral`: Días antes del vencimiento (default: 7)

**Retorna:**
- Lista de productos con prioridad (vencido, alta, media, baja)
- Días para vencer
- Información del depósito
- Cantidad disponible

**Uso:**
```sql
SELECT * FROM obtener_productos_proximos_vencer(7);
```

#### 3. `obtener_estadisticas_bajas()`
Obtiene estadísticas de bajas por periodo.

**Parámetros:**
- `p_fecha_inicio`: Fecha de inicio (default: hace 30 días)
- `p_fecha_fin`: Fecha de fin (default: hoy)

**Retorna:**
- Total de bajas
- Cantidad total dada de baja
- Estadísticas por motivo

### Vista: `v_bajas_productos_detalle`
Vista con información completa de las bajas incluyendo:
- Datos del producto
- Usuario responsable
- Depósito
- Unidad de medida

---

## 🔧 Instalación

### Paso 1: Ejecutar Script SQL

En Supabase Dashboard o cliente PostgreSQL:

```bash
# Opción 1: Desde archivo
psql -U postgres -d nombre_base_datos -f database/crear-tabla-bajas.sql

# Opción 2: Desde Supabase Dashboard
# 1. Ir a SQL Editor
# 2. Copiar contenido de database/crear-tabla-bajas.sql
# 3. Ejecutar
```

### Paso 2: Verificar Instalación

```sql
-- Verificar que la tabla existe
SELECT * FROM information_schema.tables WHERE table_name = 'bajas_productos';

-- Verificar funciones
SELECT proname FROM pg_proc WHERE proname IN ('dar_baja_producto', 'obtener_productos_proximos_vencer', 'obtener_estadisticas_bajas');

-- Verificar vista
SELECT * FROM information_schema.views WHERE table_name = 'v_bajas_productos_detalle';
```

---

## 📡 API Endpoints

### 1. POST `/api/operador/bajas`
Registra una nueva baja de producto.

**Request Body:**
```json
{
  "id_inventario": "uuid",
  "cantidad": 100,
  "motivo": "vencido",
  "observaciones": "Producto vencido hace 2 días"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Producto dado de baja exitosamente",
  "data": {
    "id_baja": "uuid",
    "cantidad_restante": 50
  }
}
```

### 2. GET `/api/operador/bajas`
Obtiene historial de bajas con filtros.

**Query Parameters:**
- `motivo`: vencido | dañado | contaminado | rechazado | otro | todos
- `fecha_inicio`: ISO date string
- `fecha_fin`: ISO date string
- `limit`: número (default: 100)
- `offset`: número (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_baja": "uuid",
      "nombre_producto": "Arroz",
      "cantidad_baja": 100,
      "motivo_baja": "vencido",
      "usuario_nombre": "Juan Pérez",
      "fecha_baja": "2026-01-19T10:30:00Z",
      "observaciones": "...",
      ...
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 100,
    "offset": 0,
    "has_more": true
  }
}
```

### 3. GET `/api/operador/bajas/estadisticas`
Obtiene estadísticas de bajas.

**Query Parameters:**
- `periodo`: días (default: 30)

**Response:**
```json
{
  "success": true,
  "periodo": {
    "dias": 30,
    "fecha_inicio": "2025-12-20",
    "fecha_fin": "2026-01-19"
  },
  "estadisticas": {
    "total": {
      "bajas": 45,
      "cantidad": 2350
    },
    "por_motivo": {
      "vencido": { "bajas": 20, "cantidad": 1200 },
      "dañado": { "bajas": 15, "cantidad": 800 },
      ...
    }
  }
}
```

### 4. GET `/api/operador/alertas-vencimiento`
Obtiene productos próximos a vencer o vencidos.

**Query Parameters:**
- `dias`: umbral de días (default: 7)
- `solo_vencidos`: true | false
- `prioridad`: vencido | alta | media | baja | todos

**Response:**
```json
{
  "success": true,
  "configuracion": {
    "dias_umbral": 7,
    "solo_vencidos": false
  },
  "estadisticas": {
    "total": 15,
    "total_vencidos": 5,
    "total_proximos": 10,
    "cantidad_total_vencidos": 250,
    "cantidad_total_proximos": 450,
    "por_prioridad": {
      "vencidos": 5,
      "alta": 3,
      "media": 5,
      "baja": 2
    }
  },
  "alertas": [
    {
      "id_inventario": "uuid",
      "id_producto": "uuid",
      "nombre_producto": "Arroz",
      "cantidad_disponible": 100,
      "fecha_caducidad": "2026-01-20",
      "dias_para_vencer": 1,
      "deposito": {
        "id": "uuid",
        "nombre": "Depósito Central"
      },
      "unidad_simbolo": "kg",
      "prioridad": "alta",
      "estado": "proximo_vencer"
    }
  ]
}
```

---

## 🎨 Componentes UI

### 1. `BajaProductoModal`
Modal para dar de baja productos.

**Props:**
```typescript
interface BajaProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventarioItem;
  onSuccess: () => void;
}
```

**Características:**
- Formulario con selección de motivo
- Validación de cantidad
- Campo de observaciones
- Confirmación con resumen
- Manejo de errores

### 2. `AlertasVencimiento`
Componente de alertas de productos próximos a vencer.

**Props:**
```typescript
interface AlertasVencimientoProps {
  diasUmbral?: number;
  onProductoSeleccionado?: (alerta: AlertaVencimiento) => void;
  autoRefresh?: boolean;
  refreshInterval?: number; // minutos
}
```

**Características:**
- Auto-refresh configurable
- Filtros por prioridad
- Estadísticas resumidas
- Acción rápida "Dar de Baja"
- Indicadores visuales por prioridad

---

## 📄 Páginas

### 1. `/operador/inventario`
Página principal de inventario con:
- Pestaña "Vencimientos" para alertas
- Botón "Dar de Baja" en tabla
- Modal integrado de bajas

### 2. `/operador/bajas`
Página de historial de bajas con:
- Lista completa de bajas
- Filtros avanzados (motivo, fecha, búsqueda)
- Paginación
- Detalles de cada baja
- Información del responsable

---

## 🔐 Permisos y Seguridad

### Políticas RLS (Row Level Security)

#### SELECT
- ✅ Usuarios autenticados pueden ver bajas

#### INSERT
- ✅ Solo ADMINISTRADOR y OPERADOR pueden registrar bajas

#### UPDATE
- ✅ Solo ADMINISTRADOR puede modificar bajas

#### DELETE
- ✅ Solo ADMINISTRADOR puede eliminar bajas

### Validaciones Backend

1. **Cantidad:**
   - Debe ser mayor a 0
   - No puede exceder cantidad disponible

2. **Motivo:**
   - Debe ser uno de: vencido, dañado, contaminado, rechazado, otro
   - "Otro" requiere observaciones obligatorias

3. **Usuario:**
   - Debe estar autenticado
   - Debe tener rol ADMINISTRADOR u OPERADOR
   - Estado debe ser "activo"

---

## 🎯 Casos de Uso

### Caso 1: Dar de Baja Producto Vencido

```typescript
// Desde el componente de inventario
const handleDarDeBaja = async (item: InventarioItem) => {
  // Abre modal con item seleccionado
  setItemParaBaja(item);
  setIsBajaModalOpen(true);
};

// El modal maneja el POST a la API
const response = await fetch('/api/operador/bajas', {
  method: 'POST',
  body: JSON.stringify({
    id_inventario: item.id_inventario,
    cantidad: 100,
    motivo: 'vencido',
    observaciones: 'Producto expiró hace 2 días'
  })
});
```

### Caso 2: Consultar Productos Próximos a Vencer

```typescript
// Componente AlertasVencimiento
const cargarAlertas = async () => {
  const response = await fetch('/api/operador/alertas-vencimiento?dias=7');
  const data = await response.json();
  
  // Muestra alertas clasificadas por prioridad
  setAlertas(data.alertas);
};
```

### Caso 3: Ver Historial de Bajas

```typescript
// Página de historial con filtros
const cargarBajas = async () => {
  const params = new URLSearchParams({
    motivo: 'vencido',
    fecha_inicio: '2026-01-01',
    limit: '50',
    offset: '0'
  });
  
  const response = await fetch(`/api/operador/bajas?${params}`);
  const data = await response.json();
  
  setBajas(data.data);
};
```

---

## 📊 Flujo de Datos

```
1. Usuario detecta producto vencido/dañado
   ↓
2. Hace clic en "Dar de Baja" en tabla inventario
   ↓
3. Se abre BajaProductoModal con datos del producto
   ↓
4. Usuario selecciona motivo y cantidad
   ↓
5. Usuario agrega observaciones (opcional)
   ↓
6. Usuario confirma baja
   ↓
7. POST /api/operador/bajas
   ↓
8. API llama función dar_baja_producto()
   ↓
9. Función registra baja y actualiza inventario
   ↓
10. Registra movimiento en historial
   ↓
11. Retorna éxito con cantidad restante
   ↓
12. UI muestra confirmación y recarga inventario
```

---

## 🧪 Pruebas

### Test 1: Registrar Baja

```sql
-- Obtener un producto del inventario
SELECT i.id_inventario, i.cantidad_disponible, p.nombre_producto
FROM inventario i
JOIN productos_donados p ON p.id_producto = i.id_producto
WHERE i.cantidad_disponible > 0
LIMIT 1;

-- Registrar baja
SELECT * FROM dar_baja_producto(
  'id_inventario_obtenido',
  10,
  'vencido',
  'tu_usuario_id',
  'Prueba de baja'
);

-- Verificar resultado
SELECT * FROM v_bajas_productos_detalle ORDER BY fecha_baja DESC LIMIT 1;
SELECT cantidad_disponible FROM inventario WHERE id_inventario = 'id_inventario_usado';
```

### Test 2: Alertas de Vencimiento

```sql
-- Crear producto que vence pronto (para testing)
UPDATE productos_donados 
SET fecha_caducidad = NOW() + INTERVAL '2 days'
WHERE id_producto = 'algún_producto_id';

-- Verificar alerta
SELECT * FROM obtener_productos_proximos_vencer(7);
```

### Test 3: Estadísticas

```sql
-- Obtener estadísticas de últimos 30 días
SELECT * FROM obtener_estadisticas_bajas(NOW() - INTERVAL '30 days', NOW());
```

---

## 🐛 Troubleshooting

### Error: "No autorizado"
**Solución:** Verificar que el usuario tenga rol ADMINISTRADOR u OPERADOR.

### Error: "Cantidad insuficiente"
**Solución:** Verificar cantidad disponible en inventario antes de dar de baja.

### Error: "Motivo de baja inválido"
**Solución:** Usar uno de los motivos válidos: vencido, dañado, contaminado, rechazado, otro.

### Las alertas no se muestran
**Solución:** Verificar que existan productos con fecha_caducidad en el rango configurado.

### Historial no carga
**Solución:** Verificar permisos RLS y que el usuario esté autenticado.

---

## 📈 Mejoras Futuras

1. **Notificaciones Automáticas:**
   - Email cuando producto está por vencer
   - Push notifications en app

2. **Reportes:**
   - Exportar historial a PDF/Excel
   - Gráficos de tendencias de bajas

3. **Predicción:**
   - ML para predecir productos en riesgo
   - Alertas tempranas basadas en patrones

4. **Workflow:**
   - Aprobación de bajas por supervisor
   - Fotografías como evidencia

5. **Integración:**
   - Con sistema de donaciones
   - Con módulo de reportes administrativos

---

## 📝 Archivos Creados/Modificados

### Base de Datos
- ✅ `database/crear-tabla-bajas.sql`

### Backend/API
- ✅ `src/app/api/operador/bajas/route.ts`
- ✅ `src/app/api/operador/bajas/estadisticas/route.ts`
- ✅ `src/app/api/operador/alertas-vencimiento/route.ts`

### Tipos
- ✅ `src/modules/operador/bajas/types/index.ts`

### Componentes
- ✅ `src/modules/operador/bajas/components/BajaProductoModal.tsx`
- ✅ `src/modules/operador/bajas/components/AlertasVencimiento.tsx`
- ✅ `src/modules/operador/inventario/components/OperadorInventoryTable.tsx` (modificado)

### Páginas
- ✅ `src/app/operador/inventario/page.tsx` (modificado)
- ✅ `src/app/operador/bajas/page.tsx`

---

## 🎓 Guía Rápida para Desarrolladores

### Para agregar nuevo motivo de baja:

1. Actualizar constraint en BD:
```sql
ALTER TABLE bajas_productos DROP CONSTRAINT bajas_productos_motivo_baja_check;
ALTER TABLE bajas_productos ADD CONSTRAINT bajas_productos_motivo_baja_check 
CHECK (motivo_baja = ANY (ARRAY['vencido', 'dañado', 'contaminado', 'rechazado', 'otro', 'nuevo_motivo']));
```

2. Actualizar tipo TypeScript:
```typescript
export type MotivoBaja = 'vencido' | 'dañado' | 'contaminado' | 'rechazado' | 'otro' | 'nuevo_motivo';
```

3. Agregar a componentes UI (labels, colors, opciones).

### Para cambiar umbral de alertas:

```typescript
// En componente AlertasVencimiento
<AlertasVencimiento 
  diasUmbral={14}  // Cambiar de 7 a 14 días
  ...
/>
```

---

**Última actualización:** 19 de enero de 2026  
**Versión:** 1.0.0  
**Autor:** Sistema de Gestión de Inventario
