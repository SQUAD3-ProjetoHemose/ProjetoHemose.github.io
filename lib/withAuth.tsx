import React from 'react'; // Importa o React para usar JSX 
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './authContext';
import { UserRole } from '@/types';

// HOC para proteger rotas com autenticação e autorização de papéis de usuário
export default function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[] = []
) {
  // Componente wrapper para lógica de autenticação/autorização
  return function AuthComponent(props: P) {
    const { user, loading } = useAuth(); // Obtém usuário e estado de carregamento do contexto de autenticação
    const router = useRouter(); // Hook para navegação

    useEffect(() => {
      if (!loading && !user) {
        // Usuário não autenticado, redireciona para login
        router.push('/login');
      } else if (!loading && user && allowedRoles.length > 0) {
        // Verifica se o usuário possui o papel necessário
        if (!allowedRoles.includes(user.tipo)) {
          // Usuário não tem permissão, redireciona para não autorizado
          router.push('/unauthorized');
        }
      }
    }, [user, loading, router]);

    // Exibe carregando enquanto verifica autenticação
    if (loading || !user) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      );
    }

    // Se não há restrição de papel ou usuário tem permissão, renderiza o componente
    if (allowedRoles.length === 0 || allowedRoles.includes(user.tipo)) {
      // Não passa o user como prop, o componente deve usar useAuth() internamente
      return <Component {...props} />;
    }

    // Caso contrário, não renderiza nada (deve ser redirecionado antes)
    return null;
  };
}
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
   */