// Gerenciador de estado centralizado para autenticação usando Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import { User, AuthResponse } from '@/types';

interface AuthState {
  // Estado
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  
  // Ações
  login: (email: string, senha: string) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (role: string) => boolean;
}

// Utilizamos o middleware persist para manter o estado de autenticação
// mesmo após recarregar a página
const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      loading: false,
      error: null,
      
      // Ações
      login: async (email: string, senha: string) => {
        set({ loading: true, error: null });
        
        try {
          const response = await api.post<AuthResponse>('/auth/login', { email, senha });
          
          if (response.data.success && response.data.user && response.data.access_token) {
            set({
              user: response.data.user,
              token: response.data.access_token,
              error: null
            });
            
            // Configurar o token para requisições futuras
            // O interceptor em api.ts já faz isso, 
            // mas aqui garantimos que temos o token no localStorage
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            return { success: true, user: response.data.user };
          } else {
            const message = response.data.message || 'Falha na autenticação';
            set({ error: message });
            return { success: false, message };
          }
        } catch (err: any) {
          const message = err.response?.data?.message || 'Erro ao fazer login';
          set({ error: message });
          return { success: false, message };
        } finally {
          set({ loading: false });
        }
      },

      logout: () => {
        // Limpar o estado e localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null });
      },

      isAuthenticated: () => {
        const state = get();
        return !!state.user && !!state.token;
      },

      hasRole: (role: string) => {
        const state = get();
        return state.user?.tipo === role;
      }
    }),
    {
      name: 'auth-storage', // Nome usado para armazenar no localStorage
      // Opcionalmente, podemos filtrar o que queremos persistir
      partialize: (state) => ({ 
        user: state.user,
        token: state.token
      })
    }
  )
);

export default useAuthStore;
            
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
