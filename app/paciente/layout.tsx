'use client';

import withAuth from '@/lib/withAuth';


import { ReactNode } from 'react'; // Importa ReactNode para tipagem
function PacienteRootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>; // Retorna um fragmento React válido 
} 
export default withAuth(PacienteRootLayout, ['admin', 'enfermeira']);
