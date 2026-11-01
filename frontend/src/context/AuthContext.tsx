import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import { User } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';

interface RegisterData {
  name: string;
  email: string;
  password?: string;
  companyName: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  demoLogin: (role?: 'admin' | 'user') => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; resetToken?: string; resetLink?: string }>;
  resetPassword: (email: string, token: string, newPassword: string) => Promise<boolean>;
  updateProfile: (profile: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_ADMIN: User = {
  id: 'usr-admin-01',
  name: 'Vincent Rompies',
  email: 'vintwork@gmail.com',
  companyName: 'KBN Traders & Finova Global',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  currency: 'USD',
  currencySymbol: '$',
};

const DEMO_USER: User = {
  id: 'usr-trader-02',
  name: 'Hana Putri',
  email: 'hana.putri@logistics.id',
  companyName: 'Hana Putri Logistics Corp',
  role: 'user',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  currency: 'USD',
  currencySymbol: '$',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading, setAuth, setUser, clearAuth, setLoading } = useAuthStore();
  const [, startTransition] = useTransition();

  // Initial persistent session verification on load/page refresh
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        setLoading(true);
        // Attempt silent session refresh via HttpOnly cookie
        const res = await api.refreshToken();
        if (isMounted && res.data?.success && res.data?.accessToken) {
          setAuth(res.data.user, res.data.accessToken);
        }
      } catch (err: any) {
        // If no active session or 401, check if user was already in demo mode or clear auth
        if (isMounted) {
          clearAuth();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [setAuth, clearAuth, setLoading]);

  const login = async (email: string, password = 'Password123!'): Promise<boolean> => {
    const toastId = toast.loading('Signing in...');
    try {
      const res = await api.login({ email, password });
      if (res.data?.success && res.data?.accessToken) {
        setAuth(res.data.user, res.data.accessToken);
        toast.success(`Welcome back, ${res.data.user.name}!`, { id: toastId });
        return true;
      }
      toast.error(res.data?.message || 'Login failed', { id: toastId });
      return false;
    } catch (error: any) {
      // If network fails (e.g. backend offline), offer seamless resilient demo fallback
      console.warn('API login failed, checking fallback:', error);
      const errorMsg = error.response?.data?.message || 'Unable to connect to auth server.';
      
      // If user is testing demo credentials offline
      if (email.toLowerCase() === 'vintwork@gmail.com' || email.toLowerCase().includes('demo')) {
        setAuth(DEMO_ADMIN, 'demo_in_memory_access_token');
        toast.success('Logged in with Demo Administrator Profile', { id: toastId });
        return true;
      }

      toast.error(errorMsg, { id: toastId });
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    const toastId = toast.loading('Creating your Finova account...');
    try {
      const res = await api.register({
        name: data.name,
        email: data.email,
        password: data.password || 'Password123!',
        companyName: data.companyName,
        role: data.role || 'user',
      });

      if (res.data?.success && res.data?.accessToken) {
        setAuth(res.data.user, res.data.accessToken);
        toast.success('Account created successfully! Welcome to Finova.', { id: toastId });
        return true;
      }
      toast.error(res.data?.message || 'Registration failed', { id: toastId });
      return false;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Registration failed. Please check inputs.';
      toast.error(errorMsg, { id: toastId });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    const toastId = toast.loading('Logging out...');
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout API warning:', err);
    } finally {
      clearAuth();
      toast.success('Logged out securely.', { id: toastId });
    }
  };

  const demoLogin = async (role: 'admin' | 'user' = 'admin'): Promise<void> => {
    const demoUser = role === 'admin' ? DEMO_ADMIN : DEMO_USER;
    const toastId = toast.loading(`Starting demo as ${role === 'admin' ? 'Administrator' : 'Trader'}...`);
    try {
      // Try backend login first
      const res = await api.login({
        email: demoUser.email,
        password: 'Password123!',
      });
      if (res.data?.success && res.data?.accessToken) {
        setAuth(res.data.user, res.data.accessToken);
        toast.success(`Demo mode active (${role.toUpperCase()})`, { id: toastId });
        return;
      }
    } catch {
      // In-memory demo fallback
    }

    setAuth(demoUser, 'demo_token_in_memory');
    toast.success(`Demo mode active (${role.toUpperCase()})`, { id: toastId });
  };

  const forgotPassword = async (email: string) => {
    const toastId = toast.loading('Dispatching reset instructions...');
    try {
      const res = await api.forgotPassword(email);
      toast.success(res.data.message || 'Reset link generated.', { id: toastId, duration: 6000 });
      return {
        success: true,
        resetToken: res.data.resetToken,
        resetLink: res.data.resetLink,
      };
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to process request.';
      toast.error(msg, { id: toastId });
      return { success: false };
    }
  };

  const resetPassword = async (email: string, token: string, newPassword: string): Promise<boolean> => {
    const toastId = toast.loading('Updating your password...');
    try {
      const res = await api.resetPassword({ email, token, newPassword });
      if (res.data?.success) {
        toast.success('Password updated successfully! Please log in.', { id: toastId });
        return true;
      }
      toast.error(res.data?.message || 'Failed to reset password.', { id: toastId });
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid or expired token.', { id: toastId });
      return false;
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    const toastId = toast.loading('Saving profile changes...');
    try {
      const res = await api.updateProfile(profileData);
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        toast.success('Profile updated successfully!', { id: toastId });
        return true;
      }
      toast.error(res.data?.message || 'Failed to update profile.', { id: toastId });
      return false;
    } catch (error: any) {
      // Resilient local update if in demo mode
      if (user) {
        setUser({ ...user, ...profileData });
        toast.success('Profile updated in session.', { id: toastId });
        return true;
      }
      toast.error('Failed to update profile.', { id: toastId });
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    const toastId = toast.loading('Verifying and changing password...');
    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      if (res.data?.success) {
        toast.success('Password changed successfully!', { id: toastId });
        return true;
      }
      toast.error(res.data?.message || 'Failed to change password.', { id: toastId });
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Incorrect current password.', { id: toastId });
      return false;
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const res = await api.refreshToken();
      if (res.data?.success && res.data?.accessToken) {
        setAuth(res.data.user, res.data.accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'Admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
        demoLogin,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
