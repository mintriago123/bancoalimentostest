import { ImpactoCalculado } from '../types';

export function calcularImpacto(
  cantidad: string,
  unidadSimbolo: string
): ImpactoCalculado {
  const cantidadNum = parseFloat(cantidad) || 0;
  let personasAlimentadas = 0;
  let comidaEquivalente = '';

  if (!unidadSimbolo) {
    return { personasAlimentadas: 0, comidaEquivalente: '' };
  }

  const simbolo = unidadSimbolo.toLowerCase();

  if (simbolo.includes('kg')) {
    personasAlimentadas = Math.floor(cantidadNum * 2);
    comidaEquivalente = `${Math.round(cantidadNum * 3)} porciones aproximadamente`;
  } else if (simbolo.includes('l') || simbolo.includes('lt')) {
    personasAlimentadas = Math.floor(cantidadNum * 1.5);
    comidaEquivalente = `${cantidadNum} litros de bebida`;
  } else if (simbolo.includes('caja')) {
    personasAlimentadas = Math.floor(cantidadNum * 4);
    comidaEquivalente = `${cantidadNum} cajas de alimentos`;
  } else if (simbolo.includes('und') || simbolo.includes('pza') || simbolo.includes('unidad')) {
    personasAlimentadas = Math.floor(cantidadNum * 0.5);
    comidaEquivalente = `${cantidadNum} unidades`;
  } else if (simbolo.includes('g') && !simbolo.includes('kg')) {
    const cantidadEnKg = cantidadNum / 1000;
    personasAlimentadas = Math.floor(cantidadEnKg * 2);
    comidaEquivalente = `${Math.round(cantidadEnKg * 3)} porciones aproximadamente`;
  } else if (simbolo.includes('ml') && !simbolo.includes('l')) {
    const cantidadEnL = cantidadNum / 1000;
    personasAlimentadas = Math.floor(cantidadEnL * 1.5);
    comidaEquivalente = `${cantidadEnL.toFixed(1)} litros de bebida`;
  } else {
    personasAlimentadas = Math.floor(cantidadNum);
    comidaEquivalente = `${cantidadNum} unidades`;
  }

  if (cantidadNum > 0 && personasAlimentadas === 0) {
    personasAlimentadas = 1;
  }

  return { personasAlimentadas, comidaEquivalente };
}
