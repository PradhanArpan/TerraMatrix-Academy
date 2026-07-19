import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, GraduationCap, Mail, Phone } from "lucide-react";
import logo from "../assets/terramatrix-logo.png";

type EnrollmentStatus = "Enrolled" | "Course Completed" | "Certificate Issued";
type Enrollment = { id: number; courseId: number; courseTitle: string; name: string; email: string; phone: string; organisation: string; enrolledAt: string; status: EnrollmentStatus };
const activeStatuses: EnrollmentStatus[] = ["Enrolled", "Course Completed", "Certificate Issued"];

function validPhone(phone: string) {
  let clean = phone.replace(/[\s\-()]/g, "");
  if (clean.startsWith("+91")) clean = clean.slice(3); else if (clean.startsWith("91") && clean.length === 12) clean = clean.slice(2); else if (clean.startsWith("0") && clean.length === 11) clean = clean.slice(1);
  return /^[6-9]\d{9}$/.test(clean) ? clean : null;
}

export default function StudentLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const login = () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = validPhone(phone);
    if (!cleanEmail || !cleanPhone) { setError("Enter the registered email and a valid Indian mobile number."); return; }
    const enrollments: Enrollment[] = JSON.parse(localStorage.getItem("terramatrix_enrollments") || "[]");
    const matching = enrollments.filter((item) => item.email.toLowerCase() === cleanEmail && item.phone === cleanPhone && activeStatuses.includes(item.status));
    if (!matching.length) { setError("No active enrolment was found. Confirm that payment was completed and the academy enrolled you."); return; }
    const loginData = JSON.stringify({ email: cleanEmail, phone: cleanPhone });
    localStorage.setItem("terramatrix_student_login", loginData); sessionStorage.setItem("terramatrix_student_login", loginData); navigate("/student-portal");
  };

  return (
    <main className="tm3-auth-page">
      <section className="tm3-auth-shell">
        <div className="tm3-auth-story">
          <div><img src={logo} alt="" /><h1>Your learning, organised around progress.</h1><p>Access enrolled programmes, live classes, resources, assignments, recordings and certificates from one learner workspace.</p></div>
          <div className="tm3-auth-story__quote">My Learning · Live agenda · Classroom resources · Progress and completion</div>
        </div>
        <div className="tm3-auth-form">
          <div className="tm3-eyebrow tm3-eyebrow--gold">Learner access</div>
          <h2>Continue your learning journey</h2>
          <p>Use the email and mobile number registered with your enrolment.</p>
          <label className="tm3-field">Registered email<span style={{ position: "relative" }}><Mail size={18} style={{ position: "absolute", left: 14, top: 15, color: "var(--tm3-subtle)" }} /><input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} style={{ paddingLeft: 43 }} placeholder="name@example.com" /></span></label>
          <label className="tm3-field">Registered phone<span style={{ position: "relative" }}><Phone size={18} style={{ position: "absolute", left: 14, top: 15, color: "var(--tm3-subtle)" }} /><input value={phone} onChange={(event) => { setPhone(event.target.value); setError(""); }} onKeyDown={(event) => { if (event.key === "Enter") login(); }} style={{ paddingLeft: 43 }} placeholder="10-digit mobile number" /></span></label>
          {error && <div className="tm3-error" style={{ padding: 12, borderRadius: 12, background: "var(--tm3-danger-soft)" }}>{error}</div>}
          <button className="tm3-button tm3-button--dark" type="button" onClick={login}><GraduationCap size={18} /> Open My Learning <ArrowRight size={17} /></button>
          <div className="tm3-auth-note">Access becomes active after the academy confirms payment and enrolment.</div>
        </div>
      </section>
    </main>
  );
}
