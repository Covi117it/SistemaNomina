export const formatCurrency = (amount: number | null | undefined): string => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2,
  }).format(amount || 0);
};
export const formatDisplayDate = (isoDate?: string | null): string => {
  if (!isoDate || !isoDate.trim()) return '-';
  const clean = isoDate.split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoDate;
};