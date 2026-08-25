const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  try {
    const response = await fetch(`${API_URL}${cleanEndpoint}`, {
      ...options,
      headers,
    });

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (err) {
    // If backend is offline or network fails, forward error cleanly
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error("Unable to connect to HealthSaathi backend. Please verify server status.");
    }
    throw err;
  }
}

export const api = {
  get: (endpoint) =>
    apiRequest(endpoint, {
      method: "GET",
    }),

  post: (endpoint, body) =>
    apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: (endpoint, body) =>
    apiRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (endpoint) =>
    apiRequest(endpoint, {
      method: "DELETE",
    }),
};

export default api;