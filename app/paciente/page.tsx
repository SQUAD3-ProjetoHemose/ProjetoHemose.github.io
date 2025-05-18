'use client';

import { useState, useEffect } from 'react';
import withAuth from '@/lib/withAuth';
import { usePacientes } from '@/lib/apiPaciente';
import { User, Paciente } from '@/types';

// Interface para as props do componente
interface PacienteDashboardPageProps {
  user: User;
}

// Interface para os dados do formulário de novo paciente
interface NovoPacienteForm {
  nome: string;
  idade: string;
  leito: string;
  status: string;
  sinaisVitais: string;
}

function PacienteDashboardPage({ user }: PacienteDashboardPageProps) {
  // Estados para gerenciar os pacientes e o formulário
  const [novoPaciente, setNovoPaciente] = useState<NovoPacienteForm>({
    nome: '',
    idade: '',
    leito: '',
    status: 'Em Triagem',
    sinaisVitais: '',
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
  } = usePacientes(); // Utilizando o hook de pacientes para operações CRUD

  // Estado para controlar edição
  const [editandoPaciente, setEditandoPaciente] = useState<Paciente | null>(null);
  const [feedback, setFeedback] = useState<{tipo: 'sucesso' | 'erro', mensagem: string} | null>(null);

  useEffect(() => {
    // Carrega a lista de pacientes quando o componente é montado
    fetchPacientes();
  }, []); // Array vazio para executar apenas na montagem

  // Função para lidar com mudanças nos campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNovoPaciente((prevState) => ({
      ...prevState,
      [name]: value,
    })); // Atualiza o estado do formulário com os novos valores
  };

  // Função para configurar a edição de um paciente
  const iniciarEdicao = (paciente: Paciente) => {
    setEditandoPaciente(paciente);
    setNovoPaciente({
      nome: paciente.nome,
      idade: paciente.idade.toString(),
      leito: paciente.leito || '',
      status: paciente.status || 'Em Triagem',
      sinaisVitais: paciente.sinaisVitais || ''
    }); // Prepara o formulário com os dados do paciente a ser editado
  };

  // Função para cancelar edição
  const cancelarEdicao = () => {
    setEditandoPaciente(null);
    setNovoPaciente({
      nome: '',
      idade: '',
      leito: '',
      status: 'Em Triagem',
      sinaisVitais: ''
    }); // Limpa o formulário e cancela modo de edição
  };

  // Função para cadastrar ou atualizar um paciente
  const handleSalvarPaciente = async () => {
    try {
      // Converte idade para número antes de enviar
      const pacienteData: Partial<Paciente> = {
        nome: novoPaciente.nome,
        idade: parseInt(novoPaciente.idade),
        leito: novoPaciente.leito,
        status: novoPaciente.status,
        sinaisVitais: novoPaciente.sinaisVitais
      }; // Preparando os dados para envio

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
        idade: '',
        leito: '',
        status: 'Em Triagem',
        sinaisVitais: ''
      }); // Resetando o formulário após sucesso

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
  }; // Função para salvar paciente (criar ou atualizar)

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
  }; // Função para excluir um paciente

  // Renderização condicional baseada no estado de carregamento
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
        <p className="ml-2 text-green-700">Carregando dados de pacientes...</p>
      </div>
    ); // Exibe indicador de carregamento
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-black">Dashboard de Pacientes</h1>
      
      {error && (
        <div className="bg-red-100 p-4 mb-6 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )} {/* Exibe mensagens de erro caso ocorram */}

      {feedback && (
        <div className={`p-4 mb-6 rounded-md ${feedback.tipo === 'sucesso' ? 'bg-green-100' : 'bg-red-100'}`}>
          <p className={feedback.tipo === 'sucesso' ? 'text-green-700' : 'text-red-700'}>
            {feedback.mensagem}
          </p>
        </div>
      )} {/* Exibe feedback de ações de sucesso ou erro */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black mb-4">
            {editandoPaciente ? 'Editar Paciente' : 'Cadastro de Paciente'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={novoPaciente.nome}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                required
              />
            </div> {/* Campo para nome do paciente */}

            <div>
              <label htmlFor="idade" className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
              <input
                type="number"
                id="idade"
                name="idade"
                value={novoPaciente.idade}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                required
              />
            </div> {/* Campo para idade do paciente */}

            <div>
              <label htmlFor="leito" className="block text-sm font-medium text-gray-700 mb-1">Leito</label>
              <input
                type="text"
                id="leito"
                name="leito"
                value={novoPaciente.leito}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
              />
            </div> {/* Campo para leito do paciente */}

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                name="status"
                value={novoPaciente.status}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
              >
                <option value="Em Triagem">Em Triagem</option>
                <option value="Internado">Internado</option>
                <option value="Alta">Alta</option>
                <option value="Em Observação">Em Observação</option>
                <option value="Aguardando Exames">Aguardando Exames</option>
              </select>
            </div> {/* Campo para status do paciente */}

            <div>
              <label htmlFor="sinaisVitais" className="block text-sm font-medium text-gray-700 mb-1">Sinais Vitais</label>
              <input
                type="text"
                id="sinaisVitais"
                name="sinaisVitais"
                value={novoPaciente.sinaisVitais}
                onChange={handleInputChange}
                placeholder="Ex: PA 120/80, FC 72bpm, T 36.5°C"
                className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
              />
            </div> {/* Campo para sinais vitais do paciente */}

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
                  className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Salvar Alterações
                </button>
              </>
            ) : (
              <button
                onClick={handleSalvarPaciente}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Cadastrar Paciente
              </button>
            )}
          </div> {/* Botões para cadastrar ou editar paciente */}

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
                      <p className="text-sm text-black">Idade: {paciente.idade}</p>
                      <p className="text-sm text-black">Leito: {paciente.leito || 'Não atribuído'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      paciente.status === 'Internado' ? 'bg-red-100 text-red-800' :
                      paciente.status === 'Em Triagem' ? 'bg-yellow-100 text-yellow-800' :
                      paciente.status === 'Alta' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {paciente.status || 'Não definido'}
                    </span> {/* Badge para status do paciente */}
                  </div>
                  <p className="text-sm mt-1 text-black">Sinais Vitais: {paciente.sinaisVitais || 'Não informado'}</p>
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
                  </div> {/* Botões de ação para cada paciente */}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhum paciente cadastrado.</p>
          )} {/* Renderização condicional para lista vazia */}
        </div>
      </div>
    </div>
  );
}

// HOC para proteger a rota, permitindo apenas admin e enfermeira
export default withAuth(PacienteDashboardPage, ['admin', 'enfermeira', 'medico']); // Restringe o acesso à página apenas para administradores, enfermeiras e médicos

// 
//  __  ____ ____ _  _ 
// / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
//
