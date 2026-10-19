import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppData } from "../state/AppDataContext";

export default function AuthPage() {
  const { login } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = location.state?.from || "/";

  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate(returnTo, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return <div className="auth-page"><div className="auth-card">
    <button type="button" className="text-button auth-back" onClick={() => navigate("/")}>← Zurück zur Startseite</button>
    <div className="brand auth-brand"><div className="brand-mark">EP</div><div><strong>Event-Aufgabenplaner</strong><span>Planen. Zuweisen. Gemeinsam umsetzen.</span></div></div>
    <h1>Anmelden</h1><p>Melde dich mit deinem Benutzerkonto an.</p>
    {returnTo !== "/" ? <div className="login-hint">Melde dich an, um fortzufahren.</div> : null}
    {error ? <div className="form-error">{error}</div> : null}
    <form onSubmit={submit} className="auth-form">
      <label className="field"><span>E-Mail</span><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required disabled={loading} /></label>
      <label className="field"><span>Passwort</span><input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required disabled={loading} /></label>
      <button className="button primary auth-submit" disabled={loading}>{loading ? "Anmeldung …" : "Anmelden"}</button>
    </form>
    <small className="auth-note">Der Prototyp verwendet eine serverseitige Anmeldung. Konten werden ausschließlich über die Backend-Konfiguration angelegt.</small>
  </div></div>;
}
