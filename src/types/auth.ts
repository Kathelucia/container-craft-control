
export interface User {
  id: string;
  email: string;
  role: 'production_manager' | 'machine_operator' | 'operations_admin';
  name: string;
  avatar?: string;
  permissions: string[];
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'production_manager' | 'machine_operator' | 'operations_admin';
  department?: string;
  shift?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: any | null;
  profile: Profile | null;
  session: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
