import { useState } from "react";
import { useAppData } from "../state/AppDataContext";

export default function CommentCard() {
  const { comments, addComment } = useAppData();
  const [value, setValue] = useState("");

  function submit(event) {
    event.preventDefault();
    const text = value.trim();
    if (!text) return;
    addComment(text);
    setValue("");
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
        />
        <button className="button secondary" type="submit">Senden</button>
      </form>
    </section>
  );
}
