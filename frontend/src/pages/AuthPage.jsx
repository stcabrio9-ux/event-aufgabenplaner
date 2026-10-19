import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppData } from "../state/AppDataContext";

export default function AuthPage() {
  const { login, register } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const returnTo = location.state?.from || "/";

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      if (mode === "login") await login(form);
      else await register(form);
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button type="button" className="text-button auth-back" onClick={() => navigate("/")}>← Zurück zur Startseite</button>
        <div className="brand auth-brand">
          <div className="brand-mark">EP</div>
          <div><strong>Event-Aufgabenplaner</strong><span>Planen. Zuweisen. Gemeinsam umsetzen.</span></div>
        </div>
        <h1>{mode === "login" ? "Anmelden" : "Konto erstellen"}</h1>
        <p>{mode === "login" ? "Melde dich mit deiner E-Mail-Adresse an." : "Erstelle dein persönliches Konto."}</p>
        {returnTo !== "/" && mode === "login" ? <div className="login-hint">Melde dich an, um fortzufahren.</div> : null}
        {error ? <div className="form-error">{error}</div> : null}
        <form onSubmit={submit} className="auth-form">
          {mode === "register" ? (
            <label className="field"><span>Name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          ) : null}
          <label className="field"><span>E-Mail</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
          <label className="field"><span>Passwort</span><input type="password" minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
          <button className="button primary auth-submit">{mode === "login" ? "Anmelden" : "Registrieren"}</button>
        </form>
        <button className="text-button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
          {mode === "login" ? "Noch kein Konto? Registrieren" : "Bereits registriert? Anmelden"}
        </button>
        <small className="auth-note">Prototyp: Die lokale Anmeldung dient nur der Frontend-Demonstration. Für den Produktivbetrieb wird die Authentifizierung serverseitig umgesetzt.</small>
      </div>
    </div>
  );
}
