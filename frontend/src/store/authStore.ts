import { create } from 'zustand';
import { authApi } from '@/services/api';
import { socketService } from '@/services/socket';

interface User {
  _id: string;
  name: string;
  email: string;
  age: number;
  bio: string;
  interests: string[];
  profileImages: { url: string }[];
  location?: { coordinates: [number, number] };
  isOnline: boolean;
  visibility: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  currentUserId: string | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  currentUserId: null,

  login: async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { user, token } = res.data.data;
    localStorage.setItem('token', token);
    socketService.connect(token);
    set({ user, token, isAuthenticated: true, currentUserId: user._id });
  },

  register: async (data: any) => {
    const res = await authApi.register(data);
    const { user, token } = res.data.data;
    localStorage.setItem('token', token);
    socketService.connect(token);
    set({ user, token, isAuthenticated: true, currentUserId: user._id });
  },

  logout: () => {
    authApi.logout();
    socketService.disconnect();
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, currentUserId: null });
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      socketService.connect(token);
      const res = await authApi.getMe();
      set({ user: res.data.data, isAuthenticated: true, isLoading: false, currentUserId: res.data.data._id });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false, currentUserId: null });
    }
  },
}));
