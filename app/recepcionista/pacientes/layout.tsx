'use client';

import { withProtectedRoute } from '@/hooks/useAuthentication';
import { ReactNode } from 'react'; // Importa ReactNode para tipagem

// Layout é um componente que apenas repassa children, portanto não precisa de props específicas
function PacienteRootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>; // Retorna um fragmento React válido 
} 

// Restringe o acesso ao layout para admin, enfermeira e médico
export default withProtectedRoute(['admin', 'enfermeira', 'medico', 'recepcionista'])(PacienteRootLayout);
            
/*
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
   */
