import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CSSProperties } from "react";

const ADMIN_PASSWORD = "admin123";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("terramatrix_admin_login");

    if (isLoggedIn === "yes") {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("terramatrix_admin_login", "yes");
      navigate("/admin/dashboard");
      return;
    }

    setError("Incorrect password. Please try again.");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <main style={page}>
      <section style={loginCard}>
        <div style={eyebrow}>ADMIN ACCESS</div>

        <h1 style={title}>Admin Login</h1>

        <label style={fieldBlock}>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            style={inputStyle}
            placeholder="Enter admin password"
          />
        </label>

        {error && <div style={errorText}>{error}</div>}

        <button onClick={handleLogin} style={loginButton}>
          Login to Admin Panel
        </button>

        <div style={noteBox}>
          <strong>Current demo password:</strong>
          <span>admin123</span>
        </div>

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
  maxWidth: "520px",
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
  margin: "0 0 22px",
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

const noteBox: CSSProperties = {
  marginTop: "18px",
  background: "#FBFAF6",
  border: "1px solid #E8E1D2",
  borderRadius: "12px",
  padding: "13px",
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  color: "#173F35",
};

