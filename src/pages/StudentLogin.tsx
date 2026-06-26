import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CSSProperties, KeyboardEvent } from "react";

type EnrollmentStatus = "Enrolled" | "Course Completed" | "Certificate Issued";

type Enrollment = {
  id: number;
  courseId: number;
  courseTitle: string;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  enrolledAt: string;
  status: EnrollmentStatus;
};

const activeStatuses: EnrollmentStatus[] = [
  "Enrolled",
  "Course Completed",
  "Certificate Issued",
];

function getValidIndianPhone(phone: string) {
  let cleaned = phone.replace(/[\s\-()]/g, "");

  if (cleaned.startsWith("+91")) cleaned = cleaned.slice(3);
  else if (cleaned.startsWith("91") && cleaned.length === 12) cleaned = cleaned.slice(2);
  else if (cleaned.startsWith("0") && cleaned.length === 11) cleaned = cleaned.slice(1);

  if (/^[6-9]\d{9}$/.test(cleaned)) return cleaned;
  return null;
}

export default function StudentLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const loginStudent = () => {
    const cleanedEmail = email.trim().toLowerCase();
    const cleanedPhone = getValidIndianPhone(phone);

    if (!cleanedEmail || !cleanedPhone) {
      setError("Please enter the registered email and a valid Indian mobile number.");
      return;
    }

    const saved = localStorage.getItem("terramatrix_enrollments");
    const enrollments: Enrollment[] = saved ? JSON.parse(saved) : [];

    const matching = enrollments.filter(
      (enrollment) =>
        enrollment.email.toLowerCase() === cleanedEmail &&
        enrollment.phone === cleanedPhone &&
        activeStatuses.includes(enrollment.status)
    );

    if (matching.length === 0) {
      setError(
        "No enrolled course was found for this email and phone. Please check whether payment was completed and admin has enrolled you."
      );
      return;
    }

    const loginData = JSON.stringify({
      email: cleanedEmail,
      phone: cleanedPhone,
    });

    localStorage.setItem("terramatrix_student_login", loginData);
    sessionStorage.setItem("terramatrix_student_login", loginData);

    navigate("/student-portal");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") loginStudent();
  };

  return (
    <main style={page}>
      <section style={loginCard}>
        <div style={eyebrow}>REGISTERED STUDENT ACCESS</div>
        <h1 style={title}>Student Login</h1>

        <p style={text}>
          Login after payment is completed and the admin enrolls you into a
          course. Your dashboard will show all courses registered under this
          email and phone number.
        </p>

        <label style={fieldBlock}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            onKeyDown={onKeyDown}
            style={inputStyle}
            placeholder="email@example.com"
          />
        </label>

        <label style={fieldBlock}>
          <span>Phone</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setError("");
            }}
            onKeyDown={onKeyDown}
            style={inputStyle}
            placeholder="10-digit mobile number"
          />
        </label>

        {error && <div style={errorText}>{error}</div>}

        <button onClick={loginStudent} style={loginButton}>
          Login to My Dashboard
        </button>
      </section>
    </main>
  );
}

const page: CSSProperties = {
  minHeight: "calc(100vh - 90px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "54px 24px",
};

const loginCard: CSSProperties = {
  width: "100%",
  maxWidth: "540px",
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "24px",
  padding: "38px",
  boxShadow: "0 24px 70px rgba(23,63,53,0.10)",
  textAlign: "left",
};

const eyebrow: CSSProperties = {
  color: "#8A661E",
  fontSize: "14px",
  fontWeight: 900,
  letterSpacing: "1.6px",
  marginBottom: "14px",
};

const title: CSSProperties = {
  color: "#173F35",
  fontSize: "38px",
  lineHeight: "1.15",
  margin: "0 0 12px",
};

const text: CSSProperties = {
  color: "#53665E",
  fontSize: "17px",
  lineHeight: "1.7",
  margin: "0 0 26px",
};

const fieldBlock: CSSProperties = {
  display: "grid",
  gap: "8px",
  color: "#35584D",
  fontSize: "14px",
  fontWeight: 800,
  marginBottom: "14px",
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px 15px",
  borderRadius: "12px",
  border: "1px solid #D8D2C3",
  fontSize: "16px",
  outline: "none",
  background: "#FFFFFF",
};

const errorText: CSSProperties = {
  background: "#FFF1F1",
  border: "1px solid #F4C7C7",
  color: "#9B1C1C",
  padding: "10px 12px",
  borderRadius: "10px",
  fontWeight: 800,
  marginBottom: "14px",
};

const loginButton: CSSProperties = {
  width: "100%",
  background: "#173F35",
  color: "#FFFFFF",
  border: "none",
  padding: "14px 18px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: "16px",
};
