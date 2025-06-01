'use client';

import { useState, useEffect } from 'react';
import { withProtectedRoute } from '@/hooks/useAuthentication';
import { Paciente, UserRole } from '@/types';
import { useAuthentication } from '@/hooks';
import usePacienteStore from '@/store/pacienteStore';
import { usePacienteForm } from '@/hooks/usePaciente';

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

function PacienteDashboardPage() {
  // Obter o usuário do contexto de autenticação
  const { user } = useAuthentication();
  
  // Estados para gerenciar os pacientes e o formulário
  const [novoPaciente, setNovoPaciente] = useState<NovoPacienteForm>({
    nome: '',
    data_nascimento: '',
    cpf: '',
    telefone: '',
    endereco: '',
    tipo_sanguineo: '',
    alergias: '',
    historico_medico: ''
  }); // Estado para o formulário de novo paciente

  // Hook personalizado para operações com pacientes
  const { 
    pacientes, 
    loading, 
    error, 
    fetchPacientes, 
    createPaciente,
    updatePaciente,
    deletePaciente
  } = usePacienteStore(); // Utilizando o hook de pacientes para operações CRUD

  // Estado para controlar edição
  const [editandoPaciente, setEditandoPaciente] = useState<Paciente | null>(null);
  const [feedback, setFeedback] = useState<{tipo: 'sucesso' | 'erro', mensagem: string} | null>(null);

  // Função para limpar CPF removendo todos os caracteres não numéricos
  const limparCPF = (cpf: string): string => {
    return cpf.replace(/\D/g, '');
  };

  // Função para validar CPF
  const validarCPF = (cpf: string): boolean => {
    const cpfLimpo = limparCPF(cpf);
    
    // Verifica se tem 11 dígitos
    if (cpfLimpo.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
    
    // Validação do algoritmo do CPF
    let soma = 0;
    
    // Primeiro dígito verificador
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.charAt(9))) return false;
    
    // Segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.charAt(10))) return false;
    
    return true;
  };

  // Calcular a idade com base na data de nascimento
  const calcularIdade = (dataNascimento: string): number => {
    if (!dataNascimento) return 0;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  useEffect(() => {
    // Carrega a lista de pacientes quando o componente é montado
    fetchPacientes();
  }, []); // Array vazio para executar apenas na montagem

  // Função para lidar com mudanças nos campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNovoPaciente((prevState) => ({
      ...prevState,
      [name]: value,
    })); // Atualiza o estado do formulário com os novos valores
  };

  // Função para formatar CPF: 000.000.000-00
  const formatarCPF = (cpf: string): string => {
    // Remove caracteres não numéricos
    const cpfLimpo = limparCPF(cpf);
    
    // Limita a 11 dígitos
    const cpfTruncado = cpfLimpo.slice(0, 11);
    
    // Formata o CPF progressivamente
    if (cpfTruncado.length <= 3) {
      return cpfTruncado;
    } else if (cpfTruncado.length <= 6) {
      return `${cpfTruncado.slice(0, 3)}.${cpfTruncado.slice(3)}`;
    } else if (cpfTruncado.length <= 9) {
      return `${cpfTruncado.slice(0, 3)}.${cpfTruncado.slice(3, 6)}.${cpfTruncado.slice(6)}`;
    } else {
      return `${cpfTruncado.slice(0, 3)}.${cpfTruncado.slice(3, 6)}.${cpfTruncado.slice(6, 9)}-${cpfTruncado.slice(9)}`;
    }
  };

  // Handler especial para CPF com formatação
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatarCPF(e.target.value);
    setNovoPaciente(prev => ({
      ...prev,
      cpf: formattedValue
    }));
  };

  // Função para configurar a edição de um paciente
  const iniciarEdicao = (paciente: Paciente) => {
    setEditandoPaciente(paciente);
    // Adapte os campos conforme necessário
    setNovoPaciente({
      nome: paciente.nome,
      data_nascimento: paciente.data_nascimento || '',
      cpf: paciente.cpf ? formatarCPF(paciente.cpf) : '',
      telefone: paciente.telefone || '',
      endereco: paciente.endereco || '',
      tipo_sanguineo: '',
      alergias: '',
      historico_medico: ''
    });
  };

  // Função para cancelar edição
  const cancelarEdicao = () => {
    setEditandoPaciente(null);
    setNovoPaciente({
      nome: '',
      data_nascimento: '',
      cpf: '',
      telefone: '',
      endereco: '',
      tipo_sanguineo: '',
      alergias: '',
      historico_medico: ''
    });
  };

  // Função para cadastrar ou atualizar um paciente
  const handleSalvarPaciente = async () => {
    try {
      // Limpar formatação do CPF antes de validar e enviar
      const cpfLimpo = limparCPF(novoPaciente.cpf);
      
      // Validar campos obrigatórios
      if (!novoPaciente.nome.trim()) {
        setFeedback({
          tipo: 'erro',
          mensagem: 'O nome é obrigatório.'
        });
        return;
      }

      if (!novoPaciente.data_nascimento) {
        setFeedback({
          tipo: 'erro',
          mensagem: 'A data de nascimento é obrigatória.'
        });
        return;
      }

      if (!cpfLimpo) {
        setFeedback({
          tipo: 'erro',
          mensagem: 'O CPF é obrigatório.'
        });
        return;
      }

      if (!validarCPF(cpfLimpo)) {
        setFeedback({
          tipo: 'erro',
          mensagem: 'CPF inválido. Verifique os dados e tente novamente.'
        });
        return;
      }

      const pacienteData = {
        nome: novoPaciente.nome.trim(),
        cpf: cpfLimpo, // Envia apenas números para o backend
        data_nascimento: novoPaciente.data_nascimento, // Formato ISO 8601: YYYY-MM-DD
        telefone: novoPaciente.telefone.trim(),
        endereco: novoPaciente.endereco.trim(),
        tipo_sanguineo: novoPaciente.tipo_sanguineo,
        alergias: novoPaciente.alergias.trim(),
        historico_medico: novoPaciente.historico_medico.trim()
      };

      if (editandoPaciente) {
        // Atualiza paciente existente
        await updatePaciente(editandoPaciente.id, pacienteData);
        setFeedback({
          tipo: 'sucesso',
          mensagem: 'Paciente atualizado com sucesso!'
        });
      } else {
        // Cria novo paciente
        await createPaciente(pacienteData);
        setFeedback({
          tipo: 'sucesso',
          mensagem: 'Paciente cadastrado com sucesso!'
        });
      }

      // Limpa o formulário após o cadastro/edição
      setNovoPaciente({
        nome: '',
        data_nascimento: '',
        cpf: '',
        telefone: '',
        endereco: '',
        tipo_sanguineo: '',
        alergias: '',
        historico_medico: ''
      });

      // Recarrega a lista de pacientes
      await fetchPacientes();
      
      // Sai do modo de edição
      setEditandoPaciente(null);
      
      // Limpa o feedback após 3 segundos
      setTimeout(() => {
        setFeedback(null);
      }, 3000);

    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
      setFeedback({
        tipo: 'erro',
        mensagem: 'Erro ao salvar paciente. Tente novamente.'
      });
    }
  };

  // Função para excluir um paciente
  const handleExcluirPaciente = async (id: number | string) => {
    if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
      try {
        await deletePaciente(id);
        setFeedback({
          tipo: 'sucesso',
          mensagem: 'Paciente excluído com sucesso!'
        });
        
        // Limpa o feedback após 3 segundos
        setTimeout(() => {
          setFeedback(null);
        }, 3000);
      } catch (error) {
        console.error('Erro ao excluir paciente:', error);
        setFeedback({
          tipo: 'erro',
          mensagem: 'Erro ao excluir paciente. Tente novamente.'
        });
      }
    }
  };

  // Função para exibir CPF mascarado na listagem
  const exibirCPFMascarado = (cpf: string): string => {
    if (!cpf) return 'Não informado';
    const cpfLimpo = limparCPF(cpf);
    if (cpfLimpo.length === 11) {
      return `${cpfLimpo.substring(0, 3)}.***.***-${cpfLimpo.substring(9, 11)}`;
    }
    return 'CPF inválido';
  };

  // Renderização condicional baseada no estado de carregamento
  if (loading) {
    return (
      <div className="flex flex-col sm:flex-row justify-center items-center h-64 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
        <p className="ml-0 sm:ml-2 mt-2 sm:mt-0 text-green-700 text-center">Carregando dados de pacientes...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-black">Dashboard de Pacientes</h1>
      
      {/* Opcional: mostrar informação do usuário */}
      {user && (
        <p className="text-black mb-4 text-sm sm:text-base">Operador: {user.nome}</p>
      )}
      
      {error && (
        <div className="bg-red-100 p-4 mb-6 rounded-md">
          <p className="text-red-700 text-sm sm:text-base">{error}</p>
        </div>
      )}

      {feedback && (
        <div className={`p-4 mb-6 rounded-md ${feedback.tipo === 'sucesso' ? 'bg-green-100' : 'bg-red-100'}`}>
          <p className={`text-sm sm:text-base ${feedback.tipo === 'sucesso' ? 'text-green-700' : 'text-red-700'}`}>
            {feedback.mensagem}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black mb-4">
            {editandoPaciente ? 'Editar Paciente' : 'Cadastro de Paciente'}
          </h2>
          
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
                onChange={handleInputChange}
                className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                autoComplete="off"
                required
                aria-label="Nome completo do paciente"
              />
            </div>

            {/* Campo para data de nascimento */}
            <div>
              <label htmlFor="data_nascimento" className="block text-sm font-medium text-gray-700 mb-1">
                Data de Nascimento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="data_nascimento"
                name="data_nascimento"
                value={novoPaciente.data_nascimento}
                onChange={handleInputChange}
                className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                autoComplete="off"
                required
                aria-label="Data de nascimento do paciente"
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
                className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                autoComplete="off"
                required
                aria-label="CPF do paciente"
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
                onChange={handleInputChange}
                placeholder="(00) 00000-0000"
                className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                autoComplete="off"
                aria-label="Telefone do paciente"
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
                onChange={handleInputChange}
                className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                autoComplete="off"
                aria-label="Endereço do paciente"
              />
            </div>

            {/* Campo para tipo sanguíneo */}
            <div>
              <label htmlFor="tipo_sanguineo" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo Sanguíneo
              </label>
              <select
                id="tipo_sanguineo"
                name="tipo_sanguineo"
                value={novoPaciente.tipo_sanguineo}
                onChange={handleInputChange}
                className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                aria-label="Tipo sanguíneo do paciente"
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
                onChange={handleInputChange}
                className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                rows={2}
                autoComplete="off"
                aria-label="Alergias do paciente"
              ></textarea>
            </div>

            {/* Campo para histórico médico */}
            <div>
              <label htmlFor="historico_medico" className="block text-sm font-medium text-gray-700 mb-1">
                Histórico Médico
              </label>
              <textarea
                id="historico_medico"
                name="historico_medico"
                value={novoPaciente.historico_medico}
                onChange={handleInputChange}
                className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                rows={3}
                autoComplete="off"
                aria-label="Histórico médico do paciente"
              ></textarea>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between gap-2">
            {editandoPaciente ? (
              <>
                <button
                  onClick={cancelarEdicao}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300 text-sm sm:text-base"
                  aria-label="Cancelar edição"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarPaciente}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 text-sm sm:text-base"
                  aria-label="Salvar alterações do paciente"
                >
                  Salvar Alterações
                </button>
              </>
            ) : (
              <button
                onClick={handleSalvarPaciente}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 text-sm sm:text-base"
                aria-label="Cadastrar novo paciente"
              >
                Cadastrar Paciente
              </button>
            )}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black mb-4">Pacientes Cadastrados</h2>
          
          {pacientes.length > 0 ? (
            <div className="divide-y divide-green-200 max-h-96 overflow-y-auto">
              {pacientes.map((paciente) => (
                <div key={paciente.id} className="py-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-black truncate">{paciente.nome}</p>
                      <p className="text-xs sm:text-sm text-black">
                        CPF: {exibirCPFMascarado(paciente.cpf || '')}
                      </p>
                      <p className="text-xs sm:text-sm text-black">
                        Data Nasc.: {paciente.data_nascimento ? new Date(paciente.data_nascimento).toLocaleDateString('pt-BR') : 'Não informada'}
                      </p>
                      <p className="text-xs sm:text-sm text-black">Telefone: {paciente.telefone || 'Não informado'}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-col sm:flex-row gap-2">
                    <button 
                      onClick={() => iniciarEdicao(paciente)} 
                      className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded transition duration-300"
                      aria-label={`Editar paciente ${paciente.nome}`}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleExcluirPaciente(paciente.id)}
                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition duration-300"
                      aria-label={`Excluir paciente ${paciente.nome}`}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm sm:text-base">Nenhum paciente cadastrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// HOC para proteger a rota, permitindo apenas admin, enfermeira e médico
export default withProtectedRoute([
  UserRole.ADMIN,
  UserRole.ENFERMEIRA,
  UserRole.MEDICO,
  UserRole.RECEPCIONISTA 
])(PacienteDashboardPage);
/* 
            
            
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
