'use client';

import { PacientesService } from '@/lib/services';
import { EnfermagemService, Triagem } from '@/lib/services/enfermagem.service';
import { Paciente } from '@/types';
import {
  Activity,
  AlertTriangle,
  Clipboard,
  Edit,
  Gauge,
  Heart,
  Plus,
  Save,
  Search,
  Thermometer,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Interface para o formulário de triagem
interface TriagemForm {
  pacienteId: string;
  pressaoArterial: string;
  frequenciaCardiaca: number | '';
  frequenciaRespiratoria: number | '';
  temperatura: number | '';
  saturacaoOxigenio: number | '';
  peso?: number | '';
  altura?: string;
  queixaPrincipal?: string;
  observacoes?: string;
}

function TriagemPage() {
  const [triagens, setTriagens] = useState<Triagem[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [formTriagem, setFormTriagem] = useState<TriagemForm>({
    pacienteId: '',
    pressaoArterial: '',
    frequenciaCardiaca: '',
    frequenciaRespiratoria: '',
    temperatura: '',
    saturacaoOxigenio: '',
    peso: '',
    altura: '',
    queixaPrincipal: '',
    observacoes: '',
  });
  const [modoEdicao, setModoEdicao] = useState(false);
  const [triagemEditando, setTriagemEditando] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; mensagem: string } | null>(
    null
  );
  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);

  // Buscar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const pacientesData = await PacientesService.getPacientes();
        // Garantir que os dados estejam no formato correto
        const pacientesFormatados = pacientesData.map((p: any) => ({
          ...p,
          sexo: p.sexo || 'M',
          cidade: p.cidade || '',
          estado: p.estado || '',
          cep: p.cep || '',
          contato_emergencia_nome: p.contato_emergencia_nome || '',
          contato_emergencia_telefone: p.contato_emergencia_telefone || '',
          observacoes: p.observacoes || '',
        }));
        setPacientes(pacientesFormatados);
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

  // Função para calcular prioridade baseada nos sinais vitais
  const calcularPrioridade = (sinais: TriagemForm): { cor: string; descricao: string } => {
    const { pressaoArterial, frequenciaCardiaca, temperatura, saturacaoOxigenio } = sinais;

    // Extrair valores de pressão
    const [sistolica, diastolica] = pressaoArterial.split('/').map((v) => parseInt(v));

    // Verificar condições críticas (vermelho)
    if (
      (sistolica && (sistolica > 180 || sistolica < 90)) ||
      (diastolica && (diastolica > 110 || diastolica < 60)) ||
      (frequenciaCardiaca &&
        (Number(frequenciaCardiaca) > 130 || Number(frequenciaCardiaca) < 50)) ||
      (temperatura && Number(temperatura) > 39) ||
      (saturacaoOxigenio && Number(saturacaoOxigenio) < 90)
    ) {
      return { cor: 'vermelho', descricao: 'Emergência - Risco de vida' };
    }

    // Verificar condições urgentes (laranja)
    if (
      (sistolica && (sistolica > 160 || sistolica < 100)) ||
      (diastolica && (diastolica > 100 || diastolica < 70)) ||
      (frequenciaCardiaca &&
        (Number(frequenciaCardiaca) > 110 || Number(frequenciaCardiaca) < 60)) ||
      (temperatura && Number(temperatura) > 38.5) ||
      (saturacaoOxigenio && Number(saturacaoOxigenio) < 95)
    ) {
      return { cor: 'laranja', descricao: 'Urgente - Necessita atendimento rápido' };
    }

    // Verificar condições moderadas (amarelo)
    if (
      (sistolica && (sistolica > 140 || sistolica < 110)) ||
      (diastolica && (diastolica > 90 || diastolica < 80)) ||
      (frequenciaCardiaca &&
        (Number(frequenciaCardiaca) > 100 || Number(frequenciaCardiaca) < 70)) ||
      (temperatura && Number(temperatura) > 37.8) ||
      (saturacaoOxigenio && Number(saturacaoOxigenio) < 97)
    ) {
      return { cor: 'amarelo', descricao: 'Pouco urgente - Pode aguardar' };
    }

    return { cor: 'verde', descricao: 'Não urgente - Sinais estáveis' };
  };

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

      // Se encontrou apenas um, seleciona automaticamente
      if (pacientesEncontrados.length === 1) {
        const paciente = pacientesEncontrados[0];
        setPacienteSelecionado(paciente);
        setFormTriagem((prev) => ({ ...prev, pacienteId: paciente.id.toString() }));

        // Buscar triagens do paciente
        const triagensData = await EnfermagemService.buscarTriagensPaciente(paciente.id.toString());
        setTriagens(triagensData);
      } else {
        // Mostrar lista de pacientes encontrados
        setFeedback({
          tipo: 'sucesso',
          mensagem: `${pacientesEncontrados.length} pacientes encontrados`,
        });
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
    setFormTriagem((prev) => ({ ...prev, pacienteId: paciente.id.toString() }));
    setBuscaPaciente(paciente.nome);

    try {
      const triagensData = await EnfermagemService.buscarTriagensPaciente(paciente.id.toString());
      setTriagens(triagensData);
    } catch (error) {
      console.error('Erro ao buscar triagens:', error);
    }
  };

  // Submissão do formulário de triagem
  const handleSubmitTriagem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pacienteSelecionado) {
      setFeedback({
        tipo: 'erro',
        mensagem: 'Selecione um paciente primeiro',
      });
      return;
    }

    // Validações básicas
    if (
      !formTriagem.pressaoArterial ||
      !formTriagem.frequenciaCardiaca ||
      !formTriagem.temperatura ||
      !formTriagem.saturacaoOxigenio
    ) {
      setFeedback({
        tipo: 'erro',
        mensagem: 'Preencha todos os campos obrigatórios',
      });
      return;
    }

    setLoading(true);

    try {
      const prioridade = calcularPrioridade(formTriagem);

      const dadosTriagem = {
        ...formTriagem,
        frequenciaCardiaca: Number(formTriagem.frequenciaCardiaca),
        frequenciaRespiratoria: Number(formTriagem.frequenciaRespiratoria),
        temperatura: Number(formTriagem.temperatura),
        saturacaoOxigenio: Number(formTriagem.saturacaoOxigenio),
        peso: formTriagem.peso ? Number(formTriagem.peso) : undefined,
        prioridade: prioridade.cor,
      };

      if (modoEdicao && triagemEditando) {
        await EnfermagemService.atualizarTriagem(triagemEditando, dadosTriagem);
        setFeedback({
          tipo: 'sucesso',
          mensagem: 'Triagem atualizada com sucesso!',
        });
      } else {
        await EnfermagemService.realizarTriagem(dadosTriagem);
        setFeedback({
          tipo: 'sucesso',
          mensagem: 'Triagem realizada com sucesso!',
        });
      }

      // Recarregar triagens
      const triagensAtualizadas = await EnfermagemService.buscarTriagensPaciente(
        pacienteSelecionado.id.toString()
      );
      setTriagens(triagensAtualizadas);

      // Limpar formulário
      limparFormulario();
    } catch (error) {
      console.error('Erro ao salvar triagem:', error);
      setFeedback({
        tipo: 'erro',
        mensagem: 'Erro ao salvar triagem',
      });
    } finally {
      setLoading(false);
    }
  };

  // Limpar formulário
  const limparFormulario = () => {
    setFormTriagem({
      pacienteId: pacienteSelecionado?.id.toString() || '',
      pressaoArterial: '',
      frequenciaCardiaca: '',
      frequenciaRespiratoria: '',
      temperatura: '',
      saturacaoOxigenio: '',
      peso: '',
      altura: '',
      queixaPrincipal: '',
      observacoes: '',
    });
    setModoEdicao(false);
    setTriagemEditando(null);
  };

  // Editar triagem
  const editarTriagem = (triagem: Triagem) => {
    setFormTriagem({
      pacienteId: triagem.pacienteId,
      pressaoArterial: triagem.pressaoArterial,
      frequenciaCardiaca: triagem.frequenciaCardiaca,
      frequenciaRespiratoria: triagem.frequenciaRespiratoria,
      temperatura: triagem.temperatura,
      saturacaoOxigenio: triagem.saturacaoOxigenio,
      peso: triagem.peso || '',
      altura: triagem.altura || '',
      queixaPrincipal: triagem.queixaPrincipal || '',
      observacoes: triagem.observacoes || '',
    });
    setModoEdicao(true);
    setTriagemEditando(triagem.id);
  };

  // Cores de prioridade
  const coresPrioridade = {
    verde: 'bg-green-100 text-green-800 border-green-300',
    amarelo: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    laranja: 'bg-orange-100 text-orange-800 border-orange-300',
    vermelho: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Triagem de Pacientes</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={limparFormulario}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Triagem
          </button>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-lg ${
            feedback.tipo === 'sucesso'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
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

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Nome ou CPF do paciente"
            value={buscaPaciente}
            onChange={(e) => setBuscaPaciente(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            onKeyPress={(e) => e.key === 'Enter' && buscarPaciente()}
          />
          <button
            onClick={buscarPaciente}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Buscar
          </button>
        </div>

        {/* Lista de pacientes encontrados */}
        {!pacienteSelecionado && buscaPaciente && (
          <div className="mt-4 space-y-2">
            {pacientes
              .filter(
                (p) =>
                  p.nome.toLowerCase().includes(buscaPaciente.toLowerCase()) ||
                  p.cpf.includes(buscaPaciente.replace(/\D/g, ''))
              )
              .slice(0, 5)
              .map((paciente) => (
                <div
                  key={paciente.id}
                  className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => selecionarPaciente(paciente)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{paciente.nome}</p>
                      <p className="text-sm text-gray-600">CPF: {paciente.cpf}</p>
                    </div>
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
          </div>
        )}

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

      {/* Formulário de Triagem */}
      {pacienteSelecionado && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Clipboard className="w-5 h-5" />
            {modoEdicao ? 'Editar Triagem' : 'Nova Triagem'}
          </h2>

          <form onSubmit={handleSubmitTriagem} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Pressão Arterial */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Heart className="w-4 h-4 inline mr-1" />
                  Pressão Arterial (mmHg) *
                </label>
                <input
                  type="text"
                  placeholder="Ex: 120/80"
                  value={formTriagem.pressaoArterial}
                  onChange={(e) =>
                    setFormTriagem((prev) => ({ ...prev, pressaoArterial: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Frequência Cardíaca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Activity className="w-4 h-4 inline mr-1" />
                  Frequência Cardíaca (bpm) *
                </label>
                <input
                  type="number"
                  placeholder="Ex: 72"
                  value={formTriagem.frequenciaCardiaca}
                  onChange={(e) =>
                    setFormTriagem((prev) => ({
                      ...prev,
                      frequenciaCardiaca: e.target.value ? Number(e.target.value) : '',
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Frequência Respiratória */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Gauge className="w-4 h-4 inline mr-1" />
                  Frequência Respiratória (irpm) *
                </label>
                <input
                  type="number"
                  placeholder="Ex: 16"
                  value={formTriagem.frequenciaRespiratoria}
                  onChange={(e) =>
                    setFormTriagem((prev) => ({
                      ...prev,
                      frequenciaRespiratoria: e.target.value ? Number(e.target.value) : '',
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Temperatura */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Thermometer className="w-4 h-4 inline mr-1" />
                  Temperatura (°C) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 36.5"
                  value={formTriagem.temperatura}
                  onChange={(e) =>
                    setFormTriagem((prev) => ({
                      ...prev,
                      temperatura: e.target.value ? Number(e.target.value) : '',
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Saturação de Oxigênio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Activity className="w-4 h-4 inline mr-1" />
                  Saturação O2 (%) *
                </label>
                <input
                  type="number"
                  placeholder="Ex: 98"
                  value={formTriagem.saturacaoOxigenio}
                  onChange={(e) =>
                    setFormTriagem((prev) => ({
                      ...prev,
                      saturacaoOxigenio: e.target.value ? Number(e.target.value) : '',
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Peso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
                <input
                  type="number"
                  placeholder="Ex: 70"
                  value={formTriagem.peso}
                  onChange={(e) =>
                    setFormTriagem((prev) => ({
                      ...prev,
                      peso: e.target.value ? Number(e.target.value) : '',
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Altura */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Altura (cm)</label>
                <input
                  type="text"
                  placeholder="Ex: 170"
                  value={formTriagem.altura}
                  onChange={(e) => setFormTriagem((prev) => ({ ...prev, altura: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Queixa Principal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Queixa Principal
              </label>
              <textarea
                placeholder="Descreva a queixa principal do paciente..."
                value={formTriagem.queixaPrincipal}
                onChange={(e) =>
                  setFormTriagem((prev) => ({ ...prev, queixaPrincipal: e.target.value }))
                }
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
              <textarea
                placeholder="Observações adicionais sobre a triagem..."
                value={formTriagem.observacoes}
                onChange={(e) =>
                  setFormTriagem((prev) => ({ ...prev, observacoes: e.target.value }))
                }
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Preview da Prioridade */}
            {formTriagem.pressaoArterial &&
              formTriagem.frequenciaCardiaca &&
              formTriagem.temperatura &&
              formTriagem.saturacaoOxigenio && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Prioridade Calculada:</h4>
                  {(() => {
                    const prioridade = calcularPrioridade(formTriagem);
                    return (
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${
                          coresPrioridade[prioridade.cor as keyof typeof coresPrioridade]
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        {prioridade.descricao}
                      </div>
                    );
                  })()}
                </div>
              )}

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2 justify-center"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Salvando...' : modoEdicao ? 'Atualizar Triagem' : 'Salvar Triagem'}
              </button>

              {modoEdicao && (
                <button
                  type="button"
                  onClick={limparFormulario}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Histórico de Triagens */}
      {triagens.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Triagens</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-900">Data</th>
                  <th className="px-4 py-3 font-medium text-gray-900">Prioridade</th>
                  <th className="px-4 py-3 font-medium text-gray-900">Sinais Vitais</th>
                  <th className="px-4 py-3 font-medium text-gray-900">Queixa</th>
                  <th className="px-4 py-3 font-medium text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {triagens.map((triagem) => (
                  <tr key={triagem.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {new Date(triagem.dataTriagem).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      {triagem.prioridade && (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            coresPrioridade[triagem.prioridade as keyof typeof coresPrioridade]
                          }`}
                        >
                          {triagem.prioridade}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs space-y-1">
                        <div>PA: {triagem.pressaoArterial}</div>
                        <div>FC: {triagem.frequenciaCardiaca} bpm</div>
                        <div>Temp: {triagem.temperatura}°C</div>
                        <div>SpO2: {triagem.saturacaoOxigenio}%</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate">
                      {triagem.queixaPrincipal || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editarTriagem(triagem)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default TriagemPage;

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
