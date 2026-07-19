import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Mail, Phone, UserRound } from "lucide-react";
import logo from "../assets/terramatrix-logo.png";
import { loadInstructors } from "../lib/catalogData";

function validPhone(phone: string) {
  let clean = phone.replace(/[\s\-()]/g, "");
  if (clean.startsWith("+91")) clean = clean.slice(3); else if (clean.startsWith("91") && clean.length === 12) clean = clean.slice(2); else if (clean.startsWith("0") && clean.length === 11) clean = clean.slice(1);
  return /^[6-9]\d{9}$/.test(clean) ? clean : null;
}

export default function InstructorLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); const [phone, setPhone] = useState(""); const [error, setError] = useState("");
  const login = () => {
    const cleanEmail = email.trim().toLowerCase(); const cleanPhone = validPhone(phone);
    if (!cleanEmail || !cleanPhone) { setError("Enter the instructor email and valid mobile number."); return; }
    const instructor = loadInstructors().find((item) => item.email.trim().toLowerCase() === cleanEmail && validPhone(item.phone) === cleanPhone);
    if (!instructor) { setError("No matching instructor profile was found. Ask the admin to check your faculty record."); return; }
    const data = JSON.stringify({ id: instructor.id, email: cleanEmail, phone: cleanPhone, name: instructor.name });
    localStorage.setItem("terramatrix_instructor_login", data); sessionStorage.setItem("terramatrix_instructor_login", data); navigate("/instructor-portal");
  };
  return (
    <main className="tm3-auth-page">
      <section className="tm3-auth-shell">
        <div className="tm3-auth-story">
          <div><img src={logo} alt="" /><h1>Teach, guide and manage learning with confidence.</h1><p>Access assigned courses, class schedules, announcements, resources, learners, submissions and analytics.</p></div>
          <div className="tm3-auth-story__quote">Course workspace · Classroom stream · People · Grades · Learning analytics</div>
        </div>
        <div className="tm3-auth-form">
          <div className="tm3-eyebrow tm3-eyebrow--gold">Instructor access</div>
          <h2>Open your teaching workspace</h2>
          <p>Use the email and mobile number stored in your instructor profile.</p>
          <label className="tm3-field">Instructor email<span style={{ position: "relative" }}><Mail size={18} style={{ position: "absolute", left: 14, top: 15, color: "var(--tm3-subtle)" }} /><input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} style={{ paddingLeft: 43 }} /></span></label>
          <label className="tm3-field">Instructor phone<span style={{ position: "relative" }}><Phone size={18} style={{ position: "absolute", left: 14, top: 15, color: "var(--tm3-subtle)" }} /><input value={phone} onChange={(event) => { setPhone(event.target.value); setError(""); }} onKeyDown={(event) => { if (event.key === "Enter") login(); }} style={{ paddingLeft: 43 }} /></span></label>
          {error && <div className="tm3-error" style={{ padding: 12, borderRadius: 12, background: "var(--tm3-danger-soft)" }}>{error}</div>}
          <button className="tm3-button tm3-button--dark" type="button" onClick={login}><UserRound size={18} /> Open Instructor Workspace <ArrowRight size={17} /></button>
          <div className="tm3-auth-note">Instructor access is limited to courses linked to the faculty profile.</div>
        </div>
      </section>
    </main>
  );
}
