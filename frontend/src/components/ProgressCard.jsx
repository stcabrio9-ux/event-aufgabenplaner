export default function ProgressCard({ progress, done, total }) {
  return (
    <section className="card progress-card">
      <div className="card-heading-row">
        <div>
          <h2>Fortschritt</h2>
          <p>Gesamtstatus des Events</p>
        </div>
        <strong>{progress} %</strong>
      </div>

      <div className="progress-track large">
        <div className="progress-value" style={{ width: `${progress}%` }} />
      </div>

      <small>{done} von {total} Aufgaben erledigt</small>
    </section>
  );
}
