'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import withAuth from '@/lib/withAuth';
import { useAgendamentos } from '@/lib/apiAgendamento';
import { usePacientes } from '@/lib/apiPaciente';
import { useUsers } from '@/lib/apiUser';
import { AgendamentoForm, TipoAgendamento, StatusAgendamento } from '@/types';
import { format } from 'date-fns';

function NovoAgendamentoPage() {
  const router = useRouter();
  const { createAgendamento } = useAgendamentos();
  const { pacientes, fetchPacientes } = usePacientes();
  const { users, fetchUsers } = useUsers();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estado para o formulário
  const [formData, setFormData] = useState<AgendamentoForm>({
    data: format(new Date(), 'yyyy-MM-dd'),
    horario: '08:00',
    tipo: TipoAgendamento.CONSULTA,
    paciente_id: 0,
    medico_id: 0,
    observacoes: '',
    status: StatusAgendamento.AGENDADO
  });
  
  // Carregar pacientes e médicos
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setIsLoading(true);
        await fetchPacientes();
        await fetchUsers('medico');
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar pacientes e médicos. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarDados();
  }, []);
  
  // Manipulador de mudança de campos
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Converter valores para número quando necessário
    if (name === 'paciente_id' || name === 'medico_id') {
      setFormData({
        ...formData,
        [name]: parseInt(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Manipulador de envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar os campos obrigatórios
    if (formData.paciente_id === 0 || formData.medico_id === 0) {
      setError('Por favor, selecione um paciente e um médico.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Enviar formulário para a API
      await createAgendamento(formData);
      
      // Exibir mensagem de sucesso
      setSuccess('Agendamento criado com sucesso!');
      
      // Aguardar 2 segundos e redirecionar
      setTimeout(() => {
        router.push('/recepcionista/agendamentos');
      }, 2000);
      
    } catch (err: any) {
      console.error('Erro ao criar agendamento:', err);
      setError(err.message || 'Ocorreu um erro ao criar o agendamento.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para voltar à página de listagem
  const handleVoltar = () => {
    router.push('/recepcionista/agendamentos');
  };

  // Renderizar o loading state
  if (isLoading && !success) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-700"></div>
        <p className="ml-2 text-red-800">Carregando...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Novo Agendamento</h1>
        <button
          onClick={handleVoltar}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Voltar
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
          <p>{success}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campo de data */}
            <div>
              <label htmlFor="data" className="block text-sm font-medium text-black mb-2">
                Data
              </label>
              <input
                type="date"
                id="data"
                name="data"
                value={formData.data}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-gray-500 focus:border-gray-500"
                required
              />
            </div>
            
            {/* Campo de horário */}
            <div>
              <label htmlFor="horario" className="block text-sm font-medium text-black mb-2">
                Horário
              </label>
              <input
                type="time"
                id="horario"
                name="horario"
                value={formData.horario}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-gray-500 focus:border-gray-500"
                required
              />
            </div>
            
            {/* Campo de tipo */}
            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-black mb-2">
                Tipo de Agendamento
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-gray-500 focus:border-gray-500"
                required
              >
                <option value={TipoAgendamento.CONSULTA}>Consulta</option>
                <option value={TipoAgendamento.EXAME}>Exame</option>
                <option value={TipoAgendamento.RETORNO}>Retorno</option>
                <option value={TipoAgendamento.PROCEDIMENTO}>Procedimento</option>
              </select>
            </div>
            
            {/* Campo de paciente */}
            <div>
              <label htmlFor="paciente_id" className="block text-sm font-medium text-black mb-2">
                Paciente
              </label>
              <select
                id="paciente_id"
                name="paciente_id"
                value={formData.paciente_id}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-gray-500 focus:border-gray-500"
                required
              >
                <option value={0}>Selecione um paciente</option>
                {pacientes.map((paciente) => (
                  <option key={paciente.id} value={paciente.id}>
                    {paciente.nome}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Campo de médico */}
            <div>
              <label htmlFor="medico_id" className="block text-sm font-medium text-black mb-2">
                Médico
              </label>
              <select
                id="medico_id"
                name="medico_id"
                value={formData.medico_id}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-gray-500 focus:border-gray-500"
                required
              >
                <option value={0}>Selecione um médico</option>
                {users
                  .filter((user) => user.tipo === 'medico')
                  .map((medico) => (
                    <option key={medico.id} value={medico.id}>
                      {medico.nome}
                    </option>
                  ))}
              </select>
            </div>
            
            {/* Campo de status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-black mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-gray-500 focus:border-gray-500"
              >
                <option value={StatusAgendamento.AGENDADO}>Agendado</option>
                <option value={StatusAgendamento.CONFIRMADO}>Confirmado</option>
              </select>
            </div>
          </div>
          
          {/* Campo de observações */}
          <div className="mt-6">
            <label htmlFor="observacoes" className="block text-sm font-medium text-black mb-2">
              Observações
            </label>
            <textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes || ''}
              onChange={handleInputChange}
              rows={3}
              className="border border-gray-300 rounded-md p-2 w-full focus:ring-gray-500 focus:border-gray-500"
              placeholder="Informações adicionais sobre o agendamento..."
            />
          </div>
          
          {/* Botões do formulário */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleVoltar}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded"
              disabled={isLoading || success !== null}
            >
              {isLoading ? 'Salvando...' : 'Salvar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Proteger a rota apenas para recepcionistas e admins
export default withAuth(NovoAgendamentoPage, ['recepcionista', 'admin']);
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
