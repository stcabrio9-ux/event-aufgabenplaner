import { useState } from "react";

export default function MemberModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "",
    projectRole: "",
    accessRole: "Betrachter"
  });

  if (!open) return null;

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.name.trim()) return;

    onCreate({
      ...form,
      name: form.name.trim(),
      projectRole: form.projectRole.trim()
    });

    setForm({ name: "", projectRole: "", accessRole: "Betrachter" });
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <section className="modal">
        <div className="modal-header">
          <div>
            <span className="eyebrow">Mitglieder</span>
            <h2>Mitglied hinzufügen</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>×</button>
        </div>

        <form className="form-grid" onSubmit={submit}>
          <label className="field full">
            <span>Name</span>
            <input name="name" value={form.name} onChange={update} placeholder="Vor- und Nachname" autoFocus />
          </label>

          <label className="field">
            <span>Projektrolle</span>
            <input name="projectRole" value={form.projectRole} onChange={update} placeholder="z. B. Frontend" />
          </label>

          <label className="field">
            <span>Zugriffsrolle</span>
            <select name="accessRole" value={form.accessRole} onChange={update}>
              <option>Betrachter</option>
              <option>Bearbeiter</option>
              <option>Administrator</option>
            </select>
          </label>

          <div className="modal-actions full">
            <button className="button secondary" type="button" onClick={onClose}>Abbrechen</button>
            <button className="button primary" type="submit">Hinzufügen</button>
          </div>
        </form>
      </section>
    </div>
  );
}
