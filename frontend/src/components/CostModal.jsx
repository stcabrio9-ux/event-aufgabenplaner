import { useEffect, useState } from "react";

export default function CostModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState({
    title: "",
    category: "",
    amount: ""
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
    if (saving || !form.title.trim() || !form.amount) return;

    setSaving(true);
    setSubmitError(null);
    try {
      await onCreate({
        title: form.title.trim(),
        category: form.category.trim() || "Sonstiges",
        amount: Number(form.amount)
      });
      setForm({ title: "", category: "", amount: "" });
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
            <span className="eyebrow">Kosten</span>
            <h2>Kosten erfassen</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} disabled={saving}>×</button>
        </div>

        <form className="form-grid" onSubmit={submit}>
          <label className="field full">
            <span>Position</span>
            <input name="title" value={form.title} onChange={update} placeholder="z. B. Catering" autoFocus disabled={saving} />
          </label>

          <label className="field">
            <span>Kategorie</span>
            <input name="category" value={form.category} onChange={update} placeholder="Verpflegung" disabled={saving} />
          </label>

          <label className="field">
            <span>Betrag in €</span>
            <input type="number" min="0" step="0.01" name="amount" value={form.amount} onChange={update} disabled={saving} />
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
