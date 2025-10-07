import type { Unidad } from '@/services/catalogService';

export function calcularImpacto(cantidadRaw: string | number, unidad?: Unidad) {
  const cantidad = Number(cantidadRaw) || 0;
  let personasAlimentadas = 0;
  let comidaEquivalente = '';

  if (!unidad) return { personasAlimentadas, comidaEquivalente };

  const simbolo = unidad.simbolo.toLowerCase();
  if (simbolo.includes('kg')) {
    personasAlimentadas = Math.floor(cantidad * 2);
    comidaEquivalente = `${cantidad * 3} porciones aproximadamente`;
  } else if (simbolo.includes('l') || simbolo.includes('lt')) {
    personasAlimentadas = Math.floor(cantidad * 1.5);
    comidaEquivalente = `${cantidad} litros de bebida`;
  } else if (simbolo.includes('caja')) {
    personasAlimentadas = Math.floor(cantidad * 4);
    comidaEquivalente = `${cantidad} cajas de alimentos`;
  } else if (simbolo.includes('und') || simbolo.includes('pza') || simbolo.includes('unidad')) {
    personasAlimentadas = Math.floor(cantidad * 0.5);
    comidaEquivalente = `${cantidad} unidades`;
  } else if (simbolo.includes('g') && !simbolo.includes('kg')) {
    const cantidadEnKg = cantidad / 1000;
    personasAlimentadas = Math.floor(cantidadEnKg * 2);
    comidaEquivalente = `${Math.round(cantidadEnKg * 3)} porciones aproximadamente`;
  } else if (simbolo.includes('ml') && !simbolo.includes('l')) {
    const cantidadEnL = cantidad / 1000;
    personasAlimentadas = Math.floor(cantidadEnL * 1.5);
    comidaEquivalente = `${cantidadEnL.toFixed(1)} litros de bebida`;
  } else {
    personasAlimentadas = Math.floor(cantidad * 1);
    comidaEquivalente = `${cantidad} ${unidad.nombre}`;
  }

  if (cantidad > 0 && personasAlimentadas === 0) personasAlimentadas = 1;
  return { personasAlimentadas, comidaEquivalente };
}
