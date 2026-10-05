function toClass(value) {
  return String(value)
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue");
}

export default function StatusBadge({ children, type = "status" }) {
  return (
    <span className={`badge badge-${type} ${type}-${toClass(children)}`}>
      {children}
    </span>
  );
}
