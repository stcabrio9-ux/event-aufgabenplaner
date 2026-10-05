export default function EmptyState({ title, text, action }) {
  return (
    <section className="card empty-state">
      <h2>{title}</h2>
      <p>{text}</p>
      {action}
    </section>
  );
}
