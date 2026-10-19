import { useEffect, useState } from "react";

const blank = { title: "", category: "", amount: "", note: "", taskId: "" };

export default function CostModal({ open, cost, eventId, tasks, onClose, onSave }) {
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (open) setForm(cost ? { ...blank, ...cost } : blank);
  }, [open, cost]);

  if (!open) return null;

  const update = (event) => setForm((current) => ({
    ...current,
    [event.target.name]: event.target.value
  }));

  function submit(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.amount) return;
    onSave({
      ...form,
      id: cost?.id,
      eventId,
      title: form.title.trim(),
      amount: Number(form.amount)
    });
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <section className="modal">
        <div className="modal-header">
          <div>
            <span className="eyebrow">Kosten</span>
            <h2>{cost ? "Kosten bearbeiten" : "Kosten erfassen"}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>×</button>
        </div>

        <form className="form-grid" onSubmit={submit}>
          <label className="field full">
            <span>Position</span>
            <input name="title" value={form.title} onChange={update} />
          </label>
          <label className="field">
            <span>Kategorie</span>
            <input name="category" value={form.category} onChange={update} />
          </label>
          <label className="field">
            <span>Betrag</span>
            <input type="number" step=".01" min="0" name="amount" value={form.amount} onChange={update} />
          </label>
          <label className="field full">
            <span>Mit Aufgabe verknüpfen</span>
            <select name="taskId" value={form.taskId || ""} onChange={update}>
              <option value="">Keine Aufgabe verknüpft</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>{task.key} · {task.title}</option>
              ))}
            </select>
          </label>
          <label className="field full">
            <span>Notiz</span>
            <textarea rows="3" name="note" value={form.note} onChange={update} />
          </label>
          <div className="modal-actions full">
            <button type="button" className="button secondary" onClick={onClose}>Abbrechen</button>
            <button className="button primary">Speichern</button>
          </div>
        </form>
      </section>
    </div>
  );
}
