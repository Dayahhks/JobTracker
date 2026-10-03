import { getToken, clearSession } from "./auth";

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

async function request(url, options = {}) {
  const { auth = true, ...fetchOptions } = options;
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...fetchOptions, headers });

  // Token expired or invalid: clear it and send the user back to the login page
  if (res.status === 401 && auth) {
    clearSession();
    onUnauthorized();
    throw new Error("Your session has expired. Please log in again.");
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const problem = await res.json();
      if (problem.errors)
        message = Object.values(problem.errors).flat().join(" ");
      else if (problem.title) message = problem.title;
    } catch {
      /* response had no JSON body */
    }
    throw new Error(message);
  }
  return res.status === 204 ? null : res.json();
}

// Auth (no token needed)
export const register = (email, password) =>
  request("/api/auth/register", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password }),
  });
export const login = (email, password) =>
  request("/api/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password }),
  });

// Applications
export const getApplications = (params) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value != null) q.set(key, value);
  });
  return request(`/api/applications?${q}`);
};
export const createApplication = (data) =>
  request("/api/applications", { method: "POST", body: JSON.stringify(data) });
export const updateApplication = (id, data) =>
  request(`/api/applications/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const updateStage = (id, stage) =>
  request(`/api/applications/${id}/stage`, {
    method: "PATCH",
    body: JSON.stringify({ stage }),
  });
export const deleteApplication = (id) =>
  request(`/api/applications/${id}`, { method: "DELETE" });
export const getDashboard = () => request("/api/dashboard");
