import { useEffect, useState } from "react";

const emptyForm = {
  name: "",
  date: "",
  participants: ""
};

export default function EventModal({ open, currentEvent, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open) {
      setForm(
        currentEvent
          ? {
              name: currentEvent.name ?? "",
              date: currentEvent.date ?? "",
              participants: currentEvent.participants ?? ""
            }
          : emptyForm
      );
    }
  }, [open, currentEvent]);

  if (!open) return null;

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.date) return;

    onSave({
      id: currentEvent?.id ?? crypto.randomUUID(),
      name: form.name.trim(),
      date: form.date,
      participants: Number(form.participants || 0)
    });
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <section className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <span className="eyebrow">Eventverwaltung</span>
            <h2>{currentEvent ? "Event bearbeiten" : "Event anlegen"}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>×</button>
        </div>

        <form className="form-grid" onSubmit={submit}>
          <label className="field full">
            <span>Name</span>
            <input
              name="name"
              value={form.name}
              onChange={update}
              placeholder="z. B. Sommerfest 2026"
              autoFocus
            />
          </label>

          <label className="field">
            <span>Datum</span>
            <input type="date" name="date" value={form.date} onChange={update} />
          </label>

          <label className="field">
            <span>Teilnehmende</span>
            <input
              type="number"
              min="0"
              name="participants"
              value={form.participants}
              onChange={update}
              placeholder="0"
            />
          </label>

          <div className="modal-actions full">
            <button className="button secondary" type="button" onClick={onClose}>Abbrechen</button>
            <button className="button primary" type="submit">Speichern</button>
          </div>
        </form>
      </section>
    </div>
  );
}
