import { useEffect, useState } from "react";

export default function MemberModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "",
    projectRole: "",
    accessRole: "Betrachter"
  });
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (open) setSubmitError(null);
  }, [open]);

  if (!open) return null;

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (saving || !form.name.trim()) return;

    setSaving(true);
    setSubmitError(null);
    try {
      await onCreate({
        ...form,
        name: form.name.trim(),
        projectRole: form.projectRole.trim()
      });
      setForm({ name: "", projectRole: "", accessRole: "Betrachter" });
      onClose();
    } catch (requestError) {
      setSubmitError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <section className="modal">
        <div className="modal-header">
          <div>
            <span className="eyebrow">Mitglieder</span>
            <h2>Mitglied hinzufügen</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} disabled={saving}>×</button>
        </div>

        <form className="form-grid" onSubmit={submit}>
          <label className="field full">
            <span>Name</span>
            <input name="name" value={form.name} onChange={update} placeholder="Vor- und Nachname" autoFocus disabled={saving} />
          </label>

          <label className="field">
            <span>Projektrolle</span>
            <input name="projectRole" value={form.projectRole} onChange={update} placeholder="z. B. Frontend" disabled={saving} />
          </label>

          <label className="field">
            <span>Zugriffsrolle</span>
            <select name="accessRole" value={form.accessRole} onChange={update} disabled={saving}>
              <option>Betrachter</option>
              <option>Bearbeiter</option>
              <option>Administrator</option>
            </select>
          </label>

          <div className="modal-actions full">
            {submitError ? <p role="alert">{submitError}</p> : null}
            <button className="button secondary" type="button" onClick={onClose} disabled={saving}>Abbrechen</button>
            <button className="button primary" type="submit" disabled={saving}>{saving ? "Wird hinzugefügt …" : "Hinzufügen"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
