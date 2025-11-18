/**
 * useAuth Hook
 * Authentication and user management hook
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/api/userService';
import { User } from '../types';

export const useAuth = () => {
  const router = useRouter();
  const { 
    user, 
    token, 
    isAuthenticated, 
    loading,
    setUser,
    setToken,
    login: storeLogin,
    logout: storeLogout,
    setLoading,
  } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid
          try {
            const currentUser = await userService.getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            // Token invalid, clear auth
            storeLogout();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        storeLogout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login function
   */
  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await userService.login({ email, password, role });
      
      storeLogin(response.user, response.token);
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    storeLogout();
    router.push('/login');
  };

  /**
   * Update user profile
   */
  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const updatedUser = await userService.updateUser(user.id, data);
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  /**
   * Change password
   */
  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      await userService.changePassword(oldPassword, newPassword);
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    updateProfile,
    changePassword,
  };
};

