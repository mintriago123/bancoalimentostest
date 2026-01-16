-- =====================================================
-- FIX: Trigger handle_new_user
-- =====================================================
-- Este script corrige el trigger que crea usuarios en public.usuarios
-- cuando se registran a través de Supabase Auth.
-- 
-- PROBLEMA: El rol siempre se guardaba como 'SOLICITANTE' ignorando
-- el valor enviado desde el frontend.
--
-- SOLUCIÓN: Leer el rol desde raw_user_meta_data del nuevo usuario.
-- =====================================================

-- Eliminar el trigger existente si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear o reemplazar la función handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rol TEXT;
BEGIN
  -- Obtener el rol desde raw_user_meta_data
  -- Si no existe, usar 'SOLICITANTE' como valor por defecto
  v_rol := COALESCE(
    NEW.raw_user_meta_data->>'rol',
    'SOLICITANTE'
  );
  
  -- Validar que el rol sea válido
  IF v_rol NOT IN ('ADMINISTRADOR', 'DONANTE', 'SOLICITANTE', 'OPERADOR') THEN
    v_rol := 'SOLICITANTE';
  END IF;

  -- Insertar el nuevo usuario en public.usuarios
  INSERT INTO public.usuarios (
    id,
    email,
    rol,
    estado,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    v_rol,
    'activo',
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Si el usuario ya existe, no hacer nada
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log del error pero no fallar el registro
    RAISE WARNING 'Error en handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Crear el trigger en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verificar que el trigger se creó correctamente
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- =====================================================
-- NOTA IMPORTANTE:
-- =====================================================
-- Ejecuta este script en el SQL Editor de Supabase.
-- Después de ejecutarlo, los nuevos registros respetarán
-- el rol seleccionado (DONANTE o SOLICITANTE).
-- =====================================================
