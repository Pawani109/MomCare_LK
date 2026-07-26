const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const token = localStorage.getItem('momcare_token');
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `API error: ${res.status}`);
  return data;
}

export const api = {
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/api/auth/me'),
  getProfile: () => request('/api/profile'),
  getReminders: () => request('/api/reminders'),
  addReminder: (data) => request('/api/reminders', { method: 'POST', body: JSON.stringify(data) }),
  toggleReminder: (id, done) => request(`/api/reminders/${id}`, { method: 'PATCH', body: JSON.stringify({ done }) }),
  getRecords: () => request('/api/records'),
  addRecord: (data) => request('/api/records', { method: 'POST', body: JSON.stringify(data) }),
  getForum: () => request('/api/forum'),
  addPost: (data) => request('/api/forum', { method: 'POST', body: JSON.stringify(data) }),
  logMood: (mood) => request('/api/mood', { method: 'POST', body: JSON.stringify({ mood }) }),
  sendSos: (location) => request('/api/sos', { method: 'POST', body: JSON.stringify({ location }) }),
  askAssistant: (question) => request('/api/assistant', { method: 'POST', body: JSON.stringify({ question }) }),
};
