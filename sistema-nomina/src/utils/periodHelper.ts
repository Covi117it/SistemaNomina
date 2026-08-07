export const getConceptoActualSugerido = (quincena?: string, mes?: number): string => {
  const hoy = new Date();
  const mesVal = mes || (hoy.getMonth() + 1);
  const quincenaVal = quincena || (hoy.getDate() <= 15 ? '1Q' : '2Q');
  
  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const nombreMes = nombresMeses[mesVal - 1] || 'Enero';
  const orden = quincenaVal === '1Q' ? 'Primera' : 'Segunda';
  
  return `${orden} Quincena de ${nombreMes} ${hoy.getFullYear()}`;
};