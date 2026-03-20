import { create } from 'zustand';
import { authApi } from '@/services/api';

interface AdminUser {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
}

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('adminUser') || 'null'),
  token: localStorage.getItem('adminToken'),
  isAuthenticated: !!localStorage.getItem('adminToken'),
  isLoading: true,

  login: async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { user, token } = res.data.data;
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    authApi.logout();
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const res = await authApi.getProfile();
      const user = res.data.data;
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        throw new Error('Unauthorized');
      }
      localStorage.setItem('adminUser', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalMatches: number;
  totalMessages: number;
  reportedUsers: number;
  onlineUsers: number;
  recentSignups: { date: string; count: number }[];
}

interface AdminState {
  stats: Stats | null;
  loading: boolean;
  setStats: (stats: Stats) => void;
  setLoading: (loading: boolean) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  stats: null,
  loading: false,
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
}));
