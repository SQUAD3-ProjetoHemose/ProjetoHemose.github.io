'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Save,
  User,
  Clock,
  Calendar,
  Activity,
  AlertTriangle,
  Heart,
  Thermometer,
  Plus,
  Eye,
  Edit,
} from 'lucide-react';
import {
  EnfermagemService,
  EvolucaoEnfermagem,
  SinaisVitais,
} from '@/lib/services/enfermagem.service';
import { PacientesService } from '@/lib/services';
import { Paciente } from '@/types';

// Interface para o formulário de evolução
interface EvolucaoForm {
  observacoesEnfermagem: string;
  procedimentosRealizados?: string;
  medicamentosAdministrados?: string;
  intercorrencias?: string;
  planoAssistencial?: string;
  sinaisVitais: {
    pressaoArterialSistolica?: number | '';
    pressaoArterialDiastolica?: number | '';
    temperatura?: number | '';
    frequenciaCardiaca?: number | '';
    frequenciaRespiratoria?: number | '';
    saturacaoOxigenio?: number | '';
    glicemiaCapilar?: number | '';
    nivelDor?: number | '';
  };
}

function EvolucaoPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [evolucoes, setEvolucoes] = useState<EvolucaoEnfermagem[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formEvolucao, setFormEvolucao] = useState<EvolucaoForm>({
    observacoesEnfermagem: '',
    procedimentosRealizados: '',
    medicamentosAdministrados: '',
    intercorrencias: '',
    planoAssistencial: '',
    sinaisVitais: {
      pressaoArterialSistolica: '',
      pressaoArterialDiastolica: '',
      temperatura: '',
      frequenciaCardiaca: '',
      frequenciaRespiratoria: '',
      saturacaoOxigenio: '',
      glicemiaCapilar: '',
      nivelDor: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; mensagem: string } | null>(
    null
  );

  // Buscar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const pacientesData = await PacientesService.getPacientes();
        setPacientes(pacientesData);
      } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
        setFeedback({
          tipo: 'erro',
          mensagem: 'Erro ao carregar lista de pacientes',
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
            'Triagem é obrigatória antes de registrar evolução. Realize a triagem primeiro.',
        });
        return;
      }

      // Buscar evoluções do paciente
      const evolucoesData = await EnfermagemService.buscarEvolucoesPaciente(paciente.id.toString());

      // Simular dados se não houver evoluções
      const evolucoesSimuladas: EvolucaoEnfermagem[] =
        evolucoesData.length > 0
          ? evolucoesData
          : [
              {
                id: '1',
                pacienteId: paciente.id.toString(),
                pacienteNome: paciente.nome,
                observacoesEnfermagem:
                  'Paciente consciente, orientado no tempo e espaço. Deambulando sem dificuldades. Aceitação da dieta oral boa. Eliminações vesico-intestinais presentes e sem alterações.',
                sinaisVitais: {
                  pressaoArterialSistolica: 120,
                  pressaoArterialDiastolica: 80,
                  temperatura: 36.5,
                  frequenciaCardiaca: 78,
                  frequenciaRespiratoria: 18,
                  saturacaoOxigenio: 98,
                  glicemiaCapilar: 95,
                  nivelDor: 2,
                },
                procedimentosRealizados:
                  'Verificação de sinais vitais, administração de medicamentos conforme prescrição médica, curativo em lesão no braço direito.',
                medicamentosAdministrados: 'Dipirona 500mg VO - 08h, Omeprazol 20mg VO - 08h30',
                planoAssistencial:
                  'Manter observação neurológica, estimular deambulação, orientar sobre importância da adesão medicamentosa.',
                profissionalId: 1,
                dataEvolucao: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
              },
              {
                id: '2',
                pacienteId: paciente.id.toString(),
                pacienteNome: paciente.nome,
                observacoesEnfermagem:
                  'Paciente apresentando melhora do quadro geral. Refere diminuição da dor. Sono preservado durante a noite. Colaborativo com os cuidados.',
                sinaisVitais: {
                  pressaoArterialSistolica: 115,
                  pressaoArterialDiastolica: 75,
                  temperatura: 36.8,
                  frequenciaCardiaca: 72,
                  frequenciaRespiratoria: 16,
                  saturacaoOxigenio: 99,
                  glicemiaCapilar: 88,
                  nivelDor: 1,
                },
                procedimentosRealizados:
                  'Higiene corporal assistida, troca de roupa de cama, controle de eliminações.',
                medicamentosAdministrados: 'Paracetamol 750mg VO - 14h',
                intercorrencias: 'Sem intercorrências no período.',
                planoAssistencial:
                  'Continuar cuidados atuais, avaliar alta hospitalar com equipe médica.',
                profissionalId: 1,
                dataEvolucao: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 horas atrás
              },
            ];

      setEvolucoes(evolucoesSimuladas);
    } catch (error) {
      console.error('Erro ao buscar dados do paciente:', error);
      setFeedback({
        tipo: 'erro',
        mensagem: 'Erro ao carregar dados do paciente',
      });
    }
  };

  // Nova evolução
  const novaEvolucao = () => {
    if (!pacienteSelecionado) {
      setFeedback({
        tipo: 'erro',
        mensagem: 'Selecione um paciente primeiro',
      });
      return;
    }

    setMostrarFormulario(true);
    // Limpar formulário
    setFormEvolucao({
      observacoesEnfermagem: '',
      procedimentosRealizados: '',
      medicamentosAdministrados: '',
      intercorrencias: '',
      planoAssistencial: '',
      sinaisVitais: {
        pressaoArterialSistolica: '',
        pressaoArterialDiastolica: '',
        temperatura: '',
        frequenciaCardiaca: '',
        frequenciaRespiratoria: '',
        saturacaoOxigenio: '',
        glicemiaCapilar: '',
        nivelDor: '',
      },
    });
  };

  // Submissão do formulário
  const handleSubmitEvolucao = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pacienteSelecionado) {
      setFeedback({
        tipo: 'erro',
        mensagem: 'Selecione um paciente primeiro',
      });
      return;
    }

    // Validação básica
    if (!formEvolucao.observacoesEnfermagem.trim()) {
      setFeedback({
        tipo: 'erro',
        mensagem: 'As observações de enfermagem são obrigatórias',
      });
      return;
    }

    setLoading(true);

    try {
      const dadosEvolucao = {
        pacienteId: pacienteSelecionado.id.toString(),
        observacoesEnfermagem: formEvolucao.observacoesEnfermagem,
        procedimentosRealizados: formEvolucao.procedimentosRealizados,
        medicamentosAdministrados: formEvolucao.medicamentosAdministrados,
        intercorrencias: formEvolucao.intercorrencias,
        planoAssistencial: formEvolucao.planoAssistencial,
        sinaisVitais: {
          pressaoArterialSistolica: formEvolucao.sinaisVitais.pressaoArterialSistolica
            ? Number(formEvolucao.sinaisVitais.pressaoArterialSistolica)
            : undefined,
          pressaoArterialDiastolica: formEvolucao.sinaisVitais.pressaoArterialDiastolica
            ? Number(formEvolucao.sinaisVitais.pressaoArterialDiastolica)
            : undefined,
          temperatura: formEvolucao.sinaisVitais.temperatura
            ? Number(formEvolucao.sinaisVitais.temperatura)
            : undefined,
          frequenciaCardiaca: formEvolucao.sinaisVitais.frequenciaCardiaca
            ? Number(formEvolucao.sinaisVitais.frequenciaCardiaca)
            : undefined,
          frequenciaRespiratoria: formEvolucao.sinaisVitais.frequenciaRespiratoria
            ? Number(formEvolucao.sinaisVitais.frequenciaRespiratoria)
            : undefined,
          saturacaoOxigenio: formEvolucao.sinaisVitais.saturacaoOxigenio
            ? Number(formEvolucao.sinaisVitais.saturacaoOxigenio)
            : undefined,
          glicemiaCapilar: formEvolucao.sinaisVitais.glicemiaCapilar
            ? Number(formEvolucao.sinaisVitais.glicemiaCapilar)
            : undefined,
          nivelDor: formEvolucao.sinaisVitais.nivelDor
            ? Number(formEvolucao.sinaisVitais.nivelDor)
            : undefined,
        },
      };

      await EnfermagemService.registrarEvolucao(dadosEvolucao);

      setFeedback({
        tipo: 'sucesso',
        mensagem: 'Evolução de enfermagem registrada com sucesso!',
      });

      // Adicionar à lista local
      const novaEvolucao: EvolucaoEnfermagem = {
        id: Date.now().toString(),
        ...dadosEvolucao,
        pacienteNome: pacienteSelecionado.nome,
        profissionalId: 1,
        dataEvolucao: new Date().toISOString(),
      };

      setEvolucoes((prev) => [novaEvolucao, ...prev]);
      setMostrarFormulario(false);
    } catch (error) {
      console.error('Erro ao registrar evolução:', error);
      setFeedback({
        tipo: 'erro',
        mensagem: 'Erro ao registrar evolução de enfermagem',
      });
    } finally {
      setLoading(false);
    }
  };

  // Formatar data/hora
  const formatarDataHora = (dataISO: string): string => {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR');
  };

  // Analisar sinais vitais
  const analisarSinaisVitais = (sinais: SinaisVitais) => {
    const alertas = [];

    if (sinais.pressaoArterialSistolica && sinais.pressaoArterialDiastolica) {
      if (sinais.pressaoArterialSistolica > 140 || sinais.pressaoArterialDiastolica > 90) {
        alertas.push('Pressão arterial elevada');
      } else if (sinais.pressaoArterialSistolica < 90 || sinais.pressaoArterialDiastolica < 60) {
        alertas.push('Pressão arterial baixa');
      }
    }

    if (sinais.temperatura) {
      if (sinais.temperatura > 37.5) {
        alertas.push('Febre');
      } else if (sinais.temperatura < 36) {
        alertas.push('Hipotermia');
      }
    }

    if (sinais.frequenciaCardiaca) {
      if (sinais.frequenciaCardiaca > 100) {
        alertas.push('Taquicardia');
      } else if (sinais.frequenciaCardiaca < 60) {
        alertas.push('Bradicardia');
      }
    }

    if (sinais.saturacaoOxigenio && sinais.saturacaoOxigenio < 95) {
      alertas.push('Saturação baixa');
    }

    return alertas;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-7 h-7 text-green-600" />
          Evolução de Enfermagem
        </h1>

        {pacienteSelecionado && (
          <button
            onClick={novaEvolucao}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mt-4 sm:mt-0"
          >
            <Plus className="w-4 h-4" />
            Nova Evolução
          </button>
        )}
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

      {/* Formulário de Nova Evolução */}
      {mostrarFormulario && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nova Evolução de Enfermagem
            </h2>
            <button
              onClick={() => setMostrarFormulario(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmitEvolucao} className="space-y-6">
            {/* Observações de Enfermagem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações de Enfermagem *
              </label>
              <textarea
                required
                value={formEvolucao.observacoesEnfermagem}
                onChange={(e) =>
                  setFormEvolucao((prev) => ({ ...prev, observacoesEnfermagem: e.target.value }))
                }
                placeholder="Descreva o estado geral do paciente, condições clínicas observadas..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={4}
              />
            </div>

            {/* Sinais Vitais */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Sinais Vitais (opcional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pressão Arterial (mmHg)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Sistólica"
                      value={formEvolucao.sinaisVitais.pressaoArterialSistolica}
                      onChange={(e) =>
                        setFormEvolucao((prev) => ({
                          ...prev,
                          sinaisVitais: {
                            ...prev.sinaisVitais,
                            pressaoArterialSistolica: e.target.value ? Number(e.target.value) : '',
                          },
                        }))
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Diastólica"
                      value={formEvolucao.sinaisVitais.pressaoArterialDiastolica}
                      onChange={(e) =>
                        setFormEvolucao((prev) => ({
                          ...prev,
                          sinaisVitais: {
                            ...prev.sinaisVitais,
                            pressaoArterialDiastolica: e.target.value ? Number(e.target.value) : '',
                          },
                        }))
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temperatura (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    value={formEvolucao.sinaisVitais.temperatura}
                    onChange={(e) =>
                      setFormEvolucao((prev) => ({
                        ...prev,
                        sinaisVitais: {
                          ...prev.sinaisVitais,
                          temperatura: e.target.value ? Number(e.target.value) : '',
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">FC (bpm)</label>
                  <input
                    type="number"
                    placeholder="75"
                    value={formEvolucao.sinaisVitais.frequenciaCardiaca}
                    onChange={(e) =>
                      setFormEvolucao((prev) => ({
                        ...prev,
                        sinaisVitais: {
                          ...prev.sinaisVitais,
                          frequenciaCardiaca: e.target.value ? Number(e.target.value) : '',
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SatO2 (%)</label>
                  <input
                    type="number"
                    placeholder="98"
                    value={formEvolucao.sinaisVitais.saturacaoOxigenio}
                    onChange={(e) =>
                      setFormEvolucao((prev) => ({
                        ...prev,
                        sinaisVitais: {
                          ...prev.sinaisVitais,
                          saturacaoOxigenio: e.target.value ? Number(e.target.value) : '',
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Procedimentos Realizados */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Procedimentos Realizados
              </label>
              <textarea
                value={formEvolucao.procedimentosRealizados}
                onChange={(e) =>
                  setFormEvolucao((prev) => ({ ...prev, procedimentosRealizados: e.target.value }))
                }
                placeholder="Descreva os procedimentos realizados..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Medicamentos Administrados */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medicamentos Administrados
              </label>
              <textarea
                value={formEvolucao.medicamentosAdministrados}
                onChange={(e) =>
                  setFormEvolucao((prev) => ({
                    ...prev,
                    medicamentosAdministrados: e.target.value,
                  }))
                }
                placeholder="Liste os medicamentos administrados com horários..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={2}
              />
            </div>

            {/* Intercorrências */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intercorrências
              </label>
              <textarea
                value={formEvolucao.intercorrencias}
                onChange={(e) =>
                  setFormEvolucao((prev) => ({ ...prev, intercorrencias: e.target.value }))
                }
                placeholder="Relate intercorrências ocorridas no período..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={2}
              />
            </div>

            {/* Plano Assistencial */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plano Assistencial
              </label>
              <textarea
                value={formEvolucao.planoAssistencial}
                onChange={(e) =>
                  setFormEvolucao((prev) => ({ ...prev, planoAssistencial: e.target.value }))
                }
                placeholder="Descreva o plano de cuidados..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={2}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Salvando...' : 'Salvar Evolução'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Histórico de Evoluções */}
      {evolucoes.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Histórico de Evoluções
          </h2>

          <div className="space-y-4">
            {evolucoes.map((evolucao) => {
              const alertas = analisarSinaisVitais(evolucao.sinaisVitais);

              return (
                <div key={evolucao.id} className="border border-gray-200 rounded-lg p-4">
                  {/* Cabeçalho */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatarDataHora(evolucao.dataEvolucao)}
                      </span>
                    </div>
                    {alertas.length > 0 && (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs">Atenção</span>
                      </div>
                    )}
                  </div>

                  {/* Observações */}
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Observações de Enfermagem:
                    </h4>
                    <p className="text-sm text-gray-900">{evolucao.observacoesEnfermagem}</p>
                  </div>

                  {/* Sinais Vitais */}
                  {(evolucao.sinaisVitais.pressaoArterialSistolica ||
                    evolucao.sinaisVitais.temperatura) && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        Sinais Vitais:
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {evolucao.sinaisVitais.pressaoArterialSistolica && (
                          <span>
                            PA: {evolucao.sinaisVitais.pressaoArterialSistolica}/
                            {evolucao.sinaisVitais.pressaoArterialDiastolica}
                          </span>
                        )}
                        {evolucao.sinaisVitais.temperatura && (
                          <span>T: {evolucao.sinaisVitais.temperatura}°C</span>
                        )}
                        {evolucao.sinaisVitais.frequenciaCardiaca && (
                          <span>FC: {evolucao.sinaisVitais.frequenciaCardiaca}bpm</span>
                        )}
                        {evolucao.sinaisVitais.saturacaoOxigenio && (
                          <span>SatO2: {evolucao.sinaisVitais.saturacaoOxigenio}%</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Procedimentos */}
                  {evolucao.procedimentosRealizados && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">
                        Procedimentos Realizados:
                      </h4>
                      <p className="text-sm text-gray-900">{evolucao.procedimentosRealizados}</p>
                    </div>
                  )}

                  {/* Medicamentos */}
                  {evolucao.medicamentosAdministrados && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">
                        Medicamentos Administrados:
                      </h4>
                      <p className="text-sm text-gray-900">{evolucao.medicamentosAdministrados}</p>
                    </div>
                  )}

                  {/* Intercorrências */}
                  {evolucao.intercorrencias && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Intercorrências:</h4>
                      <p className="text-sm text-gray-900">{evolucao.intercorrencias}</p>
                    </div>
                  )}

                  {/* Plano Assistencial */}
                  {evolucao.planoAssistencial && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">
                        Plano Assistencial:
                      </h4>
                      <p className="text-sm text-gray-900">{evolucao.planoAssistencial}</p>
                    </div>
                  )}

                  {/* Alertas */}
                  {alertas.length > 0 && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-center gap-1 text-red-800 text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="font-medium">Alertas:</span>
                        <span>{alertas.join(', ')}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default EvolucaoPage;

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
