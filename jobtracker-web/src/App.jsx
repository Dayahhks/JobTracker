import { useEffect, useState } from "react";
import { setUnauthorizedHandler } from "./api";
import { loadSession, saveSession, clearSession } from "./auth";
import AuthPage from "./AuthPage";
import Tracker from "./Tracker";

export default function App() {
  const [session, setSession] = useState(loadSession);

  // If any API call returns 401 later, drop back to the login page
  useEffect(() => {
    setUnauthorizedHandler(() => setSession(null));
  }, []);

  const login = (s) => {
    saveSession(s);
    setSession(s);
  };
  const logout = () => {
    clearSession();
    setSession(null);
  };

  if (!session) return <AuthPage onLogin={login} />;
  return <Tracker email={session.email} onLogout={logout} />;
}
