const API_BASE_URL = "http://127.0.0.1:8000/api";

export default API_BASE_URL;
export { API_BASE_URL };
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("access");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
  }

  return response;
};

// Subscription APIs
export const subscribeToCoach = async (coachId, durationDays = 30) => {
  const response = await authFetch(`${API_BASE_URL}/subscriptions/subscribe/`, {
    method: 'POST',
    body: JSON.stringify({ coach_id: coachId, duration_days: durationDays }),
  });
  return response.json();
};

export const getSubscriptionStatus = async () => {
  const response = await authFetch(`${API_BASE_URL}/subscriptions/status/`);
  if (response.status === 404) return null;
  return response.json();
};

// Message APIs
export const getConversation = async (userId) => {
  const response = await authFetch(`${API_BASE_URL}/messages/conversation/${userId}/`);
  return response.json();
};

export const sendMessage = async (receiverId, content) => {
  const response = await authFetch(`${API_BASE_URL}/messages/send/`, {
    method: 'POST',
    body: JSON.stringify({ receiver_id: receiverId, content }),
  });
  return response.json();
};

// Appointment APIs
export const createAppointment = async (coachId, date, time, notes = '') => {
  const response = await authFetch(`${API_BASE_URL}/appointments/create/`, {
    method: 'POST',
    body: JSON.stringify({ coach_id: coachId, date, time, notes }),
  });
  return response.json();
};

export const getMyAppointments = async () => {
  const response = await authFetch(`${API_BASE_URL}/appointments/my/`);
  return response.json();
};

export const confirmAppointment = async (appointmentId) => {
  const response = await authFetch(`${API_BASE_URL}/appointments/${appointmentId}/confirm/`, {
    method: 'PATCH',
  });
  return response.json();
};

// Progress APIs
export const addProgress = async (programId, weight, notes = '') => {
  const response = await authFetch(`${API_BASE_URL}/progress/add/`, {
    method: 'POST',
    body: JSON.stringify({ program_id: programId, weight, notes }),
  });
  return response.json();
};

export const getMyProgress = async () => {
  const response = await authFetch(`${API_BASE_URL}/progress/my/`);
  return response.json();
};

// Profile APIs
export const getProfile = async () => {
  const response = await authFetch(`${API_BASE_URL}/users/profile/`);
  return response.json();
};

export const updateProfile = async (data) => {
  const response = await authFetch(`${API_BASE_URL}/users/profile/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
};
