# Guía de Prueba - Sistema de Rechazos de Solicitudes

## 🧪 Pruebas Funcionales

### 1. Setup Inicial

#### Paso 1: Ejecutar Migración de Base de Datos
```sql
-- Copiar el contenido de database/migracion_rechazos.sql
-- y ejecutar en Supabase SQL Editor

-- Las nuevas columnas deben crearse:
ALTER TABLE public.solicitudes
  ADD COLUMN IF NOT EXISTS motivo_rechazo text,
  ADD COLUMN IF NOT EXISTS operador_rechazo_id uuid,
  ADD COLUMN IF NOT EXISTS fecha_rechazo timestamp with time zone;
```

#### Paso 2: Verificar Estructura de la Tabla
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'solicitudes'
ORDER BY ordinal_position;

-- Debe mostrar las nuevas columnas:
-- motivo_rechazo | text | YES
-- operador_rechazo_id | uuid | YES
-- fecha_rechazo | timestamp with time zone | YES
```

### 2. Pruebas de Interfaz de Usuario

#### Prueba 1: Acceso al Modal de Rechazos
**Objetivo:** Verificar que la interfaz de rechazo sea visible

**Pasos:**
1. Inicia sesión como OPERADOR
2. Navega a "Gestión de Solicitudes"
3. Abre una solicitud con estado "pendiente"
4. Verifica que veas dos secciones: "Aprobar Solicitud" y "Rechazar Solicitud"
5. En la sección de Rechazo, busca el botón "Mostrar opciones"

**Resultado Esperado:**
- ✅ Ambas secciones son visibles
- ✅ Botón "Mostrar opciones" está presente
- ✅ Las secciones tienen colores distintivos (verde para aprobación, rojo para rechazo)

---

#### Prueba 2: Despliegue del Formulario de Rechazo
**Objetivo:** Verificar que el formulario se despliega correctamente

**Pasos:**
1. Desde el modal de solicitud, haz clic en "Mostrar opciones" en la sección de Rechazo
2. Verifica que aparecen:
   - Select "Motivo del Rechazo" con 7 opciones
   - Textarea "Comentario Detallado"
   - Botones "Confirmar Rechazo" y "Cancelar"
   - Nota informativa en fondo naranja

**Resultado Esperado:**
- ✅ El formulario se despliega suavemente
- ✅ Se muestran todos los elementos
- ✅ El botón "Confirmar Rechazo" está deshabilitado (gris)

---

#### Prueba 3: Validación de Motivo Obligatorio
**Objetivo:** Verificar que no se puede confirmar sin seleccionar motivo

**Pasos:**
1. Haz clic en "Mostrar opciones" en Rechazo
2. Intenta hacer clic en "Confirmar Rechazo" sin seleccionar un motivo
3. Escribe un comentario válido (>10 caracteres)
4. Intenta nuevamente sin seleccionar motivo

**Resultado Esperado:**
- ✅ El botón "Confirmar Rechazo" sigue deshabilitado
- ✅ Aparece mensaje de error rojo: "Este campo es obligatorio"
- ✅ No se puede procesar sin seleccionar motivo

---

#### Prueba 4: Validación de Comentario Obligatorio
**Objetivo:** Verificar que el comentario sea obligatorio y tenga mínimo

**Pasos:**
1. Haz clic en "Mostrar opciones" en Rechazo
2. Selecciona un motivo (ej: "Stock insuficiente")
3. No escribas nada en comentario
4. Verifica que el botón está deshabilitado
5. Escribe menos de 10 caracteres (ej: "No hay")
6. Verifica que el botón sigue deshabilitado
7. Escribe 10 caracteres o más

**Resultado Esperado:**
- ✅ Con <10 caracteres: botón deshabilitado y mensaje de error
- ✅ Con ≥10 caracteres: botón se habilita
- ✅ Mensaje: "Este campo es obligatorio (mínimo 10 caracteres)"

---

#### Prueba 5: Selección de Motivos
**Objetivo:** Verificar que todos los motivos estén disponibles

**Pasos:**
1. Abre el dropdown "Motivo del Rechazo"
2. Verifica que existan exactamente 7 opciones más el placeholder:
   - "-- Selecciona un motivo --" (placeholder)
   - "Stock insuficiente"
   - "Producto no disponible"
   - "Datos incompletos"
   - "Solicitante ineligible"
   - "Solicitud duplicada"
   - "Próximos a vencer"
   - "Otro motivo"

**Resultado Esperado:**
- ✅ Se muestran todos los 7 motivos
- ✅ Cada motivo tiene una descripción breve visible al pasar el mouse
- ✅ Se puede seleccionar cada uno sin errores

---

### 3. Pruebas de Funcionalidad de Rechazo

#### Prueba 6: Rechazo Exitoso con Confirmación
**Objetivo:** Verificar que el rechazo se procesa correctamente

**Pasos:**
1. Abre una solicitud pendiente
2. Haz clic en "Mostrar opciones" en Rechazo
3. Selecciona un motivo (ej: "Stock insuficiente")
4. Escribe un comentario detallado (ej: "No contamos con la cantidad solicitada en este momento")
5. Haz clic en "Confirmar Rechazo"
6. Aparecerá un diálogo de confirmación
7. Haz clic en "Rechazar"

**Resultado Esperado:**
- ✅ Se abre diálogo de confirmación con mensaje claro
- ✅ Después de confirmar, aparece un toast verde: "Solicitud rechazada exitosamente..."
- ✅ El modal se cierra automáticamente
- ✅ La solicitud desaparece de la vista actual (cambió de estado)

---

#### Prueba 7: Verificación en Base de Datos
**Objetivo:** Verificar que los datos se guardaron correctamente

**Pasos:**
1. Después de rechazar una solicitud, abre Supabase
2. Ejecuta esta consulta:
```sql
SELECT 
  id,
  usuario_id,
  tipo_alimento,
  estado,
  motivo_rechazo,
  operador_rechazo_id,
  fecha_respuesta,
  fecha_rechazo,
  comentario_admin
FROM solicitudes
WHERE estado = 'rechazada'
ORDER BY fecha_rechazo DESC
LIMIT 5;
```

**Resultado Esperado:**
- ✅ La solicitud rechazada aparece con estado "rechazada"
- ✅ `motivo_rechazo` contiene el ID del motivo (ej: "stock_insuficiente")
- ✅ `operador_rechazo_id` contiene el UUID del operador que rechazó
- ✅ `fecha_rechazo` contiene la fecha/hora exacta (reciente)
- ✅ `comentario_admin` contiene el comentario escrito

---

#### Prueba 8: Notificación al Usuario
**Objetivo:** Verificar que el usuario recibe la notificación correcta

**Pasos:**
1. Inicia sesión como el usuario que hizo la solicitud rechazada
2. Ve al ícono de Notificaciones (campana)
3. Abre las notificaciones
4. Busca la notificación de rechazo más reciente

**Resultado Esperado:**
- ✅ La notificación tiene título: "Tu solicitud ha sido rechazada"
- ✅ El mensaje incluye:
  - Cantidad y tipo de alimento solicitado
  - Motivo del rechazo (ej: "Stock insuficiente")
  - Fecha en formato legible (ej: "15 de enero de 2026")
  - Hora exacta (ej: "14:30:45")
  - Comentario del operador
- ✅ El mensaje es accesible y fácil de leer

---

#### Prueba 9: Email de Notificación
**Objetivo:** Verificar que se envía email con la notificación

**Pasos:**
1. Revisa la bandeja de entrada del usuario
2. Busca un email con asunto relacionado al rechazo
3. Abre el email

**Resultado Esperado:**
- ✅ Se recibe un email de notificación
- ✅ El email contiene toda la información del rechazo
- ✅ El formato HTML es legible y profesional
- ✅ Hay un botón "Ver detalle" que lleva a la solicitud

---

#### Prueba 10: Cancelar Rechazo
**Objetivo:** Verificar que se puede cancelar el rechazo

**Pasos:**
1. Abre una solicitud pendiente
2. Haz clic en "Mostrar opciones" en Rechazo
3. Selecciona un motivo y escribe comentario
4. Haz clic en "Cancelar"

**Resultado Esperado:**
- ✅ El formulario de rechazo se oculta
- ✅ Vuelve a mostrar solo el botón "Mostrar opciones"
- ✅ Los datos no se guardan

---

### 4. Pruebas de Edge Cases

#### Prueba 11: Caracteres Especiales en Comentario
**Objetivo:** Verificar que se aceptan caracteres especiales

**Pasos:**
1. Abre formulario de rechazo
2. En el comentario, escribe: "⚠️ Especial @#$%&() 'comillas' \"dobles\""
3. Procede a rechazar

**Resultado Esperado:**
- ✅ Se acepta sin problemas
- ✅ Se guarda correctamente en BD
- ✅ Se muestra correctamente en notificación

---

#### Prueba 12: Comentario Muy Largo
**Objetivo:** Verificar que se aceptan comentarios largos

**Pasos:**
1. Abre formulario de rechazo
2. Pega un comentario de 500+ caracteres
3. Procede a rechazar

**Resultado Esperado:**
- ✅ Se acepta sin problemas
- ✅ Se guarda correctamente en BD
- ✅ Se trunca adecuadamente en notificación si es necesario

---

#### Prueba 13: Rechazo de Solicitud sin Comentario Previo
**Objetivo:** Verificar que funciona incluso sin comentario_admin previo

**Pasos:**
1. Abre una solicitud que no tiene comentario_admin
2. Procede a rechazarla con motivo y nuevo comentario

**Resultado Esperado:**
- ✅ No hay errores
- ✅ Se crea nuevo comentario sin problemas
- ✅ Se registra en la BD correctamente

---

### 5. Pruebas de Seguridad y Permisos

#### Prueba 14: Operador No Puede Ver Datos de Otros Operadores
**Objetivo:** Verificar que solo el operador puede ver sus rechazo

**Pasos:**
1. Operador A rechaza una solicitud
2. Operador B intenta ver los detalles del rechazo
3. Verifica que solo se ve la información necesaria

**Resultado Esperado:**
- ✅ Los datos de operador_rechazo_id no son públicos
- ✅ La información de quién rechazó está registrada internamente
- ✅ Se puede hacer auditoría posteriormente

---

#### Prueba 15: Rol No Operador No Puede Rechazar
**Objetivo:** Verificar que solo OPERADOR puede rechazar

**Pasos:**
1. Inicia sesión como DONANTE o SOLICITANTE
2. Intenta navegar a /operador/solicitudes

**Resultado Esperado:**
- ✅ Se redirige a página no autorizada
- ✅ No se puede acceder a gestión de solicitudes

---

### 6. Pruebas de Rendimiento

#### Prueba 16: Carga de Modal con Muchas Solicitudes
**Objetivo:** Verificar que el modal se carga rápido

**Pasos:**
1. Sistema con 1000+ solicitudes
2. Abre una solicitud aleatoria
3. Mide tiempo de carga del modal

**Resultado Esperado:**
- ✅ Modal se abre en menos de 2 segundos
- ✅ No hay lag al abrir formulario de rechazo
- ✅ Dropdown de motivos se carga instantáneamente

---

#### Prueba 17: Procesamiento de Rechazo con Carga Alta
**Objetivo:** Verificar que el rechazo se procesa rápido

**Pasos:**
1. Sistema con muchos usuarios concurrentes
2. Rechaza una solicitud
3. Mide tiempo de procesamiento

**Resultado Esperado:**
- ✅ Se procesa en menos de 5 segundos
- ✅ La notificación se envía correctamente
- ✅ La BD se actualiza sin problemas

---

## 📋 Checklist Final de Pruebas

### Interfaz
- [ ] Modal muestra secciones de Aprobación y Rechazo
- [ ] Botón "Mostrar opciones" funciona en Rechazo
- [ ] Formulario de rechazo se despliega correctamente
- [ ] Todos los elementos visuales son correctos

### Validaciones
- [ ] Motivo es obligatorio
- [ ] Comentario es obligatorio (mínimo 10 caracteres)
- [ ] Botón se habilita solo cuando están completos
- [ ] Mensajes de error se muestran correctamente

### Funcionalidad
- [ ] Rechazo se procesa sin errores
- [ ] Diálogo de confirmación aparece
- [ ] Toast de éxito se muestra
- [ ] Modal se cierra automáticamente

### Base de Datos
- [ ] Estado cambia a "rechazada"
- [ ] motivo_rechazo se guarda
- [ ] operador_rechazo_id se guarda
- [ ] fecha_rechazo se guarda
- [ ] comentario_admin se guarda

### Notificaciones
- [ ] Usuario recibe notificación
- [ ] Notificación contiene motivo
- [ ] Notificación contiene fecha y hora
- [ ] Notificación contiene comentario
- [ ] Email se envía correctamente

### Seguridad
- [ ] Solo OPERADOR puede rechazar
- [ ] operador_rechazo_id queda registrado
- [ ] Los datos son auditables

---

## 🔧 Troubleshooting

### Problema: "El botón no se habilita"
**Solución:** Verifica que:
- Hayas seleccionado un motivo
- El comentario tenga ≥10 caracteres
- No haya errores en consola (F12)

### Problema: "No se envía la notificación"
**Solución:** Verifica que:
- El email del usuario esté configurado correctamente
- Las notificaciones estén habilitadas en configuración
- No haya errores en los logs del servidor

### Problema: "Los datos no se guardan en la BD"
**Solución:** Verifica que:
- La migración se ejecutó correctamente
- Las columnas existen en la tabla
- No haya errores de permisos en Supabase

### Problema: "Aparece error al rechazar"
**Solución:**
- Revisa la consola del navegador (F12)
- Verifica los logs del servidor
- Comprueba que no hay errores de validación

---

## 📊 Registros Esperados en Log

```
[SolicitudesActionService] Actualizando estado de solicitud abc123 a rechazada
[SolicitudesActionService] Registrando detalles de rechazo:
  - motivo_rechazo: stock_insuficiente
  - operador_rechazo_id: operador789
  - fecha_rechazo: 2026-01-15T14:30:45Z

[email] Enviando notificación por email a: usuario@example.com
[email] Asunto: Tu solicitud ha sido rechazada
```

---

## ✅ Conclusión

Si todas las pruebas pasan, el sistema de rechazos está listo para producción.
