'use client';

import { PacientesService } from '@/lib/services';
import { EnfermagemService, SinaisVitais } from '@/lib/services/enfermagem.service';
import { Paciente } from '@/types';
import {
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  Gauge,
  Heart,
  Save,
  Search,
  Thermometer,
  TrendingUp,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Interface para o formulário de sinais vitais
interface SinaisVitaisForm {
  pressaoArterialSistolica: number | '';
  pressaoArterialDiastolica: number | '';
  temperatura: number | '';
  frequenciaCardiaca: number | '';
  frequenciaRespiratoria: number | '';
  saturacaoOxigenio: number | '';
  glicemiaCapilar: number | '';
  nivelDor: number | '';
}

// Interface para histórico de sinais vitais com timestamp
interface SinaisVitaisHistorico extends SinaisVitais {
  id?: string;
  dataRegistro: string;
  profissionalNome?: string;
}

function SinaisVitaisPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [formSinais, setFormSinais] = useState<SinaisVitaisForm>({
    pressaoArterialSistolica: '',
    pressaoArterialDiastolica: '',
    temperatura: '',
    frequenciaCardiaca: '',
    frequenciaRespiratoria: '',
    saturacaoOxigenio: '',
    glicemiaCapilar: '',
    nivelDor: '',
  });
  const [historicoSinais, setHistoricoSinais] = useState<SinaisVitaisHistorico[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; mensagem: string } | null>(
    null
  );

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
            'Triagem é obrigatória antes de registrar sinais vitais. Realize a triagem primeiro.',
        });
        return;
      }

      // Buscar histórico de sinais vitais
      const sinaisData = await EnfermagemService.buscarSinaisVitaisPaciente(paciente.id.toString());

      // Simular dados de histórico com timestamps
      const historicoSimulado: SinaisVitaisHistorico[] = [
        {
          pressaoArterialSistolica: 120,
          pressaoArterialDiastolica: 80,
          temperatura: 36.5,
          frequenciaCardiaca: 72,
          frequenciaRespiratoria: 16,
          saturacaoOxigenio: 98,
          glicemiaCapilar: 90,
          nivelDor: 2,
          dataRegistro: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
          profissionalNome: 'Enfermeira Ana',
        },
        {
          pressaoArterialSistolica: 125,
          pressaoArterialDiastolica: 85,
          temperatura: 36.8,
          frequenciaCardiaca: 78,
          frequenciaRespiratoria: 18,
          saturacaoOxigenio: 97,
          glicemiaCapilar: 95,
          nivelDor: 3,
          dataRegistro: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 horas atrás
          profissionalNome: 'Técnica Maria',
        },
      ];

      setHistoricoSinais(historicoSimulado);
    } catch (error) {
      console.error('Erro ao buscar dados do paciente:', error);
      setFeedback({
        tipo: 'erro',
        mensagem: 'Erro ao carregar dados do paciente',
      });
    }
  };

  // Submissão do formulário
  const handleSubmitSinais = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pacienteSelecionado) {
      setFeedback({
        tipo: 'erro',
        mensagem: 'Selecione um paciente primeiro',
      });
      return;
    }

    // Validações básicas
    const camposObrigatorios = [
      'pressaoArterialSistolica',
      'pressaoArterialDiastolica',
      'temperatura',
      'frequenciaCardiaca',
      'saturacaoOxigenio',
    ];

    const camposFaltando = camposObrigatorios.filter(
      (campo) =>
        !formSinais[campo as keyof SinaisVitaisForm] ||
        formSinais[campo as keyof SinaisVitaisForm] === ''
    );

    if (camposFaltando.length > 0) {
      setFeedback({
        tipo: 'erro',
        mensagem: 'Preencha todos os campos obrigatórios',
      });
      return;
    }

    setLoading(true);

    try {
      const dadosSinais: SinaisVitais = {
        pressaoArterialSistolica: Number(formSinais.pressaoArterialSistolica),
        pressaoArterialDiastolica: Number(formSinais.pressaoArterialDiastolica),
        temperatura: Number(formSinais.temperatura),
        frequenciaCardiaca: Number(formSinais.frequenciaCardiaca),
        frequenciaRespiratoria: formSinais.frequenciaRespiratoria
          ? Number(formSinais.frequenciaRespiratoria)
          : undefined,
        saturacaoOxigenio: Number(formSinais.saturacaoOxigenio),
        glicemiaCapilar: formSinais.glicemiaCapilar
          ? Number(formSinais.glicemiaCapilar)
          : undefined,
        nivelDor: formSinais.nivelDor ? Number(formSinais.nivelDor) : undefined,
      };

      await EnfermagemService.registrarSinaisVitais(pacienteSelecionado.id.toString(), dadosSinais);

      setFeedback({
        tipo: 'sucesso',
        mensagem: 'Sinais vitais registrados com sucesso!',
      });

      // Adicionar ao histórico local
      const novoRegistro: SinaisVitaisHistorico = {
        ...dadosSinais,
        dataRegistro: new Date().toISOString(),
        profissionalNome: 'Você',
      };

      setHistoricoSinais((prev) => [novoRegistro, ...prev]);

      // Limpar formulário
      setFormSinais({
        pressaoArterialSistolica: '',
        pressaoArterialDiastolica: '',
        temperatura: '',
        frequenciaCardiaca: '',
        frequenciaRespiratoria: '',
        saturacaoOxigenio: '',
        glicemiaCapilar: '',
        nivelDor: '',
      });
    } catch (error) {
      console.error('Erro ao registrar sinais vitais:', error);
      setFeedback({
        tipo: 'erro',
        mensagem: 'Erro ao registrar sinais vitais',
      });
    } finally {
      setLoading(false);
    }
  };

  // Analisar sinais vitais
  const analisarSinaisVitais = (sinais: SinaisVitais) => {
    const alertas = [];

    // Pressão arterial
    if (sinais.pressaoArterialSistolica && sinais.pressaoArterialDiastolica) {
      if (sinais.pressaoArterialSistolica > 140 || sinais.pressaoArterialDiastolica > 90) {
        alertas.push({ tipo: 'erro', mensagem: 'Pressão arterial elevada' });
      } else if (sinais.pressaoArterialSistolica < 90 || sinais.pressaoArterialDiastolica < 60) {
        alertas.push({ tipo: 'erro', mensagem: 'Pressão arterial baixa' });
      }
    }

    // Temperatura
    if (sinais.temperatura) {
      if (sinais.temperatura > 37.5) {
        alertas.push({ tipo: 'erro', mensagem: 'Febre' });
      } else if (sinais.temperatura < 36) {
        alertas.push({ tipo: 'erro', mensagem: 'Hipotermia' });
      }
    }

    // Saturação
    if (sinais.saturacaoOxigenio && sinais.saturacaoOxigenio < 95) {
      alertas.push({ tipo: 'erro', mensagem: 'Saturação de oxigênio baixa' });
    }

    // Frequência cardíaca
    if (sinais.frequenciaCardiaca) {
      if (sinais.frequenciaCardiaca > 100) {
        alertas.push({ tipo: 'erro', mensagem: 'Taquicardia' });
      } else if (sinais.frequenciaCardiaca < 60) {
        alertas.push({ tipo: 'erro', mensagem: 'Bradicardia' });
      }
    }

    return alertas;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Sinais Vitais</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          Última atualização: {new Date().toLocaleTimeString('pt-BR')}
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

      {/* Formulário de Sinais Vitais */}
      {pacienteSelecionado && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Registrar Sinais Vitais
          </h2>

          <form onSubmit={handleSubmitSinais} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Pressão Arterial Sistólica */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Heart className="w-4 h-4 inline mr-1" />
                  Pressão Sistólica (mmHg) *
                </label>
                <input
                  type="number"
                  placeholder="Ex: 120"
                  value={formSinais.pressaoArterialSistolica}
                  onChange={(e) =>
                    setFormSinais((prev) => ({
                      ...prev,
                      pressaoArterialSistolica: e.target.value ? Number(e.target.value) : '',
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Pressão Arterial Diastólica */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Heart className="w-4 h-4 inline mr-1" />
                  Pressão Diastólica (mmHg) *
                </label>
                <input
                  type="number"
                  placeholder="Ex: 80"
                  value={formSinais.pressaoArterialDiastolica}
                  onChange={(e) =>
                    setFormSinais((prev) => ({
                      ...prev,
                      pressaoArterialDiastolica: e.target.value ? Number(e.target.value) : '',
                    }))
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
                  value={formSinais.frequenciaCardiaca}
                  onChange={(e) =>
                    setFormSinais((prev) => ({
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
                  Frequência Respiratória (irpm)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 16"
                  value={formSinais.frequenciaRespiratoria}
                  onChange={(e) =>
                    setFormSinais((prev) => ({
                      ...prev,
                      frequenciaRespiratoria: e.target.value ? Number(e.target.value) : '',
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  value={formSinais.temperatura}
                  onChange={(e) =>
                    setFormSinais((prev) => ({
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
                  value={formSinais.saturacaoOxigenio}
                  onChange={(e) =>
                    setFormSinais((prev) => ({
                      ...prev,
                      saturacaoOxigenio: e.target.value ? Number(e.target.value) : '',
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Glicemia Capilar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Glicemia Capilar (mg/dL)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 90"
                  value={formSinais.glicemiaCapilar}
                  onChange={(e) =>
                    setFormSinais((prev) => ({
                      ...prev,
                      glicemiaCapilar: e.target.value ? Number(e.target.value) : '',
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Nível de Dor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de Dor (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  placeholder="Ex: 2"
                  value={formSinais.nivelDor}
                  onChange={(e) =>
                    setFormSinais((prev) => ({
                      ...prev,
                      nivelDor: e.target.value ? Number(e.target.value) : '',
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Análise dos sinais vitais */}
            {formSinais.pressaoArterialSistolica &&
              formSinais.pressaoArterialDiastolica &&
              formSinais.frequenciaCardiaca &&
              formSinais.temperatura &&
              formSinais.saturacaoOxigenio && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Análise dos Sinais Vitais:
                  </h4>
                  {(() => {
                    const alertas = analisarSinaisVitais({
                      pressaoArterialSistolica: Number(formSinais.pressaoArterialSistolica),
                      pressaoArterialDiastolica: Number(formSinais.pressaoArterialDiastolica),
                      temperatura: Number(formSinais.temperatura),
                      frequenciaCardiaca: Number(formSinais.frequenciaCardiaca),
                      saturacaoOxigenio: Number(formSinais.saturacaoOxigenio),
                    });

                    if (alertas.length === 0) {
                      return (
                        <div className="text-green-700 flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Sinais vitais dentro dos parâmetros normais
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-1">
                        {alertas.map((alerta, index) => (
                          <div key={index} className="text-red-700 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            {alerta.mensagem}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

            {/* Botão de submissão */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Salvando...' : 'Registrar Sinais Vitais'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Histórico de Sinais Vitais */}
      {historicoSinais.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Histórico de Sinais Vitais
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-900">Data/Hora</th>
                  <th className="px-4 py-3 font-medium text-gray-900">PA</th>
                  <th className="px-4 py-3 font-medium text-gray-900">FC</th>
                  <th className="px-4 py-3 font-medium text-gray-900">Temp</th>
                  <th className="px-4 py-3 font-medium text-gray-900">SpO2</th>
                  <th className="px-4 py-3 font-medium text-gray-900">Glicemia</th>
                  <th className="px-4 py-3 font-medium text-gray-900">Dor</th>
                  <th className="px-4 py-3 font-medium text-gray-900">Profissional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historicoSinais.map((sinais, index) => {
                  const alertas = analisarSinaisVitais(sinais);
                  const temAlerta = alertas.length > 0;

                  return (
                    <tr key={index} className={`hover:bg-gray-50 ${temAlerta ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3">
                        {new Date(sinais.dataRegistro).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        {sinais.pressaoArterialSistolica}/{sinais.pressaoArterialDiastolica}
                        {temAlerta && (
                          <AlertTriangle className="w-3 h-3 text-red-500 inline ml-1" />
                        )}
                      </td>
                      <td className="px-4 py-3">{sinais.frequenciaCardiaca} bpm</td>
                      <td className="px-4 py-3">{sinais.temperatura}°C</td>
                      <td className="px-4 py-3">{sinais.saturacaoOxigenio}%</td>
                      <td className="px-4 py-3">{sinais.glicemiaCapilar || '-'}</td>
                      <td className="px-4 py-3">{sinais.nivelDor || '-'}</td>
                      <td className="px-4 py-3">{sinais.profissionalNome}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SinaisVitaisPage;

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
