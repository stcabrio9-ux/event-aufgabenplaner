import { useState } from "react";
import { useAppData } from "../state/AppDataContext";

export default function CommentCard() {
  const { comments, addComment } = useAppData();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  async function submit(event) {
    event.preventDefault();
    const text = value.trim();
    if (saving || !text) return;
    setSaving(true);
    setSubmitError(null);
    try {
      await addComment(text);
      setValue("");
    } catch (requestError) {
      setSubmitError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card comment-card">
      <h2>Kommentare</h2>

      {comments.length ? (
        <div className="comment-list">
          {comments.map((comment) => (
            <article className="comment" key={comment.id}>
              <div className="avatar small">{comment.initials}</div>
              <div>
                <strong>{comment.author}</strong>
                <p>{comment.text}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="subtle-text">Noch keine Kommentare vorhanden.</p>
      )}

      <form className="comment-form" onSubmit={submit}>
        <input
          aria-label="Kommentar"
          placeholder="Kommentar schreiben ..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={saving}
        />
        <button className="button secondary" type="submit" disabled={saving}>{saving ? "Senden …" : "Senden"}</button>
      </form>
      {submitError ? <p role="alert">{submitError}</p> : null}
    </section>
  );
}
