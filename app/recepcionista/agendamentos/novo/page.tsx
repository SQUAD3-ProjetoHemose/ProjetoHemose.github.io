'use client';

import { withProtectedRoute } from '@/hooks/useAuthentication';
import useAgendamentoStore from '@/store/agendamentoStore';
import usePacienteStore from '@/store/pacienteStore';
import useUserStore from '@/store/userStore';
import { AgendamentoForm, StatusAgendamento, TipoAgendamento, UserRole } from '@/types';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Interface para os dados do formulário de novo paciente
interface NovoPacienteForm {
  nome: string;
  data_nascimento: string;
  cpf: string;
  telefone: string;
  endereco: string;
  tipo_sanguineo: string;
  alergias: string;
  historico_medico: string;
}

function NovoAgendamentoPage() {
  const router = useRouter();
  const { createAgendamento } = useAgendamentoStore();
  const { pacientes, fetchPacientes, createPaciente } = usePacienteStore();
  const { users, fetchUsers } = useUserStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estado para controlar a exibição do modal de cadastro de paciente
  const [showModal, setShowModal] = useState<boolean>(false);

  // Estado para o formulário de novo paciente
  const [novoPaciente, setNovoPaciente] = useState<NovoPacienteForm>({
    nome: '',
    data_nascimento: '',
    cpf: '',
    telefone: '',
    endereco: '',
    tipo_sanguineo: '',
    alergias: '',
    historico_medico: '',
  });

  // Estado para o formulário de agendamento
  const [formData, setFormData] = useState<AgendamentoForm>({
    data: format(new Date(), 'yyyy-MM-dd'),
    horario: '08:00', // Manter 'horario' no formulário para compatibilidade
    tipo: TipoAgendamento.CONSULTA,
    paciente_id: 0,
    medico_id: 0,
    observacoes: '',
    status: StatusAgendamento.AGENDADO,
  });

  // Novos estados para pesquisa de paciente
  const [searchCpf, setSearchCpf] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [foundPaciente, setFoundPaciente] = useState<any | null>(null);

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

  // Manipulador de mudança de campos do agendamento
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Checar se precisamos abrir o modal de novo paciente
    if (name === 'paciente_id' && value === 'novo') {
      setShowModal(true);
      return;
    }

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

  // Manipulador de mudança nos campos do formulário de paciente
  const handlePacienteInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNovoPaciente((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Função para formatar CPF: 000.000.000-00
  const formatarCPF = (cpf: string) => {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');

    // Limita a 11 dígitos
    cpf = cpf.slice(0, 11);

    // Formata o CPF
    if (cpf.length <= 3) {
      return cpf;
    } else if (cpf.length <= 6) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
    } else if (cpf.length <= 9) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
    } else {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
    }
  };

  // Handler especial para CPF com formatação
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatarCPF(e.target.value);
    setNovoPaciente((prev) => ({
      ...prev,
      cpf: formattedValue,
    }));
  };

  // Função para salvar um novo paciente
  const handleSalvarPaciente = async () => {
    try {
      // Remover formatação do CPF antes de enviar
      const cpfLimpo = novoPaciente.cpf.replace(/\D/g, '');

      // Validar campos obrigatórios
      if (!novoPaciente.nome || !novoPaciente.data_nascimento || cpfLimpo.length !== 11) {
        setError('Preencha os campos obrigatórios corretamente. CPF deve conter 11 dígitos.');
        return;
      }

      setIsLoading(true);

      const pacienteData = {
        nome: novoPaciente.nome,
        cpf: cpfLimpo,
        data_nascimento: novoPaciente.data_nascimento,
        telefone: novoPaciente.telefone,
        endereco: novoPaciente.endereco,
        tipo_sanguineo: novoPaciente.tipo_sanguineo,
        alergias: novoPaciente.alergias,
        historico_medico: novoPaciente.historico_medico,
      };

      // Criar o novo paciente
      const novoPacienteCriado = await createPaciente(pacienteData);

      // Atualizar a lista de pacientes
      await fetchPacientes();

      // Fechar o modal
      setShowModal(false);

      // Limpar o formulário de paciente
      setNovoPaciente({
        nome: '',
        data_nascimento: '',
        cpf: '',
        telefone: '',
        endereco: '',
        tipo_sanguineo: '',
        alergias: '',
        historico_medico: '',
      });

      // Selecionar o novo paciente no formulário de agendamento
      setFormData({
        ...formData,
        paciente_id: novoPacienteCriado.id,
      });

      // Mostrar mensagem de sucesso temporária
      setSuccess('Paciente cadastrado com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Erro ao cadastrar paciente:', err);
      setError(err.message || 'Ocorreu um erro ao cadastrar o paciente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para formatar CPF na pesquisa
  const formatarCPFPesquisa = (cpf: string) => {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');

    // Limita a 11 dígitos
    cpf = cpf.slice(0, 11);

    // Formata o CPF
    if (cpf.length <= 3) {
      return cpf;
    } else if (cpf.length <= 6) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
    } else if (cpf.length <= 9) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
    } else {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
    }
  };

  // Função para pesquisar paciente por CPF
  const pesquisarPacientePorCpf = async () => {
    if (!searchCpf) {
      setSearchError('Digite um CPF para pesquisar');
      return;
    }

    const cpfLimpo = searchCpf.replace(/\D/g, '');

    if (cpfLimpo.length !== 11) {
      setSearchError('CPF deve ter 11 dígitos');
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError(null);
      setFoundPaciente(null);

      // Buscar paciente na lista existente primeiro
      const pacienteExistente = pacientes.find((p) => p.cpf.replace(/\D/g, '') === cpfLimpo);

      if (pacienteExistente) {
        setFoundPaciente(pacienteExistente);
        setFormData((prev) => ({
          ...prev,
          paciente_id: pacienteExistente.id,
        }));
        setSearchError(null);
      } else {
        // Se não encontrar na lista, tentar buscar na API
        try {
          const response = await fetch(`/api/pacientes/buscar-cpf/${cpfLimpo}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });

          if (response.ok) {
            const pacienteEncontrado = await response.json();
            setFoundPaciente(pacienteEncontrado);
            setFormData((prev) => ({
              ...prev,
              paciente_id: pacienteEncontrado.id,
            }));
            // Atualizar lista local de pacientes
            await fetchPacientes();
          } else if (response.status === 404) {
            setSearchError('Paciente não encontrado. Você pode cadastrar um novo paciente.');
            setFoundPaciente(null);
          } else {
            setSearchError('Erro ao buscar paciente. Tente novamente.');
          }
        } catch (apiError) {
          setSearchError('Paciente não encontrado na base de dados.');
          setFoundPaciente(null);
        }
      }
    } catch (error) {
      console.error('Erro na pesquisa:', error);
      setSearchError('Erro ao pesquisar paciente. Tente novamente.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Limpar pesquisa de paciente
  const limparPesquisa = () => {
    setSearchCpf('');
    setFoundPaciente(null);
    setSearchError(null);
    setFormData((prev) => ({
      ...prev,
      paciente_id: 0,
    }));
  };

  // Handler para mudança no campo de pesquisa CPF
  const handleSearchCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatarCPFPesquisa(e.target.value);
    setSearchCpf(formattedValue);
    setSearchError(null);

    // Limpar paciente encontrado se o usuário começar a digitar novamente
    if (foundPaciente) {
      setFoundPaciente(null);
      setFormData((prev) => ({
        ...prev,
        paciente_id: 0,
      }));
    }
  };

  // Handler para tecla Enter no campo de pesquisa
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      pesquisarPacientePorCpf();
    }
  };

  // Manipulador de envio do formulário de agendamento
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
  if (isLoading && !success && !showModal) {
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
                className="border border-purple-300 rounded-md p-2 w-full focus:ring-purple-500 focus:border-purple-500"
                autoComplete="off"
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
                autoComplete="off"
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

            {/* Seção de pesquisa de paciente por CPF */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-black mb-2">
                Buscar Paciente por CPF
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchCpf}
                  onChange={handleSearchCpfChange}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="Digite o CPF (000.000.000-00)"
                  className="flex-1 border border-purple-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={searchLoading}
                />
                <button
                  type="button"
                  onClick={pesquisarPacientePorCpf}
                  disabled={searchLoading || !searchCpf}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
                >
                  {searchLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Buscando...
                    </div>
                  ) : (
                    'Buscar'
                  )}
                </button>
                {(foundPaciente || searchError) && (
                  <button
                    type="button"
                    onClick={limparPesquisa}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-md"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Erro na pesquisa */}
              {searchError && (
                <div className="mt-2 p-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 text-sm">
                  {searchError}
                </div>
              )}

              {/* Paciente encontrado */}
              {foundPaciente && (
                <div className="mt-2 p-3 bg-green-100 border-l-4 border-green-500 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-800">Paciente encontrado:</p>
                      <p className="text-green-700">{foundPaciente.nome}</p>
                      <p className="text-sm text-green-600">
                        CPF: {formatarCPFPesquisa(foundPaciente.cpf)} | Data Nasc.:{' '}
                        {foundPaciente.data_nascimento
                          ? new Date(foundPaciente.data_nascimento).toLocaleDateString('pt-BR')
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="text-green-600">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Campo de paciente (dropdown) */}
            <div>
              <label htmlFor="paciente_id" className="block text-sm font-medium text-black mb-2">
                Paciente {foundPaciente ? '(Selecionado pela pesquisa)' : ''}
              </label>
              <select
                id="paciente_id"
                name="paciente_id"
                value={formData.paciente_id}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-gray-500 focus:border-gray-500"
                required
                disabled={!!foundPaciente}
              >
                <option value={0}>Selecione um paciente</option>
                {pacientes.length > 0 ? (
                  pacientes.map((paciente) => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.nome} - CPF: {formatarCPFPesquisa(paciente.cpf)}
                    </option>
                  ))
                ) : (
                  <option disabled>Nenhum paciente cadastrado</option>
                )}
                <option value="novo" className="font-medium text-purple-700">
                  + Cadastrar Novo Paciente
                </option>
              </select>

              {!foundPaciente && (
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="mt-2 text-sm text-purple-700 hover:text-purple-900"
                >
                  Não encontrou o paciente? Cadastre um novo
                </button>
              )}
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
              autoComplete="off"
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

      {/* Modal para cadastro de paciente */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-black">Cadastro Rápido de Paciente</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Campo para nome do paciente */}
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={novoPaciente.nome}
                  onChange={handlePacienteInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                  autoComplete="off"
                  required
                />
              </div>

              {/* Campo para data de nascimento */}
              <div>
                <label
                  htmlFor="data_nascimento"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Data de Nascimento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="data_nascimento"
                  name="data_nascimento"
                  value={novoPaciente.data_nascimento}
                  onChange={handlePacienteInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                  autoComplete="off"
                  required
                />
              </div>

              {/* Campo para CPF */}
              <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                  CPF <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="cpf"
                  name="cpf"
                  value={novoPaciente.cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                  autoComplete="off"
                  required
                />
              </div>

              {/* Campo para telefone */}
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={novoPaciente.telefone}
                  onChange={handlePacienteInputChange}
                  placeholder="(00) 00000-0000"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                  autoComplete="off"
                />
              </div>

              {/* Campo para endereço */}
              <div>
                <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  id="endereco"
                  name="endereco"
                  value={novoPaciente.endereco}
                  onChange={handlePacienteInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                  autoComplete="off"
                />
              </div>

              {/* Campo para tipo sanguíneo */}
              <div>
                <label
                  htmlFor="tipo_sanguineo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tipo Sanguíneo
                </label>
                <select
                  id="tipo_sanguineo"
                  name="tipo_sanguineo"
                  value={novoPaciente.tipo_sanguineo}
                  onChange={handlePacienteInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Selecione</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {/* Campo para alergias */}
              <div>
                <label htmlFor="alergias" className="block text-sm font-medium text-gray-700 mb-1">
                  Alergias
                </label>
                <textarea
                  id="alergias"
                  name="alergias"
                  value={novoPaciente.alergias}
                  onChange={handlePacienteInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                  rows={2}
                  autoComplete="off"
                ></textarea>
              </div>

              {/* Campo para histórico médico */}
              <div>
                <label
                  htmlFor="historico_medico"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Histórico Médico
                </label>
                <textarea
                  id="historico_medico"
                  name="historico_medico"
                  value={novoPaciente.historico_medico}
                  onChange={handlePacienteInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                  rows={2}
                  autoComplete="off"
                ></textarea>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarPaciente}
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded transition duration-300"
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : 'Cadastrar Paciente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Proteger a rota apenas para recepcionistas e admins
export default withProtectedRoute([UserRole.ADMIN, UserRole.RECEPCIONISTA])(NovoAgendamentoPage);

/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
