'use client';

import { useAuthentication } from '@/hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

// Interface para as props do componente
interface RecepcionistaLayoutProps {
  children: ReactNode;
}

export default function RecepcionistaLayout({ children }: RecepcionistaLayoutProps) {
  const { user, logout } = useAuthentication(); // Obtendo usuário e função de logout do hook
  const pathname = usePathname();

  // Função para realizar logout e redirecionar para a página de login
  const handleLogout = () => {
    logout();
  };

  // Função para verificar se o link atual está ativo
  const isActive = (path: string): string => {
    // Para o dashboard principal, verificar se é exatamente /recepcionista
    if (path === '/recepcionista') {
      return pathname === path ? 'bg-purple-800' : '';
    }
    // Para outras rotas, verificar se começam com o path
    return pathname.startsWith(path) ? 'bg-purple-800' : '';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-purple-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">HEMOSE</h1>
            <span className="text-sm bg-purple-900 px-2 py-1 rounded">Recepção</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Olá, {user?.nome || 'Recepcionista'}</span>
            <button 
              onClick={handleLogout}
              className="px-3 py-1 bg-purple-800 text-white rounded hover:bg-purple-900 text-sm"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 bg-purple-700 text-white">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/recepcionista" 
                  className={`block px-4 py-2 rounded hover:bg-purple-800 ${isActive('/recepcionista')}`}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/recepcionista/pacientes" 
                  className={`block px-4 py-2 rounded hover:bg-purple-800 ${isActive('/recepcionista/pacientes')}`}
                >
                  Cadastro de Pacientes
                </Link>
              </li>
              <li>
                <Link 
                  href="/recepcionista/agendamentos" 
                  className={`block px-4 py-2 rounded hover:bg-purple-800 ${isActive('/recepcionista/agendamentos')}`}
                >
                  Agendamentos
                </Link>
              </li>
              <li>
                <Link 
                  href="/recepcionista/check-in" 
                  className={`block px-4 py-2 rounded hover:bg-purple-800 ${isActive('/recepcionista/check-in')}`}
                >
                  Check-in
                </Link>
              </li>
              <li>
                <Link 
                  href="/recepcionista/acompanhantes" 
                  className={`block px-4 py-2 rounded hover:bg-purple-800 ${isActive('/recepcionista/acompanhantes')}`}
                >
                  Acompanhantes
                </Link>
              </li>
              <li>
                <Link 
                  href="/recepcionista/relatorios" 
                  className={`block px-4 py-2 rounded hover:bg-purple-800 ${isActive('/recepcionista/relatorios')}`}
                >
                  Relatórios
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 bg-purple-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/