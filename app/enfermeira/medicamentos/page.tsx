'use client';

import { PacientesService } from '@/lib/services';
import { EnfermagemService, Medicamento } from '@/lib/services/enfermagem.service';
import { Paciente } from '@/types';
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  History,
  Pill,
  Search,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Interface para o formulário de administração
interface AdministracaoForm {
  observacoes?: string;
  intercorrencias?: string;
}

function MedicamentosPage() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [medicamentosHistorico, setMedicamentosHistorico] = useState<Medicamento[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [formAdministracao, setFormAdministracao] = useState<AdministracaoForm>({});
  const [medicamentoSelecionado, setMedicamentoSelecionado] = useState<Medicamento | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; mensagem: string } | null>(
    null
  );

  // Buscar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [medicamentosData, pacientesData] = await Promise.all([
          EnfermagemService.getMedicamentosAdministrar(),
          PacientesService.getPacientes(),
        ]);
        setMedicamentos(medicamentosData);
        setPacientes(pacientesData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setFeedback({
          tipo: 'erro',
          mensagem: 'Erro ao carregar dados iniciais',
        });
      }
    };

    carregarDados();
  }, []);

  // Limpar feedback automaticamente
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Buscar paciente
  const buscarPaciente = async () => {
    if (!buscaPaciente.trim()) {
      setFeedback({
        tipo: 'erro',
        mensagem: 'Digite o nome ou CPF do paciente',
      });
      return;
    }

    try {
      const pacientesEncontrados = pacientes.filter(
        (p) =>
          p.nome.toLowerCase().includes(buscaPaciente.toLowerCase()) ||
          p.cpf.includes(buscaPaciente.replace(/\D/g, ''))
      );

      if (pacientesEncontrados.length === 0) {
        setFeedback({
          tipo: 'erro',
          mensagem: 'Nenhum paciente encontrado',
        });
        return;
      }

      if (pacientesEncontrados.length === 1) {
        await selecionarPaciente(pacientesEncontrados[0]);
      }
    } catch (error) {
      setFeedback({
        tipo: 'erro',
        mensagem: 'Erro ao buscar paciente',
      });
    }
  };

  // Selecionar paciente
  const selecionarPaciente = async (paciente: Paciente) => {
    setPacienteSelecionado(paciente);
    setBuscaPaciente(paciente.nome);

    try {
      // Verificar se triagem foi realizada (obrigatória)
      const triagemRealizada = await EnfermagemService.verificarTriagemObrigatoria(
        paciente.id.toString()
      );

      if (!triagemRealizada) {
        setFeedback({
          tipo: 'erro',
          mensagem:
            'Triagem é obrigatória antes de administrar medicamentos. Realize a triagem primeiro.',
        });
        return;
      }

      // Filtrar medicamentos do paciente
      const medicamentosPaciente = medicamentos.filter(
        (m) => m.pacienteId === paciente.id.toString()
      );

      // Simular dados de histórico
      const historicoSimulado: Medicamento[] = [
        {
          id: 'hist1',
          pacienteId: paciente.id.toString(),
          pacienteNome: paciente.nome,
          leito: '12A',
          medicamento: 'Dipirona',
          dosagem: '500mg',
          horario: '08:00',
          administrado: true,
          profissionalId: 1,
          observacoes: 'Administrado conforme prescrição',
        },
        {
          id: 'hist2',
          pacienteId: paciente.id.toString(),
          pacienteNome: paciente.nome,
          leito: '12A',
          medicamento: 'Omeprazol',
          dosagem: '20mg',
          horario: '08:30',
          administrado: true,
          profissionalId: 1,
          observacoes: 'Paciente em jejum',
        },
      ];

      setMedicamentosHistorico(historicoSimulado);
    } catch (error) {
      console.error('Erro ao buscar dados do paciente:', error);
      setFeedback({
        tipo: 'erro',
        mensagem: 'Erro ao carregar dados do paciente',
      });
    }
  };

  // Administrar medicamento
  const administrarMedicamento = async (medicamento: Medicamento) => {
    if (!pacienteSelecionado) {
      setFeedback({
        tipo: 'erro',
        mensagem: 'Selecione um paciente primeiro',
      });
      return;
    }

    setMedicamentoSelecionado(medicamento);
  };

  // Confirmar administração
  const confirmarAdministracao = async () => {
    if (!medicamentoSelecionado) return;

    setLoading(true);

    try {
      await EnfermagemService.administrarMedicamento(
        medicamentoSelecionado.id,
        formAdministracao.observacoes
      );

      setFeedback({
        tipo: 'sucesso',
        mensagem: 'Medicamento administrado com sucesso!',
      });

      // Atualizar lista removendo o medicamento administrado
      setMedicamentos((prev) => prev.filter((m) => m.id !== medicamentoSelecionado.id));

      // Adicionar ao histórico
      const novoHistorico: Medicamento = {
        ...medicamentoSelecionado,
        administrado: true,
        observacoes: formAdministracao.observacoes || 'Administrado conforme prescrição',
      };

      setMedicamentosHistorico((prev) => [novoHistorico, ...prev]);

      // Limpar formulário
      setMedicamentoSelecionado(null);
      setFormAdministracao({});
    } catch (error) {
      console.error('Erro ao administrar medicamento:', error);
      setFeedback({
        tipo: 'erro',
        mensagem: 'Erro ao administrar medicamento',
      });
    } finally {
      setLoading(false);
    }
  };

  // Verificar se medicamento está atrasado
  const verificarAtraso = (horario: string): boolean => {
    const agora = new Date();
    const [hora, minuto] = horario.split(':').map((n) => parseInt(n));
    const horarioMedicamento = new Date();
    horarioMedicamento.setHours(hora, minuto, 0, 0);

    return agora > horarioMedicamento;
  };

  // Obter cor do status do medicamento
  const obterCorStatus = (medicamento: Medicamento): string => {
    if (medicamento.administrado) return 'text-green-600';
    if (verificarAtraso(medicamento.horario)) return 'text-red-600';
    return 'text-yellow-600';
  };

  // Filtrar medicamentos do paciente selecionado
  const medicamentosPaciente = pacienteSelecionado
    ? medicamentos.filter((m) => m.pacienteId === pacienteSelecionado.id.toString())
    : medicamentos;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Pill className="w-7 h-7 text-green-600" />
          Administração de Medicamentos
        </h1>

        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => setMostrarHistorico(!mostrarHistorico)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              mostrarHistorico
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <History className="w-4 h-4" />
            {mostrarHistorico ? 'Ocultar Histórico' : 'Ver Histórico'}
          </button>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-lg ${
            feedback.tipo === 'sucesso'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.mensagem}
        </div>
      )}

      {/* Busca de Paciente */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Buscar Paciente
        </h2>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Digite o nome ou CPF do paciente"
            value={buscaPaciente}
            onChange={(e) => setBuscaPaciente(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={buscarPaciente}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Buscar
          </button>
        </div>

        {/* Paciente selecionado */}
        {pacienteSelecionado && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-900">Paciente Selecionado:</h3>
            <p className="text-green-800">
              {pacienteSelecionado.nome} - CPF: {pacienteSelecionado.cpf}
            </p>
          </div>
        )}
      </div>

      {/* Lista de Medicamentos para Administrar */}
      {!mostrarHistorico && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Medicamentos para Administrar
          </h2>

          {medicamentosPaciente.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {pacienteSelecionado
                ? 'Nenhum medicamento pendente para este paciente.'
                : 'Nenhum medicamento pendente no momento.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Paciente</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Leito</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Medicamento</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Dosagem</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Horário</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {medicamentosPaciente.map((medicamento) => (
                    <tr key={medicamento.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{medicamento.pacienteNome}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-gray-600">{medicamento.leito}</td>
                      <td className="py-3 px-2">
                        <span className="font-medium text-gray-900">{medicamento.medicamento}</span>
                      </td>
                      <td className="py-3 px-2 text-gray-600">{medicamento.dosagem}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className={obterCorStatus(medicamento)}>{medicamento.horario}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        {medicamento.administrado ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Administrado
                          </span>
                        ) : verificarAtraso(medicamento.horario) ? (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            Atrasado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <Clock className="w-4 h-4" />
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {!medicamento.administrado && (
                          <button
                            onClick={() => administrarMedicamento(medicamento)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Administrar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Histórico de Medicamentos */}
      {mostrarHistorico && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico de Medicamentos Administrados
          </h2>

          {medicamentosHistorico.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum medicamento administrado ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Paciente</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Medicamento</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Dosagem</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Horário</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Observações</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {medicamentosHistorico.map((medicamento) => (
                    <tr key={medicamento.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {medicamento.pacienteNome}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 font-medium text-gray-900">
                        {medicamento.medicamento}
                      </td>
                      <td className="py-3 px-2 text-gray-600">{medicamento.dosagem}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{medicamento.horario}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-gray-600">
                        {medicamento.observacoes || 'Nenhuma observação'}
                      </td>
                      <td className="py-3 px-2">
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Administrado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal de Confirmação de Administração */}
      {medicamentoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Administração</h3>

            <div className="space-y-3 mb-6">
              <p>
                <strong>Paciente:</strong> {medicamentoSelecionado.pacienteNome}
              </p>
              <p>
                <strong>Medicamento:</strong> {medicamentoSelecionado.medicamento}
              </p>
              <p>
                <strong>Dosagem:</strong> {medicamentoSelecionado.dosagem}
              </p>
              <p>
                <strong>Horário:</strong> {medicamentoSelecionado.horario}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  value={formAdministracao.observacoes || ''}
                  onChange={(e) =>
                    setFormAdministracao((prev) => ({ ...prev, observacoes: e.target.value }))
                  }
                  placeholder="Digite observações sobre a administração..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intercorrências (opcional)
                </label>
                <textarea
                  value={formAdministracao.intercorrencias || ''}
                  onChange={(e) =>
                    setFormAdministracao((prev) => ({ ...prev, intercorrencias: e.target.value }))
                  }
                  placeholder="Relate qualquer intercorrência..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setMedicamentoSelecionado(null)}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAdministracao}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {loading ? 'Administrando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MedicamentosPage;

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
