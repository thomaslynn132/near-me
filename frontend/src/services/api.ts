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

export const postApi = {
  getFeed: (page = 1, limit = 20) => api.get('/posts/feed', { params: { page, limit } }),
  createPost: (data: { content?: string; media?: any[]; privacy?: string }) => api.post('/posts', data),
  updatePost: (postId: string, data: { content?: string; media?: any[]; privacy?: string }) => api.put(`/posts/${postId}`, data),
  deletePost: (postId: string) => api.delete(`/posts/${postId}`),
  likePost: (postId: string) => api.post(`/posts/${postId}/like`),
  getUserPosts: (userId: string, page = 1, limit = 20) => api.get(`/posts/user/${userId}`, { params: { page, limit } }),
  getPresignedUrl: (filename: string) => api.get('/posts/presigned-url', { params: { filename } }),
};

export const followApi = {
  follow: (userId: string) => api.post(`/users/${userId}/follow`),
  unfollow: (userId: string) => api.delete(`/users/${userId}/follow`),
  getFollowers: (userId: string) => api.get(`/users/${userId}/followers`),
  getFollowing: (userId: string) => api.get(`/users/${userId}/following`),
  isFollowing: (userId: string) => api.get(`/users/${userId}/is-following`),
};

export default api;
