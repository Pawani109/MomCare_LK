const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const token = localStorage.getItem('momcare_token');
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `API error: ${res.status}`);
  return data;
}

export const api = {
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/api/auth/me'),
  getAccess: () => request('/api/access'),
  getCareComments: () => request('/api/care-comments'),
  addCareComment: (data) => request('/api/care-comments', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => request('/api/profile'),
  getPregnancy: () => request('/api/pregnancy'),
  updatePregnancy: (data) => request('/api/pregnancy', { method: 'PUT', body: JSON.stringify(data) }),
  getPregnancyWeek: (week) => request(`/api/pregnancy/weeks/${week}`),
  getAppointments: () => request('/api/appointments'),
  addAppointment: (data) => request('/api/appointments', { method: 'POST', body: JSON.stringify(data) }),
  updateAppointment: (id, data) => request(`/api/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAppointment: (id) => request(`/api/appointments/${id}`, { method: 'DELETE' }),
  getReminders: () => request('/api/reminders'),
  addReminder: (data) => request('/api/reminders', { method: 'POST', body: JSON.stringify(data) }),
  toggleReminder: (id, done) => request(`/api/reminders/${id}`, { method: 'PATCH', body: JSON.stringify({ done }) }),
  getRecords: () => request('/api/records'),
  addRecord: (data) => request('/api/records', { method: 'POST', body: data }),
  updateRecord: (id, data) => request(`/api/records/${id}`, { method: 'PUT', body: data }),
  deleteRecord: (id) => request(`/api/records/${id}`, { method: 'DELETE' }),
  addRecordComment: (id, text) => request(`/api/records/${id}/comments`, { method: 'POST', body: JSON.stringify({ text }) }),
  getRecordFileUrl: (id) => `${API_BASE}/api/records/${id}/file`,
  getForum: () => request('/api/forum'),
  addPost: (data) => request('/api/forum', { method: 'POST', body: JSON.stringify(data) }),
  addForumReply: (id, text) => request(`/api/forum/${id}/replies`, { method: 'POST', body: JSON.stringify({ text }) }),
  deleteForumPost: (id) => request(`/api/forum/${id}`, { method: 'DELETE' }),
  deleteForumReply: (postId, replyId) => request(`/api/forum/${postId}/replies/${replyId}`, { method: 'DELETE' }),
  reportForumPost: (id, reason) => request(`/api/forum/${id}/report`, { method: 'POST', body: JSON.stringify({ reason }) }),
  logMood: (mood, note = '') => request('/api/mood', { method: 'POST', body: JSON.stringify({ mood, note }) }),
  getMoodHistory: () => request('/api/mood'),
  getEmergencyContacts: () => request('/api/emergency/contacts'),
  addEmergencyContact: (data) => request('/api/emergency/contacts', { method: 'POST', body: JSON.stringify(data) }),
  updateEmergencyContact: (id, data) => request(`/api/emergency/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEmergencyContact: (id) => request(`/api/emergency/contacts/${id}`, { method: 'DELETE' }),
  getSosHistory: () => request('/api/emergency/sos'),
  getNearbyPlaces: ({ lat, lng, radius = 5000, category = 'all' }) => request(`/api/places/nearby?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius=${encodeURIComponent(radius)}&category=${encodeURIComponent(category)}`),
  sendSos: (data) => request('/api/emergency/sos', { method: 'POST', body: JSON.stringify(data) }),
  askAssistant: (question) => request('/api/assistant', { method: 'POST', body: JSON.stringify({ question }) }),
};
