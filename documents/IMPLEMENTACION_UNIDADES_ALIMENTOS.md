# Implementación: Unidades de Medida por Alimento

## 📋 Resumen

Se ha implementado un sistema completo para asociar unidades de medida específicas a cada alimento, permitiendo que los administradores configuren qué unidades están permitidas para cada producto. Esto mejora la precisión de las donaciones y solicitudes al restringir las opciones a unidades relevantes.

---

## 🗄️ Cambios en la Base de Datos

### 1. Nueva Tabla: `alimentos_unidades`

Tabla intermedia que relaciona alimentos con sus unidades de medida permitidas:

```sql
CREATE TABLE public.alimentos_unidades (
  id bigserial PRIMARY KEY,
  alimento_id bigint NOT NULL REFERENCES public.alimentos(id) ON DELETE CASCADE,
  unidad_id bigint NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
  es_unidad_principal boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT alimentos_unidades_unique UNIQUE (alimento_id, unidad_id)
);
```

**Características:**
- Relación muchos a muchos entre alimentos y unidades
- Campo `es_unidad_principal` para marcar la unidad recomendada
- Constraint único para evitar duplicados
- Cascada en eliminación (si se elimina un alimento, se eliminan sus relaciones)

### 2. Función: `obtener_unidades_alimento`

Función PostgreSQL para consultar las unidades de un alimento:

```sql
CREATE OR REPLACE FUNCTION obtener_unidades_alimento(p_alimento_id bigint)
RETURNS TABLE (
  unidad_id bigint,
  nombre text,
  simbolo text,
  tipo_magnitud_id bigint,
  tipo_magnitud_nombre text,
  es_base boolean,
  es_principal boolean
);
```

**Uso:**
```sql
SELECT * FROM obtener_unidades_alimento(1);
```

### 3. Función: `convertir_cantidad`

Función para realizar conversiones entre unidades del mismo tipo de magnitud:

```sql
CREATE OR REPLACE FUNCTION convertir_cantidad(
  p_cantidad numeric,
  p_unidad_origen_id bigint,
  p_unidad_destino_id bigint
) RETURNS numeric;
```

**Uso futuro:**
- Convertir automáticamente entre unidades (kg ↔ lb, L ↔ ml, etc.)
- Validar compatibilidad de unidades en transacciones

### 4. Vista: `v_inventario_con_unidades`

Vista que facilita consultas de inventario con información de alimentos y unidades:

```sql
CREATE OR REPLACE VIEW v_inventario_con_unidades AS
SELECT 
  i.id_inventario,
  i.id_deposito,
  d.nombre as deposito_nombre,
  i.id_producto,
  pd.nombre_producto,
  pd.alimento_id,
  a.nombre as alimento_nombre,
  a.categoria as alimento_categoria,
  i.cantidad_disponible,
  pd.unidad_medida as unidad_actual,
  i.fecha_actualizacion
FROM ...
```

---

## 💻 Cambios en el Frontend

### 1. Módulo Admin - Catálogo de Alimentos

#### Tipos Actualizados (`src/modules/admin/catalogo/types.ts`)

```typescript
export interface UnidadAlimento {
  unidad_id: number;
  nombre: string;
  simbolo: string;
  tipo_magnitud_id: number;
  tipo_magnitud_nombre: string;
  es_base: boolean;
  es_principal: boolean;
}

export interface FoodRecord {
  id: number;
  nombre: string;
  categoria: string;
  unidades?: UnidadAlimento[];
}

export interface FoodFormValues {
  nombre: string;
  categoria: string;
  categoriaPersonalizada?: string;
  unidades_ids: number[];
  unidad_principal_id?: number;
}
```

#### Componente: `FoodModal`

**Nuevas características:**
- ✅ Selector múltiple de unidades agrupadas por tipo de magnitud
- ✅ Marcado de unidad principal con indicador visual (⭐)
- ✅ Interfaz intuitiva con checkmarks y colores
- ✅ Validación: al menos una unidad debe ser seleccionada

**Props adicionales:**
```typescript
interface FoodModalProps {
  // ... props existentes
  unidadesDisponibles: Unidad[];
  loadingUnidades: boolean;
}
```

#### Servicio: `catalogService`

**Métodos actualizados:**
- `fetchFoods()`: Ahora carga las unidades asociadas a cada alimento usando `obtener_unidades_alimento()`
- `createFood()`: Inserta relaciones en `alimentos_unidades` al crear un alimento
- `updateFood()`: Elimina y recrea las relaciones al actualizar

**Ejemplo de creación:**
```typescript
const { data: alimentoData } = await supabase
  .from('alimentos')
  .insert({ nombre, categoria })
  .select()
  .single();

const unidadesRelaciones = unidades_ids.map(unidadId => ({
  alimento_id: alimentoData.id,
  unidad_id: unidadId,
  es_unidad_principal: unidad_principal_id === unidadId
}));

await supabase.from('alimentos_unidades').insert(unidadesRelaciones);
```

#### Hook: `useCatalogData`

**Nuevos retornos:**
```typescript
return {
  // ... valores existentes
  unidades: Unidad[],
  loadingUnidades: boolean,
}
```

---

### 2. Módulo Donante - Nueva Donación

#### Hook: `useCatalogData`

**Actualizado para cargar unidades por alimento:**
```typescript
interface UseCatalogDataReturn {
  // ... propiedades existentes
  obtenerUnidadesAlimento: (alimentoId: number) => UnidadAlimento[];
}
```

**Implementación:**
```typescript
const alimentosConUnidades = await Promise.all(
  alimentosData.map(async (alimento) => {
    const { data: unidadesData } = await supabase
      .rpc('obtener_unidades_alimento', { p_alimento_id: alimento.id });
    
    return {
      ...alimento,
      unidades: unidadesData || []
    };
  })
);
```

#### Página: `nueva-donacion/page.tsx`

**Función: `getUnidadesDisponibles()`**
```typescript
const getUnidadesDisponibles = () => {
  if (formulario.tipo_producto === 'personalizado') {
    return unidades; // Todas las unidades
  }

  if (!formulario.tipo_producto) {
    return [];
  }

  const unidadesAlimento = obtenerUnidadesAlimento(
    parseInt(formulario.tipo_producto)
  );
  
  // Si no hay unidades configuradas, mostrar todas
  if (unidadesAlimento.length === 0) {
    return unidades;
  }

  return unidadesAlimento.map(u => ({
    id: u.unidad_id,
    nombre: u.nombre,
    simbolo: u.simbolo
  }));
};
```

**Comportamiento:**
- 🎯 Productos del catálogo: solo unidades configuradas
- 🆓 Productos personalizados: todas las unidades
- ⚡ Fallback: si un alimento no tiene unidades, muestra todas

---

### 3. Módulo User - Solicitudes

#### Tipos Actualizados (`src/modules/user/types/index.ts`)

```typescript
export interface UnidadAlimento {
  unidad_id: number;
  nombre: string;
  simbolo: string;
  tipo_magnitud_id: number;
  tipo_magnitud_nombre: string;
  es_base: boolean;
  es_principal: boolean;
}

export interface Alimento {
  id: number;
  nombre: string;
  categoria: string;
  descripcion?: string;
  unidades?: UnidadAlimento[];
}
```

#### Hook: `useAlimentos`

**Actualizado para cargar unidades:**
```typescript
interface UseAlimentosResult {
  // ... propiedades existentes
  obtenerUnidadesAlimento: (alimentoId: number) => UnidadAlimento[];
}
```

#### Página: `formulario/page.tsx`

**Misma lógica que en donaciones:**
```typescript
const getUnidadesDisponibles = () => {
  if (!alimentoId) return [];
  
  const unidadesAlimento = obtenerUnidadesAlimento(alimentoId);
  
  if (unidadesAlimento.length === 0) {
    return unidades;
  }

  return unidadesAlimento.map(u => ({
    id: u.unidad_id,
    nombre: u.nombre,
    simbolo: u.simbolo
  }));
};
```

**Mejoras UX:**
- 🔄 Al seleccionar un alimento, se resetea la unidad seleccionada
- 📝 Mensaje contextual: "Unidades permitidas para este alimento"
- ⚠️ Si no hay alimento seleccionado: "Selecciona primero un alimento"

---

## 🚀 Instrucciones de Implementación

### 1. Ejecutar Script SQL

```bash
psql -U postgres -d nombre_base_datos -f modificaciones_unidades_alimentos.sql
```

O desde Supabase Dashboard:
1. Ir a SQL Editor
2. Copiar y pegar el contenido de `modificaciones_unidades_alimentos.sql`
3. Ejecutar

### 2. Verificar Permisos

```sql
-- Verificar que las políticas RLS estén correctamente configuradas
GRANT SELECT ON public.alimentos_unidades TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.alimentos_unidades TO authenticated;
```

### 3. Configurar Datos Iniciales (Opcional)

Asignar unidades a alimentos existentes:

```sql
-- Ejemplo: Arroz puede medirse en kg, lb, unidades
INSERT INTO alimentos_unidades (alimento_id, unidad_id, es_unidad_principal)
SELECT a.id, u.id, true
FROM alimentos a, unidades u
WHERE a.nombre ILIKE '%arroz%' AND u.simbolo = 'kg';

INSERT INTO alimentos_unidades (alimento_id, unidad_id, es_unidad_principal)
SELECT a.id, u.id, false
FROM alimentos a, unidades u
WHERE a.nombre ILIKE '%arroz%' AND u.simbolo = 'lb';
```

### 4. Reiniciar la Aplicación

```bash
npm run dev
```

---

## 📊 Flujo de Uso

### Para Administradores

1. **Crear/Editar Alimento**
   - Ir a "Catálogo de alimentos"
   - Hacer clic en "Registrar alimento" o editar uno existente
   - Completar nombre y categoría
   - En sección "Unidades de Medida":
     - Seleccionar todas las unidades permitidas
     - Marcar una como "Principal" (recomendada)
   - Guardar

2. **Vista del Catálogo**
   - Ver alimentos con sus unidades asociadas
   - Identificar unidad principal con ⭐

### Para Donantes

1. **Nueva Donación**
   - Seleccionar alimento del catálogo
   - El selector de unidades solo mostrará las permitidas
   - Si es producto personalizado, se muestran todas las unidades

### Para Solicitantes

1. **Nueva Solicitud**
   - Buscar alimento en inventario
   - Al seleccionar, solo aparecen las unidades configuradas
   - Mensaje claro sobre unidades permitidas

---

## 🎨 Características Visuales

### Modal de Alimentos (Admin)

```
┌─────────────────────────────────────┐
│ Unidades de Medida *           [✓]  │
├─────────────────────────────────────┤
│ Tipo de magnitud #1                 │
│ ┌──────────┐ ┌──────────┐          │
│ │ ★ Kilogramo│ │   Libra  │          │
│ │ (kg) [✓]   │ │  (lb)    │          │
│ └──────────┘ └──────────┘          │
│                                     │
│ 2 unidades seleccionadas            │
│ ⚠️ Recomendado: Marca una principal │
└─────────────────────────────────────┘
```

### Selector de Unidades (Donantes/Solicitantes)

```
Unidad de Medida *
┌─────────────────────────┐
│ Selecciona una unidad   │▼
├─────────────────────────┤
│ Kilogramo (kg)          │
│ Libra (lb)              │
└─────────────────────────┘
📝 Unidades permitidas para este alimento
```

---

## ✅ Validaciones Implementadas

1. ✅ Al menos una unidad debe ser seleccionada
2. ✅ Solo se muestran unidades configuradas para el alimento
3. ✅ Fallback a todas las unidades si no hay configuración
4. ✅ Productos personalizados tienen acceso a todas las unidades
5. ✅ Constraint de base de datos evita duplicados

---

## 🔮 Mejoras Futuras Sugeridas

1. **Conversiones Automáticas**
   - Usar la función `convertir_cantidad()` para conversiones en tiempo real
   - Mostrar equivalencias (ej: "5 kg = 11.02 lb")

2. **Unidades Predeterminadas por Categoría**
   - Frutas/Verduras → kg, lb
   - Líquidos → L, ml, galones
   - Enlatados → unidades, cajas

3. **Historial de Unidades**
   - Tracking de cambios en unidades asignadas
   - Auditoría de modificaciones

4. **Validación de Coherencia**
   - Alertar si una donación usa una unidad no permitida
   - Sugerir conversión automática

5. **Reportes**
   - Alimentos sin unidades configuradas
   - Unidades más utilizadas por categoría

---

## 🐛 Troubleshooting

### Error: "No se pueden cargar las unidades"

**Solución:** Verificar que la función `obtener_unidades_alimento` existe:
```sql
SELECT proname FROM pg_proc WHERE proname = 'obtener_unidades_alimento';
```

### Error: "Constraint unique violation"

**Solución:** Ya existe esa relación alimento-unidad. Revisar datos:
```sql
SELECT * FROM alimentos_unidades WHERE alimento_id = X AND unidad_id = Y;
```

### No aparecen unidades en el selector

**Solución:** 
1. Verificar que el alimento tiene unidades asignadas
2. Revisar consola del navegador por errores
3. Confirmar que `obtenerUnidadesAlimento()` retorna datos

---

## 📝 Notas Técnicas

- **Rendimiento:** La carga de unidades por alimento es paralela (Promise.all)
- **Caché:** Considerar implementar caché en el frontend para reducir llamadas
- **RLS:** Asegurar políticas correctas en `alimentos_unidades`
- **Migración:** Alimentos antiguos sin unidades seguirán funcionando (fallback)

---

## 👨‍💻 Archivos Modificados

### SQL
- `modificaciones_unidades_alimentos.sql` (nuevo)

### Backend/Types
- `src/modules/admin/catalogo/types.ts`
- `src/modules/user/types/index.ts`

### Componentes
- `src/modules/admin/catalogo/components/FoodModal.tsx`

### Servicios
- `src/modules/admin/catalogo/services/catalogService.ts`

### Hooks
- `src/modules/admin/catalogo/hooks/useCatalogData.ts`
- `src/modules/donante/nueva-donacion/hooks/useCatalogData.ts`
- `src/modules/user/hooks/useAlimentos.ts`

### Páginas
- `src/app/admin/catalogo/page.tsx`
- `src/app/donante/nueva-donacion/page.tsx`
- `src/app/user/formulario/page.tsx`

---

## 📚 Referencias

- [Supabase RPC Functions](https://supabase.com/docs/guides/database/functions)
- [PostgreSQL CREATE FUNCTION](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [React Hook Patterns](https://react.dev/reference/react/hooks)

---

**Última actualización:** 28 de octubre de 2025
**Versión:** 1.0.0
