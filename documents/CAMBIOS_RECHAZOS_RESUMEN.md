# Resumen de Cambios - Sistema de Rechazos

## 🎯 Objetivo Completado
Se ha implementado un **sistema completo de rechazos de solicitudes** con:
- ✅ Motivos predefinidos y obligatorios
- ✅ Comentario detallado obligatorio (mínimo 10 caracteres)
- ✅ Registro de quién rechazó (operador_id)
- ✅ Fecha y hora exacta del rechazo
- ✅ Notificación al usuario con todos los detalles

---

## 📊 Cambios de Base de Datos

### Tabla `solicitudes` - Nuevas Columnas

```sql
motivo_rechazo TEXT              -- Motivo del rechazo
operador_rechazo_id UUID         -- ID del operador que rechazó
fecha_rechazo TIMESTAMP WITH TZ  -- Fecha/hora del rechazo
```

**Ejemplo de registro rechazado:**
```
id: 'abc123'
usuario_id: 'user456'
tipo_alimento: 'Arroz'
cantidad: 10
estado: 'rechazada'
motivo_rechazo: 'stock_insuficiente'
operador_rechazo_id: 'operador789'
fecha_respuesta: 2026-01-15T14:30:45Z
fecha_rechazo: 2026-01-15T14:30:45Z
comentario_admin: 'No contamos con la cantidad solicitada'
```

---

## 🎨 Interfaz de Usuario

### Modal de Solicitud - Sección de Rechazo

#### Antes:
```
Gestionar Solicitud
┌─────────────────────────┐
│ Comentario (opcional)   │
│ [           ]           │
├─────────────────────────┤
│ [Aprobar] [Rechazar]    │
└─────────────────────────┘
```

#### Después:
```
Aprobar Solicitud
┌─────────────────────────┐
│ Comentario (opcional)   │
│ [           ]           │
├─────────────────────────┤
│ [Aprobar Solicitud]     │
└─────────────────────────┘

Rechazar Solicitud
┌─────────────────────────────────┐
│ [Mostrar opciones]              │
└─────────────────────────────────┘

[Al hacer clic en "Mostrar opciones"]
┌────────────────────────────────────────────┐
│ Motivo del Rechazo * (Obligatorio)        │
│ ┌──────────────────────────────────────┐  │
│ │ -- Selecciona un motivo --           │  │
│ │ ✓ Stock insuficiente                 │  │
│ │ Producto no disponible               │  │
│ │ Datos incompletos                    │  │
│ │ Solicitante ineligible               │  │
│ │ Solicitud duplicada                  │  │
│ │ Próximos a vencer                    │  │
│ │ Otro motivo                          │  │
│ └──────────────────────────────────────┘  │
│                                             │
│ Comentario Detallado * (Obligatorio)      │
│ ┌──────────────────────────────────────┐  │
│ │ Explica en detalle el motivo...      │  │
│ │                                       │  │
│ │                                       │  │
│ └──────────────────────────────────────┘  │
│ Mínimo 10 caracteres. El solicitante      │
│ recibirá este comentario.                 │
│                                             │
│ ⚠ Nota importante:                        │
│ El solicitante recibirá una notificación  │
│ con:                                       │
│ • Motivo del rechazo                      │
│ • Fecha y hora del rechazo                │
│ • Tu comentario detallado                 │
│                                             │
│ [Confirmar Rechazo] [Cancelar]            │
└────────────────────────────────────────────┘
```

---

## 📧 Notificación al Usuario

**Título:** "Tu solicitud ha sido rechazada"

**Mensaje completo:**
```
Tu solicitud de 10 kg de Arroz ha sido rechazada.

Motivo: Stock insuficiente
Fecha: 15 de enero de 2026
Hora: 14:30:45

Detalles: No contamos con la cantidad 
solicitada en este momento. Por favor, 
intenta más tarde.
```

---

## 🔄 Flujo de Proceso

```
1. Operador abre solicitud pendiente
        ↓
2. Hace clic en "Mostrar opciones" en Rechazo
        ↓
3. Completa el formulario:
   - Selecciona motivo
   - Escribe comentario (mín 10 caracteres)
        ↓
4. Hace clic en "Confirmar Rechazo"
        ↓
5. Diálogo de confirmación
        ↓
6. Se actualiza la BD:
   - estado = 'rechazada'
   - motivo_rechazo = 'stock_insuficiente'
   - operador_rechazo_id = 'uuid-operador'
   - fecha_rechazo = NOW()
        ↓
7. Se envía notificación al usuario con:
   - Motivo
   - Fecha y hora exacta
   - Comentario detallado
```

---

## 🔐 Validaciones

| Campo | Validación | Estado |
|-------|-----------|--------|
| Motivo | Obligatorio | ✅ |
| Comentario | Obligatorio, mín 10 caracteres | ✅ |
| Stock | Validado antes de aprobar | ✅ |
| Confirmación | Diálogo de confirmación | ✅ |
| Auditoría | Registra quién, cuándo, por qué | ✅ |

---

## 📝 Motivos Predefinidos

```typescript
{
  id: 'stock_insuficiente',
  label: 'Stock insuficiente',
  descripcion: 'No hay cantidad suficiente disponible'
}

{
  id: 'producto_no_disponible',
  label: 'Producto no disponible',
  descripcion: 'El producto solicitado no está en inventario'
}

{
  id: 'datos_incompletos',
  label: 'Datos incompletos',
  descripcion: 'La solicitud carece de información requerida'
}

{
  id: 'solicitante_ineligible',
  label: 'Solicitante ineligible',
  descripcion: 'El solicitante no cumple con los requisitos'
}

{
  id: 'duplicada',
  label: 'Solicitud duplicada',
  descripcion: 'Ya existe una solicitud similar en proceso'
}

{
  id: 'vencimiento_proximo',
  label: 'Próximos a vencer',
  descripcion: 'Los productos disponibles están próximos a vencer'
}

{
  id: 'otro',
  label: 'Otro motivo',
  descripcion: 'Especificar en los comentarios'
}
```

---

## 📋 Archivos Modificados

### Backend (Servicios)
- ✅ `solicitudesActionService.ts` - Lógica de rechazo y notificación
- ✅ `useSolicitudActions.ts` - Hook actualizado con nuevos parámetros

### Frontend (Componentes)
- ✅ `SolicitudDetailModal.tsx` - Nuevo formulario de rechazo
- ✅ `page.tsx` (operador) - Gestión de estado y llamadas

### Tipos y Constantes
- ✅ `types/index.ts` - Nuevos campos en Solicitud
- ✅ `constants/index.ts` - MOTIVOS_RECHAZO

### Base de Datos
- ✅ `schema_bd_complete.sql` - Nuevas columnas
- ✅ `migracion_rechazos.sql` - Script de migración

---

## ⚙️ Próximos Pasos

1. **Ejecutar migración SQL:**
   ```bash
   # En Supabase SQL Editor, ejecutar:
   # database/migracion_rechazos.sql
   ```

2. **Probar la funcionalidad:**
   - Abrir una solicitud pendiente
   - Hacer clic en "Mostrar opciones" en Rechazo
   - Probar validaciones
   - Confirmar rechazo
   - Verificar notificación en usuario

3. **Verificar en BD:**
   ```sql
   SELECT id, estado, motivo_rechazo, 
          operador_rechazo_id, fecha_rechazo
   FROM solicitudes
   WHERE estado = 'rechazada';
   ```

---

## ✨ Ventajas de la Implementación

✅ **Trazabilidad completa**: Se registra quién, cuándo y por qué  
✅ **Transparencia**: El usuario sabe exactamente por qué fue rechazado  
✅ **Consistencia**: Motivos estandarizados  
✅ **UX mejorada**: Interfaz clara separada por secciones  
✅ **Validaciones robustas**: No se puede rechazar sin información completa  
✅ **Auditoría**: Todos los rechazos quedan registrados en la BD  
