import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const userApi = {
  getNearby: (lng: number, lat: number, radius?: number) =>
    api.get('/users/nearby', { params: { lng, lat, radius } }),
  getProfile: (userId: string) => api.get(`/users/${userId}`),
  updateProfile: (data: any) => api.put('/users/profile', data),
  updateLocation: (coordinates: [number, number]) =>
    api.put('/users/location', { coordinates }),
  likeUser: (userId: string) => api.post(`/users/like/${userId}`),
  dislikeUser: (userId: string) => api.post(`/users/dislike/${userId}`),
};

export const matchApi = {
  getMatches: () => api.get('/matches'),
  getBlindMatches: () => api.get('/matches/blind'),
  createMatch: (userId: string) => api.post('/matches', { userId }),
  createBlindMatch: (userId: string) => api.post('/matches/blind', { userId }),
  revealMatch: (matchId: string) => api.put(`/matches/${matchId}/reveal`),
  unmatch: (matchId: string) => api.delete(`/matches/${matchId}`),
};

export const chatApi = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (matchId: string, limit?: number, before?: string) =>
    api.get(`/messages/${matchId}`, { params: { limit, before } }),
  sendMessage: (matchId: string, content: string, messageType = 'text', mediaUrl?: string) =>
    api.post('/messages', { matchId, content, messageType, mediaUrl }),
  markAsRead: (messageId: string) => api.put(`/messages/${messageId}/read`),
};

export const friendApi = {
  getFriends: () => api.get('/friends'),
  getPendingRequests: () => api.get('/friends/requests'),
  sendRequest: (receiverId: string) => api.post('/friends/request', { receiverId }),
  acceptRequest: (requestId: string) => api.put(`/friends/request/${requestId}/accept`),
  rejectRequest: (requestId: string) => api.put(`/friends/request/${requestId}/reject`),
  removeFriend: (friendId: string) => api.delete(`/friends/${friendId}`),
};

export default api;
