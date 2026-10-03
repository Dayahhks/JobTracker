import { useState } from "react";
import * as api from "./api";

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isLogin = mode === "login";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (!isLogin) await api.register(email.trim(), password);
      const session = await api.login(email.trim(), password);
      onLogin({
        token: session.token,
        expiresAt: session.expiresAt,
        email: session.email,
      });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const switchMode = () => {
    setMode(isLogin ? "register" : "login");
    setError("");
  };

  return (
    <main className="authwrap">
      <h1>Job Application Tracker</h1>
      <form className="card form" onSubmit={submit}>
        <h2>{isLogin ? "Log in" : "Create account"}</h2>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password (8+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={isLogin ? undefined : 8}
          autoComplete={isLogin ? "current-password" : "new-password"}
        />
        <button type="submit" disabled={busy}>
          {busy ? "Please wait…" : isLogin ? "Log in" : "Register"}
        </button>
        <button type="button" className="secondary" onClick={switchMode}>
          {isLogin ? "Need an account? Register" : "Have an account? Log in"}
        </button>
      </form>
    </main>
  );
}
