export default function StatCard({ label, value, detail }) {
  return (
    <section className="card stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </section>
  );
}
