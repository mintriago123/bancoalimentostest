-- Script de mantenimiento simplificado (sin VACUUM)
-- ANALYZE actualiza estadísticas para mejorar el rendimiento
-- Funciona en Supabase y otros entornos con transacciones

ANALYZE movimiento_inventario_detalle;
ANALYZE movimiento_inventario_cabecera;
ANALYZE detalles_solicitud;
ANALYZE solicitudes;
ANALYZE inventario;
ANALYZE productos_donados;
ANALYZE donaciones;
ANALYZE notificaciones;
ANALYZE configuracion_notificaciones;
ANALYZE alimentos;
ANALYZE alimentos_unidades;
ANALYZE unidades;
ANALYZE conversiones;
ANALYZE usuarios;

-- Reindexar tablas importantes
REINDEX TABLE alimentos;
REINDEX TABLE alimentos_unidades;
REINDEX TABLE unidades;
REINDEX TABLE conversiones;
REINDEX TABLE usuarios;

SELECT '✅ Optimización completada. La BD debería ir más rápido.' as mensaje;

-- NOTA: Para limpieza completa con VACUUM, ejecutar desde terminal:
-- psql -U postgres -d tu_base_de_datos -c "VACUUM ANALYZE;"
