
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: User['role']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<string, User> = {
  'manager@betaflow.com': {
    id: '1',
    email: 'manager@betaflow.com',
    role: 'production_manager',
    name: 'Sarah Johnson',
    avatar: 'SJ',
    permissions: ['production.read', 'production.write', 'machines.read', 'reports.read']
  },
  'operator@betaflow.com': {
    id: '2',
    email: 'operator@betaflow.com',
    role: 'machine_operator',
    name: 'Mike Rodriguez',
    avatar: 'MR',
    permissions: ['batches.write', 'defects.write', 'machines.status']
  },
  'admin@betaflow.com': {
    id: '3',
    email: 'admin@betaflow.com',
    role: 'admin_executive',
    name: 'Lisa Chen',
    avatar: 'LC',
    permissions: ['orders.read', 'inventory.read', 'reports.export', 'users.manage']
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('betaflow_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } catch {
        localStorage.removeItem('betaflow_user');
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication
    const user = mockUsers[email];
    if (user && password === 'demo123') {
      localStorage.setItem('betaflow_user', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('betaflow_user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const switchRole = (role: User['role']) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, role };
      localStorage.setItem('betaflow_user', JSON.stringify(updatedUser));
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      switchRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
