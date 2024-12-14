import { createContext, useContext } from 'react';

export interface User {
  id: string;
  displayName: string;
  email?: string;
  provider: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export async function checkAuthStatus(): Promise<AuthContextType> {
  try {
    const response = await fetch('/api/auth/status');
    const data = await response.json();
    
    return {
      user: data.user || null,
      isAuthenticated: data.authenticated,
      loading: false,
    };
  } catch (error) {
    console.error('Error checking auth status:', error);
    return {
      user: null,
      isAuthenticated: false,
      loading: false,
    };
  }
}
