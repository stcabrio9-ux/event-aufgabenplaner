const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

async function request(path, options = {}) {
  const token = sessionStorage.getItem("event-planner-auth-token");
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {})
    },
    ...options
  });

  if (response.status === 204) {
    return null;
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // Leave payload empty for non-JSON responses.
  }

  if (!response.ok) {
    if (response.status === 401) {
      sessionStorage.removeItem("event-planner-auth-token");
      if (window.location.pathname !== "/login") window.location.assign("/login");
    }
    const error = new Error(
      payload?.error?.message ?? `API-Fehler: ${response.status}`
    );
    error.code = payload?.error?.code ?? "API_ERROR";
    error.status = response.status;
    throw error;
  }

  return payload;
}

export const api = {
  login: async (credentials) => {
    const result = await request("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
    sessionStorage.setItem("event-planner-auth-token", result.token);
    return result.user;
  },
  getCurrentUser: () => request("/auth/me"),
  logout: async () => {
    try { await request("/auth/logout", { method: "POST" }); }
    finally { sessionStorage.removeItem("event-planner-auth-token"); }
  },
  getEvents: () => request("/events"),
  getEvent: (id) => request(`/events/${id}`),
  createEvent: (payload) =>
    request("/events", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateEvent: (id, payload) =>
    request(`/events/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  deleteEvent: (id) => request(`/events/${id}`, { method: "DELETE" }),
  getTasks: (eventId) => request(`/events/${eventId}/tasks`),
  createTask: (eventId, payload) =>
    request(`/events/${eventId}/tasks`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateTask: (taskId, payload) =>
    request(`/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  deleteTask: (taskId) => request(`/tasks/${taskId}`, { method: "DELETE" }),
  getMembers: (eventId) => request(`/events/${eventId}/members`),
  createMember: (eventId, payload) =>
    request(`/events/${eventId}/members`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  deleteMember: (memberId) => request(`/members/${memberId}`, { method: "DELETE" }),
  getCosts: (eventId) => request(`/events/${eventId}/costs`),
  createCost: (eventId, payload) =>
    request(`/events/${eventId}/costs`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateCost: (costId, payload) =>
    request(`/costs/${costId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  deleteCost: (costId) => request(`/costs/${costId}`, { method: "DELETE" }),
  getComments: (eventId) => request(`/events/${eventId}/comments`),
  createComment: (eventId, payload) =>
    request(`/events/${eventId}/comments`, {
      method: "POST",
      body: JSON.stringify(payload)
    })
};
