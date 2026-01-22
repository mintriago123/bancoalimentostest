# Historial de Cancelaciones de Donaciones

## 📋 Descripción

Se ha implementado un módulo completo para consultar el historial de donaciones canceladas, similar al historial de bajas de productos. Los administradores pueden ver todas las cancelaciones con filtros avanzados y estadísticas detalladas.

## 🎯 Acceso

**Ruta**: `/admin/reportes/cancelaciones-donaciones`

**Requisitos**: 
- Rol: `ADMINISTRADOR`
- Estado: Activo

**Ubicación en menú**: 
Sidebar → Reportes → Cancelaciones

## 📊 Características

### Estadísticas en Tiempo Real

El dashboard muestra 4 tarjetas con métricas principales:

1. **Total Cancelaciones**: Número total de donaciones canceladas
2. **Cantidad Total**: Suma de todas las cantidades canceladas
3. **Solicitud Donante**: Cancelaciones solicitadas por el donante
4. **No Disponible**: Cancelaciones por producto no disponible

### Filtros Disponibles

1. **Búsqueda por texto**: 
   - Nombre del donante
   - Tipo de producto
   - Nombre del usuario que canceló

2. **Filtro por motivo**:
   - Todos los motivos
   - Error del Donante
   - Producto No Disponible
   - Calidad Inadecuada
   - Logística Imposible
   - Donación Duplicada
   - Solicitud del Donante
   - Otro Motivo

3. **Filtro por fecha**:
   - Fecha inicio (desde)
   - Fecha fin (hasta)

### Tabla de Cancelaciones

La tabla muestra la siguiente información para cada cancelación:

| Columna | Información |
|---------|-------------|
| **Donación** | Cantidad, unidad, producto y categoría |
| **Donante** | Nombre y teléfono del donante |
| **Motivo** | Motivo de cancelación (con colores) |
| **Cancelado por** | Usuario que canceló y su rol |
| **Fecha** | Fecha y hora de la cancelación |
| **Observaciones** | Detalles adicionales (si existen) |

### Colores por Motivo

Cada motivo tiene un color identificativo:

- 🟠 **Error del Donante**: Naranja
- 🔴 **Producto No Disponible**: Rojo
- 🟣 **Calidad Inadecuada**: Púrpura
- 🟡 **Logística Imposible**: Amarillo
- 🔵 **Donación Duplicada**: Azul
- ⚫ **Solicitud del Donante**: Gris
- ⚪ **Otro Motivo**: Gris claro

### Paginación

- 50 cancelaciones por página
- Botones "Anterior" y "Siguiente"
- Contador de registros mostrados

## 🔌 API Endpoint

### GET /api/admin/cancelaciones-donaciones

**Parámetros de consulta**:

```typescript
{
  motivo?: MotivoCancelacion | 'todos',  // Filtrar por motivo
  fecha_inicio?: string,                   // Formato: YYYY-MM-DD
  fecha_fin?: string,                      // Formato: YYYY-MM-DD
  limit?: number,                          // Default: 50
  offset?: number,                         // Default: 0
  estadisticas?: boolean                   // true para incluir stats
}
```

**Respuesta exitosa**:

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "user_id": "uuid",
      "nombre_donante": "Juan Pérez",
      "tipo_producto": "Arroz",
      "cantidad": 100,
      "unidad_nombre": "kilogramos",
      "unidad_simbolo": "kg",
      "estado": "Cancelada",
      "motivo_cancelacion": "solicitud_donante",
      "observaciones_cancelacion": "El donante no puede entregar el producto",
      "usuario_cancelacion_id": "uuid",
      "fecha_cancelacion": "2026-01-21T10:30:00Z",
      "usuario_cancelacion_nombre": "Admin User",
      "usuario_cancelacion_email": "admin@example.com",
      "usuario_cancelacion_rol": "ADMINISTRADOR",
      "categoria_comida": "Granos",
      "telefono": "0987654321",
      "codigo_comprobante": "DON-123-2026"
    }
  ],
  "pagination": {
    "total": 150,
    "offset": 0,
    "limit": 50,
    "has_more": true
  },
  "estadisticas": {
    "total": {
      "cancelaciones": 150,
      "cantidad_total": 5000
    },
    "por_motivo": {
      "error_donante": { "cancelaciones": 20, "cantidad": 500 },
      "no_disponible": { "cancelaciones": 45, "cantidad": 1800 },
      "calidad_inadecuada": { "cancelaciones": 15, "cantidad": 400 },
      "logistica_imposible": { "cancelaciones": 30, "cantidad": 1200 },
      "duplicado": { "cancelaciones": 10, "cantidad": 300 },
      "solicitud_donante": { "cancelaciones": 25, "cantidad": 700 },
      "otro": { "cancelaciones": 5, "cantidad": 100 }
    }
  }
}
```

## 📁 Estructura de Archivos

```
src/
├── app/
│   ├── admin/
│   │   └── reportes/
│   │       └── cancelaciones-donaciones/
│   │           └── page.tsx                     # Página principal
│   ├── api/
│   │   └── admin/
│   │       └── cancelaciones-donaciones/
│   │           └── route.ts                     # Endpoint API
│   └── components/
│       └── Sidebar.tsx                          # Enlace agregado
└── modules/
    └── admin/
        └── reportes/
            └── cancelaciones/
                └── types/
                    └── index.ts                 # Tipos TypeScript
```

## 🔍 Consultas SQL Útiles

### Ver cancelaciones recientes

```sql
SELECT 
  d.id,
  d.nombre_donante,
  d.tipo_producto,
  d.cantidad,
  d.unidad_simbolo,
  d.motivo_cancelacion,
  d.observaciones_cancelacion,
  u.nombre as cancelado_por,
  d.fecha_cancelacion
FROM donaciones d
LEFT JOIN usuarios u ON d.usuario_cancelacion_id = u.id
WHERE d.estado = 'Cancelada'
ORDER BY d.fecha_cancelacion DESC
LIMIT 20;
```

### Estadísticas por motivo

```sql
SELECT 
  motivo_cancelacion,
  COUNT(*) as total_cancelaciones,
  SUM(cantidad) as cantidad_total,
  ROUND(AVG(cantidad), 2) as cantidad_promedio
FROM donaciones
WHERE estado = 'Cancelada'
  AND motivo_cancelacion IS NOT NULL
GROUP BY motivo_cancelacion
ORDER BY total_cancelaciones DESC;
```

### Tendencia de cancelaciones por mes

```sql
SELECT 
  DATE_TRUNC('month', fecha_cancelacion) as mes,
  COUNT(*) as cancelaciones,
  SUM(cantidad) as cantidad_total
FROM donaciones
WHERE estado = 'Cancelada'
  AND fecha_cancelacion >= NOW() - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', fecha_cancelacion)
ORDER BY mes DESC;
```

### Top donantes con más cancelaciones

```sql
SELECT 
  nombre_donante,
  COUNT(*) as total_cancelaciones,
  SUM(cantidad) as cantidad_cancelada,
  ARRAY_AGG(DISTINCT motivo_cancelacion) as motivos
FROM donaciones
WHERE estado = 'Cancelada'
GROUP BY nombre_donante
HAVING COUNT(*) > 1
ORDER BY total_cancelaciones DESC
LIMIT 10;
```

## 🎨 Interfaz de Usuario

### Funcionalidades

✅ Búsqueda en tiempo real
✅ Filtros múltiples combinables
✅ Estadísticas visuales con tarjetas
✅ Tabla responsive
✅ Paginación automática
✅ Actualización manual con botón
✅ Contador de resultados filtrados
✅ Mensajes de estado (cargando, error, vacío)
✅ Colores por motivo para fácil identificación
✅ Vista de observaciones truncadas con tooltip

### Acciones Disponibles

- **Buscar**: Filtro de texto en múltiples campos
- **Filtrar por motivo**: Dropdown con todos los motivos
- **Filtrar por fecha**: Rango de fechas personalizado
- **Limpiar filtros**: Restablecer todos los filtros
- **Actualizar**: Recargar datos desde el servidor
- **Navegar**: Paginación entre resultados

## 📝 Notas Importantes

1. **Seguridad**: Solo administradores pueden acceder
2. **Performance**: Paginación de 50 registros
3. **Estadísticas**: Se cargan solo en la primera página
4. **Filtros**: Se combinan con operador AND
5. **Búsqueda**: Es case-insensitive
6. **Fechas**: El rango incluye el día completo final
7. **Observaciones**: Se muestran truncadas en la tabla

## 🚀 Próximas Mejoras Sugeridas

- [ ] Exportar a CSV/Excel
- [ ] Gráficos de tendencias
- [ ] Comparación entre periodos
- [ ] Filtro por usuario que canceló
- [ ] Vista detallada en modal
- [ ] Notificaciones de cancelaciones frecuentes

## 🔗 Relacionado

- [Sistema de Cancelación de Donaciones](./SISTEMA_CANCELACION_DONACIONES.md)
- [Historial de Bajas de Productos](/operador/bajas)
- [Gestión de Donaciones](/admin/reportes/donaciones)
