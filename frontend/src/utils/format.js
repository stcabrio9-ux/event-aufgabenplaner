export function formatDate(value) {
  if (!value) return "Keine Frist";
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
}

export function formatMoney(value) {
  return Number(value || 0).toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR"
  });
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
}
