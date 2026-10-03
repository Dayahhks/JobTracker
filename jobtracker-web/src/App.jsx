import { useEffect, useState } from "react";
import { setUnauthorizedHandler } from "./api";
import { loadSession, saveSession, clearSession } from "./auth";
import AuthPage from "./AuthPage";
import Tracker from "./Tracker";
import Dashboard from "./Dashboard";

export default function App() {
  const [session, setSession] = useState(loadSession);
  const [view, setView] = useState("tracker");

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

  return (
    <>
      <nav className="tabs" aria-label="Pages">
        <button
          className={view === "tracker" ? "active" : ""}
          onClick={() => setView("tracker")}
        >
          Applications
        </button>
        <button
          className={view === "dashboard" ? "active" : ""}
          onClick={() => setView("dashboard")}
        >
          Dashboard
        </button>
      </nav>
      {view === "tracker" ? (
        <Tracker email={session.email} onLogout={logout} />
      ) : (
        <Dashboard />
      )}
    </>
  );
}
