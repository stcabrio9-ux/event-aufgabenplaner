import { useEffect, useState } from "react";
export default function TeamModal({open,team,people,onAddPerson,onClose,onSave}){
  const [name,setName]=useState(""); const [memberIds,setMemberIds]=useState([]); const [person,setPerson]=useState({name:"",email:""});
  useEffect(()=>{if(open){setName(team?.name||"");setMemberIds(team?.memberIds||[]) }},[open,team]);
  if(!open)return null;
  const toggle=id=>setMemberIds(ids=>ids.includes(id)?ids.filter(x=>x!==id):[...ids,id]);
  const addPerson=()=>{if(!person.name.trim()||!person.email.trim())return; const id=onAddPerson(person); setMemberIds(ids=>[...new Set([...ids,id])]); setPerson({name:"",email:""})};
  return <div className="modal-backdrop"><section className="modal"><div className="modal-header"><div><span className="eyebrow">Teamverwaltung</span><h2>{team?"Team bearbeiten":"Team erstellen"}</h2></div><button className="icon-button" onClick={onClose}>×</button></div><div className="form-grid">
    <label className="field full"><span>Teamname</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="z. B. Organisation"/></label>
    <div className="field full"><span>Mitglieder</span><div className="check-list">{people.map(p=><label key={p.id}><input type="checkbox" checked={memberIds.includes(p.id)} onChange={()=>toggle(p.id)}/>{p.name} <small>{p.email}</small></label>)}</div></div>
    <div className="field full"><span>Neue Person ohne Account</span><div className="inline-form"><input placeholder="Name" value={person.name} onChange={e=>setPerson({...person,name:e.target.value})}/><input type="email" placeholder="E-Mail" value={person.email} onChange={e=>setPerson({...person,email:e.target.value})}/><button type="button" className="button secondary" onClick={addPerson}>Hinzufügen</button></div></div>
    <div className="modal-actions full"><button className="button secondary" type="button" onClick={onClose}>Abbrechen</button><button className="button primary" type="button" onClick={()=>{if(name.trim()){onSave({...(team||{}),name:name.trim(),memberIds});onClose()}}}>Speichern</button></div>
  </div></section></div>
}
