import { useState, useEffect } from 'react';
import api from "./api";
import { User, AuthResponse } from '@/types';

// Hook personalizado para autenticação
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, senha: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      const response = await api.post<AuthResponse>('/auth/login', { email, senha });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.access_token!);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user!);
        setError(null);
        return { success: true, user: response.data.user };
      } else {
        setError(response.data.message || 'Falha na autenticação');
        return { success: false, message: response.data.message };
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao fazer login';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAuthenticated = (): boolean => !!user;

  const hasRole = (role: string): boolean => {
    return user?.tipo === role;
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    hasRole,
  };
};
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
 */
