async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const problem = await res.json();
      if (problem.errors)
        message = Object.values(problem.errors).flat().join(" ");
    } catch {
      /* response had no JSON body */
    }
    throw new Error(message);
  }
  return res.status === 204 ? null : res.json();
}

export const getApplications = () => request("/api/applications");
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
