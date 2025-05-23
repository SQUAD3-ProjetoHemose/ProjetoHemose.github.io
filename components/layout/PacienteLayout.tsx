'use client';

import { useAuthentication } from '@/hooks';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface PacienteLayoutProps {
  children: ReactNode;
  pacienteNome: string;
}

export function PacienteLayout({ children, pacienteNome }: PacienteLayoutProps) {
  const router = useRouter();
  const { logout } = useAuthentication();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold">HEMOSE</div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => router.push('/paciente')} className="w-full text-left hover:bg-blue-700 p-2 rounded">
            Dashboard
          </button>
          <button onClick={() => router.push('/paciente/meu-perfil')} className="w-full text-left hover:bg-blue-700 p-2 rounded">
            Meu Perfil
          </button>
          <button onClick={() => router.push('/paciente/agendamentos')} className="w-full text-left hover:bg-blue-700 p-2 rounded">
            Agendamentos
          </button>
          <button onClick={() => router.push('/paciente/prontuario')} className="w-full text-left hover:bg-blue-700 p-2 rounded">
            Prontuário
          </button>
        </nav>
        <div className="p-4 border-t border-blue-700">
          <div className="text-sm">Paciente: {pacienteNome}</div>
          <button
            onClick={handleLogout}
            className="mt-2 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white w-full"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-blue-50 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
