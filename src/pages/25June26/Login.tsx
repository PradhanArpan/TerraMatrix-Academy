import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for the login link.");
    }
  };

  return (
    <div
      style={{
        padding: "80px",
        textAlign: "center",
      }}
    >
      <h1>TerraMatrix Academy Login</h1>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: "12px",
          width: "300px",
          marginBottom: "20px",
          borderRadius: "10px",
          border: "1px solid #ccc",
        }}
      />

      <br />

      <button
        onClick={handleLogin}
        style={{
          background: "#6D83F2",
          color: "white",
          border: "none",
          padding: "15px 30px",
          borderRadius: "12px",
          cursor: "pointer",
        }}
      >
        Login with Email
      </button>
    </div>
  );
}