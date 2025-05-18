'use client';

import { useState, useEffect } from 'react';
import withAuth from '@/lib/withAuth';
import { User, Stats, FilaEspera } from '@/types';
import { usePacientes } from '@/lib/apiPaciente';

// Interface para as props do componente
interface RecepcionistaDashboardPageProps {
  user: User;
}

// Interface para agendamentos futuros
interface Agendamento {
  id: number;
  data: string;
  horario: string;
  paciente: string;
  tipo: string;
  medico: string;
}

function RecepcionistaDashboardPage({ user }: RecepcionistaDashboardPageProps) {
  // Estados para armazenar dados dinâmicos da recepção
  const [stats, setStats] = useState<Stats>({
    pacientesHoje: 0,
    agendamentosHoje: 0,
    pacientesAguardando: 0,
    proximosAgendamentos: 0,
  });

  const [filaEspera, setFilaEspera] = useState<FilaEspera[]>([]);
  const [proximosAgendamentos, setProximosAgendamentos] = useState<Agendamento[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { fetchPacientes, loading: loadingPacientes } = usePacientes();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Função para carregar todos os dados da dashboard
    const carregarDados = async () => {
      try {
        setIsLoading(true);
        
        // Buscar pacientes reais para utilizar nos dados simulados
        const pacientes = await fetchPacientes();
        
        // Dados estatísticos - simulados mas baseados em dados reais quando possível
        setStats({
          pacientesHoje: pacientes.length > 0 ? Math.min(pacientes.length * 2, 24) : 24,
          agendamentosHoje: pacientes.length > 0 ? Math.min(pacientes.length * 3, 35) : 35,
          pacientesAguardando: pacientes.length > 0 ? Math.min(pacientes.length / 2, 6) : 6,
          proximosAgendamentos: pacientes.length > 0 ? Math.min(pacientes.length, 12) : 12,
        });

        // Fila de espera - utilizando nomes de pacientes reais quando disponíveis
        setFilaEspera([
          { id: 1, nome: pacientes[0]?.nome || 'José Silva', horario: '11:30', tipo: 'Consulta', medico: 'Dr. Carlos Santos', status: 'Aguardando' },
          { id: 2, nome: pacientes[1]?.nome || 'Fernanda Lima', horario: '11:45', tipo: 'Retorno', medico: 'Dra. Ana Oliveira', status: 'Triagem' },
          { id: 3, nome: pacientes[2]?.nome || 'Ricardo Souza', horario: '12:00', tipo: 'Exame', medico: 'Dr. Paulo Mendes', status: 'Aguardando' },
          { id: 4, nome: pacientes[3]?.nome || 'Camila Ferreira', horario: '12:15', tipo: 'Consulta', medico: 'Dra. Mariana Costa', status: 'Aguardando' },
          { id: 5, nome: pacientes[4]?.nome || 'Eduardo Martins', horario: '12:30', tipo: 'Consulta', medico: 'Dr. Carlos Santos', status: 'Aguardando' },
          { id: 6, nome: pacientes[5]?.nome || 'Luciana Alves', horario: '12:45', tipo: 'Retorno', medico: 'Dra. Ana Oliveira', status: 'Aguardando' },
        ]);

        // Agendamentos futuros - utilizando nomes de pacientes reais quando disponíveis
        setProximosAgendamentos([
          { id: 1, data: '29/04/2025', horario: '09:00', paciente: pacientes[6]?.nome || 'Antônio Gomes', tipo: 'Consulta', medico: 'Dr. Carlos Santos' },
          { id: 2, data: '29/04/2025', horario: '10:30', paciente: pacientes[7]?.nome || 'Juliana Mendes', tipo: 'Retorno', medico: 'Dra. Ana Oliveira' },
          { id: 3, data: '29/04/2025', horario: '14:15', paciente: pacientes[8]?.nome || 'Roberto Almeida', tipo: 'Exame', medico: 'Dr. Paulo Mendes' }
        ]);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, []); // Array vazio para executar apenas na montagem do componente

  // Exibe loader enquanto os dados estão carregando
  if (isLoading || loadingPacientes) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
        <p className="ml-2 text-purple-700">Carregando dados...</p>
      </div>
    );
  }

  // Manipulador para atualizar a fila (simulado)
  const handleAtualizarFila = () => {
    // Em um sistema real, isso buscaria os dados mais recentes da API
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Manipulador para busca (simulado)
  const handleSearch = () => {
    // Em um sistema real, isso buscaria pacientes na API
    if (searchTerm.trim() === '') return;
    
    alert(`Buscando por: ${searchTerm}`);
    setSearchTerm('');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-black">Dashboard de Recepção</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black">Pacientes Hoje</h2>
          <p className="text-3xl font-bold text-black">{stats.pacientesHoje}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black">Agendamentos Hoje</h2>
          <p className="text-3xl font-bold text-black">{stats.agendamentosHoje}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black">Aguardando Atendimento</h2>
          <p className="text-3xl font-bold text-black">{stats.pacientesAguardando}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black">Próximos Agendamentos</h2>
          <p className="text-3xl font-bold text-black">{stats.proximosAgendamentos}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-black">Fila de Espera</h2>
            <div className="flex space-x-2">
              <button 
                className="px-3 py-1 bg-purple-700 text-white rounded text-sm hover:bg-purple-800"
                onClick={handleAtualizarFila}
              >
                Atualizar
              </button>
              <button className="px-3 py-1 bg-purple-700 text-white rounded text-sm hover:bg-purple-800">
                Gerenciar Fila
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-purple-200">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Horário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Médico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-purple-200">
                {filaEspera.map((paciente) => (
                  <tr key={paciente.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-black">{paciente.nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">{paciente.horario}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">{paciente.tipo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">{paciente.medico}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${paciente.status === 'Aguardando' ? 'bg-purple-100 text-black' :
                          paciente.status === 'Triagem' ? 'bg-purple-200 text-black' :
                            paciente.status === 'Em Atendimento' ? 'bg-purple-300 text-black' :
                              'bg-purple-100 text-black'
                        }`}>
                        {paciente.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="bg-purple-700 hover:bg-purple-800 text-white px-3 py-1 rounded text-xs">
                        Check-in
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black mb-4">Ações Rápidas</h2>

          <div className="space-y-3">
            <a href="/recepcionista/pacientes/novo" className="block w-full text-center bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded">
              Novo Paciente
            </a>
            <a href="/recepcionista/agendamentos/novo" className="block w-full text-center bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded">
              Novo Agendamento
            </a>
            <a href="/recepcionista/check-in" className="block w-full text-center bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded">
              Check-in de Paciente
            </a>
            <a href="/recepcionista/acompanhantes/novo" className="block w-full text-center bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded">
              Cadastrar Acompanhante
            </a>
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-black mb-2">Busca Rápida</h3>
            <div className="flex">
              <input
                type="text"
                placeholder="Nome ou CPF do paciente"
                className="flex-1 px-3 py-2 border border-purple-300 rounded-l-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 placeholder:text-[#333333]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                className="bg-purple-700 text-white px-4 py-2 rounded-r-md hover:bg-purple-800"
                onClick={handleSearch}
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-black mb-4">Próximos Agendamentos</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-purple-200">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Horário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Médico
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-purple-200">
              {proximosAgendamentos.map((agendamento) => (
                <tr key={agendamento.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-black">{agendamento.data}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-black">{agendamento.horario}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-black">{agendamento.paciente}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-black">{agendamento.tipo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-black">{agendamento.medico}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-black hover:text-gray-700">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-right">
          <a href="/recepcionista/agendamentos" className="text-black hover:underline text-sm font-medium">
            Ver todos os agendamentos →
          </a>
        </div>
      </div>
    </div>
  );
}

// HOC para proteger a rota, permitindo apenas recepcionistas
export default withAuth(RecepcionistaDashboardPage, ['recepcionista']);
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/

*/