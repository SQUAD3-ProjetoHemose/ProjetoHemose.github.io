'use client';

import { withProtectedRoute } from '@/hooks/useAuthentication';
import useAgendamentoStore from '@/store/agendamentoStore';
import usePacienteStore from '@/store/pacienteStore';
import useUserStore from '@/store/userStore';
import { AgendamentoForm, StatusAgendamento, TipoAgendamento, UserRole } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function EditarAgendamentoPage() {
  const params = useParams();
  const agendamentoId = parseInt(params.id as string);
  const router = useRouter();
  const { fetchAgendamento, updateAgendamento, deleteAgendamento } = useAgendamentoStore();
  const { pacientes, fetchPacientes } = usePacienteStore();
  const { users, fetchUsers } = useUserStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estado para o formulário
  const [formData, setFormData] = useState<AgendamentoForm>({
    data: '',
    horario: '',
    tipo: TipoAgendamento.CONSULTA,
    paciente_id: 0,
    medico_id: 0,
    observacoes: '',
    status: StatusAgendamento.AGENDADO,
  });

  // Carregar dados do agendamento, pacientes e médicos
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Carregar os dados necessários
        await fetchPacientes();
        await fetchUsers('medico');

        // Carregar o agendamento específico
        const dadosAgendamento = await fetchAgendamento(agendamentoId);

        if (dadosAgendamento) {
          // Formatar a data para o formato adequado para input type="date"
          const dataFormatada = dadosAgendamento.data.substring(0, 10); // yyyy-MM-dd

          setFormData({
            data: dataFormatada,
            horario: dadosAgendamento.hora,
            tipo: dadosAgendamento.tipo,
            paciente_id: dadosAgendamento.paciente_id,
            medico_id: dadosAgendamento.medico_id,
            observacoes: dadosAgendamento.observacoes || '',
            status: dadosAgendamento.status,
          });
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados do agendamento. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, [agendamentoId, fetchAgendamento, fetchPacientes, fetchUsers]);

  // Manipulador de mudança de campos
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Converter valores para número quando necessário
    if (name === 'paciente_id' || name === 'medico_id') {
      setFormData({
        ...formData,
        [name]: parseInt(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
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
      await updateAgendamento(agendamentoId, formData);

      // Exibir mensagem de sucesso
      setSuccess('Agendamento atualizado com sucesso!');

      // Aguardar 2 segundos e redirecionar
      setTimeout(() => {
        router.push('/recepcionista/agendamentos');
      }, 2000);
    } catch (err: any) {
      console.error('Erro ao atualizar agendamento:', err);
      setError(err.message || 'Ocorreu um erro ao atualizar o agendamento.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para excluir o agendamento
  const handleDelete = async () => {
    if (
      window.confirm(
        'Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.'
      )
    ) {
      try {
        setIsLoading(true);
        setError(null);

        await deleteAgendamento(agendamentoId);

        // Exibir mensagem de sucesso
        setSuccess('Agendamento excluído com sucesso!');

        // Aguardar 2 segundos e redirecionar
        setTimeout(() => {
          router.push('/recepcionista/agendamentos');
        }, 2000);
      } catch (err: any) {
        console.error('Erro ao excluir agendamento:', err);
        setError(err.message || 'Ocorreu um erro ao excluir o agendamento.');
      } finally {
        setIsLoading(false);
      }
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
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
        <p className="ml-2 text-purple-700">Carregando...</p>
      </div>
    );
  }

  // Obter o nome do status para exibição
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Editar Agendamento #{agendamentoId}</h1>
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
                className="border border-purple-300 rounded-md p-2 w-full focus:ring-purple-500 focus:border-purple-500"
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
                className="border border-purple-300 rounded-md p-2 w-full focus:ring-purple-500 focus:border-purple-500"
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
                className="border border-purple-300 rounded-md p-2 w-full focus:ring-purple-500 focus:border-purple-500"
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
                className="border border-purple-300 rounded-md p-2 w-full focus:ring-purple-500 focus:border-purple-500"
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
                className="border border-purple-300 rounded-md p-2 w-full focus:ring-purple-500 focus:border-purple-500"
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
                className="border border-purple-300 rounded-md p-2 w-full focus:ring-purple-500 focus:border-purple-500"
              >
                <option value={StatusAgendamento.AGENDADO}>Agendado</option>
                <option value={StatusAgendamento.CONFIRMADO}>Confirmado</option>
                <option value={StatusAgendamento.CANCELADO}>Cancelado</option>
                <option value={StatusAgendamento.REALIZADO}>Realizado</option>
                <option value={StatusAgendamento.FALTOU}>Faltou</option>
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
              className="border border-purple-300 rounded-md p-2 w-full focus:ring-purple-500 focus:border-purple-500"
              placeholder="Informações adicionais sobre o agendamento..."
            />
          </div>

          {/* Botões do formulário */}
          <div className="mt-8 flex justify-between space-x-4">
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              disabled={isLoading || success !== null}
            >
              Excluir Agendamento
            </button>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleVoltar}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded"
                disabled={isLoading || success !== null}
              >
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Proteger a rota apenas para recepcionistas e admins
export default withProtectedRoute([UserRole.ADMIN, UserRole.RECEPCIONISTA])(EditarAgendamentoPage);

/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
