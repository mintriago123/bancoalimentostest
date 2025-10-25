-- =====================================================
-- SCRIPT PARA AGREGAR EL ROL OPERADOR AL SISTEMA
-- =====================================================
-- Fecha: 23 de octubre de 2025
-- Descripción: Actualiza la tabla usuarios para incluir el rol OPERADOR
-- =====================================================

-- 1. Agregar el rol OPERADOR al constraint de la tabla usuarios
ALTER TABLE public.usuarios 
DROP CONSTRAINT IF EXISTS usuarios_rol_check;

ALTER TABLE public.usuarios 
ADD CONSTRAINT usuarios_rol_check 
CHECK (rol = ANY (ARRAY['ADMINISTRADOR'::text, 'DONANTE'::text, 'SOLICITANTE'::text, 'OPERADOR'::text]));

-- =====================================================
-- SCRIPT OPCIONAL: Convertir usuarios específicos a OPERADOR
-- =====================================================
-- Descomenta y ajusta según necesites

-- Opción 1: Convertir un usuario específico por su email
UPDATE public.usuarios 
SET rol = 'OPERADOR', updated_at = NOW()
WHERE email = 'kristhianbello12@gmail.com';

-- Opción 2: Convertir un usuario específico por su ID
-- UPDATE public.usuarios 
-- SET rol = 'OPERADOR', updated_at = NOW()
-- WHERE id = 'REEMPLAZAR_CON_UUID_DEL_USUARIO';

-- Opción 3: Convertir múltiples usuarios por sus emails
-- UPDATE public.usuarios 
-- SET rol = 'OPERADOR', updated_at = NOW()
-- WHERE email IN (
--   'operador1@bancodealimentos.com',
--   'operador2@bancodealimentos.com'
-- );

-- =====================================================
-- VERIFICACIÓN: Consultar usuarios con rol OPERADOR
-- =====================================================
-- Ejecuta esta consulta para verificar los cambios
SELECT 
  id,
  nombre,
  email,
  rol,
  estado,
  created_at,
  updated_at
FROM public.usuarios 
WHERE rol = 'OPERADOR'
ORDER BY created_at DESC;

-- =====================================================
-- ROLLBACK (si necesitas revertir los cambios)
-- =====================================================
-- Descomenta estas líneas para volver al estado anterior

-- ALTER TABLE public.usuarios 
-- DROP CONSTRAINT IF EXISTS usuarios_rol_check;

-- ALTER TABLE public.usuarios 
-- ADD CONSTRAINT usuarios_rol_check 
-- CHECK (rol = ANY (ARRAY['ADMINISTRADOR'::text, 'DONANTE'::text, 'SOLICITANTE'::text]));

-- UPDATE public.usuarios 
-- SET rol = 'SOLICITANTE', updated_at = NOW()
-- WHERE rol = 'OPERADOR';
