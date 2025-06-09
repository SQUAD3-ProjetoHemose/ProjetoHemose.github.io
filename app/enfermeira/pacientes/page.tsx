'use client';

import { PacientesService } from '@/lib/services';
import { EnfermagemService } from '@/lib/services/enfermagem.service';
import { Paciente } from '@/types';
import {
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  FileText,
  Filter,
  Heart,
  MapPin,
  Search,
  Stethoscope,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Interface para informações expandidas do paciente na enfermagem
interface PacienteEnfermagem extends Paciente {
  leito?: string;
  ala?: string;
  dataInternacao?: string;
  ultimaTriagem?: string;
  statusTriagem?: 'pendente' | 'realizada' | 'prioridade';
  condicaoAtual?: 'estavel' | 'observacao' | 'critico';
  medicamentosAtivos?: number;
  proximaMedicacao?: string;
}

// Interface para filtros
interface FiltrosPacientes {
  busca: string;
  ala: string;
  status: string;
  condicao: string;
}

function PacientesPage() {
  const [pacientes, setPacientes] = useState<PacienteEnfermagem[]>([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState<PacienteEnfermagem[]>([]);
  const [filtros, setFiltros] = useState<FiltrosPacientes>({
    busca: '',
    ala: '',
    status: '',
    condicao: '',
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ordenacao, setOrdenacao] = useState('nome');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    carregarPacientes();
  }, []);

  useEffect(() => {
    filtrarPacientes();
  }, [pacientes, filtros, ordenacao]);

  const carregarPacientes = async () => {
    try {
      setCarregando(true);
      setErro(null);

      // Carregar pacientes do sistema
      // CORRIGIR: const todosPacientes = await PacientesService.listarPacientes();
      const todosPacientes = await PacientesService.getPacientes();

      // Carregar todos os medicamentos pendentes uma vez
      const todosMedicamentosPendentes = await EnfermagemService.getMedicamentosAdministrar();

      // Adicionar informações específicas de enfermagem
      const pacientesComInfoEnfermagem: PacienteEnfermagem[] = await Promise.all(
        todosPacientes.map(async (paciente) => {
          try {
            // Verificar se paciente tem triagem
            // CORRIGIR: const triagens = await EnfermagemService.getTriagensPaciente(paciente.id.toString());
            const triagens = await EnfermagemService.buscarTriagensPaciente(paciente.id.toString());
            const ultimaTriagem = triagens.length > 0 ? triagens[0] : null;

            // Filtrar medicamentos para o paciente atual
            const medicamentosPaciente = todosMedicamentosPendentes.filter(
              (m) => m.pacienteId === paciente.id.toString() && !m.administrado
            );

            // Encontrar o próximo medicamento (o mais próximo no horário)
            let proximaMedicacaoInfo: string | undefined = undefined;
            if (medicamentosPaciente.length > 0) {
              const agora = new Date();
              const hojeStr = agora.toISOString().split('T')[0]; // Data de hoje para comparar horários

              const horariosMedicamentos = medicamentosPaciente
                .map((m) => {
                  const [hora, minuto] = m.horario.split(':').map(Number);
                  const dataMedicamento = new Date(hojeStr);
                  dataMedicamento.setHours(hora, minuto, 0, 0);
                  return dataMedicamento;
                })
                .filter((dataMedicamento) => dataMedicamento >= agora) // Considerar apenas horários futuros ou atuais
                .sort((a, b) => a.getTime() - b.getTime());

              if (horariosMedicamentos.length > 0) {
                proximaMedicacaoInfo = horariosMedicamentos[0].toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
              }
            }

            return {
              ...paciente,
              leito: `${Math.floor(Math.random() * 20) + 1}${
                ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
              }`, // Simulado
              ala: ['UTI', 'Clínica Médica', 'Cirurgia', 'Pediatria'][
                Math.floor(Math.random() * 4)
              ], // Simulado
              dataInternacao: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0], // Simulado
              ultimaTriagem: ultimaTriagem
                ? new Date(ultimaTriagem.dataTriagem).toLocaleString('pt-BR')
                : undefined,
              statusTriagem: ultimaTriagem ? 'realizada' : 'pendente',
              condicaoAtual: ['estavel', 'observacao', 'critico'][Math.floor(Math.random() * 3)] as
                | 'estavel'
                | 'observacao'
                | 'critico', // Simulado
              medicamentosAtivos: medicamentosPaciente.length,
              proximaMedicacao: proximaMedicacaoInfo,
            };
          } catch (error) {
            console.error(
              `Erro ao carregar informações de enfermagem para paciente ${paciente.id}:`,
              error
            );
            return {
              ...paciente,
              statusTriagem: 'pendente' as const,
              condicaoAtual: 'estavel' as const,
              medicamentosAtivos: 0,
            };
          }
        })
      );

      setPacientes(pacientesComInfoEnfermagem);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      setErro('Erro ao carregar lista de pacientes. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const filtrarPacientes = () => {
    let resultado = [...pacientes];

    // Filtro por busca (nome ou CPF)
    if (filtros.busca) {
      const termoBusca = filtros.busca.toLowerCase();
      resultado = resultado.filter(
        (paciente) =>
          paciente.nome.toLowerCase().includes(termoBusca) || paciente.cpf.includes(filtros.busca)
      );
    }

    // Filtro por ala
    if (filtros.ala) {
      resultado = resultado.filter((paciente) => paciente.ala === filtros.ala);
    }

    // Filtro por status de triagem
    if (filtros.status) {
      resultado = resultado.filter((paciente) => paciente.statusTriagem === filtros.status);
    }

    // Filtro por condição
    if (filtros.condicao) {
      resultado = resultado.filter((paciente) => paciente.condicaoAtual === filtros.condicao);
    }

    // Ordenação
    resultado.sort((a, b) => {
      switch (ordenacao) {
        case 'nome':
          return a.nome.localeCompare(b.nome);
        case 'leito':
          return (a.leito || '').localeCompare(b.leito || '');
        case 'condicao':
          const prioridadeCondicao = { critico: 3, observacao: 2, estavel: 1 };
          return (
            (prioridadeCondicao[b.condicaoAtual || 'estavel'] || 0) -
            (prioridadeCondicao[a.condicaoAtual || 'estavel'] || 0)
          );
        case 'triagem':
          const prioridadeTriagem = { pendente: 2, prioridade: 3, realizada: 1 };
          return (
            (prioridadeTriagem[b.statusTriagem || 'pendente'] || 0) -
            (prioridadeTriagem[a.statusTriagem || 'pendente'] || 0)
          );
        default:
          return 0;
      }
    });

    setPacientesFiltrados(resultado);
  };

  const getCorCondicao = (condicao?: string) => {
    switch (condicao) {
      case 'critico':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'observacao':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'estavel':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCorStatusTriagem = (status?: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-red-100 text-red-800';
      case 'prioridade':
        return 'bg-orange-100 text-orange-800';
      case 'realizada':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const alas = ['UTI', 'Clínica Médica', 'Cirurgia', 'Pediatria'];
  const statusTriagem = ['pendente', 'realizada', 'prioridade'];
  const condicoes = ['estavel', 'observacao', 'critico'];

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando lista de pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <Users className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Lista de Pacientes</h1>
                <p className="text-gray-600">Gerenciamento de pacientes na enfermagem</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border">
              Total: {pacientesFiltrados.length} pacientes
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow-sm border-1 border-gray-300 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou CPF..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Ordenação */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Ordenar por:</span>
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="nome">Nome</option>
                <option value="leito">Leito</option>
                <option value="condicao">Condição</option>
                <option value="triagem">Status Triagem</option>
              </select>
            </div>

            {/* Toggle Filtros */}
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </button>
          </div>

          {/* Filtros Expandidos */}
          {mostrarFiltros && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ala</label>
                  <select
                    value={filtros.ala}
                    onChange={(e) => setFiltros({ ...filtros, ala: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Todas as alas</option>
                    {alas.map((ala) => (
                      <option key={ala} value={ala}>
                        {ala}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Triagem
                  </label>
                  <select
                    value={filtros.status}
                    onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Todos os status</option>
                    <option value="pendente">Pendente</option>
                    <option value="realizada">Realizada</option>
                    <option value="prioridade">Prioridade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condição</label>
                  <select
                    value={filtros.condicao}
                    onChange={(e) => setFiltros({ ...filtros, condicao: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Todas as condições</option>
                    <option value="estavel">Estável</option>
                    <option value="observacao">Em Observação</option>
                    <option value="critico">Crítico</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mensagem de Erro */}
        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{erro}</p>
            </div>
          </div>
        )}

        {/* Lista de Pacientes */}
        {pacientesFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum paciente encontrado</h3>
            <p className="text-gray-600">Tente ajustar os filtros de busca.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pacientesFiltrados.map((paciente) => (
              <div
                key={paciente.id}
                className="bg-white rounded-lg shadow-sm border-1 border-green-600 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Informações do Paciente */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{paciente.nome}</h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getCorCondicao(
                                paciente.condicaoAtual
                              )}`}
                            >
                              {paciente.condicaoAtual === 'critico'
                                ? 'Crítico'
                                : paciente.condicaoAtual === 'observacao'
                                ? 'Observação'
                                : 'Estável'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>Leito: {paciente.leito || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4" />
                              <span>Ala: {paciente.ala || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Internação:{' '}
                                {paciente.dataInternacao
                                  ? new Date(paciente.dataInternacao).toLocaleDateString('pt-BR')
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                Próxima medicação: {paciente.proximaMedicacao || 'Nenhuma'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status e Badges */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getCorStatusTriagem(
                              paciente.statusTriagem
                            )}`}
                          >
                            {paciente.statusTriagem === 'pendente'
                              ? 'Triagem Pendente'
                              : paciente.statusTriagem === 'prioridade'
                              ? 'Triagem Prioritária'
                              : 'Triagem Realizada'}
                          </span>

                          {paciente.medicamentosAtivos && paciente.medicamentosAtivos > 0 && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {paciente.medicamentosAtivos} medicamento
                              {paciente.medicamentosAtivos > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ações Rápidas */}
                    <div className="flex items-center gap-2 mt-4 lg:mt-0 lg:ml-4">
                      <button
                        onClick={() =>
                          (window.location.href = `/enfermeira/triagem?paciente=${paciente.id}`)
                        }
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                        title="Ver/Fazer Triagem"
                      >
                        <Stethoscope className="h-4 w-4" />
                        Triagem
                      </button>

                      <button
                        onClick={() =>
                          (window.location.href = `/enfermeira/sinais-vitais?paciente=${paciente.id}`)
                        }
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Sinais Vitais"
                      >
                        <Heart className="h-4 w-4" />
                        Vitais
                      </button>

                      <button
                        onClick={() =>
                          (window.location.href = `/enfermeira/evolucao?paciente=${paciente.id}`)
                        }
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors"
                        title="Evolução"
                      >
                        <FileText className="h-4 w-4" />
                        Evolução
                      </button>
                    </div>
                  </div>

                  {/* Informações Adicionais */}
                  {paciente.ultimaTriagem && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Última triagem: {paciente.ultimaTriagem}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PacientesPage;

// Assinatura ASCII
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
