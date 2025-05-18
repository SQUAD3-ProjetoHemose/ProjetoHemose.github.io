'use client';

import { useAuth } from '@/lib/apiUser';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from '@/types';
import React from 'react';

interface EnfermeiraLayoutProps {
  children: React.ReactNode;
}

export default function EnfermeiraLayout({ children }: EnfermeiraLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const isActive = (path: string): string => {
    return pathname === path ? 'bg-green-800' : '';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-green-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">HEMOSE</h1>
            <span className="text-sm bg-green-900 px-2 py-1 rounded">Área de Enfermagem</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Olá, {user?.nome || 'Enfermeira'}</span>
            <button 
              onClick={handleLogout}
              className="px-3 py-1 bg-green-800 text-white rounded hover:bg-green-900 text-sm"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 bg-green-700 text-white">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/enfermeira" 
                  className={`block px-4 py-2 rounded hover:bg-green-800 ${isActive('/enfermeira')}`}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/enfermeira/pacientes" 
                  className={`block px-4 py-2 rounded hover:bg-green-800 ${isActive('/enfermeira/pacientes')}`}
                >
                  Pacientes
                </Link>
              </li>
              <li>
                <Link 
                  href="/enfermeira/triagem" 
                  className={`block px-4 py-2 rounded hover:bg-green-800 ${isActive('/enfermeira/triagem')}`}
                >
                  Triagem
                </Link>
              </li>
              <li>
                <Link 
                  href="/enfermeira/medicamentos" 
                  className={`block px-4 py-2 rounded hover:bg-green-800 ${isActive('/enfermeira/medicamentos')}`}
                >
                  Administrar Medicamentos
                </Link>
              </li>
              <li>
                <Link 
                  href="/enfermeira/leitos" 
                  className={`block px-4 py-2 rounded hover:bg-green-800 ${isActive('/enfermeira/leitos')}`}
                >
                  Controle de Leitos
                </Link>
              </li>
              <li>
                <Link 
                  href="/enfermeira/sinais-vitais" 
                  className={`block px-4 py-2 rounded hover:bg-green-800 ${isActive('/enfermeira/sinais-vitais')}`}
                >
                  Sinais Vitais
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 bg-green-100 p-6">
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