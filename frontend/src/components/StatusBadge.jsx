function cls(v){return String(v).toLowerCase().replaceAll(" ","-").replaceAll("ä","ae").replaceAll("ö","oe").replaceAll("ü","ue");}
export default function StatusBadge({children,type="status"}){return <span className={`badge ${type}-${cls(children)}`}>{children}</span>}
