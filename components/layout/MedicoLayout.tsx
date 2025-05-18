'use client';

import { useAuth } from '@/lib/authContext'; // Importação corrigida do hook useAuth
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

// Interface para as props do componente
interface MedicoLayoutProps {
  children: ReactNode;
}

export default function MedicoLayout({ children }: MedicoLayoutProps) {
  const { user, logout } = useAuth(); // Obtendo usuário e função de logout do contexto de autenticação
  const pathname = usePathname();

  // Função para realizar logout e redirecionar para a página de login
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Função para verificar se o link atual está ativo
  const isActive = (path: string): string => {
    return pathname === path ? 'bg-blue-800' : '';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">HEMOSE</h1>
            <span className="text-sm bg-blue-900 px-2 py-1 rounded">Área Médica</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Olá, Dr(a). {user?.nome || 'Médico'}</span>
            <button 
              onClick={handleLogout}
              className="px-3 py-1 bg-blue-800 text-white rounded hover:bg-blue-900 text-sm"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 bg-blue-700 text-white">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/medico" 
                  className={`block px-4 py-2 rounded hover:bg-blue-800 ${isActive('/medico')}`}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/medico/pacientes" 
                  className={`block px-4 py-2 rounded hover:bg-blue-800 ${isActive('/medico/pacientes')}`}
                >
                  Meus Pacientes
                </Link>
              </li>
              <li>
                <Link 
                  href="/medico/prontuarios" 
                  className={`block px-4 py-2 rounded hover:bg-blue-800 ${isActive('/medico/prontuarios')}`}
                >
                  Prontuários
                </Link>
              </li>
              <li>
                <Link 
                  href="/medico/prescricoes" 
                  className={`block px-4 py-2 rounded hover:bg-blue-800 ${isActive('/medico/prescricoes')}`}
                >
                  Prescrições
                </Link>
              </li>
              <li>
                <Link 
                  href="/medico/internacoes" 
                  className={`block px-4 py-2 rounded hover:bg-blue-800 ${isActive('/medico/internacoes')}`}
                >
                  Internações
                </Link>
              </li>
              <li>
                <Link 
                  href="/medico/agenda" 
                  className={`block px-4 py-2 rounded hover:bg-blue-800 ${isActive('/medico/agenda')}`}
                >
                  Minha Agenda
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 bg-blue-100 p-6">
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