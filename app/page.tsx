'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redireciona automaticamente para a página de login quando o componente for montado
    router.push('/login');
  }, [router]);

  // Tela de loading enquanto redireciona
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">H</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">HEMOSE</h1>
        <p className="text-gray-600 mb-4">Centro de Hemoterapia de Sergipe</p>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Redirecionando...</p>
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