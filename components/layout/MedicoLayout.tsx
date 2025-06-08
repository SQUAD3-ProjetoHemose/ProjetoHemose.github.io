'use client';

import { useAuthentication } from '@/hooks';
import {
  Activity,
  BarChart3,
  Bell,
  Calendar,
  ClipboardList,
  FileText,
  LogOut,
  Menu,
  Search,
  Stethoscope,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface MedicoLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/medico',
    icon: Activity,
    description: 'Fila de espera e visão geral',
  },
  {
    name: 'Agenda',
    href: '/medico/agenda',
    icon: Calendar,
    description: 'Agendamentos e consultas',
  },
  {
    name: 'Pacientes',
    href: '/medico/pacientes',
    icon: Users,
    description: 'Buscar e gerenciar pacientes',
  },
  {
    name: 'Prontuários',
    href: '/medico/prontuarios',
    icon: FileText,
    description: 'Prontuários eletrônicos',
  },
  {
    name: 'Prescrições',
    href: '/medico/prescricoes',
    icon: ClipboardList,
    description: 'Prescrições médicas',
  },
  {
    name: 'Atestados',
    href: '/medico/atestados',
    icon: FileText,
    description: 'Atestados e declarações',
  },
  {
    name: 'Relatórios',
    href: '/medico/relatorios',
    icon: BarChart3,
    description: 'Relatórios e estatísticas',
  },
];

export default function MedicoLayout({ children }: MedicoLayoutProps) {
  const { user, logout } = useAuthentication();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/medico') {
      return pathname === '/medico';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200 shadow-sm">
          {/* Logo/Header */}
          <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200 bg-blue-700">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Stethoscope className="text-blue-700 h-5 w-5" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-white">HEMOSE</h1>
                <p className="text-xs text-blue-100">Módulo Médico</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <nav className="mt-2 flex-1 space-y-1 px-3">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      active
                        ? 'bg-blue-50 border-blue-600 text-blue-800 shadow-sm'
                        : 'border-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-2 text-sm font-medium rounded-lg border-l-4 transition-all duration-200`}
                  >
                    <Icon
                      className={`${
                        active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                      } mr-3 h-5 w-5 flex-shrink-0`}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Ações rápidas */}
            <div className="px-3 mt-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Ações Rápidas</h3>
                <div className="space-y-2">
                  <Link
                    href="/medico/pacientes/buscar"
                    className="flex items-center text-xs text-blue-700 hover:text-blue-800 transition-colors"
                  >
                    <Search className="h-3 w-3 mr-2" />
                    Buscar Paciente
                  </Link>
                  <Link
                    href="/medico/atestados/novo"
                    className="flex items-center text-xs text-blue-700 hover:text-blue-800 transition-colors"
                  >
                    <FileText className="h-3 w-3 mr-2" />
                    Novo Atestado
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* User info */}
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center w-full">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.nome?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">Dr(a). {user?.nome}</p>
                <p className="text-xs text-gray-600">
                  Médico • CRM {user?.registroProfissional || 'N/A'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Sair do sistema"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Header mobile */}
            <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200 bg-blue-700">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Stethoscope className="text-blue-700 h-5 w-5" />
                </div>
                <div className="ml-3">
                  <h1 className="text-lg font-semibold text-white">HEMOSE</h1>
                  <p className="text-xs text-blue-100">Módulo Médico</p>
                </div>
              </div>
            </div>

            {/* Navigation mobile */}
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
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-3 text-base font-medium rounded-md border-l-4`}
                    >
                      <Icon className="mr-4 h-6 w-6 flex-shrink-0" />
                      <div>
                        <div>{item.name}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* User info mobile */}
            <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
              <div className="flex items-center w-full">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.nome?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-800">Dr(a). {user?.nome}</p>
                  <p className="text-xs text-gray-600">Médico</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Sair"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar mobile */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <button
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-gray-900">HEMOSE</h1>
              <span className="ml-2 text-sm text-gray-500">Médico</span>
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-2">
              {/* Notificações */}
              <button className="relative rounded-full bg-white p-1 text-gray-400 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="rounded-full bg-white p-1 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                title="Sair do sistema"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 bg-gray-50">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
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
