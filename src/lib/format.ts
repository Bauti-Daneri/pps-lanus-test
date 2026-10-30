// Todo el dinero llega en centavos (Int). Acá se convierte a texto, nunca antes.

const amountWithCents = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const amountWithoutCents = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

// 12500 -> "$125", 9550 -> "$95.50"
export function formatAmount(cents: number) {
  const formatter = cents % 100 === 0 ? amountWithoutCents : amountWithCents;
  return `$${formatter.format(cents / 100)}`;
}

// 97885 -> "978.85", 123456 -> "1,234.56"
export function formatBalance(cents: number) {
  return amountWithCents.format(cents / 100);
}

// (2, 2030) -> "02/30"
export function formatExpiry(month: number, year: number) {
  const mm = String(month).padStart(2, "0");
  const yy = String(year % 100).padStart(2, "0");
  return `${mm}/${yy}`;
}
