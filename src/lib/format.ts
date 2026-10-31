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

// Fechas siempre en hora de Buenos Aires, sin importar dónde corra el
// servidor. 2026-10-30T12:00Z -> { date: "30 de octubre de 2026", time: "09:00" }
const TIME_ZONE = "America/Argentina/Buenos_Aires";
const longDate = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "long",
  timeZone: TIME_ZONE,
});
const shortTime = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: TIME_ZONE,
});

export function formatDateTime(date: Date) {
  return { date: longDate.format(date), time: shortTime.format(date) };
}

// (2, 2030) -> "02/30"
export function formatExpiry(month: number, year: number) {
  const mm = String(month).padStart(2, "0");
  const yy = String(year % 100).padStart(2, "0");
  return `${mm}/${yy}`;
}
