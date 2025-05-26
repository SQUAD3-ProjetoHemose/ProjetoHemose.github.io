// Gerenciador de estado centralizado para autenticação usando Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/lib/api';
import { User, UserRole } from '@/types'; // Importar UserRole também

// Interface para resposta de autenticação específica do store
interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

interface AuthState {
  // Estado
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  
  // Ações
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (role: UserRole) => boolean; // Tipagem mais específica
  getProfile: () => Promise<void>;
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
      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        
        try {
          const response = await authAPI.login({ email, password });
          
          // Verificar se o login foi bem-sucedido
          if (response.success && response.access_token && response.user) {
            const token = response.access_token;
            const user = response.user;
            
            set({
              user: user,
              token: token,
              error: null
            });
            
            // Configurar o token para requisições futuras
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            return { success: true, user: user, token: token };
          } else {
            const message = 'Credenciais inválidas';
            set({ error: message });
            return { success: false, message };
          }
        } catch (err: any) {
          const message = err.message || 'Erro ao fazer login';
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

      hasRole: (role: UserRole) => {
        const state = get();
        return state.user?.tipo === role; // Usar apenas 'tipo' que é o campo correto
      },

      getProfile: async () => {
        set({ loading: true, error: null });
        
        try {
          const response = await authAPI.profile();
          if (response.user) {
            set({ user: response.user });
            localStorage.setItem('user', JSON.stringify(response.user));
          }
        } catch (err: any) {
          const message = err.message || 'Erro ao buscar perfil';
          set({ error: message });
          // Se falhar ao buscar perfil, fazer logout
          get().logout();
        } finally {
          set({ loading: false });
        }
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
