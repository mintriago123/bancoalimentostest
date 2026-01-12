-- Script para limpiar datos transaccionales
-- MANTIENE: alimentos, usuarios, unidades, conversiones, tipos_magnitud, depositos
-- ELIMINA: donaciones, inventarios, movimientos, solicitudes, notificaciones

BEGIN;

-- Mostrar qué se va a eliminar
SELECT 
    'RESUMEN DE ELIMINACIÓN' as mensaje,
    (SELECT COUNT(*) FROM movimiento_inventario_detalle) as movimientos_detalle,
    (SELECT COUNT(*) FROM movimiento_inventario_cabecera) as movimientos_cabecera,
    (SELECT COUNT(*) FROM detalles_solicitud) as detalles_solicitud,
    (SELECT COUNT(*) FROM solicitudes) as solicitudes,
    (SELECT COUNT(*) FROM inventario) as inventarios,
    (SELECT COUNT(*) FROM productos_donados) as productos_donados,
    (SELECT COUNT(*) FROM donaciones) as donaciones,
    (SELECT COUNT(*) FROM notificaciones) as notificaciones,
    (SELECT COUNT(*) FROM configuracion_notificaciones) as config_notificaciones;

-- PASO 1: Eliminar movimientos de inventario
DELETE FROM movimiento_inventario_detalle;
DELETE FROM movimiento_inventario_cabecera;

-- PASO 2: Eliminar solicitudes y detalles
DELETE FROM detalles_solicitud;
DELETE FROM solicitudes;

-- PASO 3: Eliminar inventario
DELETE FROM inventario;

-- PASO 4: Eliminar productos donados
DELETE FROM productos_donados;

-- PASO 5: Eliminar donaciones
DELETE FROM donaciones;

-- PASO 6: Eliminar notificaciones
DELETE FROM notificaciones;
DELETE FROM configuracion_notificaciones;

-- Resumen final
SELECT 
    '✅ LIMPIEZA COMPLETADA' as mensaje,
    (SELECT COUNT(*) FROM alimentos) as alimentos_restantes,
    (SELECT COUNT(*) FROM usuarios) as usuarios_restantes,
    (SELECT COUNT(*) FROM unidades) as unidades_restantes,
    (SELECT COUNT(*) FROM conversiones) as conversiones_restantes,
    (SELECT COUNT(*) FROM depositos) as depositos_restantes;

COMMIT;
