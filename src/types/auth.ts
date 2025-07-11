
export interface User {
  id: string;
  email: string;
  role: 'production_manager' | 'machine_operator' | 'admin_executive';
  name: string;
  avatar?: string;
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
