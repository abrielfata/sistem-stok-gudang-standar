export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '—';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatRupiah(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return 'Rp 0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(isNaN(num) ? 0 : num);
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('id-ID').format(isNaN(num) ? 0 : num);
}

export function formatCompactRupiah(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return 'Rp 0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'Rp 0';
  
  // Compact notation will format to e.g., 1,5 rb, 1,5 jt, 1,5 M
  // id-ID locale often translates "M" to "M" (Milyar) and "K" to "rb".
  const formatted = new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
  
  return `Rp ${formatted}`;
}
