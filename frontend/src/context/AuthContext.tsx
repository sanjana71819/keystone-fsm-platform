import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthResponse, Role, User } from '../types';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isTechnician: boolean;
  isCustomer: boolean;
  login: (credentials: { username: string; password: string }) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('keystone_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('keystone_token'));
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const u = await authApi.getCurrentUser();
      setUser(u);
      localStorage.setItem('keystone_user', JSON.stringify(u));
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (credentials: { username: string; password: string }) => {
    const res = await authApi.login(credentials);
    setToken(res.token);
    localStorage.setItem('keystone_token', res.token);
    
    const userObj: User = {
      id: res.userId,
      username: res.username,
      email: res.email,
      role: res.role,
      firstName: res.firstName,
      lastName: res.lastName,
      enabled: true,
      customerId: res.customerId,
      technicianId: res.technicianId,
      createdAt: new Date().toISOString()
    };

    setUser(userObj);
    localStorage.setItem('keystone_user', JSON.stringify(userObj));
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('keystone_token');
    localStorage.removeItem('keystone_user');
  };

  const role = user?.role || null;
  const isAdmin = role === 'ADMIN';
  const isManager = role === 'MANAGER';
  const isTechnician = role === 'TECHNICIAN';
  const isCustomer = role === 'CUSTOMER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated: !!token && !!user,
        isAdmin,
        isManager,
        isTechnician,
        isCustomer,
        login,
        logout,
        refreshUser,
        loading
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
