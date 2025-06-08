// Gerenciador de estado centralizado para usuários usando Zustand
import { create } from 'zustand';
import { usersAPI } from '@/lib/api';
import { User } from '@/types';

interface UserState {
  // Estado
  users: User[];
  medicos: User[];
  enfermeiras: User[];
  recepcionistas: User[];
  userSelecionado: User | null;
  loading: boolean;
  error: string | null;
  
  // Ações
  fetchUsers: (role?: string | null) => Promise<User[]>;
  fetchMedicos: () => Promise<User[]>;
  fetchEnfermeiras: () => Promise<User[]>;
  fetchRecepcionistas: () => Promise<User[]>;
  createUser: (userData: Partial<User>) => Promise<User>;
  updateUser: (id: number | string, userData: Partial<User>) => Promise<User>;
  deleteUser: (id: number | string) => Promise<boolean>;
  getUserById: (id: number) => Promise<User>;
  setUserSelecionado: (user: User | null) => void;
  reset: () => void;
}

const useUserStore = create<UserState>((set, get) => ({
  // Estado inicial
  users: [],
  medicos: [],
  enfermeiras: [],
  recepcionistas: [],
  userSelecionado: null,
  loading: false,
  error: null,
  
  // Ações
  fetchUsers: async (role: string | null = null) => {
    set({ loading: true, error: null });
    
    try {
      const response = await usersAPI.getAll(role || undefined);
      set({ users: response });
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao buscar usuários';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  fetchMedicos: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await usersAPI.getMedicos();
      set({ medicos: response });
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao buscar médicos';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  fetchEnfermeiras: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await usersAPI.getEnfermeiras();
      set({ enfermeiras: response });
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao buscar enfermeiras';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  fetchRecepcionistas: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await usersAPI.getRecepcionistas();
      set({ recepcionistas: response });
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao buscar recepcionistas';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  createUser: async (userData: Partial<User>) => {
    set({ loading: true, error: null });
    
    try {
      const response = await usersAPI.create(userData);
      set(state => ({ 
        users: [...state.users, response]
      }));
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao criar usuário';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  updateUser: async (id: number | string, userData: Partial<User>) => {
    set({ loading: true, error: null });
    
    try {
      const response = await usersAPI.update(Number(id), userData);
      set(state => ({ 
        users: state.users.map(u => u.id === id ? response : u),
        userSelecionado: state.userSelecionado?.id === id ? response : state.userSelecionado
      }));
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao atualizar usuário';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  deleteUser: async (id: number | string) => {
    set({ loading: true, error: null });
    
    try {
      await usersAPI.delete(Number(id));
      set(state => ({
        users: state.users.filter(u => u.id !== id),
        userSelecionado: state.userSelecionado?.id === id ? null : state.userSelecionado
      }));
      return true;
    } catch (err: any) {
      const message = err.message || 'Erro ao excluir usuário';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  getUserById: async (id: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await usersAPI.getById(id);
      return response;
    } catch (err: any) {
      const message = err.message || 'Erro ao buscar usuário';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  setUserSelecionado: (user: User | null) => {
    set({ userSelecionado: user });
  },

  // Reset do estado para valores iniciais
  reset: () => {
    set({
      users: [],
      medicos: [],
      enfermeiras: [],
      recepcionistas: [],
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
