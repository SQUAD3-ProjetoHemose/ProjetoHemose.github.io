'use client';

import { useAuthentication } from '@/hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';
import {
  Menu,
  X,
  LogOut,
  UserPlus,
  Calendar,
  Users,
  FileText,
  UserCheck
} from 'lucide-react';

// Interface para as props do componente
interface RecepcionistaLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/recepcionista',
    icon: FileText,
    description: 'Visão geral da recepção'
  },
  {
    name: 'Pacientes',
    href: '/recepcionista/pacientes',
    icon: Users,
    description: 'Cadastro de Pacientes'
  },
  {
    name: 'Agendamentos',
    href: '/recepcionista/agendamentos',
    icon: Calendar,
    description: 'Gerenciar Agendamentos'
  },
  {
    name: 'Check-in',
    href: '/recepcionista/check-in',
    icon: UserCheck,
    description: 'Check-in de Pacientes'
  },
  {
    name: 'Acompanhantes',
    href: '/recepcionista/acompanhantes',
    icon: UserPlus,
    description: 'Cadastro de Acompanhantes'
  },
  {
    name: 'Relatórios',
    href: '/recepcionista/relatorios',
    icon: FileText,
    description: 'Relatórios da Recepção'
  }
];

export default function RecepcionistaLayout({ children }: RecepcionistaLayoutProps) {
<<<<<<< HEAD
  const { user, logout } = useAuth();
=======
  const { user, logout } = useAuthentication();
>>>>>>> main
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Função para verificar se o link atual está ativo
  const isActive = (href: string) => {
    // Para o dashboard principal, verificar se é exatamente /recepcionista
    if (href === '/recepcionista') {
      return pathname === '/recepcionista';
    }
    // Para outras rotas, verificar se começam com o path
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
<<<<<<< HEAD
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
=======
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          {/* Logo/Header */}
          <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">HEMOSE</h1>
                <p className="text-xs text-gray-500">Recepção</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive(item.href)
                        ? 'bg-purple-50 border-purple-600 text-purple-800'
                        : 'border-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4 transition-colors`}
                  >
                    <Icon
                      className={`${
                        isActive(item.href) ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'
                      } mr-3 h-5 w-5`}
                    />
                    <div>
                      <div>{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User info */}
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">
                  {user?.nome?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-800">{user?.nome}</p>
                <p className="text-xs text-gray-600">Recepcionista</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-12 text-purple-600 hover:text-purple-800 transition-colors"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
>>>>>>> main
          </div>
        </div>
      </div>

<<<<<<< HEAD
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
=======
      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-gray-100 bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-gray-700" />
              </button>
            </div>
            <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <div className="ml-3">
                  <h1 className="text-lg font-semibold text-gray-900">HEMOSE</h1>
                  <p className="text-xs text-gray-500">Recepção</p>
                </div>
              </div>
            </div>
            <div className="mt-5 h-0 flex-1 overflow-y-auto">
              <nav className="space-y-1 px-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`${
                        isActive(item.href)
                          ? 'bg-purple-50 border-purple-500 text-purple-700'
                          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-base font-medium rounded-md border-l-4`}
                    >
                      <Icon className="mr-4 h-6 w-6" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
>>>>>>> main

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar mobile */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow lg:hidden">
          <button
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-gray-900">HEMOSE Recepção</h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button
                onClick={handleLogout}
                className="rounded-full bg-white p-1 text-gray-400 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
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