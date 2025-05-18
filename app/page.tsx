'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redireciona automaticamente para a página de login quando o componente for montado
    router.push('/login');
  }, []);
  
  // Esta página nunca será realmente exibida, pois o redirecionamento ocorre antes da renderização
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-600"></div>
      <p className="ml-2 text-rose-700">Redirecionando...</p>
    </div>
  );
}

// Função que redireciona automaticamente para a página de login
// Utilizamos o hook useRouter para navegação client-side
// O useEffect garante que o redirecionamento ocorra apenas no cliente
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
   */