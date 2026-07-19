import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import logo from "../assets/terramatrix-logo.png";
import { ADMIN_SESSION_KEY, createAdminSession, getAdminToken } from "../lib/appsScriptApi";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { if (getAdminToken()) navigate("/admin"); }, [navigate]);

  const login = async () => {
    if (!password.trim()) { setError("Please enter the admin password."); return; }
    setError(""); setSubmitting(true);
    try {
      const session = await createAdminSession(password);
      sessionStorage.setItem(ADMIN_SESSION_KEY, session.token);
      sessionStorage.setItem("terramatrix_admin_login", "yes");
      navigate("/admin");
    } catch (serverError) {
      setError(serverError instanceof Error ? serverError.message : "Unable to verify the password.");
    } finally { setSubmitting(false); }
  };

  return (
    <main className="tm3-auth-page">
      <section className="tm3-auth-shell">
        <div className="tm3-auth-story">
          <div><img src={logo} alt="" /><h1>Academy operations, with clarity.</h1><p>Manage programmes, faculty, registrations, enrolments and learning operations from one shared workspace.</p></div>
          <div className="tm3-auth-story__quote">Secure server-side verification · Shared Google Sheets data · Role-controlled administration</div>
        </div>
        <div className="tm3-auth-form">
          <Link to="/" className="tm3-auth-back"><ArrowLeft size={16} /> Back to Academy</Link>
          <div className="tm3-eyebrow tm3-eyebrow--gold">Administrator access</div>
          <h2>Open the admin workspace</h2>
          <p>Enter the password configured for this Apps Script project.</p>
          <label className="tm3-field">Admin password
            <span style={{ position: "relative", display: "block" }}><KeyRound size={18} style={{ position: "absolute", left: 14, top: 15, color: "var(--tm3-subtle)" }} /><input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} onKeyDown={(event) => { if (event.key === "Enter" && !submitting) void login(); }} autoFocus style={{ paddingLeft: 43 }} placeholder="Enter password" /></span>
          </label>
          {error && <div className="tm3-error" style={{ padding: 12, borderRadius: 12, background: "var(--tm3-danger-soft)" }}>{error}</div>}
          <button className="tm3-button tm3-button--dark" type="button" onClick={() => void login()} disabled={submitting}><ShieldCheck size={18} /> {submitting ? "Verifying…" : "Enter workspace"}<ArrowRight size={17} /></button>
          <div className="tm3-auth-note"><strong>Protected session.</strong> The password is verified on the Apps Script server and is not stored in this page.</div>
        </div>
      </section>
    </main>
  );
}
