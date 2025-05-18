import { useState } from 'react';
import api from "./api";
import { User } from '@/types';

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
