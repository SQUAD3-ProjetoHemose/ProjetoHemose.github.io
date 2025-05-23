// Gerenciador de estado centralizado para usuários usando Zustand
import { create } from 'zustand';
import api from '@/lib/api';
import { User } from '@/types';

interface UserState {
  // Estado
  users: User[];
  userSelecionado: User | null;
  loading: boolean;
  error: string | null;
  
  // Ações
  fetchUsers: (role?: string | null) => Promise<User[]>;
  createUser: (userData: Partial<User>) => Promise<User>;
  updateUser: (id: number | string, userData: Partial<User>) => Promise<User>;
  deleteUser: (id: number | string) => Promise<boolean>;
  reset: () => void;
}

const useUserStore = create<UserState>((set, get) => ({
  // Estado inicial
  users: [],
  userSelecionado: null,
  loading: false,
  error: null,
  
  // Ações
  fetchUsers: async (role: string | null = null) => {
    set({ loading: true, error: null });
    
    try {
      const endpoint = role ? `/users?role=${role}` : '/users';
      const response = await api.get<User[]>(endpoint);
      set({ users: response.data });
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao buscar usuários';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  createUser: async (userData: Partial<User>) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.post<User>('/users', userData);
      set(state => ({ 
        users: [...state.users, response.data]
      }));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar usuário';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  updateUser: async (id: number | string, userData: Partial<User>) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.put<User>(`/users/${id}`, userData);
      set(state => ({ 
        users: state.users.map(u => u.id === id ? response.data : u),
        userSelecionado: state.userSelecionado?.id === id ? response.data : state.userSelecionado
      }));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao atualizar usuário';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  deleteUser: async (id: number | string) => {
    set({ loading: true, error: null });
    
    try {
      await api.delete(`/users/${id}`);
      set(state => ({
        users: state.users.filter(u => u.id !== id),
        userSelecionado: state.userSelecionado?.id === id ? null : state.userSelecionado
      }));
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao excluir usuário';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  // Reset do estado para valores iniciais
  reset: () => {
    set({
      users: [],
      userSelecionado: null,
      loading: false,
      error: null
    });
  }
}));

export default useUserStore;
            
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
