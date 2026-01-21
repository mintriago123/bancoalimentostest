# 🚀 Instalación Rápida - Sistema de Bajas y Alertas de Vencimiento

## ✅ Pasos de Instalación

### 1. Ejecutar Script SQL en Supabase

#### Opción A: Desde Supabase Dashboard
1. Ir a [Supabase Dashboard](https://supabase.com)
2. Seleccionar tu proyecto
3. Ir a **SQL Editor**
4. Crear una nueva consulta
5. Copiar todo el contenido de `database/crear-tabla-bajas.sql`
6. Ejecutar (Run)
7. Verificar mensaje de éxito

#### Opción B: Desde CLI
```bash
cd "c:\Users\ASUS\Desktop\Vinculación 2\bancoalimentostest_fork"
# Asegúrate de tener configurado Supabase CLI
supabase db push database/crear-tabla-bajas.sql
```

### 2. Verificar Instalación

Ejecutar en SQL Editor de Supabase:

```sql
-- Verificar tabla
SELECT COUNT(*) FROM bajas_productos;

-- Verificar funciones
SELECT proname FROM pg_proc 
WHERE proname IN (
  'dar_baja_producto',
  'obtener_productos_proximos_vencer',
  'obtener_estadisticas_bajas'
);

-- Verificar vista
SELECT * FROM v_bajas_productos_detalle LIMIT 1;
```

**Resultado esperado:**
- Tabla existe (puede estar vacía)
- 3 funciones encontradas
- Vista accesible

### 3. Sin Configuración Adicional Necesaria

✅ Los archivos TypeScript ya están listos  
✅ Las APIs ya están creadas  
✅ Los componentes ya están integrados  
✅ Las rutas ya están configuradas

---

## 🎯 Acceso a las Funcionalidades

### Para Operadores

1. **Gestión de Inventario con Bajas:**
   - URL: `http://localhost:3000/operador/inventario`
   - Pestaña: "Inventario"
   - Acción: Clic en icono de papelera 🗑️ en cualquier producto

2. **Alertas de Vencimiento:**
   - URL: `http://localhost:3000/operador/inventario`
   - Pestaña: "Vencimientos"
   - Visualiza productos próximos a vencer o vencidos
   - Botón "Dar de Baja" directo

3. **Historial de Bajas:**
   - URL: `http://localhost:3000/operador/bajas`
   - Ver todas las bajas registradas
   - Filtros por motivo, fecha, producto

### Para Administradores

Las mismas funcionalidades de operadores más:
- Edición de bajas
- Eliminación de registros de bajas
- Reportes completos

---

## 🔧 Prueba Rápida

### Test 1: Dar de Baja un Producto

```bash
# 1. Iniciar servidor
npm run dev

# 2. Abrir navegador
# http://localhost:3000/operador/inventario

# 3. Buscar producto en tabla

# 4. Clic en botón de papelera (🗑️)

# 5. Completar formulario:
#    - Motivo: "Vencido"
#    - Cantidad: 10
#    - Observaciones: "Prueba del sistema"

# 6. Confirmar baja

# 7. Verificar mensaje de éxito
```

### Test 2: Ver Alertas de Vencimiento

```sql
-- Primero, crear un producto que vence pronto (en Supabase SQL Editor)
UPDATE productos_donados 
SET fecha_caducidad = NOW() + INTERVAL '2 days'
WHERE id_producto IN (
  SELECT id_producto FROM inventario 
  WHERE cantidad_disponible > 0 
  LIMIT 1
);
```

Luego:
1. Ir a `http://localhost:3000/operador/inventario`
2. Clic en pestaña "Vencimientos"
3. Verificar que aparece el producto actualizado

### Test 3: Consultar Historial

1. Después de realizar bajas de prueba
2. Ir a `http://localhost:3000/operador/bajas`
3. Ver lista completa con filtros

---

## 📊 Verificación de Funcionalidad

Marca las casillas cuando pruebes:

- [ ] ✅ Script SQL ejecutado sin errores
- [ ] ✅ Tabla `bajas_productos` creada
- [ ] ✅ Funciones disponibles
- [ ] ✅ Vista `v_bajas_productos_detalle` funciona
- [ ] ✅ Página de inventario carga correctamente
- [ ] ✅ Botón "Dar de Baja" visible en tabla
- [ ] ✅ Modal de baja se abre correctamente
- [ ] ✅ Baja se registra exitosamente
- [ ] ✅ Inventario se actualiza
- [ ] ✅ Pestaña "Vencimientos" muestra alertas
- [ ] ✅ Página de historial accesible
- [ ] ✅ Filtros funcionan correctamente

---

## 🐛 Solución de Problemas Comunes

### Error: "función dar_baja_producto no existe"
**Causa:** Script SQL no ejecutado o incompleto  
**Solución:** Re-ejecutar `database/crear-tabla-bajas.sql` completo

### Error: "No autorizado" en API
**Causa:** Usuario no tiene rol OPERADOR o ADMINISTRADOR  
**Solución:** 
```sql
UPDATE usuarios 
SET rol = 'OPERADOR' 
WHERE email = 'tu_email@ejemplo.com';
```

### Modal no se abre
**Causa:** Error de importación o estado  
**Solución:** Verificar consola del navegador (F12) y revisar errores

### Alertas no muestran productos
**Causa:** No hay productos con fecha de vencimiento próxima  
**Solución:** 
```sql
-- Crear datos de prueba
UPDATE productos_donados 
SET fecha_caducidad = NOW() + INTERVAL '3 days'
WHERE id_producto IN (
  SELECT id_producto FROM inventario 
  WHERE cantidad_disponible > 0 
  LIMIT 5
);
```

### Página de historial vacía
**Causa:** No hay bajas registradas aún  
**Solución:** Registrar al menos una baja de prueba desde el inventario

---

## 📞 Soporte

Si tienes problemas:

1. Verificar logs del servidor: `npm run dev` (terminal)
2. Verificar consola del navegador (F12)
3. Revisar errores en Supabase Dashboard > Logs
4. Consultar documentación completa: `documents/SISTEMA_BAJAS_VENCIMIENTOS.md`

---

## 🎉 ¡Listo!

El sistema está completamente funcional. Los usuarios con rol OPERADOR o ADMINISTRADOR pueden:

✅ Dar de baja productos vencidos o dañados  
✅ Ver alertas de productos próximos a vencer  
✅ Consultar historial completo de bajas  
✅ Filtrar y buscar en el historial  
✅ Ver estadísticas de bajas

---

**Tiempo estimado de instalación:** 5-10 minutos  
**Complejidad:** Baja (solo ejecutar un script SQL)  
**Requisitos:** Acceso a Supabase Dashboard
