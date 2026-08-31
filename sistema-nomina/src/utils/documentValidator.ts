export const isValidCedulaRD = (cedula: string): boolean => {
  const digits = cedula.replace(/\D/g, '');
  if (digits.length !== 11) return false;

  const multiplicadores = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sumaTotal = 0;

  for (let i = 0; i < 10; i++) {
    const digito = parseInt(digits.charAt(i), 10);
    let prod = digito * multiplicadores[i];
    if (prod >= 10) {
      prod = Math.floor(prod / 10) + (prod % 10);
    }
    sumaTotal += prod;
  }

  const digitoVerificadorCalculado = (10 - (sumaTotal % 10)) % 10;
  const digitoVerificadorReal = parseInt(digits.charAt(10), 10);

  return digitoVerificadorCalculado === digitoVerificadorReal;
};

export const isValidPasaporte = (pasaporte: string): boolean => {
  const clean = pasaporte.trim().toUpperCase();
  const esDominicano = /^[A-Z]{2}\d{7}$/.test(clean);
  const esOaciInternacional = /^[A-Z0-9]{6,9}$/.test(clean);
  return esDominicano || esOaciInternacional;
};

export const getTipoPasaporte = (pasaporte: string): 'RD' | 'EXTRANJERO' | 'INVALIDO' => {
  const clean = pasaporte.trim().toUpperCase();
  if (/^[A-Z]{2}\d{7}$/.test(clean)) return 'RD';
  if (/^[A-Z0-9]{6,9}$/.test(clean)) return 'EXTRANJERO';
  return 'INVALIDO';
};