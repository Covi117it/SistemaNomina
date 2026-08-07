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
  const clean = pasaporte.trim();
  return clean.length >= 5 && clean.length <= 20 && /^[a-zA-Z0-9]+$/.test(clean);
};