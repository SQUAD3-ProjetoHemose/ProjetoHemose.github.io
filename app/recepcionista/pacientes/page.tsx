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
      cpf: paciente.cpf || '',
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
      // Remover formatação do CPF antes de enviar
      const cpfLimpo = novoPaciente.cpf.replace(/\D/g, '');
      
      // Validar campos obrigatórios
      if (!novoPaciente.nome || !novoPaciente.data_nascimento || cpfLimpo.length !== 11) {
        setFeedback({
          tipo: 'erro',
          mensagem: 'Preencha os campos obrigatórios corretamente. CPF deve conter 11 dígitos.'
        });
        return;
      }

      const pacienteData = {
        nome: novoPaciente.nome,
        cpf: cpfLimpo,
        data_nascimento: novoPaciente.data_nascimento, // Formato ISO 8601: YYYY-MM-DD
        telefone: novoPaciente.telefone,
        endereco: novoPaciente.endereco,
        tipo_sanguineo: novoPaciente.tipo_sanguineo,
        alergias: novoPaciente.alergias,
        historico_medico: novoPaciente.historico_medico
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

  // Renderização condicional baseada no estado de carregamento
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
        <p className="ml-2 text-green-700">Carregando dados de pacientes...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-black">Dashboard de Pacientes</h1>
      
      {/* Opcional: mostrar informação do usuário */}
      {user && (
        <p className="text-black mb-4">Operador: {user.nome}</p>
      )}
      
      {error && (
        <div className="bg-red-100 p-4 mb-6 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {feedback && (
        <div className={`p-4 mb-6 rounded-md ${feedback.tipo === 'sucesso' ? 'bg-green-100' : 'bg-red-100'}`}>
          <p className={feedback.tipo === 'sucesso' ? 'text-green-700' : 'text-red-700'}>
            {feedback.mensagem}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
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
                className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                autoComplete="off"
                required
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
                className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
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
                className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
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
                onChange={handleInputChange}
                placeholder="(00) 00000-0000"
                className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
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
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                autoComplete="off"
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
                className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
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
                className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                rows={2}
                autoComplete="off"
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
                className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                rows={3}
                autoComplete="off"
              ></textarea>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            {editandoPaciente ? (
              <>
                <button
                  onClick={cancelarEdicao}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarPaciente}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Salvar Alterações
                </button>
              </>
            ) : (
              <button
                onClick={handleSalvarPaciente}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Cadastrar Paciente
              </button>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black mb-4">Pacientes Cadastrados</h2>
          
          {pacientes.length > 0 ? (
            <div className="divide-y divide-green-200">
              {pacientes.map((paciente) => (
                <div key={paciente.id} className="py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-black">{paciente.nome}</p>
                      <p className="text-sm text-black">
                        CPF: {paciente.cpf ? `${paciente.cpf.substring(0, 3)}.***.***-${paciente.cpf.substring(9, 11)}` : 'Não informado'}
                      </p>
                      <p className="text-sm text-black">
                        Data Nasc.: {paciente.data_nascimento ? new Date(paciente.data_nascimento).toLocaleDateString('pt-BR') : 'Não informada'}
                      </p>
                      <p className="text-sm text-black">Telefone: {paciente.telefone || 'Não informado'}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex space-x-2">
                    <button 
                      onClick={() => iniciarEdicao(paciente)} 
                      className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded">
                      Editar
                    </button>
                    <button 
                      onClick={() => handleExcluirPaciente(paciente.id)}
                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhum paciente cadastrado.</p>
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
  UserRole.RECEPCIONISTA // <-- Adicione esta linha!
])(PacienteDashboardPage);
/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
