import { useEffect, useState } from "react";
const blank={title:"",description:"",status:"Offen",priority:"Mittel",dueDate:"",assigneeId:""};
export default function TaskModal({open,task,eventId,people,onClose,onSave}){
  const [form,setForm]=useState(blank); useEffect(()=>{if(open)setForm(task?{...blank,...task}:blank)},[open,task]); if(!open)return null;
  const u=e=>setForm(f=>({...f,[e.target.name]:e.target.value})); const submit=e=>{e.preventDefault();if(!form.title.trim())return;onSave({...form,id:task?.id,eventId,key:task?.key,title:form.title.trim()});onClose()};
  return <div className="modal-backdrop"><section className="modal"><div className="modal-header"><div><span className="eyebrow">Aufgabenverwaltung</span><h2>{task?`Aufgabe ${task.key} bearbeiten`:"Neue Aufgabe"}</h2></div><button className="icon-button" onClick={onClose}>×</button></div><form className="form-grid" onSubmit={submit}>
    <label className="field full"><span>Titel</span><input name="title" value={form.title} onChange={u}/></label>
    <label className="field full"><span>Beschreibung</span><textarea name="description" rows="3" value={form.description} onChange={u}/></label>
    <label className="field"><span>Status</span><select name="status" value={form.status} onChange={u}><option>Offen</option><option>In Bearbeitung</option><option>Erledigt</option></select></label>
    <label className="field"><span>Priorität</span><select name="priority" value={form.priority} onChange={u}><option>Niedrig</option><option>Mittel</option><option>Hoch</option></select></label>
    <label className="field"><span>Frist</span><input type="date" name="dueDate" value={form.dueDate} onChange={u}/></label>
    <label className="field"><span>Verantwortlich</span><select name="assigneeId" value={form.assigneeId} onChange={u}><option value="">Nicht zugewiesen</option>{people.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
    <div className="modal-actions full"><button type="button" className="button secondary" onClick={onClose}>Abbrechen</button><button className="button primary">Speichern</button></div>
  </form></section></div>
}
