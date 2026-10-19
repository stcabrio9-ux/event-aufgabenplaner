import { useEffect, useState } from "react";

const emptyForm = {
  name: "",
  date: "",
  participants: ""
};

export default function EventModal({ open, currentEvent, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (open) {
      setSubmitError(null);
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

  async function submit(event) {
    event.preventDefault();
    if (saving || !form.name.trim() || !form.date) return;

    setSaving(true);
    setSubmitError(null);
    try {
      await onSave({
        id: currentEvent?.id ?? crypto.randomUUID(),
        name: form.name.trim(),
        date: form.date,
        participants: Number(form.participants || 0)
      });
      onClose();
    } catch (requestError) {
      setSubmitError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <section className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <span className="eyebrow">Eventverwaltung</span>
            <h2>{currentEvent ? "Event bearbeiten" : "Event anlegen"}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} disabled={saving}>×</button>
        </div>

        <form className="form-grid" onSubmit={submit}>
          <label className="field full">
            <span>Name</span>
            <input
              name="name"
              value={form.name}
              onChange={update}
              disabled={saving}
              placeholder="z. B. Sommerfest 2026"
              autoFocus
            />
          </label>

          <label className="field">
            <span>Datum</span>
            <input type="date" name="date" value={form.date} onChange={update} disabled={saving} />
          </label>

          <label className="field">
            <span>Teilnehmende</span>
            <input
              type="number"
              min="0"
              name="participants"
              value={form.participants}
              onChange={update}
              disabled={saving}
              placeholder="0"
            />
          </label>

          <div className="modal-actions full">
            {submitError ? <p role="alert">{submitError}</p> : null}
            <button className="button secondary" type="button" onClick={onClose} disabled={saving}>Abbrechen</button>
            <button className="button primary" type="submit" disabled={saving}>{saving ? "Speichern …" : "Speichern"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
