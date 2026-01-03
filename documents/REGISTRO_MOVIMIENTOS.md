# Registro de Movimientos de Inventario

## Funcionalidad Implementada

Se ha agregado el registro automático de movimientos en las tablas `movimiento_inventario_cabecera` y `movimiento_inventario_detalle` cuando se realizan las siguientes acciones:

### 1. Aprobación de Solicitudes

**Archivo:** `src/app/admin/reportes/solicitudes/page.tsx`

**Función:** `registrarMovimientoSolicitud()`

**Flujo:**
- Cuando se aprueba una solicitud (`estado: 'aprobada'`)
- Se descuenta automáticamente del inventario
- Se registra un movimiento de tipo **EGRESO** en las tablas de movimiento
- **Cabecera:** Registra el donante (admin que aprueba) y solicitante (usuario que solicita)
- **Detalle:** Registra cada producto con tipo `'egreso'` y rol `'beneficiario'`

**Estructura del movimiento:**
```typescript
// Cabecera
{
  fecha_movimiento: timestamp,
  id_donante: user.id, // Admin que aprueba
  id_solicitante: solicitud.usuario_id, // Usuario solicitante
  estado_movimiento: 'completado',
  observaciones: 'Solicitud aprobada - [tipo_alimento] ([cantidad] unidades)'
}

// Detalle
{
  id_movimiento: cabecera.id_movimiento,
  id_producto: producto.id_producto,
  cantidad: cantidadEntregada,
  tipo_transaccion: 'egreso',
  rol_usuario: 'beneficiario',
  observacion_detalle: 'Entrega por solicitud aprobada - [tipo_alimento]'
}
```

### 2. Entrega de Donaciones

**Archivo:** `src/app/admin/reportes/donaciones/page.tsx`

**Función:** `registrarMovimientoDonacion()`

**Flujo:**
- Cuando se marca una donación como entregada (`estado: 'Entregada'`)
- Se agrega automáticamente al inventario
- Se registra un movimiento de tipo **INGRESO** en las tablas de movimiento
- **Cabecera:** Registra el donante original y el admin que recibe
- **Detalle:** Registra el producto con tipo `'ingreso'` y rol `'donante'`

**Estructura del movimiento:**
```typescript
// Cabecera
{
  fecha_movimiento: timestamp,
  id_donante: donacion.user_id, // Donante original
  id_solicitante: user.id, // Admin que recibe
  estado_movimiento: 'donado',
  observaciones: 'Donación entregada - [tipo_producto] ([cantidad] [unidad])'
}

// Detalle
{
  id_movimiento: cabecera.id_movimiento,
  id_producto: productoId,
  cantidad: donacion.cantidad,
  tipo_transaccion: 'ingreso',
  rol_usuario: 'donante',
  observacion_detalle: 'Ingreso por donación entregada - [tipo_producto]'
}
```

### 3. Reporte de Movimientos Actualizado

**Archivo:** `src/app/admin/reportes/movimientos/page.tsx`

**Mejoras:**
- **Prioridad 1:** Lee los movimientos registrados en `movimiento_inventario_cabecera` y `movimiento_inventario_detalle`
- **Prioridad 2 (Fallback):** Lee donaciones marcadas como 'Entregada'
- **Prioridad 3 (Fallback):** Lee solicitudes marcadas como 'aprobada'
- **Anti-duplicados:** Evita mostrar el mismo movimiento dos veces
- **Trazabilidad completa:** Muestra origen, usuario responsable, rol y observaciones detalladas

**Fuentes de datos:**
1. **Movimientos registrados** (nueva funcionalidad)
2. **Donaciones entregadas** (datos legados)
3. **Solicitudes aprobadas** (datos legados)

## Ventajas del Sistema

### Trazabilidad Completa
- Cada movimiento queda registrado con fecha, hora y usuario responsable
- Se puede rastrear quién aprobó una solicitud o recibió una donación
- Observaciones detalladas en cada operación

### Integridad de Datos
- Los movimientos se registran automáticamente junto con las operaciones
- No depende de acciones manuales del usuario
- Consistencia entre inventario y movimientos

### Compatibilidad
- El sistema funciona con datos existentes (fallback)
- Nuevos movimientos se registran en las tablas especializadas
- No rompe funcionalidad existente

### Flexibilidad
- Diferentes tipos de transacción: 'ingreso', 'egreso', 'baja'
- Diferentes roles: 'donante', 'beneficiario', 'distribuidor'
- Estados de movimiento: 'pendiente', 'completado', 'donado'

## Tablas Utilizadas

### movimiento_inventario_cabecera
- `id_movimiento` (UUID, PK)
- `fecha_movimiento` (timestamp)
- `id_donante` (UUID, FK → usuarios)
- `id_solicitante` (UUID, FK → usuarios)
- `estado_movimiento` (text: 'pendiente', 'completado', 'donado')
- `observaciones` (text)

### movimiento_inventario_detalle
- `id_detalle` (UUID, PK)
- `id_movimiento` (UUID, FK → movimiento_inventario_cabecera)
- `id_producto` (UUID, FK → productos_donados)
- `cantidad` (numeric)
- `tipo_transaccion` (text: 'ingreso', 'egreso', 'baja')
- `rol_usuario` (text: 'donante', 'beneficiario', 'distribuidor')
- `observacion_detalle` (text)

## Próximos Pasos Recomendados

1. **Migración de datos históricos** (opcional):
   - Convertir donaciones y solicitudes existentes a movimientos registrados
   - Script de migración para datos legados

2. **Reportes adicionales**:
   - Reporte de movimientos por usuario
   - Reporte de movimientos por producto
   - Análisis de tendencias de donaciones vs solicitudes

3. **Validaciones adicionales**:
   - Verificar stock disponible antes de aprobar solicitudes
   - Alertas automáticas cuando el stock es bajo
   - Validación de fechas de vencimiento

4. **Interfaz mejorada**:
   - Vista detallada de cada movimiento
   - Filtros avanzados en el reporte
   - Exportación a Excel con formato mejorado
