export default function PageHeader({ eyebrow, title, meta, action }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {meta ? <div className="page-meta">{meta}</div> : null}
      </div>
      {action}
    </header>
  );
}
