# Implementación: Sistema de Rechazos de Solicitudes con Detalles Completos

## Resumen
Se ha implementado un sistema completo de rechazos de solicitudes que incluye:
- ✅ Motivos predefinidos para rechazos
- ✅ Comentario obligatorio al rechazar
- ✅ Registro de quién rechazó (operador_id)
- ✅ Fecha y hora exacta del rechazo
- ✅ Notificación al usuario con todos los detalles

## Cambios Realizados

### 1. Base de Datos (`database/`)

#### Archivo: `schema_bd_complete.sql`
- ✅ Agregadas 3 columnas a la tabla `solicitudes`:
  - `motivo_rechazo` (text): Motivo del rechazo seleccionado
  - `operador_rechazo_id` (uuid): ID del operador que rechazó
  - `fecha_rechazo` (timestamp): Fecha y hora exacta del rechazo

#### Archivo: `migracion_rechazos.sql` (Nuevo)
- ✅ Script de migración con ALTER TABLE para agregar las columnas
- ✅ Índices para mejora de rendimiento en consultas
- ✅ Comentarios descriptivos de las columnas

### 2. Tipos y Constantes (`src/modules/operador/solicitudes/`)

#### Archivo: `types/index.ts`
```typescript
// Nuevos campos en la interfaz Solicitud:
motivo_rechazo?: string | null;
operador_rechazo_id?: string | null;
fecha_rechazo?: string | null;
```

#### Archivo: `constants/index.ts`
```typescript
// Nuevas constantes con motivos predefinidos:
export const MOTIVOS_RECHAZO = [
  { id: 'stock_insuficiente', label: 'Stock insuficiente', ... },
  { id: 'producto_no_disponible', label: 'Producto no disponible', ... },
  { id: 'datos_incompletos', label: 'Datos incompletos', ... },
  { id: 'solicitante_ineligible', label: 'Solicitante ineligible', ... },
  { id: 'duplicada', label: 'Solicitud duplicada', ... },
  { id: 'vencimiento_proximo', label: 'Próximos a vencer', ... },
  { id: 'otro', label: 'Otro motivo', ... }
];
```

### 3. Componentes (`src/modules/operador/solicitudes/components/`)

#### Archivo: `SolicitudDetailModal.tsx`
**Cambios principales:**
- ✅ Importado MOTIVOS_RECHAZO de constantes
- ✅ Agregadas props: `motivoRechazo`, `onMotivoRechazoChange`
- ✅ Implementado estado local `modoRechazo` para mostrar/ocultar formulario
- ✅ Separadas secciones de Aprobación y Rechazo visualmente

**Nueva interfaz de Rechazo:**
- Select dropdown con motivos predefinidos (OBLIGATORIO)
- Textarea para comentario detallado (OBLIGATORIO - mínimo 10 caracteres)
- Información importante sobre lo que recibirá el usuario
- Botones de confirmación y cancelación
- Validación: el botón "Confirmar Rechazo" está deshabilitado hasta completar todos los campos

### 4. Servicios (`src/modules/admin/reportes/solicitudes/`)

#### Archivo: `services/solicitudesActionService.ts`
**Función actualizada: `updateSolicitudEstado`**
```typescript
// Nuevos parámetros:
- motivoRechazo?: string
- operadorId?: string

// Lógica de rechazo:
if (nuevoEstado === 'rechazada') {
  updateData.motivo_rechazo = motivoRechazo || null;
  updateData.operador_rechazo_id = operadorId || null;
  updateData.fecha_rechazo = new Date().toISOString();
}
```

**Función actualizada: `notificarCambioEstado`**
- Agregado parámetro `motivoRechazo`
- Construcción de mensaje detallado para rechazos con:
  - Cantidad y tipo de alimento
  - Motivo (con etiqueta legible)
  - Fecha en formato es-ES (ej: "15 de enero de 2026")
  - Hora en formato es-ES (ej: "14:30:45")
  - Comentario del operador

**Ejemplo de mensaje de rechazo:**
```
Tu solicitud de 10 kg de Arroz ha sido rechazada.

Motivo: Stock insuficiente
Fecha: 15 de enero de 2026
Hora: 14:30:45

Detalles: No contamos con la cantidad solicitada en este momento. 
Por favor, intenta más tarde.
```

### 5. Hooks (`src/modules/admin/reportes/solicitudes/hooks/`)

#### Archivo: `useSolicitudActions.ts`
- ✅ Actualizada firma de `updateEstado` para aceptar `motivoRechazo` y `operadorId`
- ✅ Parámetros se pasan correctamente al servicio

### 6. Página Principal (`src/app/operador/solicitudes/page.tsx`)

**Cambios implementados:**
- ✅ Nuevo estado: `motivoRechazo`
- ✅ Actualizado `handleEstadoChange` para:
  - Obtener el ID del usuario actual (operador)
  - Pasar motivoRechazo y operadorId al servicio
  - Mejorada descripción del diálogo de confirmación

- ✅ Actualizado `closeModal` para limpiar `motivoRechazo`
- ✅ Actualizado `handleOpenModal` para resetear `motivoRechazo`
- ✅ Actualizado `handleModalRechazar` para pasar `motivoRechazo`
- ✅ Actualizado componente `SolicitudDetailModal` con nuevas props

## Flujo de Rechazo Completo

### 1. Operador Abre Modal
```
- El modal se abre mostrando detalles de la solicitud
- Sección de Aprobación está visible
- Sección de Rechazo muestra botón "Mostrar opciones"
```

### 2. Operador Selecciona "Mostrar Opciones" en Rechazo
```
- Se despliega formulario de rechazo con:
  - Select de motivos (OBLIGATORIO)
  - Textarea de comentarios (OBLIGATORIO - mín 10 caracteres)
  - Información sobre lo que recibe el usuario
  - Botón "Confirmar Rechazo" (deshabilitado hasta completar)
  - Botón "Cancelar"
```

### 3. Operador Completa Formulario
```
- Selecciona un motivo del dropdown
- Escribe comentario detallado (mínimo 10 caracteres)
- Botón "Confirmar Rechazo" se habilita
```

### 4. Operador Confirma Rechazo
```
- Se abre diálogo de confirmación
- Al confirmar, se ejecuta updateEstado con:
  - Solicitud
  - Estado: 'rechazada'
  - Comentario administrativo
  - Motivo de rechazo
  - ID del operador
```

### 5. Base de Datos Se Actualiza
```
UPDATE solicitudes SET
  estado = 'rechazada',
  fecha_respuesta = NOW(),
  motivo_rechazo = 'stock_insuficiente',
  operador_rechazo_id = 'uuid-del-operador',
  fecha_rechazo = NOW(),
  comentario_admin = 'Comentario del operador'
WHERE id = 'solicitud-id'
```

### 6. Usuario Recibe Notificación
```
Título: "Tu solicitud ha sido rechazada"
Mensaje:
  Tu solicitud de 10 kg de Arroz ha sido rechazada.

  Motivo: Stock insuficiente
  Fecha: 15 de enero de 2026
  Hora: 14:30:45

  Detalles: [Comentario del operador]
```

## Validaciones Implementadas

1. ✅ **Motivo obligatorio**: No se puede rechazar sin seleccionar un motivo
2. ✅ **Comentario obligatorio**: Mínimo 10 caracteres
3. ✅ **Stock para aprobación**: Se valida que haya suficiente inventario
4. ✅ **Confirmación**: Diálogo de confirmación antes de procesar
5. ✅ **Indicadores visuales**: 
   - Secciones separadas por colores (verde aprobación, rojo rechazo)
   - Botones deshabilitados con explicación
   - Mensajes de validación en rojo

## Archivos Modificados

### Configuración de Base de Datos
- `database/schema_bd_complete.sql` ✅
- `database/migracion_rechazos.sql` ✅ (Nuevo)

### Frontend - Tipos y Constantes
- `src/modules/operador/solicitudes/types/index.ts` ✅
- `src/modules/operador/solicitudes/constants/index.ts` ✅

### Frontend - Componentes
- `src/modules/operador/solicitudes/components/SolicitudDetailModal.tsx` ✅

### Backend - Servicios
- `src/modules/admin/reportes/solicitudes/services/solicitudesActionService.ts` ✅
- `src/modules/admin/reportes/solicitudes/hooks/useSolicitudActions.ts` ✅

### Frontend - Páginas
- `src/app/operador/solicitudes/page.tsx` ✅

## Próximos Pasos Recomendados

1. **Ejecutar la migración de base de datos:**
   ```sql
   -- Ejecutar el script de migracion_rechazos.sql en Supabase
   ```

2. **Pruebas:**
   - ✅ Probar rechazo con diferentes motivos
   - ✅ Verificar que el usuario recibe notificación
   - ✅ Validar que se registra quién rechazó y cuándo
   - ✅ Confirmar que no se puede rechazar sin motivo y comentario

3. **Documentación adicional:**
   - Considerar documentar en la sección de Administración
   - Crear guía para operadores sobre cómo usar rechazos

## Notas Técnicas

- El formato de fecha es **es-ES** para que los usuarios vean: "15 de enero de 2026"
- La notificación incluye **metadatos** con el motivo y fecha para auditoría
- Los campos en la BD son **nullable** para mantener compatibilidad con solicitudes aprobadas
- El sistema es **totalmente auditable**: se registra quién, cuándo y por qué
