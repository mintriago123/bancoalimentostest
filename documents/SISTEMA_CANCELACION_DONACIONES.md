# Sistema de Cancelación de Donaciones con Observaciones

## 📋 Resumen de Cambios

Se ha implementado un sistema completo para cancelar donaciones que solicita motivo y observaciones, similar al sistema de bajas de alimentos.

## 🗄️ Cambios en Base de Datos

### Nuevas Columnas en `donaciones`

```sql
motivo_cancelacion           TEXT      -- Motivo de la cancelación
observaciones_cancelacion    TEXT      -- Observaciones detalladas
usuario_cancelacion_id       UUID      -- Usuario que canceló
fecha_cancelacion           TIMESTAMP  -- Fecha y hora de cancelación
```

### Motivos de Cancelación Disponibles

1. **error_donante**: El donante cometió un error al registrar
2. **no_disponible**: El producto ya no está disponible
3. **calidad_inadecuada**: No cumple con estándares de calidad
4. **logistica_imposible**: No se puede coordinar la logística
5. **duplicado**: Donación registrada por error/duplicada
6. **solicitud_donante**: El donante solicita cancelar
7. **otro**: Otro motivo (requiere observaciones obligatorias)

### Aplicar Cambios en BD

```bash
# Ejecutar el script SQL en Supabase
psql -h [host] -U postgres -d postgres -f database/agregar-campos-cancelacion-donaciones.sql
```

O desde el SQL Editor de Supabase, copiar y pegar el contenido de:
`database/agregar-campos-cancelacion-donaciones.sql`

## 🎨 Nuevos Componentes

### 1. CancelarDonacionModal

**Ubicación**: `src/modules/admin/reportes/donaciones/components/CancelarDonacionModal.tsx`

Modal que muestra:
- Información de la donación a cancelar
- Selector de motivo de cancelación (7 opciones)
- Campo de observaciones (obligatorio si motivo es "otro")
- Advertencia sobre la acción
- Botones de confirmar/cancelar

### 2. Tipos Actualizados

**Ubicación**: `src/modules/admin/reportes/donaciones/types/index.ts`

- Nuevo tipo: `MotivoCancelacion`
- Nueva interfaz: `CancelarDonacionRequest`
- Campos agregados a interfaz `Donation`:
  - `motivo_cancelacion`
  - `observaciones_cancelacion`
  - `usuario_cancelacion_id`
  - `fecha_cancelacion`

## ⚙️ Servicios Modificados

### donationActionService.ts

- **updateDonationEstado** ahora acepta `cancelacionData` como tercer parámetro
- Guarda automáticamente el usuario que cancela (obtenido de `supabase.auth.getUser()`)
- Registra fecha de cancelación automáticamente
- Incluye motivo y observaciones en notificaciones y emails

### useDonationActions.ts

- Hook actualizado para pasar parámetros de cancelación
- Firma de función modificada para aceptar `cancelacionData` opcional

## 📄 Páginas Actualizadas

### /app/admin/reportes/donaciones/page.tsx

**Cambios principales:**

1. Importa `CancelarDonacionModal`
2. Nuevos estados:
   - `donacionACancelar`
   - `isCancelModalOpen`
3. Al hacer clic en "Cancelar", en lugar de mostrar confirmación simple, abre el modal
4. Nueva función `handleConfirmCancelacion` que procesa la cancelación con datos

**Flujo de cancelación:**

```
Usuario hace clic en "Cancelar" 
  ↓
Se abre CancelarDonacionModal
  ↓
Usuario selecciona motivo y escribe observaciones
  ↓
Usuario confirma
  ↓
handleConfirmCancelacion llama updateEstado con cancelacionData
  ↓
donationActionService guarda todo en BD y envía notificaciones
  ↓
Modal se cierra y tabla se recarga
```

## 📧 Notificaciones y Emails

Las notificaciones de cancelación ahora incluyen:
- Motivo de cancelación (convertido a texto legible)
- Observaciones detalladas
- Esta información también se envía por email al donante

El template de email ya estaba preparado para mostrar `comentarioAdmin`, que ahora se usa para las observaciones de cancelación.

## ✅ Validaciones Implementadas

### En el Frontend (Modal):
- Observaciones obligatorias si el motivo es "otro"
- Deshabilitación de botones durante el proceso
- Mensajes de error claros

### En la Base de Datos:
- CHECK: Si motivo es "otro", debe haber observaciones
- CHECK: Si estado es "Cancelada", debe tener motivo, usuario y fecha
- NOT NULL en usuario_cancelacion_id cuando hay cancelación

## 🔒 Seguridad

- Solo ADMINISTRADORES pueden cancelar donaciones
- Se registra automáticamente quién canceló (mediante `supabase.auth.getUser()`)
- Fecha de cancelación se registra automáticamente
- No se puede cancelar sin proporcionar motivo

## 📊 Ejemplos de Uso

### Cancelación Simple:
```typescript
await updateEstado(donation, 'Cancelada', {
  motivo: 'solicitud_donante',
  observaciones: 'El donante llamó para cancelar la donación'
});
```

### Cancelación con Motivo "Otro":
```typescript
await updateEstado(donation, 'Cancelada', {
  motivo: 'otro',
  observaciones: 'El producto se dañó durante el almacenamiento temporal' // Obligatorio
});
```

## 🚀 Próximos Pasos

1. Ejecutar el script SQL en la base de datos
2. Probar la cancelación de donaciones desde el panel de administrador
3. Verificar que las notificaciones incluyan el motivo y observaciones
4. Confirmar que el email al donante muestra la información correcta

## 📝 Notas Importantes

- El modal es similar al de bajas de alimentos (`BajaProductoModal`)
- Sigue el mismo patrón de diseño y validaciones
- Se integra perfectamente con el sistema existente de notificaciones
- Los operadores NO pueden cancelar donaciones (solo ADMINISTRADORES)
- La información de cancelación es permanente y auditable

## 🔍 Consultas Útiles

### Ver donaciones canceladas con detalles:
```sql
SELECT 
  id,
  tipo_producto,
  nombre_donante,
  estado,
  motivo_cancelacion,
  observaciones_cancelacion,
  usuario_cancelacion_id,
  fecha_cancelacion
FROM public.donaciones
WHERE estado = 'Cancelada'
ORDER BY fecha_cancelacion DESC;
```

### Estadísticas de motivos de cancelación:
```sql
SELECT 
  motivo_cancelacion,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM donaciones WHERE estado = 'Cancelada'), 2) as porcentaje
FROM public.donaciones
WHERE estado = 'Cancelada'
GROUP BY motivo_cancelacion
ORDER BY total DESC;
```
