import { useEffect, useState } from "react";

const blank = { name: "", description: "", startDate: "", endDate: "", startTime: "", endTime: "", location: "", image: "", teamIds: [], individualIds: [] };

export default function EventModal({ open, event, teams, people, onClose, onSave }) {
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(event ? { ...blank, ...event, startDate: event.startDate || event.date || "" } : blank);
      setError("");
    }
  }, [open, event]);

  if (!open) return null;
  const update = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  const toggle = (field, id) => setForm((current) => ({ ...current, [field]: (current[field] || []).includes(id) ? current[field].filter((item) => item !== id) : [...(current[field] || []), id] }));

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.startDate || saving) return;
    setSaving(true);
    setError("");
    try {
      await onSave({ ...form, name: form.name.trim() });
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return <div className="modal-backdrop"><section className="modal modal-wide"><div className="modal-header"><div><span className="eyebrow">Eventverwaltung</span><h2>{event ? "Event bearbeiten" : "Event erstellen"}</h2></div><button className="icon-button" type="button" onClick={onClose} disabled={saving}>×</button></div>
    <form className="form-grid" onSubmit={submit}>
      {error ? <div className="form-error full">{error}</div> : null}
      <label className="field full"><span>Name *</span><input name="name" value={form.name} onChange={update} placeholder="z. B. Sommerfest 2026" disabled={saving} /></label>
      <label className="field full"><span>Beschreibung</span><textarea name="description" value={form.description} onChange={update} rows="4" disabled={saving} /></label>
      <label className="field"><span>Startdatum *</span><input type="date" name="startDate" value={form.startDate} onChange={update} disabled={saving} /></label>
      <label className="field"><span>Enddatum</span><input type="date" name="endDate" value={form.endDate} onChange={update} disabled={saving} /></label>
      <label className="field"><span>Startzeit</span><input type="time" name="startTime" value={form.startTime} onChange={update} disabled={saving} /></label>
      <label className="field"><span>Endzeit</span><input type="time" name="endTime" value={form.endTime} onChange={update} disabled={saving} /></label>
      <label className="field full"><span>Ort / Location</span><input name="location" value={form.location} onChange={update} disabled={saving} /></label>
      <fieldset className="field full checkbox-field"><legend>Teams zuweisen</legend>{teams.length ? teams.map((team) => <label key={team.id}><input type="checkbox" checked={(form.teamIds || []).includes(team.id)} onChange={() => toggle("teamIds", team.id)} disabled={saving} /><span>{team.name}</span></label>) : <small>Noch keine Teams vorhanden.</small>}</fieldset>
      <fieldset className="field full checkbox-field"><legend>Einzelne Personen zuweisen</legend>{people.length ? people.map((person) => <label key={person.id}><input type="checkbox" checked={(form.individualIds || []).includes(person.id)} onChange={() => toggle("individualIds", person.id)} disabled={saving} /><span>{person.name}</span></label>) : <small>Noch keine Personen vorhanden.</small>}</fieldset>
      <div className="modal-actions full"><button className="button secondary" type="button" onClick={onClose} disabled={saving}>Abbrechen</button><button className="button primary" disabled={saving}>{saving ? "Speichern …" : "Speichern"}</button></div>
    </form>
  </section></div>;
}
