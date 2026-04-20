export function parseCurrencyInput(value: string) {
  return Number(value.replace(/[^\d.-]/g, ''));
}

export function isValidCurrencyInput(value: string) {
  return !Number.isNaN(parseCurrencyInput(value));
}
