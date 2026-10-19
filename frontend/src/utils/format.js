export function formatDate(value) {
  if (!value) return "Nicht festgelegt";
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
}

export function formatDateRange(start, end) {
  if (!start && !end) return "Zeitraum nicht festgelegt";
  if (!end || start === end) return formatDate(start);
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function formatMoney(value) {
  return Number(value || 0).toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR"
  });
}

export function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";
}

export function isoNow() {
  return new Date().toISOString();
}

export function formatDateTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export function isUpcoming(event) {
  if (!event?.endDate && !event?.startDate) return true;
  const boundary = event.endDate || event.startDate;
  const today = new Date();
  today.setHours(0,0,0,0);
  return new Date(`${boundary}T23:59:59`) >= today;
}
