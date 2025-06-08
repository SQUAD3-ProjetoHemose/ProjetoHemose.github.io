'use client';

import { useState, useEffect } from 'react';
import { Stats, FilaEspera } from '@/types';
import { useAuthentication } from '@/hooks';
import { RecepcionistaService } from '@/lib/services/recepcionista.service';
import { useRouter } from 'next/navigation';

// Interface para agendamentos futuros
interface AgendamentoFuturo {
  id: number;
  data: string;
  horario: string;
  paciente: string;
  tipo: string;
  medico: string;
}

function RecepcionistaDashboardPage() {
  const router = useRouter();
  // Obter o usuário do contexto de autenticação
  const { user } = useAuthentication();

  // Estados para armazenar dados dinâmicos da recepção
  const [stats, setStats] = useState<Stats>({
    pacientesInternados: 0,
    pacientesTriagem: 0,
    medicamentosAdministrar: 0,
    leitosDisponiveis: 0,
    pacientesHoje: 0,
    agendamentosHoje: 0,
    pacientesAguardando: 0,
    proximosAgendamentos: 0,
  });

  const [filaEspera, setFilaEspera] = useState<FilaEspera[]>([]);
  const [proximosAgendamentos, setProximosAgendamentos] = useState<AgendamentoFuturo[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Função para carregar todos os dados da dashboard
    const carregarDados = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Carregar dados em paralelo usando o serviço
        const [statsData, filaData, proximosData] = await Promise.all([
          RecepcionistaService.getDashboardStats(),
          RecepcionistaService.getFilaEspera(),
          RecepcionistaService.getProximosAgendamentos(),
        ]);

        setStats(statsData);
        setFilaEspera(transformarFilaData(filaData));
        setProximosAgendamentos(proximosData);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        setError('Erro ao carregar dados do dashboard. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, []);

  // Função para obter cor da prioridade
  const getPrioridadeColor = (prioridade?: string) => {
    switch (prioridade) {
      case 'Urgente':
        return 'bg-red-100 text-red-800';
      case 'Alta':
        return 'bg-orange-100 text-orange-800';
      case 'Normal':
        return 'bg-blue-100 text-blue-800';
      case 'Baixa':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para validar e transformar dados da fila
  const transformarFilaData = (data: any[]): FilaEspera[] => {
    return data.map((item) => ({
      ...item,
      status: ['Aguardando', 'Triagem', 'Em Atendimento', 'Finalizado'].includes(item.status)
        ? (item.status as FilaEspera['status'])
        : ('Aguardando' as FilaEspera['status']),
      prioridade: ['Urgente', 'Alta', 'Normal', 'Baixa'].includes(item.prioridade)
        ? item.prioridade
        : 'Normal',
      chegada: item.chegada || undefined,
    }));
  };

  // Manipulador para atualizar a fila
  const handleAtualizarFila = async () => {
    try {
      setIsLoading(true);
      const [filaData, statsData] = await Promise.all([
        RecepcionistaService.getFilaEspera(),
        RecepcionistaService.getDashboardStats(),
      ]);
      setFilaEspera(transformarFilaData(filaData));
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao atualizar fila:', error);
      setError('Erro ao atualizar fila. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Manipulador para busca
  const handleSearch = async () => {
    if (searchTerm.trim() === '') return;

    try {
      const pacientes = await RecepcionistaService.buscarPaciente(searchTerm);

      if (pacientes.length === 0) {
        alert('Nenhum paciente encontrado com o termo pesquisado.');
        return;
      }

      if (pacientes.length === 1) {
        // Redirecionar para o perfil do paciente
        router.push(`/recepcionista/pacientes/${pacientes[0].id}`);
      } else {
        // Redirecionar para lista com filtro
        router.push(`/recepcionista/pacientes?search=${encodeURIComponent(searchTerm)}`);
      }

      setSearchTerm('');
    } catch (error) {
      console.error('Erro na busca:', error);
      alert('Erro ao buscar paciente. Verifique o termo e tente novamente.');
    }
  };

  // Exibe loader enquanto os dados estão carregando
  if (isLoading) {
    return (
<<<<<<< HEAD
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
        <p className="ml-2 text-red-700">Carregando dados...</p>
=======
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
        <p className="ml-2 text-purple-700 text-center">Carregando dados do dashboard...</p>
>>>>>>> main
      </div>
    );
  }

  // Exibe erro se houver
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar dashboard</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Recarregar página
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-black">Dashboard de Recepção</h1>

      {/* Saudação personalizada */}
      {user && <p className="text-black text-sm sm:text-base">Olá, {user.nome}. Bem-vindo(a)!</p>}

      {/* Cards de estatísticas - responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-sm sm:text-lg font-semibold text-black">Pacientes Hoje</h2>
          <p className="text-2xl sm:text-3xl font-bold text-black">{stats.pacientesHoje}</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-sm sm:text-lg font-semibold text-black">Agendamentos Hoje</h2>
          <p className="text-2xl sm:text-3xl font-bold text-black">{stats.agendamentosHoje}</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-sm sm:text-lg font-semibold text-black">Aguardando Atendimento</h2>
          <p className="text-2xl sm:text-3xl font-bold text-black">{stats.pacientesAguardando}</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-sm sm:text-lg font-semibold text-black">Próximos Agendamentos</h2>
          <p className="text-2xl sm:text-3xl font-bold text-black">{stats.proximosAgendamentos}</p>
        </div>
      </div>

      {/* Seção principal - responsiva */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fila de espera */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
            <h2 className="text-lg font-semibold text-black">Fila de Espera</h2>
<<<<<<< HEAD
            <div className="flex space-x-2">
              <button 
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-800"
=======
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <button
                className="px-3 py-1 bg-purple-700 text-white rounded text-sm hover:bg-purple-800 w-full sm:w-auto"
>>>>>>> main
                onClick={handleAtualizarFila}
                disabled={isLoading}
              >
                Atualizar
              </button>
<<<<<<< HEAD
              <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-800">
=======
              <button className="px-3 py-1 bg-purple-700 text-white rounded text-sm hover:bg-purple-800 w-full sm:w-auto">
>>>>>>> main
                Gerenciar Fila
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Horário
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Médico
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Status
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Prioridade
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Ação
                  </th>
                </tr>
              </thead>
<<<<<<< HEAD
              <tbody className="bg-white divide-y divide-gray-200">
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
                      <span className={`px-2 py-1 text-xs rounded-full ${paciente.status === 'Aguardando' ? 'bg-red-100 text-black' :
                          paciente.status === 'Triagem' ? 'bg-red-300 text-black' :
                            paciente.status === 'Em Atendimento' ? 'bg-red-400 text-black' :
                              'bg-red-100 text-black'
                        }`}>
                        {paciente.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-xs">
                        Check-in
                      </button>
=======
              <tbody className="bg-white divide-y divide-purple-200">
                {filaEspera.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Nenhum paciente na fila de espera
>>>>>>> main
                    </td>
                  </tr>
                ) : (
                  filaEspera.map((paciente) => (
                    <tr key={paciente.id}>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">{paciente.nome}</div>
                        {paciente.chegada && (
                          <div className="text-xs text-gray-500">Chegou: {paciente.chegada}</div>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">{paciente.horario}</div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">{paciente.tipo}</div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">{paciente.medico}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            paciente.status === 'Aguardando'
                              ? 'bg-purple-100 text-black'
                              : paciente.status === 'Triagem'
                              ? 'bg-purple-200 text-black'
                              : paciente.status === 'Em Atendimento'
                              ? 'bg-purple-300 text-black'
                              : paciente.status === 'Finalizado'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-black'
                          }`}
                        >
                          {paciente.status}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                        {paciente.prioridade && (
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getPrioridadeColor(
                              paciente.prioridade
                            )}`}
                          >
                            {paciente.prioridade}
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                        <button className="bg-purple-700 hover:bg-purple-800 text-white px-2 sm:px-3 py-1 rounded text-xs">
                          Check-in
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black mb-4">Ações Rápidas</h2>

          <div className="space-y-3">
<<<<<<< HEAD
            <a href="/recepcionista/pacientes/novo" className="block w-full text-center bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded">
              Novo Paciente
            </a>
            <a href="/recepcionista/agendamentos/novo" className="block w-full text-center bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded">
              Novo Agendamento
            </a>
            <a href="/recepcionista/check-in" className="block w-full text-center bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded">
              Check-in de Paciente
            </a>
            <a href="/recepcionista/acompanhantes/novo" className="block w-full text-center bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded">
=======
            <a
              href="/recepcionista/pacientes/novo"
              className="block w-full text-center bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded text-sm sm:text-base"
            >
              Novo Paciente
            </a>
            <a
              href="/recepcionista/agendamentos/novo"
              className="block w-full text-center bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded text-sm sm:text-base"
            >
              Novo Agendamento
            </a>
            <a
              href="/recepcionista/check-in"
              className="block w-full text-center bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded text-sm sm:text-base"
            >
              Check-in de Paciente
            </a>
            <a
              href="/recepcionista/acompanhantes/novo"
              className="block w-full text-center bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded text-sm sm:text-base"
            >
>>>>>>> main
              Cadastrar Acompanhante
            </a>
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-black mb-2">Busca Rápida</h3>
            <div className="flex flex-col sm:flex-row">
              <input
                type="text"
                placeholder="Nome ou CPF do paciente"
<<<<<<< HEAD
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 placeholder:text-[#333333]"
=======
                className="flex-1 px-3 py-2 border border-purple-300 rounded-l-md sm:rounded-r-none rounded-r-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 placeholder:text-[#333333] text-sm"
>>>>>>> main
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
<<<<<<< HEAD
              <button 
                className="bg-gray-600 text-white px-4 py-2 rounded-r-md hover:bg-gray-700"
=======
              <button
                className="bg-purple-700 text-white px-4 py-2 rounded-r-md sm:rounded-l-none rounded-l-md hover:bg-purple-800 mt-2 sm:mt-0 text-sm"
>>>>>>> main
                onClick={handleSearch}
                disabled={!searchTerm.trim()}
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Próximos agendamentos */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-black mb-4">Próximos Agendamentos</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Data
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Horário
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Paciente
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Tipo
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Médico
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Ação
                </th>
              </tr>
            </thead>
<<<<<<< HEAD
            <tbody className="bg-white divide-y divide-red-200">
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
=======
            <tbody className="bg-white divide-y divide-purple-200">
              {proximosAgendamentos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum agendamento futuro encontrado
>>>>>>> main
                  </td>
                </tr>
              ) : (
                proximosAgendamentos.map((agendamento) => (
                  <tr key={agendamento.id}>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">{agendamento.data}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">{agendamento.horario}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-black">{agendamento.paciente}</div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">{agendamento.tipo}</div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">{agendamento.medico}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        className="text-purple-600 hover:text-purple-800 font-medium"
                        onClick={() => router.push(`/recepcionista/agendamentos/${agendamento.id}`)}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-right">
          <a
            href="/recepcionista/agendamentos"
            className="text-purple-600 hover:text-purple-800 hover:underline text-sm font-medium"
          >
            Ver todos os agendamentos →
          </a>
        </div>
      </div>
    </div>
  );
}

// Exportar diretamente sem HOC, pois a proteção já está no layout
export default RecepcionistaDashboardPage;

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
