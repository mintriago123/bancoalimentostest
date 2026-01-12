import { ImpactoCalculado } from '../types';

export function calcularImpacto(
  cantidad: string,
  unidadSimbolo: string,
  categoria?: string,
  nombreProducto?: string
): ImpactoCalculado {
  const cantidadNum = parseFloat(cantidad) || 0;
  let personasAlimentadas = 0;
  let comidaEquivalente = '';

  if (!unidadSimbolo) {
    return { personasAlimentadas: 0, comidaEquivalente: '' };
  }

  const simbolo = unidadSimbolo.toLowerCase();
  const esAceiteOGrasa = categoria?.toLowerCase().includes('aceite') || categoria?.toLowerCase().includes('grasa');
  const esBebida = categoria?.toLowerCase().includes('bebida');
  const esLacteo = categoria?.toLowerCase().includes('lácteo') || categoria?.toLowerCase().includes('lacteo');
  const esAgua = nombreProducto?.toLowerCase().includes('agua') || false;

  // Helper para pluralización correcta
  const pluralizarLitros = (cantidad: number): string => {
    return cantidad === 1 ? 'litro' : 'litros';
  };

  // Verificar unidades más específicas primero (ml antes de l, g antes de kg, oz antes de otras)
  if (simbolo.includes('ml')) {
    const cantidadEnL = cantidadNum / 1000;
    personasAlimentadas = Math.floor(cantidadEnL * 1.5);
    if (esAceiteOGrasa) {
      comidaEquivalente = `ingrediente para ~${Math.floor(cantidadEnL * 10)} preparaciones`;
    } else if (esAgua) {
      const horas = Math.floor(cantidadEnL * 8);
      comidaEquivalente = `hidratación para ~${horas} horas`;
    } else if (esBebida) {
      const litrosRedondeados = parseFloat(cantidadEnL.toFixed(1));
      comidaEquivalente = `${cantidadEnL.toFixed(1)} ${pluralizarLitros(litrosRedondeados)} de bebida`;
    } else if (esLacteo) {
      const litrosRedondeados = parseFloat(cantidadEnL.toFixed(1));
      comidaEquivalente = `${cantidadEnL.toFixed(1)} ${pluralizarLitros(litrosRedondeados)} de lácteos`;
    } else {
      const litrosRedondeados = parseFloat(cantidadEnL.toFixed(1));
      comidaEquivalente = `${cantidadEnL.toFixed(1)} ${pluralizarLitros(litrosRedondeados)} de líquido`;
    }
  } else if (simbolo.includes('oz')) {
    // 1 oz ≈ 28.35 g, convertir a kg para el cálculo
    const cantidadEnKg = (cantidadNum * 28.35) / 1000;
    personasAlimentadas = Math.floor(cantidadEnKg * 2);
    comidaEquivalente = `${Math.round(cantidadEnKg * 3)} porciones aproximadamente`;
  } else if (simbolo.includes('g') && !simbolo.includes('kg')) {
    const cantidadEnKg = cantidadNum / 1000;
    personasAlimentadas = Math.floor(cantidadEnKg * 2);
    comidaEquivalente = `${Math.round(cantidadEnKg * 3)} porciones aproximadamente`;
  } else if (simbolo.includes('lb')) {
    // 1 lb ≈ 0.453592 kg
    const cantidadEnKg = cantidadNum * 0.453592;
    personasAlimentadas = Math.floor(cantidadEnKg * 2);
    comidaEquivalente = `${Math.round(cantidadEnKg * 3)} porciones aproximadamente`;
  } else if (simbolo.includes('t') && !simbolo.includes('lt')) {
    // 1 tonelada = 1000 kg
    const cantidadEnKg = cantidadNum * 1000;
    personasAlimentadas = Math.floor(cantidadEnKg * 2);
    comidaEquivalente = `${Math.round(cantidadEnKg * 3)} porciones aproximadamente`;
  } else if (simbolo.includes('kg')) {
    personasAlimentadas = Math.floor(cantidadNum * 2);
    comidaEquivalente = `${Math.round(cantidadNum * 3)} porciones aproximadamente`;
  } else if (simbolo.includes('gal')) {
    // 1 galón ≈ 3.78541 litros
    const cantidadEnL = cantidadNum * 3.78541;
    personasAlimentadas = Math.floor(cantidadEnL * 1.5);
    if (esAceiteOGrasa) {
      comidaEquivalente = `ingrediente para ~${Math.floor(cantidadEnL * 10)} preparaciones`;
    } else if (esAgua) {
      const horas = Math.floor(cantidadEnL * 8);
      comidaEquivalente = `hidratación para ~${horas} horas`;
    } else if (esBebida) {
      const litrosRedondeados = parseFloat(cantidadEnL.toFixed(1));
      comidaEquivalente = `${cantidadEnL.toFixed(1)} ${pluralizarLitros(litrosRedondeados)} de bebida`;
    } else if (esLacteo) {
      const litrosRedondeados = parseFloat(cantidadEnL.toFixed(1));
      comidaEquivalente = `${cantidadEnL.toFixed(1)} ${pluralizarLitros(litrosRedondeados)} de lácteos`;
    } else {
      const litrosRedondeados = parseFloat(cantidadEnL.toFixed(1));
      comidaEquivalente = `${cantidadEnL.toFixed(1)} ${pluralizarLitros(litrosRedondeados)} de líquido`;
    }
  } else if (simbolo.includes('l') || simbolo.includes('lt')) {
    personasAlimentadas = Math.floor(cantidadNum * 1.5);
    if (esAceiteOGrasa) {
      comidaEquivalente = `ingrediente para ~${Math.floor(cantidadNum * 10)} preparaciones`;
    } else if (esAgua) {
      const horas = Math.floor(cantidadNum * 8);
      comidaEquivalente = `hidratación para ~${horas} horas`;
    } else if (esBebida) {
      comidaEquivalente = `${cantidadNum} ${pluralizarLitros(cantidadNum)} de bebida`;
    } else if (esLacteo) {
      comidaEquivalente = `${cantidadNum} ${pluralizarLitros(cantidadNum)} de lácteos`;
    } else {
      comidaEquivalente = `${cantidadNum} ${pluralizarLitros(cantidadNum)} de líquido`;
    }
  } else if (simbolo.includes('caja')) {
    personasAlimentadas = Math.floor(cantidadNum * 4);
    comidaEquivalente = `${cantidadNum} cajas de alimentos`;
  } else if (simbolo.includes('und') || simbolo.includes('pza') || simbolo.includes('unidad')) {
    personasAlimentadas = Math.floor(cantidadNum * 0.5);
    comidaEquivalente = `${cantidadNum} unidades`;
  } else {
    personasAlimentadas = Math.floor(cantidadNum);
    comidaEquivalente = `${cantidadNum} unidades`;
  }

  if (cantidadNum > 0 && personasAlimentadas === 0) {
    personasAlimentadas = 1;
  }

  return { personasAlimentadas, comidaEquivalente };
}
