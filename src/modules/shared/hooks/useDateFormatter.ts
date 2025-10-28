import { useState } from 'react';

export function useDateFormatter() {
  const [formattedDate, setFormattedDate] = useState('');

  const formatDate = (value: string): string => {
    let cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length > 8) cleanValue = cleanValue.slice(0, 8);

    let dia = cleanValue.slice(0, 2);
    let mes = cleanValue.slice(2, 4);
    let anio = cleanValue.slice(4, 8);

    // Validar días
    if (dia) {
      let nDia = parseInt(dia, 10);
      if (nDia > 31) dia = '31';
      if (nDia < 1 && dia.length === 2) dia = '01';
    }

    // Validar meses
    if (mes) {
      let nMes = parseInt(mes, 10);
      if (nMes > 12) mes = '12';
      if (nMes < 1 && mes.length === 2) mes = '01';
    }

    let nuevaFecha = dia;
    if (mes) nuevaFecha += '/' + mes;
    if (anio) nuevaFecha += '/' + anio;

    return nuevaFecha;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDate(e.target.value);
    setFormattedDate(formatted);
    return formatted;
  };

  const normalizeDate = (fecha: string): string => {
    return fecha.replace(/[-/]/g, '').trim().toLowerCase();
  };

  const validateDate = (inputDate: string, validDates: string[]): boolean => {
    if (!validDates.length || !inputDate) return false;
    return validDates.some((validDate) => 
      normalizeDate(inputDate) === normalizeDate(validDate)
    );
  };

  const resetDate = () => {
    setFormattedDate('');
  };

  return {
    formattedDate,
    formatDate,
    handleDateChange,
    validateDate,
    normalizeDate,
    resetDate,
  };
}
