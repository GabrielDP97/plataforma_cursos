import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/modules/auth';
import type { User } from '../api/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getRoleHomePath(role?: User['role']): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'instructor':
      return '/instructor';
    default:
      return '/dashboard';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const response = await authApi.getSession();
      setUser(response.user);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const response = await authApi.getSession();
        setUser(response.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapSession();
  }, []);

  const login = async (identifier: string, password: string) => {
    // Determine if identifier is email or username
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    const response = await authApi.login({
      ...(isEmail ? { email: identifier } : { username: identifier }),
      password,
    });

    // The login endpoint returns user without mustChangePassword,
    // but getSession does — so fetch full session after login
    const sessionResponse = await authApi.getSession();
    const fullUser = sessionResponse.user || response.user;
    setUser(fullUser);
    return fullUser;
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await authApi.changePassword({ currentPassword, newPassword });
    // Refresh session to get updated mustChangePassword flag
    await refreshSession();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, changePassword, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { getRoleHomePath };
