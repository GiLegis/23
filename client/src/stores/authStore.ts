import { create } from 'zustand';
import { User } from '@synergia/types';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await api.login(email, password);
      if (response.success && response.data) {
        localStorage.setItem('supabase_token', response.data.session.access_token);
        set({ 
          user: response.data.user, 
          isAuthenticated: true,
          isLoading: false 
        });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('supabase_token');
      set({ user: null, isAuthenticated: false });
    }
  },

  loadUser: async () => {
    const token = localStorage.getItem('supabase_token');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await api.getCurrentUser();
      if (response.success && response.data) {
        set({ 
          user: response.data, 
          isAuthenticated: true,
          isLoading: false 
        });
      } else {
        localStorage.removeItem('supabase_token');
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      localStorage.removeItem('supabase_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  }
}));