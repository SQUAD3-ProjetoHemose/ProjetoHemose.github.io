'use client';

import { useAuth } from '@/lib/authContext'; // Importação corrigida do hook useAuth
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

// Interface para as props do componente
interface RecepcionistaLayoutProps {
  children: ReactNode;
}

export default function RecepcionistaLayout({ children }: RecepcionistaLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const isActive = (path: string): string => {
    return pathname === path || pathname.startsWith(path + '/') ? 'bg-red-800' : '';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-red-800 to-red-500 text-white">
        <div className="flex px-9 py-5  justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold">HEMOSE</h1>
            <span className="text-sm bg-red-700 px-2 py-1 rounded">Recepção</span>
          </div>
          <div className="flex items-center space-x-5">
            <span>Olá, {user?.nome || 'Recepcionista'}</span>
            <button 
              onClick={handleLogout}
              className="px-5 py-1 bg- text-white bg-red-700 rounded hover:bg-red-900 text-sm"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 bg-gradient-to-br from-red-800 to-red-700 text-white">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/recepcionista" 
                  className={`block px-4 py-2 rounded hover:bg-red-900 ${isActive('/recepcionista')}`}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/recepcionista/pacientes" 
                  className={`block px-4 py-2 rounded hover:bg-red-900 ${isActive('/recepcionista/pacientes')}`}
                >
                  Cadastro de Pacientes
                </Link>
              </li>
              <li>
                <Link 
                  href="/recepcionista/agendamentos" 
                  className={`block px-4 py-2 rounded hover:bg-red-900 ${isActive('/recepcionista/agendamentos')}`}
                >
                  Agendamentos
                </Link>
              </li>
              <li>
                <Link 
                  href="/recepcionista/check-in" 
                  className={`block px-4 py-2 rounded hover:bg-red-900 ${isActive('/recepcionista/check-in')}`}
                >
                  Check-in
                </Link>
              </li>
              <li>
                <Link 
                  href="/recepcionista/acompanhantes" 
                  className={`block px-4 py-2 rounded hover:bg-red-900 ${isActive('/recepcionista/acompanhantes')}`}
                >
                  Acompanhantes
                </Link>
              </li>
              <li>
                <Link 
                  href="/recepcionista/relatorios" 
                  className={`block px-4 py-2 rounded hover:bg-red-900 ${isActive('/recepcionista/relatorios')}`}
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