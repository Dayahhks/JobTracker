const KEY = "jobtracker.session";

export function loadSession() {
  try {
    const session = JSON.parse(localStorage.getItem(KEY));
    if (session && new Date(session.expiresAt) > new Date()) return session;
  } catch {
    /* nothing valid stored */
  }
  localStorage.removeItem(KEY);
  return null;
}

export const saveSession = (session) =>
  localStorage.setItem(KEY, JSON.stringify(session));
export const clearSession = () => localStorage.removeItem(KEY);
export const getToken = () => loadSession()?.token;
