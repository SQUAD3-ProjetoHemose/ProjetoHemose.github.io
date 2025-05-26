'use client';

import { useState, useEffect } from 'react';
import { withProtectedRoute } from '@/hooks/useAuthentication';
import { Stats, UserRole } from '@/types';
import { useAuthentication } from '@/hooks';

// Interface para pacientes urgentes
interface PacienteUrgente {
  id: number | string;
  nome: string;
  leito: string;
  status: string;
  sinaisVitais: string;
}

interface Medicacao {
  id: number | string;
  paciente: string;
  leito: string;
  medicamento: string;
  dosagem: string;
  horario: string;
}

function EnfermeiraDashboardPage() {
  // Obter o usuário do contexto de autenticação
  const { user } = useAuthentication();
  
  const [stats, setStats] = useState<Stats>({
    pacientesInternados: 0,
    pacientesTriagem: 0,
    medicamentosAdministrar: 0,
    leitosDisponiveis: 0,
  });

  const [pacientesUrgentes, setPacientesUrgentes] = useState<PacienteUrgente[]>([]);
  const [medicacoes, setMedicacoes] = useState<Medicacao[]>([]);

  useEffect(() => {
    // Em uma implementação real, esses dados viriam da API
    // Por enquanto, vamos usar dados fictícios
    setStats({
      pacientesInternados: 32,
      pacientesTriagem: 8,
      medicamentosAdministrar: 15,
      leitosDisponiveis: 18,
    });

    setPacientesUrgentes([
      { id: 1, nome: 'Roberto Almeida', leito: '12A', status: 'Crítico', sinaisVitais: 'PA: 160/100, FC: 110' },
      { id: 2, nome: 'Mariana Costa', leito: '08B', status: 'Instável', sinaisVitais: 'PA: 90/60, FC: 120' },
      { id: 3, nome: 'Paulo Ferreira', leito: '15C', status: 'Em observação', sinaisVitais: 'PA: 140/90, FC: 95' },
    ]);

    setMedicacoes([
      { id: 1, paciente: 'Roberto Almeida', leito: '12A', medicamento: 'Dipirona', dosagem: '500mg', horario: '12:00' },
      { id: 2, paciente: 'Mariana Costa', leito: '08B', medicamento: 'Amoxicilina', dosagem: '500mg', horario: '12:45' },
      { id: 3, paciente: 'Paulo Ferreira', leito: '15C', medicamento: 'Paracetamol', dosagem: '750mg', horario: '13:15' },
    ]);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-black">Dashboard de Enfermagem</h1>
      
      {/* Opcional: mostrar nome da enfermeira */}
      {user && (
        <p className="text-black mb-4">Olá, {user.nome}. Bem-vindo(a)!</p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black">Pacientes Internados</h2>
          <p className="text-3xl font-bold text-black">{stats.pacientesInternados}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black">Aguardando Triagem</h2>
          <p className="text-3xl font-bold text-black">{stats.pacientesTriagem}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black">Medicamentos a Administrar</h2>
          <p className="text-3xl font-bold text-black">{stats.medicamentosAdministrar}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black">Leitos Disponíveis</h2>
          <p className="text-3xl font-bold text-black">{stats.leitosDisponiveis}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black mb-4">Pacientes que Requerem Atenção</h2>
          
          {pacientesUrgentes.length > 0 ? (
            <div className="divide-y divide-green-200">
              {pacientesUrgentes.map((paciente) => (
                <div key={paciente.id} className="py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-black">{paciente.nome}</p>
                      <p className="text-sm text-black">Leito: {paciente.leito}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      paciente.status === 'Crítico' ? 'bg-green-300 text-black' :
                      paciente.status === 'Instável' ? 'bg-green-200 text-black' :
                      'bg-green-100 text-black'
                    }`}>
                      {paciente.status}
                    </span>
                  </div>
                  <p className="text-sm mt-1 text-black">{paciente.sinaisVitais}</p>
                  <div className="mt-2 flex space-x-2">
                    <button className="text-xs bg-green-700 hover:bg-green-800 text-white px-2 py-1 rounded">
                      Ver detalhes
                    </button>
                    <button className="text-xs bg-green-700 hover:bg-green-800 text-white px-2 py-1 rounded">
                      Registrar sinais
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-black">Nenhum paciente requer atenção imediata.</p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black mb-4">Ações Rápidas</h2>
          
          <div className="space-y-3">
            <a href="/enfermeira/triagem" className="block w-full text-center bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded">
              Iniciar Triagem
            </a>
            <a href="/enfermeira/medicamentos" className="block w-full text-center bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded">
              Administrar Medicamentos
            </a>
            <a href="/enfermeira/sinais-vitais" className="block w-full text-center bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded">
              Registrar Sinais Vitais
            </a>
            <a href="/enfermeira/leitos" className="block w-full text-center bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded">
              Gerenciar Leitos
            </a>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-black mb-4">Medicamentos a Administrar</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-green-200">
            <thead className="bg-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Leito
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Medicamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Dosagem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Horário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-green-200">
              {medicacoes.map((med) => (
                <tr key={med.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-black">{med.paciente}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-black">{med.leito}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-black">{med.medicamento}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-black">{med.dosagem}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-black font-medium">{med.horario}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded text-xs">
                      Administrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-right">
          <a href="/enfermeira/medicamentos" className="text-black hover:underline text-sm font-medium">
            Ver todos os medicamentos →
          </a>
        </div>
      </div>
    </div>
  );
}

export default withProtectedRoute([UserRole.ENFERMEIRA])(EnfermeiraDashboardPage);
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
   */