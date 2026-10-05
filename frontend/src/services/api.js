const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`API-Fehler: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
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
    })
};
