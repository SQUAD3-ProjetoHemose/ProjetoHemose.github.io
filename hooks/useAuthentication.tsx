// Hook para lógica de autenticação
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { UserRole } from '@/types';

// Hook para gerenciamento de autenticação
export const useAuthentication = () => {
  const router = useRouter();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  
  // Acesso ao estado e ações da store
  const { 
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    hasRole
  } = useAuthStore();

  // Função para redirecionar usuário para sua página inicial
  const redirectToUserHome = useCallback(() => {
    if (!user) return;
    
    let path = '/';
    
    switch(user.tipo) {
      case 'admin':
        path = '/admin';
        break;
      case 'medico':
        path = '/medico';
        break;
      case 'enfermeira':
        path = '/enfermeira';
        break;
      case 'recepcionista':
        path = '/recepcionista';
        break;
      default:
        path = '/';
        break;
    }
    
    router.push(path);
  }, [user, router]);

  // Efeito para redirecionar após login - só executa na página de login ou raiz
  useEffect(() => {
    if (isAuthenticated() && user) {
      const currentPath = window.location.pathname;
      
      // Verificar se o usuário está em uma página válida para seu tipo
      const isValidUserPath = () => {
        switch(user.tipo) {
          case 'admin':
            return currentPath.startsWith('/admin');
          case 'medico':
            return currentPath.startsWith('/medico');
          case 'enfermeira':
            return currentPath.startsWith('/enfermeira');
          case 'recepcionista':
            return currentPath.startsWith('/recepcionista');
          default:
            return false;
        }
      };
      
      // Só redireciona se estiver em páginas que não são específicas do usuário
      // ou se estiver em uma página inválida para o tipo de usuário
      if (currentPath === '/login' || currentPath === '/' || !isValidUserPath()) {
        if (redirectPath) {
          router.push(redirectPath);
          setRedirectPath(null);
        } else {
          // Se não houver path específico, redirecionar para a página inicial do usuário
          redirectToUserHome();
        }
      }
    }
  }, [isAuthenticated, user, redirectPath, redirectToUserHome, router]);

  // Função de login com redirecionamento
  const loginWithRedirect = useCallback(async (email: string, senha: string, redirectTo?: string) => {
    try {
      const result = await login(email, senha);
      
      if (result.success && redirectTo) {
        setRedirectPath(redirectTo);
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }, [login]);

  // Função de logout com redirecionamento
  const logoutWithRedirect = useCallback(() => {
    logout();
    router.push('/login');
  }, [logout, router]);

  // Verifica se o usuário tem acesso a uma rota específica
  const canAccessRoute = useCallback((requiredRoles: UserRole[]) => {
    if (!user) return false;
    
    // Administradores têm acesso a tudo
    if (user.tipo === 'admin') return true;
    
    // Verificar se o tipo do usuário está nas roles permitidas
    return requiredRoles.includes(user.tipo);
  }, [user]);

  return {
    // Estado
    user,
    token,
    loading,
    error,
    login: loginWithRedirect,
    logout: logoutWithRedirect,
    isAuthenticated,
    hasRole,
    canAccessRoute,
    redirectToUserHome
  };
};

// HOC para proteção de rotas
export const withProtectedRoute = (requiredRoles: UserRole[] = []) => {
  return (Component: React.ComponentType<any>) => {
    return function ProtectedRoute(props: any) {
      const { isAuthenticated, canAccessRoute, redirectToUserHome, loading } = useAuthentication();
      const router = useRouter();
      
      useEffect(() => {
        if (!loading) {
          if (!isAuthenticated()) {
            router.push('/login');
          } else if (requiredRoles.length > 0 && !canAccessRoute(requiredRoles)) {
            // Se o usuário está autenticado mas não tem permissão, redireciona para sua página inicial
            redirectToUserHome();
          }
        }
      }, [loading, isAuthenticated, canAccessRoute, router, redirectToUserHome]);
      
      // Renderiza um loading enquanto verifica autenticação
      if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
      }
      
      // Se não estiver autenticado, não renderiza nada (redirecionamento ocorre no useEffect)
      if (!isAuthenticated() || (requiredRoles.length > 0 && !canAccessRoute(requiredRoles))) {
        return null;
      }
      
      // Se está autenticado e tem permissão, renderiza o componente
      return <Component {...props} />;
    };
  };
};


            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
