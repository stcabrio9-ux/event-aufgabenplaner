import { useEffect, useState } from "react";

const initialForm = {
  title: "",
  owner: "",
  priority: "Mittel",
  dueDate: ""
};

export default function NewTaskModal({ open, members, onClose, onCreate }) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (open) {
      setSubmitError(null);
      setForm({
        ...initialForm,
        owner: members[0]?.name ?? ""
      });
    }
  }, [open, members]);

  if (!open) return null;

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (saving || !form.title.trim()) return;

    setSaving(true);
    setSubmitError(null);
    try {
      await onCreate({
        ...form,
        title: form.title.trim(),
        dueDate: form.dueDate || null,
        status: "Offen"
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
            <span className="eyebrow">Aufgabenverwaltung</span>
            <h2>Neue Aufgabe</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} disabled={saving}>×</button>
        </div>

        <form onSubmit={submit} className="form-grid">
          <label className="field full">
            <span>Aufgabe</span>
            <input
              name="title"
              value={form.title}
              onChange={update}
              disabled={saving}
              placeholder="z. B. Catering buchen"
              autoFocus
            />
          </label>

          <label className="field">
            <span>Verantwortlich</span>
            <select name="owner" value={form.owner} onChange={update} disabled={saving}>
              <option value="">Nicht zugewiesen</option>
              {members.map((member) => (
                <option key={member.id} value={member.name}>{member.name}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Priorität</span>
            <select name="priority" value={form.priority} onChange={update} disabled={saving}>
              <option>Niedrig</option>
              <option>Mittel</option>
              <option>Hoch</option>
            </select>
          </label>

          <label className="field full">
            <span>Frist</span>
            <input type="date" name="dueDate" value={form.dueDate} onChange={update} disabled={saving} />
          </label>

          <div className="modal-actions full">
            {submitError ? <p role="alert">{submitError}</p> : null}
            <button className="button secondary" type="button" onClick={onClose} disabled={saving}>Abbrechen</button>
            <button className="button primary" type="submit" disabled={saving}>{saving ? "Wird erstellt …" : "Aufgabe erstellen"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
