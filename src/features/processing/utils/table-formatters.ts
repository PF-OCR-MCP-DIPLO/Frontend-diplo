export function parseCurrencyInput(value: string) {
  const normalized = value.replace(/[^\d.-]/g, '').trim();
  if (!normalized || normalized === '-' || normalized === '.' || normalized === '-.') {
    return Number.NaN;
  }
  return Number(normalized);
}

export function isValidCurrencyInput(value: string) {
  return !Number.isNaN(parseCurrencyInput(value));
}
