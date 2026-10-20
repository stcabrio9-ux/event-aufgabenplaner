import { useEffect, useState } from "react";

const blank = { name: "", email: "" };

export default function PersonModal({ open, person, onClose, onSave }) {
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(person ? { name: person.name || "", email: person.email || "" } : blank);
      setError("");
    }
  }, [open, person]);

  if (!open) return null;

  async function submit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    try {
      await onSave({
        id: person?.id,
        name: form.name.trim(),
        email: form.email.trim()
      });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="modal-backdrop">
      <section className="modal">
        <div className="modal-header">
          <div>
            <span className="eyebrow">Personenverwaltung</span>
            <h2>{person ? "Person bearbeiten" : "Person hinzufügen"}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>×</button>
        </div>
        <form className="form-grid" onSubmit={submit}>
          {error ? <div className="form-error full">{error}</div> : null}
          <label className="field full">
            <span>Name</span>
            <input name="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          </label>
          <label className="field full">
            <span>E-Mail-Adresse</span>
            <input name="email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          </label>
          <div className="modal-actions full">
            <button className="button secondary" type="button" onClick={onClose}>Abbrechen</button>
            <button className="button primary">Speichern</button>
          </div>
        </form>
      </section>
    </div>
  );
}
