'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthentication } from '@/hooks';
import { 
  FileText, 
  Calendar, 
  Users, 
  Stethoscope,
  Activity,
  Menu,
  X,
  LogOut,
  Home
} from 'lucide-react';

// Interface para itens de navegação
interface NavItem {
  href: string;
  label: string;
  icon: any;
}

// Layout principal para páginas médicas
export default function MedicoLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthentication();

  // Itens de navegação do médico
  const navItems: NavItem[] = [
    { href: '/medico', label: 'Dashboard', icon: Home },
    { href: '/medico/prontuarios', label: 'Prontuários', icon: FileText },
    { href: '/medico/agenda', label: 'Agenda', icon: Calendar },
    { href: '/medico/pacientes', label: 'Pacientes', icon: Users },
    { href: '/medico/prescricoes', label: 'Prescrições', icon: Stethoscope },
    { href: '/medico/evolucoes', label: 'Evoluções', icon: Activity },
  ];

  // Função para logout
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Verificar se um item está ativo
  const isActiveItem = (href: string) => {
    if (href === '/medico') {
      return pathname === '/medico';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 bg-blue-700">
          <h1 className="text-xl font-bold text-white">HEMOSE Médico</h1>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 ${
                  isActiveItem(item.href) ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' : ''
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Informações do usuário */}
        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Dr(a). {user?.nome}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-4 bg-white shadow-sm lg:px-6">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Dr(a). {user?.nome}</span>
          </div>
        </header>

        {/* Conteúdo da página */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
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