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

interface UsersHook {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: (role?: string | null) => Promise<User[]>;
  createUser: (userData: Partial<User>) => Promise<User>;
  updateUser: (id: number | string, userData: Partial<User>) => Promise<User>;
  deleteUser: (id: number | string) => Promise<boolean>;
}

// Hook para operações CRUD de usuários
export const useUsers = (): UsersHook => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (role: string | null = null): Promise<User[]> => {
    try {
      setLoading(true);
      const endpoint = role ? `/users?role=${role}` : '/users';
      const response = await api.get<User[]>(endpoint);
      setUsers(response.data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao buscar usuários';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: Partial<User>): Promise<User> => {
    try {
      setLoading(true);
      const response = await api.post<User>('/users', userData);
      setUsers([...users, response.data]);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar usuário';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: number | string, userData: Partial<User>): Promise<User> => {
    try {
      setLoading(true);
      const response = await api.put<User>(`/users/${id}`, userData);
      setUsers(users.map(u => u.id === id ? response.data : u));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao atualizar usuário';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number | string): Promise<boolean> => {
    try {
      setLoading(true);
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao excluir usuário';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
};
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
 */
