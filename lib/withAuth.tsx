import React from 'react'; // Importa o React para usar JSX 
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './apiUser';
import { UserRole } from '@/types';

export default function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[] = []
) {
  return function AuthComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        // User is not authenticated, redirect to login
        router.push('/login');
      } else if (!loading && user && allowedRoles.length > 0) {
        // Check if user has the required role
        if (!allowedRoles.includes(user.tipo)) {
          // User doesn't have required role, redirect to unauthorized
          router.push('/unauthorized');
        }
      }
    }, [user, loading, router]);

    // Show nothing while checking auth
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

    // If allowed roles is empty or user has the required role, render the component
    if (allowedRoles.length === 0 || allowedRoles.includes(user.tipo)) {
      return <Component {...props} user={user} />;
    }

    // Otherwise, show nothing (should never reach here due to redirect)
    return null;
  };
}
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
   */