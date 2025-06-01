'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthentication } from '@/hooks';
import {
  Menu,
  X,
  LogOut,
  Calendar,
  Users,
  FileText,
  UserCheck,
  UserPlus,
  Stethoscope
} from 'lucide-react';

interface MedicoLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/medico',
    icon: FileText,
    description: 'Visão geral do médico'
  },
  {
    name: 'Pacientes',
    href: '/medico/pacientes',
    icon: Users,
    description: 'Lista de Pacientes'
  },
  {
    name: 'Consultas',
    href: '/medico/consultas',
    icon: Calendar,
    description: 'Gerenciar Consultas'
  },
  {
    name: 'Check-in',
    href: '/medico/check-in',
    icon: UserCheck,
    description: 'Check-in de Pacientes'
  },
  {
    name: 'Acompanhantes',
    href: '/medico/acompanhantes',
    icon: UserPlus,
    description: 'Acompanhantes dos Pacientes'
  },
  {
    name: 'Relatórios',
    href: '/medico/relatorios',
    icon: FileText,
    description: 'Relatórios Médicos'
  }
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
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          {/* Logo/Header */}
          <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                <Stethoscope className="text-white h-5 w-5" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">HEMOSE</h1>
                <p className="text-xs text-gray-500">Médico</p>
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
                        ? 'bg-blue-50 border-blue-600 text-blue-800'
                        : 'border-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4 transition-colors`}
                  >
                    <Icon
                      className={`${
                        isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
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
                <p className="text-xs text-gray-600">Médico</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-12 text-blue-600 hover:text-blue-800 transition-colors"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

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
                <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                  <Stethoscope className="text-white h-5 w-5" />
                </div>
                <div className="ml-3">
                  <h1 className="text-lg font-semibold text-gray-900">HEMOSE</h1>
                  <p className="text-xs text-gray-500">Médico</p>
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
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
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

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar mobile */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow lg:hidden">
          <button
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-gray-900">HEMOSE Médico</h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button
                onClick={handleLogout}
                className="rounded-full bg-white p-1 text-gray-400 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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