import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<UserRole>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ner_token'));
  const [role, setRole] = useState<UserRole | null>((localStorage.getItem('ner_role') as UserRole) || null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ner_token');
      if (storedToken) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
          setRole(userData.role);
          localStorage.setItem('ner_role', userData.role);
        } catch (err) {
          console.error('Session expired or invalid token:', err);
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<UserRole> => {
    setIsLoading(true);
    try {
      const resp = await authApi.login({ username, password });
      localStorage.setItem('ner_token', resp.access_token);
      localStorage.setItem('ner_role', resp.role);
      setToken(resp.access_token);
      setRole(resp.role);

      setUser({
        id: resp.user_id,
        username: resp.username,
        email: `${resp.username}@nerlogix.gov.in`,
        full_name: resp.full_name,
        role: resp.role,
        is_active: true,
        created_at: new Date().toISOString(),
      });

      // Background profile refresh
      authApi.getMe().then((userData) => {
        setUser(userData);
      }).catch((e) => console.warn('Profile refresh:', e));

      return resp.role;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ner_token');
    localStorage.removeItem('ner_role');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
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
