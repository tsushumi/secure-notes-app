import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api');

const api = axios.create({
  baseURL,
  withCredentials: true, // send the httpOnly auth cookie
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // required by the server's CSRF guard
  },
});

// A 401 from a note endpoint means the session expired. (401s from /auth/* are normal
// responses, like "wrong password", and must not trigger a reload.)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.startsWith('/auth/')) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const notesAPI = {
  getAll: (params, signal) => api.get('/notes', { params, signal }),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
  togglePin: (id) => api.patch(`/notes/${id}/pin`),
  toggleShare: (id) => api.patch(`/notes/${id}/share`),
};

export const publicAPI = {
  getNote: (shareId) => api.get(`/public/notes/${shareId}`),
};

export default api;
