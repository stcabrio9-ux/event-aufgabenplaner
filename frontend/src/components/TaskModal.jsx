import { useEffect, useState } from "react";

const blank = { title: "", description: "", status: "Offen", priority: "Mittel", dueDate: "", assigneeId: "" };

export default function TaskModal({ open, task, eventId, people, onClose, onSave }) {
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (open) { setForm(task ? { ...blank, ...task, assigneeId: task.assigneeId || task.owner || "" } : blank); setError(""); } }, [open, task]);
  if (!open) return null;
  const update = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || saving) return;
    setSaving(true);
    setError("");
    try { await onSave({ ...form, id: task?.id, eventId, key: task?.key, title: form.title.trim() }); onClose(); }
    catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }
  return <div className="modal-backdrop"><section className="modal"><div className="modal-header"><div><span className="eyebrow">Aufgabenverwaltung</span><h2>{task ? `Aufgabe ${task.key || ""} bearbeiten` : "Neue Aufgabe"}</h2></div><button className="icon-button" type="button" onClick={onClose} disabled={saving}>×</button></div><form className="form-grid" onSubmit={submit}>
    {error ? <div className="form-error full">{error}</div> : null}
    <label className="field full"><span>Titel</span><input name="title" value={form.title} onChange={update} disabled={saving} /></label>
    <label className="field full"><span>Beschreibung</span><textarea name="description" rows="3" value={form.description} onChange={update} disabled={saving} /></label>
    <label className="field"><span>Status</span><select name="status" value={form.status} onChange={update} disabled={saving}><option>Offen</option><option>In Bearbeitung</option><option>Erledigt</option></select></label>
    <label className="field"><span>Priorität</span><select name="priority" value={form.priority} onChange={update} disabled={saving}><option>Niedrig</option><option>Mittel</option><option>Hoch</option></select></label>
    <label className="field"><span>Frist</span><input type="date" name="dueDate" value={form.dueDate || ""} onChange={update} disabled={saving} /></label>
    <label className="field"><span>Verantwortlich</span><select name="assigneeId" value={form.assigneeId} onChange={update} disabled={saving}><option value="">Nicht zugewiesen</option>{people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label>
    <div className="modal-actions full"><button type="button" className="button secondary" onClick={onClose} disabled={saving}>Abbrechen</button><button className="button primary" disabled={saving}>{saving ? "Speichern …" : "Speichern"}</button></div>
  </form></section></div>;
}
