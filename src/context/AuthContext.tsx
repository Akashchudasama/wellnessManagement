
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserRole = 'admin' | 'incharge' | null;

interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Load user from localStorage on initial render, but don't redirect
  useEffect(() => {
    const storedUser = localStorage.getItem('hms_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('hms_user');
      }
    }
  }, []);

  // Simple mock login function - in a real app, this would call an API
  const login = async (username: string, password: string, role: UserRole): Promise<boolean> => {
    // For demo purposes, we're using simple validation
    // Admin credentials: admin/admin123
    // Incharge credentials: incharge/incharge123
    if (role === 'admin' && username === 'admin' && password === 'admin123') {
      const user = { id: '1', name: 'Admin User', role: 'admin' as UserRole };
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('hms_user', JSON.stringify(user));
      return true;
    } else if (role === 'incharge' && username === 'incharge' && password === 'incharge123') {
      const user = { id: '2', name: 'Incharge User', role: 'incharge' as UserRole };
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('hms_user', JSON.stringify(user));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('hms_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
