-- Tabla para registrar el historial de donaciones/entregas parciales
CREATE TABLE IF NOT EXISTS public.historial_donaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id UUID NOT NULL REFERENCES public.solicitudes(id) ON DELETE CASCADE,
    cantidad_entregada DECIMAL(10, 2) NOT NULL,
    porcentaje_entregado INTEGER NOT NULL,
    cantidad_solicitada DECIMAL(10, 2) NOT NULL,
    operador_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    comentario TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT cantidad_positiva CHECK (cantidad_entregada > 0),
    CONSTRAINT porcentaje_valido CHECK (porcentaje_entregado >= 0 AND porcentaje_entregado <= 100)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_historial_donaciones_solicitud ON public.historial_donaciones(solicitud_id);
CREATE INDEX idx_historial_donaciones_operador ON public.historial_donaciones(operador_id);
CREATE INDEX idx_historial_donaciones_fecha ON public.historial_donaciones(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.historial_donaciones ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios autenticados pueden ver el historial de sus propias solicitudes
CREATE POLICY "Usuarios pueden ver historial de sus solicitudes"
    ON public.historial_donaciones
    FOR SELECT
    TO authenticated
    USING (
        solicitud_id IN (
            SELECT id FROM public.solicitudes WHERE usuario_id = auth.uid()
        )
    );

-- Política: Operadores y administradores pueden ver todo el historial
CREATE POLICY "Operadores y admins pueden ver todo el historial"
    ON public.historial_donaciones
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = auth.uid()
            AND rol IN ('OPERADOR', 'ADMINISTRADOR', 'ADMIN')
        )
    );

-- Política: Operadores y administradores pueden insertar registros
CREATE POLICY "Operadores y admins pueden registrar donaciones"
    ON public.historial_donaciones
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = auth.uid()
            AND rol IN ('OPERADOR', 'ADMINISTRADOR', 'ADMIN')
        )
    );

-- Agregar columnas a la tabla solicitudes para rastrear entregas parciales
ALTER TABLE public.solicitudes 
ADD COLUMN IF NOT EXISTS cantidad_entregada DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tiene_entregas_parciales BOOLEAN DEFAULT FALSE;

-- Comentarios para documentación
COMMENT ON TABLE public.historial_donaciones IS 'Registra todas las entregas/donaciones realizadas a una solicitud, incluyendo entregas parciales';
COMMENT ON COLUMN public.historial_donaciones.cantidad_entregada IS 'Cantidad entregada en esta donación específica';
COMMENT ON COLUMN public.historial_donaciones.porcentaje_entregado IS 'Porcentaje de la solicitud original que representa esta entrega';
COMMENT ON COLUMN public.historial_donaciones.cantidad_solicitada IS 'Cantidad total solicitada (para referencia histórica)';
COMMENT ON COLUMN public.solicitudes.cantidad_entregada IS 'Total acumulado de todas las entregas realizadas';
COMMENT ON COLUMN public.solicitudes.tiene_entregas_parciales IS 'Indica si la solicitud tiene múltiples entregas parciales';
