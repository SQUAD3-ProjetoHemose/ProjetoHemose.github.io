'use client';

import { useState, useEffect } from 'react';
import withAuth from '@/lib/withAuth';
import { Stats, Atendimento } from '@/types';
import { usePacientes } from '@/lib/apiPaciente';
import { useAuth } from '@/lib/authContext'; // Corrigindo importação do useAuth

// Interface para atividades recentes
interface AtividadeMedica {
  id: number;
  data: string;
  descricao: string;
}

function MedicoDashboardPage() {
  // Obter o usuário do contexto de autenticação
  const { user } = useAuth();
  
  // Estados para armazenar dados dinâmicos do médico
  const [stats, setStats] = useState<Stats>({
    pacientesHoje: 0,
    prescricoesAtivas: 0,
    internacoesAtivas: 0,
    totalPacientes: 0
  });

  const [proximosAtendimentos, setProximosAtendimentos] = useState<Atendimento[]>([]);
  const [atividades, setAtividades] = useState<AtividadeMedica[]>([]);
  const { fetchPacientes, loading: loadingPacientes } = usePacientes();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Função para carregar todos os dados do dashboard médico
    const carregarDadosMedico = async () => {
      try {
        setIsLoading(true);
        
        // Buscar pacientes
        const pacientes = await fetchPacientes();
        
        // Em uma aplicação real, estes dados viriam de endpoints específicos
        // Por enquanto, vamos calcular baseado nos dados que temos ou simular
        setStats({
          totalPacientes: pacientes.length,
          pacientesHoje: Math.floor(Math.random() * 15) + 5, // Simulando entre 5 e 20 pacientes hoje
          prescricoesAtivas: Math.floor(Math.random() * 30) + 10, // Simulando entre 10 e 40 prescrições
          internacoesAtivas: Math.floor(Math.random() * 10) + 3 // Simulando entre 3 e 13 internações
        });
        
        // Próximos atendimentos simulados, em uma app real viriam da API de agendamentos
        setProximosAtendimentos([
          { id: 1, nome: pacientes[0]?.nome || 'Maria Silva', horario: '13:30', tipo: 'Consulta' },
          { id: 2, nome: pacientes[1]?.nome || 'João Santos', horario: '14:15', tipo: 'Retorno' },
          { id: 3, nome: pacientes[2]?.nome || 'Ana Oliveira', horario: '15:00', tipo: 'Exame' },
          { id: 4, nome: pacientes[3]?.nome || 'Carlos Pereira', horario: '16:30', tipo: 'Consulta' },
        ]);
        
        // Atividades recentes simuladas
        setAtividades([
          { id: 1, data: 'Hoje, 10:15', descricao: `Prontuário atualizado: ${pacientes[0]?.nome || 'Maria Silva'}` },
          { id: 2, data: 'Hoje, 09:30', descricao: `Nova prescrição: ${pacientes[1]?.nome || 'João Santos'} - Dipirona 500mg` },
          { id: 3, data: 'Ontem, 16:45', descricao: `Alta concedida: ${pacientes[2]?.nome || 'Ana Oliveira'}` },
          { id: 4, data: 'Ontem, 14:20', descricao: `Nova internação: ${pacientes[3]?.nome || 'Carlos Pereira'} - Leito 08` }
        ]);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard médico:', error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDadosMedico();
  }, []); // Array vazio para executar apenas na montagem do componente

  // Exibe loader enquanto os dados estão carregando
  if (isLoading || loadingPacientes) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        <p className="ml-2 text-blue-700">Carregando dados médicos...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-black">Dashboard Médico</h1>
      
      {/* Opcional: mostrar nome do médico */}
      {user && (
        <p className="text-black mb-4">Bem-vindo(a), Dr(a). {user.nome}</p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black">Total de Pacientes</h2>
          <p className="text-3xl font-bold text-black">{stats.totalPacientes}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black">Pacientes Hoje</h2>
          <p className="text-3xl font-bold text-black">{stats.pacientesHoje}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black">Prescrições Ativas</h2>
          <p className="text-3xl font-bold text-black">{stats.prescricoesAtivas}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black">Internações Ativas</h2>
          <p className="text-3xl font-bold text-black">{stats.internacoesAtivas}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black mb-4">Próximos Atendimentos</h2>
          
          {proximosAtendimentos.length > 0 ? (
            <div className="divide-y divide-blue-200">
              {proximosAtendimentos.map((atendimento) => (
                <div key={atendimento.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-black">{atendimento.nome}</p>
                    <p className="text-sm text-black">{atendimento.tipo}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-black">{atendimento.horario}</p>
                    <button className="text-sm text-black hover:underline">Ver detalhes</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-black">Nenhum atendimento agendado para hoje.</p>
          )}
          
          <div className="mt-4">
            <a href="/medico/agenda" className="text-black hover:underline text-sm font-medium">
              Ver agenda completa →
            </a>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black mb-4">Ações Rápidas</h2>
          
          <div className="space-y-3">
            <a href="/medico/prontuarios/novo" className="block w-full text-center bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded">
              Novo Prontuário
            </a>
            <a href="/medico/prescricoes/nova" className="block w-full text-center bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded">
              Nova Prescrição
            </a>
            <a href="/medico/pacientes" className="block w-full text-center bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded">
              Buscar Paciente
            </a>
            <a href="/medico/internacoes" className="block w-full text-center bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded">
              Gerenciar Internações
            </a>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-black mb-4">Atividades Recentes</h2>
        
        <div className="space-y-4">
          {atividades.map((atividade) => (
            <div key={atividade.id} className="border-l-4 border-blue-700 pl-4 py-2">
              <p className="text-sm text-black">{atividade.data}</p>
              <p className="font-medium text-black">{atividade.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// HOC para proteger a rota, permitindo apenas médicos
export default withAuth(MedicoDashboardPage, ['medico']);
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
 */