# Implementación de Donaciones con Entregas Parciales

## Descripción General

Se ha implementado un sistema completo de donaciones que permite a operadores y administradores entregar cantidades parciales o totales de lo solicitado por los beneficiarios, con registro de historial y control de inventario.

## Características Principales

### 1. Gestión de Donaciones

Los operadores y administradores pueden:
- **Donar cantidad exacta solicitada** (entrega completa 100%)
- **Donar cantidad parcial** según disponibilidad en stock
- **Ver porcentaje de entrega** en tiempo real
- **Agregar comentarios** explicativos para cada donación
- **Usar atajos rápidos** (25%, 50%, 75%, 100%) o botón "Máximo"

### 2. Validaciones Automáticas

El sistema valida:
- ✓ Cantidad a donar > 0
- ✓ Cantidad a donar ≤ cantidad solicitada
- ✓ Stock suficiente en inventario
- ✓ Confirmación antes de procesar la donación

### 3. Historial de Donaciones

Cada solicitud registra:
- **Fecha y hora** de cada entrega
- **Cantidad entregada** en cada donación
- **Porcentaje entregado** respecto al total
- **Operador responsable** que procesó la donación
- **Comentarios** asociados a cada entrega
- **Progreso acumulado** (cuánto se ha entregado del total)

### 4. Estados de Solicitud

- **Pendiente**: Solicitud nueva, sin entregas
- **Pendiente con entregas parciales**: Se ha entregado algo pero no el total
- **Aprobada**: Se ha completado el 100% de la solicitud

## Base de Datos

### Nueva Tabla: `historial_donaciones`

```sql
CREATE TABLE public.historial_donaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    cantidad_entregada DECIMAL(10, 2) NOT NULL,
    porcentaje_entregado INTEGER NOT NULL,
    cantidad_solicitada DECIMAL(10, 2) NOT NULL,
    operador_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    comentario TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT cantidad_positiva CHECK (cantidad_entregada > 0),
    CONSTRAINT porcentaje_valido CHECK (porcentaje_entregado >= 0 AND porcentaje_entregado <= 100)
);
```

### Nuevas Columnas en `solicitudes`

```sql
ALTER TABLE solicitudes 
ADD COLUMN cantidad_entregada DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN tiene_entregas_parciales BOOLEAN DEFAULT FALSE;
```

### Políticas RLS

- **Usuarios**: Pueden ver el historial de sus propias solicitudes
- **Operadores/Admins**: Pueden ver todo el historial y registrar nuevas donaciones

## Flujo de Trabajo

### Para Operadores/Administradores

1. **Abrir solicitud pendiente**
   - Click en "Ver Detalle" de una solicitud pendiente

2. **Ver información de stock**
   - El modal muestra inventario disponible
   - Se calcula el total disponible en todos los depósitos

3. **Activar modo donación**
   - Click en "Procesar Donación"

4. **Configurar la donación**
   - Ingresar cantidad manualmente o usar botones de porcentaje
   - Ver indicador visual del porcentaje de entrega
   - Agregar comentario opcional

5. **Confirmar donación**
   - Se valida stock disponible
   - Se solicita confirmación
   - Se descuenta del inventario
   - Se registra en el historial
   - Se notifica al solicitante

### Para Beneficiarios (Solicitantes)

- Reciben notificación de cada entrega parcial
- Pueden ver en su panel:
  - Total solicitado
  - Total entregado hasta el momento
  - Porcentaje completado
  - Historial detallado de todas las entregas
  - Código de comprobante (cuando se completa)

## Archivos Modificados

### Frontend

1. **`SolicitudDetailModal.tsx`** - Componente modal del operador
   - Agregada sección de gestión de donación
   - Integrado selector de cantidad con validaciones
   - Botones de porcentaje rápido (25%, 50%, 75%, 100%)
   - Indicador visual de porcentaje
   - Historial de entregas con timeline

2. **`page.tsx`** (Operador) - Página principal de solicitudes
   - Agregado handler `handleDonacion`
   - Integración con hook `procesarDonacion`
   - Confirmación antes de procesar

3. **`types/index.ts`** - Tipos TypeScript
   - Agregado `cantidad_entregada` a `Solicitud`
   - Agregado `tiene_entregas_parciales` a `Solicitud`

### Backend/Servicios

4. **`solicitudesActionService.ts`** - Servicio de acciones
   - Nueva función `procesarDonacion()`
   - Validación de stock
   - Actualización de solicitud
   - Registro en historial
   - Descuento de inventario
   - Notificaciones

5. **`useSolicitudActions.ts`** - Hook de acciones
   - Nuevo método `procesarDonacion`
   - Manejo de errores y estados

6. **`historialDonacionesService.ts`** - Servicio de historial
   - Función `obtenerHistorialDonaciones()`
   - Join con datos de operador

### Base de Datos

7. **`03.Create_Historial_Donaciones.sql`** - Script SQL
   - Creación de tabla `historial_donaciones`
   - Índices para optimización
   - Políticas RLS
   - Alteración de tabla `solicitudes`

## Beneficios de la Implementación

### Para Operadores
- ✓ Flexibilidad para entregar según disponibilidad real
- ✓ No necesitan rechazar por stock insuficiente
- ✓ Pueden hacer entregas escalonadas
- ✓ Historial completo de todas las acciones

### Para Beneficiarios
- ✓ Reciben algo incluso si no hay stock completo
- ✓ Transparencia total del proceso
- ✓ Notificaciones de cada entrega
- ✓ Pueden ver progreso de su solicitud

### Para el Sistema
- ✓ Mejor aprovechamiento del inventario
- ✓ Registro detallado de movimientos
- ✓ Trazabilidad completa
- ✓ Reportes más precisos

## Interfaz de Usuario

### Sección de Donación (Modo Colapsable)

```
┌─────────────────────────────────────────┐
│ 📦 Gestionar Donación                   │
├─────────────────────────────────────────┤
│                                         │
│ [Procesar Donación]                     │  <- Botón inicial
│                                         │
└─────────────────────────────────────────┘
```

### Modo Donación Expandido

```
┌─────────────────────────────────────────┐
│ Solicitado: 50 kg | Disponible: 35 kg   │
├─────────────────────────────────────────┤
│                                         │
│ Cantidad a donar:                       │
│ [ 35 ] kg                               │
│                                         │
│ Porcentajes rápidos:                    │
│ [25%] [50%] [75%] [100%] [Máximo]      │
│                                         │
│ Porcentaje de entrega: 70%             │
│ ████████████████░░░░░░░░                │
│ ⚠ Entrega parcial                      │
│                                         │
│ Comentarios (opcional):                 │
│ [____________________________]          │
│                                         │
│ [Confirmar Donación] [Cancelar]        │
└─────────────────────────────────────────┘
```

### Historial de Entregas

```
┌─────────────────────────────────────────┐
│ 📜 Historial de Entregas                │
├─────────────────────────────────────────┤
│ Total: 50 kg | Entregado: 35 kg | 70%  │
├─────────────────────────────────────────┤
│ ① 20 kg (40%) - 15/01/2026 10:30       │
│    Por: Juan Pérez (OPERADOR)           │
│    Comentario: Primera entrega          │
│                                         │
│ ② 15 kg (30%) - 18/01/2026 14:15       │
│    Por: María López (OPERADOR)          │
│    Comentario: Stock repuesto           │
└─────────────────────────────────────────┘
```

## Casos de Uso

### Caso 1: Entrega Completa
- Solicitud: 100 kg de arroz
- Stock disponible: 150 kg
- Acción: Operador dona 100 kg (100%)
- Resultado: Solicitud pasa a "aprobada", se genera código de comprobante

### Caso 2: Entrega Parcial Única
- Solicitud: 100 kg de arroz
- Stock disponible: 60 kg
- Acción: Operador dona 60 kg (60%)
- Resultado: Solicitud sigue "pendiente" con entrega parcial registrada

### Caso 3: Entregas Múltiples
- Solicitud: 100 kg de arroz
- Primera entrega: 40 kg (40%) - Stock limitado
- Segunda entrega: 30 kg (30%) - Reposición parcial
- Tercera entrega: 30 kg (30%) - Completa el 100%
- Resultado: Solicitud pasa a "aprobada", 3 registros en historial

## Notificaciones

El sistema envía notificaciones al beneficiario:

### Entrega Parcial
```
Título: Entrega Parcial Registrada
Mensaje: Se ha registrado una entrega de 40 kg (40% del total).
         Total entregado hasta ahora: 40/100 kg
```

### Entrega Completa
```
Título: Donación Completada
Mensaje: Tu solicitud ha sido completada: 100 kg de Arroz
         Código de comprobante: SLCXXXXXXXX
```

## Próximas Mejoras Sugeridas

1. **Dashboard de Donaciones**
   - Estadísticas de entregas parciales vs completas
   - Tiempo promedio de completación
   - Productos con más entregas parciales

2. **Reportes**
   - Reporte de entregas por operador
   - Reporte de solicitudes con múltiples entregas
   - Análisis de disponibilidad de stock

3. **Notificaciones Push**
   - Alertas en tiempo real de entregas
   - Recordatorios de solicitudes pendientes de completar

4. **Exportación**
   - Exportar historial de donaciones a Excel/PDF
   - Comprobantes individuales por cada entrega

## Ejecución del Script SQL

Para activar esta funcionalidad en la base de datos:

```bash
# Conectarse a PostgreSQL
psql -U postgres -d banco_alimentos

# Ejecutar el script
\i database/03.Create_Historial_Donaciones.sql
```

O desde Supabase Dashboard:
1. Ir a SQL Editor
2. Copiar contenido de `03.Create_Historial_Donaciones.sql`
3. Ejecutar

## Compatibilidad

- ✓ Compatible con sistema existente de aprobación/rechazo
- ✓ No afecta solicitudes ya procesadas
- ✓ Funciona con el sistema de inventario actual
- ✓ Integrado con notificaciones existentes
- ✓ Respeta políticas RLS configuradas

## Soporte

Para dudas o problemas:
1. Verificar que el script SQL se ejecutó correctamente
2. Revisar políticas RLS en Supabase
3. Verificar permisos de operador/administrador
4. Consultar logs del navegador para errores

---

**Fecha de Implementación**: 19 de Enero de 2026  
**Versión**: 1.0.0  
**Estado**: ✅ Implementado y Funcional
