import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAppData } from "../state/AppDataContext";
import { initials } from "../utils/format";

export default function Topbar() {
  const { currentUser, notifications, logout, markNotificationsRead } = useAppData();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const mine = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id)
    : [];
  const unread = mine.filter((n) => !n.read).length;

  function signOut() {
    logout();
    navigate("/");
  }

  return (
    <header className="topbar">
      <Link className="brand" to="/">
        <div className="brand-mark">EP</div>
        <div>
          <strong>Event-Aufgabenplaner</strong>
          <span>Planen. Zuweisen. Gemeinsam umsetzen.</span>
        </div>
      </Link>

      <div className="topbar-actions">
        {currentUser ? (
          <>
            <button
              className="notification-button"
              type="button"
              onClick={() => {
                setOpen((value) => !value);
                markNotificationsRead();
              }}
            >
              <span>Benachrichtigungen</span>
              {unread > 0 ? <b>{unread}</b> : null}
            </button>

            <Link to="/profile" className="user-link">
              <div className="avatar">{initials(currentUser.name)}</div>
              <span>{currentUser.name} · {currentUser.role === "admin" ? "Administrator" : "Benutzer"}</span>
            </Link>

            <button className="link-button" type="button" onClick={signOut}>
              Abmelden
            </button>
          </>
        ) : (
          <Link className="button primary button-link" to="/login">
            Anmelden
          </Link>
        )}
      </div>

      {currentUser && open ? (
        <div className="notification-panel">
          <div className="panel-title">Benachrichtigungen</div>
          {mine.length ? (
            mine.slice().reverse().slice(0, 6).map((notification) => (
              <Link
                key={notification.id}
                to={notification.link || "/profile"}
                onClick={() => setOpen(false)}
                className="notification-item"
              >
                {notification.text}
              </Link>
            ))
          ) : (
            <p>Keine Benachrichtigungen.</p>
          )}
        </div>
      ) : null}
    </header>
  );
}
