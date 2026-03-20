import axios from 'axios';

const api = axios.create({
  baseURL: '/api/admin',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
};

export const adminApi = {
  getStats: () => api.get('/stats'),
  getUsers: (page = 1, limit = 20, search?: string) =>
    api.get('/users', { params: { page, limit, search } }),
  getUser: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  toggleUserStatus: (id: string) => api.post(`/users/${id}/toggle-status`),
  
  getMatches: (page = 1, limit = 20) => api.get('/matches', { params: { page, limit } }),
  deleteMatch: (id: string) => api.delete(`/matches/${id}`),
  
  getReports: (page = 1, limit = 20, status?: string) =>
    api.get('/reports', { params: { page, limit, status } }),
  resolveReport: (id: string, action: string) => api.put(`/reports/${id}/resolve`, { action }),
  
  getLogs: (page = 1, limit = 50, type?: string) =>
    api.get('/logs', { params: { page, limit, type } }),
};

export default api;
