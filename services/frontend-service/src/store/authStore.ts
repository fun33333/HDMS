/**
 * Auth Store (Zustand)
 * Global state for authentication and user session
 */

import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,

  setUser: (user) => {
    // Sync with localStorage
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    }
    
    set({ 
      user, 
      isAuthenticated: !!user 
    });
  },

  setToken: (token) => {
    // Sync with localStorage
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
    
    set({ token });
  },

  login: (user, token) => {
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    set({ 
      user, 
      token, 
      isAuthenticated: true,
      loading: false 
    });
  },

  logout: () => {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false 
    });
  },

  setLoading: (loading) => set({ loading }),
}));

