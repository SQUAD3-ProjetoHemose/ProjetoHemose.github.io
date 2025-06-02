'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { withProtectedRoute } from '@/hooks/useAuthentication';
import useAgendamentoStore from '@/store/agendamentoStore';
import usePacienteStore from '@/store/pacienteStore';
import useUserStore from '@/store/userStore';
import { Agendamento, StatusAgendamento, TipoAgendamento, UserRole } from '@/types';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function AgendamentosPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filteredStatus, setFilteredStatus] = useState<StatusAgendamento | ''>('');
  const [filteredTipo, setFilteredTipo] = useState<TipoAgendamento | ''>('');
  const [filteredMedicoId, setFilteredMedicoId] = useState<number | ''>('');
  
  const { 
    agendamentos, 
    loading, 
    error,
    fetchAgendamentos,
    confirmarAgendamento,
    cancelarAgendamento,
    realizarAgendamento,
    registrarFalta
  } = useAgendamentoStore();
  
  const { pacientes, fetchPacientes } = usePacienteStore();
  const { users, fetchUsers } = useUserStore();
  
  // Carregar médicos, pacientes e agendamentos da data selecionada
  useEffect(() => {
    const carregarDados = async () => {
      try {
        await fetchUsers('medico');
        await fetchPacientes();
        
        // Buscar agendamentos por data
        const dataFormatada = format(selectedDate, 'yyyy-MM-dd');
        await fetchAgendamentos(dataFormatada);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    
    carregarDados();
  }, [selectedDate, fetchUsers, fetchPacientes, fetchAgendamentos]);
  
  // Função para navegar para o dia anterior
  const handlePreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };
  
  // Função para navegar para o próximo dia
  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };
  
  // Função para ir para a página de novo agendamento
  const handleNewAppointment = () => {
    router.push('/recepcionista/agendamentos/novo');
  };
  
  // Função para editar um agendamento
  const handleEditAppointment = (id: number) => {
    router.push(`/recepcionista/agendamentos/editar/${id}`);
  };
  
  // Função para confirmar um agendamento
  const handleConfirmAppointment = async (id: number) => {
    if (window.confirm('Deseja confirmar este agendamento?')) {
      try {
        await confirmarAgendamento(id);
        // Recarregar agendamentos da data atual
        const dataFormatada = format(selectedDate, 'yyyy-MM-dd');
        await fetchAgendamentos(dataFormatada);
      } catch (error) {
        console.error('Erro ao confirmar agendamento:', error);
      }
    }
  };
  
  // Função para cancelar um agendamento
  const handleCancelAppointment = async (id: number) => {
    if (window.confirm('Deseja cancelar este agendamento?')) {
      try {
        await cancelarAgendamento(id);
        // Recarregar agendamentos da data atual
        const dataFormatada = format(selectedDate, 'yyyy-MM-dd');
        await fetchAgendamentos(dataFormatada);
      } catch (error) {
        console.error('Erro ao cancelar agendamento:', error);
      }
    }
  };
  
  // Função para marcar um agendamento como realizado
  const handleCompleteAppointment = async (id: number) => {
    if (window.confirm('Deseja marcar este agendamento como realizado?')) {
      try {
        await realizarAgendamento(id);
        // Recarregar agendamentos da data atual
        const dataFormatada = format(selectedDate, 'yyyy-MM-dd');
        await fetchAgendamentos(dataFormatada);
      } catch (error) {
        console.error('Erro ao marcar agendamento como realizado:', error);
      }
    }
  };
  
  // Função para registrar falta no agendamento
  const handleMissedAppointment = async (id: number) => {
    if (window.confirm('Deseja registrar falta para este agendamento?')) {
      try {
        await registrarFalta(id);
        // Recarregar agendamentos da data atual
        const dataFormatada = format(selectedDate, 'yyyy-MM-dd');
        await fetchAgendamentos(dataFormatada);
      } catch (error) {
        console.error('Erro ao registrar falta no agendamento:', error);
      }
    }
  };
  
  // Filtragem de agendamentos
  const filteredAgendamentos = agendamentos.filter(agendamento => {
    let match = true;
    
    if (filteredStatus && agendamento.status !== filteredStatus) {
      match = false;
    }
    
    if (filteredTipo && agendamento.tipo !== filteredTipo) {
      match = false;
    }
    
    if (filteredMedicoId && agendamento.medico_id !== +filteredMedicoId) {
      match = false;
    }
    
    return match;
  });
  
  // Obter nome do paciente por ID ou do objeto paciente
  const getPacienteNome = (agendamento: Agendamento) => {
    // Primeiro tentar obter do objeto paciente no agendamento
    if (agendamento.paciente?.nome) {
      return agendamento.paciente.nome;
    }
    
    // Senão, buscar na lista de pacientes
    const paciente = pacientes.find(p => p.id === agendamento.paciente_id);
    return paciente ? paciente.nome : 'Paciente não encontrado';
  };
  
  // Obter nome do médico por ID ou do objeto médico
  const getMedicoNome = (agendamento: Agendamento) => {
    // Primeiro tentar obter do objeto médico no agendamento
    if (agendamento.medico?.nome) {
      return agendamento.medico.nome;
    }
    
    // Senão, buscar na lista de usuários
    const medico = users.find(u => u.id === agendamento.medico_id);
    return medico ? medico.nome : 'Médico não encontrado';
  };
  
  // Obter cor do status
  const getStatusColor = (status: StatusAgendamento) => {
    switch (status) {
      case StatusAgendamento.AGENDADO:
        return 'bg-blue-100 text-blue-800';
      case StatusAgendamento.CONFIRMADO:
        return 'bg-green-100 text-green-800';
      case StatusAgendamento.CANCELADO:
        return 'bg-red-100 text-red-800';
      case StatusAgendamento.REALIZADO:
        return 'bg-purple-100 text-purple-800';
      case StatusAgendamento.FALTOU:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  // Traduzir status para português
  const getStatusName = (status: StatusAgendamento) => {
    switch (status) {
      case StatusAgendamento.AGENDADO:
        return 'Agendado';
      case StatusAgendamento.CONFIRMADO:
        return 'Confirmado';
      case StatusAgendamento.CANCELADO:
        return 'Cancelado';
      case StatusAgendamento.REALIZADO:
        return 'Realizado';
      case StatusAgendamento.FALTOU:
        return 'Faltou';
      default:
        return status;
    }
  };
  
  // Traduzir tipo para português
  const getTipoName = (tipo: TipoAgendamento) => {
    switch (tipo) {
      case TipoAgendamento.CONSULTA:
        return 'Consulta';
      case TipoAgendamento.EXAME:
        return 'Exame';
      case TipoAgendamento.RETORNO:
        return 'Retorno';
      case TipoAgendamento.PROCEDIMENTO:
        return 'Procedimento';
      default:
        return tipo;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
        <p className="text-purple-700 text-center">Carregando agendamentos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar agendamentos</h2>
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
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-black">Gerenciamento de Agendamentos</h1>
      
      {/* Seleção de Data e Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Navegação de data */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={handlePreviousDay}
              className="bg-purple-700 hover:bg-purple-800 text-white p-2 rounded"
            >
              &lt; Anterior
            </button>
            <div className="text-xl font-semibold">
              {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>
            <button 
              onClick={handleNextDay}
              className="bg-purple-700 hover:bg-purple-800 text-white p-2 rounded"
            >
              Próximo &gt;
            </button>
          </div>
          
          {/* Botão de novo agendamento */}
          <button 
            onClick={handleNewAppointment}
            className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded"
          >
            Novo Agendamento
          </button>
        </div>
        
        {/* Filtros */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-black mb-1">Status</label>
            <select
              id="statusFilter"
              className="border border-purple-300 rounded p-2 w-40"
              value={filteredStatus}
              onChange={(e) => setFilteredStatus(e.target.value as StatusAgendamento | '')}
            >
              <option value="">Todos</option>
              <option value={StatusAgendamento.AGENDADO}>Agendado</option>
              <option value={StatusAgendamento.CONFIRMADO}>Confirmado</option>
              <option value={StatusAgendamento.CANCELADO}>Cancelado</option>
              <option value={StatusAgendamento.REALIZADO}>Realizado</option>
              <option value={StatusAgendamento.FALTOU}>Faltou</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="tipoFilter" className="block text-sm font-medium text-black mb-1">Tipo</label>
            <select
              id="tipoFilter"
              className="border border-purple-300 rounded p-2 w-40"
              value={filteredTipo}
              onChange={(e) => setFilteredTipo(e.target.value as TipoAgendamento | '')}
            >
              <option value="">Todos</option>
              <option value={TipoAgendamento.CONSULTA}>Consulta</option>
              <option value={TipoAgendamento.EXAME}>Exame</option>
              <option value={TipoAgendamento.RETORNO}>Retorno</option>
              <option value={TipoAgendamento.PROCEDIMENTO}>Procedimento</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="medicoFilter" className="block text-sm font-medium text-black mb-1">Médico</label>
            <select
              id="medicoFilter"
              className="border border-purple-300 rounded p-2 w-56"
              value={filteredMedicoId}
              onChange={(e) => setFilteredMedicoId(e.target.value ? +e.target.value : '')}
            >
              <option value="">Todos</option>
              {users.filter(u => u.tipo === 'medico').map(medico => (
                <option key={medico.id} value={medico.id}>{medico.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Lista de Agendamentos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-purple-200">
            <thead className="bg-purple-50">
              <tr>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Horário
                </th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Paciente
                </th>
                <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Médico
                </th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-purple-200">
              {filteredAgendamentos.length > 0 ? (
                filteredAgendamentos.map((agendamento) => (
                  <tr key={agendamento.id}>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-black">
                      {agendamento.horario}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-black">
                        {getPacienteNome(agendamento)}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">
                        {getTipoName(agendamento.tipo)}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">
                        {getMedicoNome(agendamento)}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(agendamento.status)}`}>
                        {getStatusName(agendamento.status)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                        <button
                          onClick={() => handleEditAppointment(agendamento.id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Editar
                        </button>
                        
                        {agendamento.status === StatusAgendamento.AGENDADO && (
                          <button
                            onClick={() => handleConfirmAppointment(agendamento.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                          >
                            Confirmar
                          </button>
                        )}
                        
                        {(agendamento.status === StatusAgendamento.AGENDADO || agendamento.status === StatusAgendamento.CONFIRMADO) && (
                          <>
                            <button
                              onClick={() => handleCompleteAppointment(agendamento.id)}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs"
                            >
                              Atendido
                            </button>
                            
                            <button
                              onClick={() => handleMissedAppointment(agendamento.id)}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs"
                            >
                              Faltou
                            </button>
                            
                            <button
                              onClick={() => handleCancelAppointment(agendamento.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                    Nenhum agendamento encontrado para esta data ou com estes filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Resumo do dia */}
      {agendamentos.length > 0 && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2 text-black">Resumo do Dia</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-100 p-3 rounded-md">
              <div className="text-blue-800 font-semibold">Total</div>
              <div className="text-2xl">{agendamentos.length}</div>
            </div>
            <div className="bg-green-100 p-3 rounded-md">
              <div className="text-green-800 font-semibold">Confirmados</div>
              <div className="text-2xl">
                {agendamentos.filter(a => a.status === StatusAgendamento.CONFIRMADO).length}
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-md">
              <div className="text-purple-800 font-semibold">Realizados</div>
              <div className="text-2xl">
                {agendamentos.filter(a => a.status === StatusAgendamento.REALIZADO).length}
              </div>
            </div>
            <div className="bg-red-100 p-3 rounded-md">
              <div className="text-red-800 font-semibold">Cancelados</div>
              <div className="text-2xl">
                {agendamentos.filter(a => a.status === StatusAgendamento.CANCELADO).length}
              </div>
            </div>
            <div className="bg-gray-100 p-3 rounded-md">
              <div className="text-gray-800 font-semibold">Faltas</div>
              <div className="text-2xl">
                {agendamentos.filter(a => a.status === StatusAgendamento.FALTOU).length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Protege a rota para apenas recepcionista e admin
export default withProtectedRoute([UserRole.ADMIN,UserRole.RECEPCIONISTA])(AgendamentosPage);
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
