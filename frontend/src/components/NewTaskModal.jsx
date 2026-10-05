import { useEffect, useState } from "react";

const initialForm = {
  title: "",
  owner: "",
  priority: "Mittel",
  dueDate: ""
};

export default function NewTaskModal({ open, members, onClose, onCreate }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (open) {
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

  function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) return;

    onCreate({
      ...form,
      title: form.title.trim(),
      status: "Offen"
    });
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <section className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <span className="eyebrow">Aufgabenverwaltung</span>
            <h2>Neue Aufgabe</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={submit} className="form-grid">
          <label className="field full">
            <span>Aufgabe</span>
            <input
              name="title"
              value={form.title}
              onChange={update}
              placeholder="z. B. Catering buchen"
              autoFocus
            />
          </label>

          <label className="field">
            <span>Verantwortlich</span>
            <select name="owner" value={form.owner} onChange={update}>
              <option value="">Nicht zugewiesen</option>
              {members.map((member) => (
                <option key={member.id} value={member.name}>{member.name}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Priorität</span>
            <select name="priority" value={form.priority} onChange={update}>
              <option>Niedrig</option>
              <option>Mittel</option>
              <option>Hoch</option>
            </select>
          </label>

          <label className="field full">
            <span>Frist</span>
            <input type="date" name="dueDate" value={form.dueDate} onChange={update} />
          </label>

          <div className="modal-actions full">
            <button className="button secondary" type="button" onClick={onClose}>Abbrechen</button>
            <button className="button primary" type="submit">Aufgabe erstellen</button>
          </div>
        </form>
      </section>
    </div>
  );
}
