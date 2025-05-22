'use client';

import { useState, useEffect } from 'react';
import withAuth from '@/lib/withAuth';
import { useAgendamentos } from '@/lib/apiAgendamento';
import { usePacientes } from '@/lib/apiPaciente';
import { useUsers } from '@/lib/apiUser';
import { StatusAgendamento } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function CheckInPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [checkedInSuccess, setCheckedInSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    agendamentos, 
    loading, 
    fetchAgendamentosHoje,
    fetchAgendamentos,
    confirmarAgendamento
  } = useAgendamentos();
  
  const { pacientes, fetchPacientes } = usePacientes();
  const { users } = useUsers();
  
  // Carregar agendamentos do dia e pacientes
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchPacientes();
        await fetchAgendamentosHoje();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados. Por favor, recarregue a página.');
      }
    };
    
    loadData();
  }, []);
  
  // Buscar agendamentos ou pacientes
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      // Buscar pacientes pelo nome
      const pacientesEncontrados = pacientes.filter(p => 
        p.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      let resultados: any[] = [];
      
      if (pacientesEncontrados.length > 0) {
        for (const paciente of pacientesEncontrados) {
          // Para cada paciente encontrado, buscar seus agendamentos de hoje
          const today = format(new Date(), 'yyyy-MM-dd');
          const agendamentosPaciente = await fetchAgendamentos(today, undefined, paciente.id);
          
          // Adicionar aos resultados apenas se houver agendamentos
          if (agendamentosPaciente.length > 0) {
            resultados = [
              ...resultados,
             
              ...agendamentosPaciente.map((a: any) => ({
                ...a,
                paciente: paciente
              }))
            ];
          }
        }
      }
      
      setSearchResults(resultados);
      
      if (resultados.length === 0) {
        setError('Nenhum agendamento encontrado para o paciente informado.');
      }
    } catch (err) {
      console.error('Erro na busca:', err);
      setError('Erro ao buscar. Por favor, tente novamente.');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Realizar check-in do paciente
  const handleCheckIn = async (agendamentoId: number) => {
    try {
      setError(null);
      setCheckedInSuccess(null);
      
      // Confirmar o agendamento
      await confirmarAgendamento(agendamentoId);
      
      // Atualizar a lista de agendamentos do dia
      await fetchAgendamentosHoje();
      
      // Limpar resultados de busca e mostrar mensagem de sucesso
      setSearchResults([]);
      setSearchTerm('');
      setCheckedInSuccess('Check-in realizado com sucesso!');
      
      // Limpar a mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setCheckedInSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Erro ao realizar check-in:', err);
      setError('Erro ao realizar check-in. Por favor, tente novamente.');
    }
  };
  
  // Obter o nome do médico
  const getMedicoNome = (medicoId: number) => {
    const medico = users.find(u => u.id === medicoId);
    return medico ? medico.nome : 'Médico não encontrado';
  };
  
  // Traduzir tipo para português
  const getTipoName = (tipo: string) => {
    switch (tipo) {
      case 'consulta':
        return 'Consulta';
      case 'exame':
        return 'Exame';
      case 'retorno':
        return 'Retorno';
      case 'procedimento':
        return 'Procedimento';
      default:
        return tipo;
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-black">Check-in de Pacientes</h1>
      
      {/* Barra de busca */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold text-black mb-4">Buscar paciente</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nome do paciente"
            className="border border-red-300 rounded-md p-2 flex-grow focus:ring-red-500 focus:border-red-500"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchTerm.trim()}
            className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
        
        {/* Mensagens de erro ou sucesso */}
        {error && (
          <div className="mt-4 bg-red-100 border-l-4 border-amber-500 text-amber-700 p-4">
            <p>{error}</p>
          </div>
        )}
        
        {checkedInSuccess && (
          <div className="mt-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
            <p>{checkedInSuccess}</p>
          </div>
        )}
        
        {/* Resultados da busca */}
        {searchResults.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-semibold text-black mb-2">Agendamentos encontrados</h3>
            <div className="divide-y divide-red-200">
              {searchResults.map((resultado) => (
                <div key={resultado.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-black">{resultado.paciente.nome}</p>
                      <p className="text-sm text-black">
                        {getTipoName(resultado.tipo)} às {resultado.horario} com {getMedicoNome(resultado.medico_id)}
                      </p>
                      {resultado.observacoes && (
                        <p className="text-sm text-black mt-1">Obs: {resultado.observacoes}</p>
                      )}
                    </div>
                    <div>
                      {resultado.status === StatusAgendamento.AGENDADO ? (
                        <button
                          onClick={() => handleCheckIn(resultado.id)}
                          className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded"
                        >
                          Realizar Check-in
                        </button>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Check-in já realizado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Lista de agendamentos confirmados (com check-in realizado) */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-black mb-4">
          Pacientes com check-in realizado hoje ({format(new Date(), "dd 'de' MMMM", { locale: ptBR })})
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
            <p className="ml-2 text-red-700">Carregando...</p>
          </div>
        ) : (
          <>
            {agendamentos.filter(a => a.status === StatusAgendamento.CONFIRMADO).length === 0 ? (
              <p className="text-gray-500">Nenhum paciente realizou check-in hoje.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-red-200">
                  <thead className="bg-red-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Horário
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Paciente
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Tipo
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Médico
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-red-200">
                    {agendamentos
                      .filter(a => a.status === StatusAgendamento.CONFIRMADO)
                      .sort((a, b) => a.horario.localeCompare(b.horario))
                      .map((agendamento) => {
                        const paciente = pacientes.find(p => p.id === agendamento.paciente_id);
                        
                        return (
                          <tr key={agendamento.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                              {agendamento.horario}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-black">
                                {paciente?.nome || 'Paciente não encontrado'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-black">
                                {getTipoName(agendamento.tipo)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-black">
                                {getMedicoNome(agendamento.medico_id)}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Proteger a rota para apenas recepcionista e admin
export default withAuth(CheckInPage, ['recepcionista', 'admin']);
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
