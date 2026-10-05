import { useState } from "react";

export default function CostModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState({
    title: "",
    category: "",
    amount: ""
  });

  if (!open) return null;

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.amount) return;

    onCreate({
      title: form.title.trim(),
      category: form.category.trim() || "Sonstiges",
      amount: Number(form.amount)
    });

    setForm({ title: "", category: "", amount: "" });
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <section className="modal">
        <div className="modal-header">
          <div>
            <span className="eyebrow">Kosten</span>
            <h2>Kosten erfassen</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>×</button>
        </div>

        <form className="form-grid" onSubmit={submit}>
          <label className="field full">
            <span>Position</span>
            <input name="title" value={form.title} onChange={update} placeholder="z. B. Catering" autoFocus />
          </label>

          <label className="field">
            <span>Kategorie</span>
            <input name="category" value={form.category} onChange={update} placeholder="Verpflegung" />
          </label>

          <label className="field">
            <span>Betrag in €</span>
            <input type="number" min="0" step="0.01" name="amount" value={form.amount} onChange={update} />
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
