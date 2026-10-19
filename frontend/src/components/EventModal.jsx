import { useEffect, useState } from "react";

const blank={name:"",description:"",startDate:"",endDate:"",startTime:"",endTime:"",location:"",image:"",teamIds:[],individualIds:[]};
export default function EventModal({open,event,teams,people,onClose,onSave}) {
  const [form,setForm]=useState(blank);
  useEffect(()=>{if(open)setForm(event?{...blank,...event}:blank)},[open,event]);
  if(!open)return null;
  const update=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  const toggle=(field,id)=>setForm(f=>({...f,[field]:(f[field]||[]).includes(id)?f[field].filter(x=>x!==id):[...(f[field]||[]),id]}));
  const fileChange=e=>{const file=e.target.files?.[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>setForm(f=>({...f,image:reader.result})); reader.readAsDataURL(file)};
  const submit=e=>{e.preventDefault(); if(!form.name.trim()||!form.startDate)return; onSave({...form,name:form.name.trim()}); onClose()};
  return <div className="modal-backdrop"><section className="modal modal-wide"><div className="modal-header"><div><span className="eyebrow">Eventverwaltung</span><h2>{event?"Event bearbeiten":"Event erstellen"}</h2></div><button className="icon-button" onClick={onClose}>×</button></div>
    <form className="form-grid" onSubmit={submit}>
      <label className="field full"><span>Name *</span><input name="name" value={form.name} onChange={update} placeholder="z. B. Sommerfest 2026" /></label>
      <label className="field full"><span>Beschreibung</span><textarea name="description" value={form.description} onChange={update} rows="4" placeholder="Worum geht es bei diesem Event?" /></label>
      <label className="field"><span>Startdatum *</span><input type="date" name="startDate" value={form.startDate} onChange={update}/></label>
      <label className="field"><span>Enddatum</span><input type="date" name="endDate" value={form.endDate} onChange={update}/></label>
      <label className="field"><span>Startzeit</span><input type="time" name="startTime" value={form.startTime} onChange={update}/></label>
      <label className="field"><span>Endzeit</span><input type="time" name="endTime" value={form.endTime} onChange={update}/></label>
      <label className="field full"><span>Ort / Location</span><input name="location" value={form.location} onChange={update} placeholder="Adresse oder Veranstaltungsort" /></label>
      <label className="field full"><span>Eventfoto</span><input type="file" accept="image/*" onChange={fileChange}/>{form.image?<img className="form-image-preview" src={form.image} alt="Vorschau"/>:null}</label>
      <fieldset className="field full checkbox-field"><legend>Teams zuweisen</legend>{teams.length?teams.map(t=><label key={t.id}><input type="checkbox" checked={(form.teamIds||[]).includes(t.id)} onChange={()=>toggle("teamIds",t.id)}/><span>{t.name}</span></label>):<small>Noch keine Teams vorhanden.</small>}</fieldset>
      <fieldset className="field full checkbox-field"><legend>Einzelne Personen zuweisen</legend>{people.length?people.map(p=><label key={p.id}><input type="checkbox" checked={(form.individualIds||[]).includes(p.id)} onChange={()=>toggle("individualIds",p.id)}/><span>{p.name} · {p.email}</span></label>):<small>Noch keine Personen vorhanden.</small>}</fieldset>
      <div className="modal-actions full"><button className="button secondary" type="button" onClick={onClose}>Abbrechen</button><button className="button primary">Speichern</button></div>
    </form>
  </section></div>
}
