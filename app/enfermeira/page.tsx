'use client';

import { useState, useEffect } from 'react';
import { useAuthentication } from '@/hooks';
import {
  EnfermagemService,
  DashboardEnfermagem,
  PacienteUrgente,
  Medicamento,
} from '@/lib/services/enfermagem.service';
import { Activity, Users, Pill, Bed, AlertTriangle, Clock, Heart, Bell } from 'lucide-react';

function EnfermeiraDashboardPage() {
  // Obter o usuário do contexto de autenticação
  const { user } = useAuthentication();

  const [dashboardData, setDashboardData] = useState<DashboardEnfermagem | null>(null);
  const [pacientesUrgentes, setPacientesUrgentes] = useState<PacienteUrgente[]>([]);
  const [medicamentosUrgentes, setMedicamentosUrgentes] = useState<Medicamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregarDashboard();
  }, []);

  const carregarDashboard = async () => {
    try {
      setCarregando(true);
      setErro(null);

      // Carregar dados do dashboard
      const dashboard = await EnfermagemService.getDashboard();
      setDashboardData(dashboard);

      // Os pacientes urgentes já vêm no dashboard
      setPacientesUrgentes(dashboard.pacientesUrgentes || []);

      // Os medicamentos por horário já vêm no dashboard
      const agora = new Date();
      const proximaHora = new Date(agora.getTime() + 60 * 60 * 1000); // próxima hora

      const medicamentosUrgentes = (dashboard.medicamentosHorario || []).filter(
        (med: Medicamento) => {
          const hoje = new Date().toISOString().split('T')[0];
          const horarioMed = new Date(`${hoje}T${med.horario}`);
          return horarioMed <= proximaHora && !med.administrado;
        }
      );

      setMedicamentosUrgentes(medicamentosUrgentes.slice(0, 5)); // Mostrar apenas os 5 mais urgentes
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setErro('Erro ao carregar dados do dashboard. Tente recarregar a página.');

      // Dados de fallback para desenvolvimento
      setDashboardData({
        estatisticas: {
          pacientesInternados: 32,
          pacientesTriagem: 8,
          medicamentosAdministrar: 15,
          leitosDisponiveis: 18,
          triagensHoje: 12,
          evolucoeHoje: 8,
        },
        pacientesUrgentes: [],
        medicamentosHorario: [],
        leitosStatus: [],
      });
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard de Enfermagem</h1>
              {user && <p className="text-gray-600">Olá, {user.nome}. Bem-vindo(a)!</p>}
            </div>
            <div className="text-sm text-gray-500">
              Última atualização: {new Date().toLocaleTimeString('pt-BR')}
            </div>
          </div>
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

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600">Pacientes Internados</h2>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.estatisticas.pacientesInternados || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600">Aguardando Triagem</h2>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.estatisticas.pacientesTriagem || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600">Medicamentos Pendentes</h2>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.estatisticas.medicamentosAdministrar || 0}
                </p>
              </div>
              <Pill className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600">Leitos Disponíveis</h2>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.estatisticas.leitosDisponiveis || 0}
                </p>
              </div>
              <Bed className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Seção de Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pacientes que Requerem Atenção */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Pacientes Prioritários</h2>
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
            </div>
            <div className="p-6">
              {pacientesUrgentes.length > 0 ? (
                <div className="space-y-4">
                  {pacientesUrgentes.slice(0, 5).map((paciente) => (
                    <div
                      key={paciente.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{paciente.nome}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              paciente.status === 'Crítico'
                                ? 'bg-red-100 text-red-800'
                                : paciente.status === 'Instável'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {paciente.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Leito: {paciente.leito}</p>
                        <p className="text-sm text-gray-600">{paciente.sinaisVitais}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            (window.location.href = `/enfermeira/sinais-vitais?paciente=${paciente.id}`)
                          }
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Ver Sinais Vitais"
                        >
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Nenhum paciente prioritário no momento</p>
                </div>
              )}
            </div>
          </div>

          {/* Medicamentos Urgentes */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Medicamentos Urgentes</h2>
                <Bell className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="p-6">
              {medicamentosUrgentes.length > 0 ? (
                <div className="space-y-4">
                  {medicamentosUrgentes.map((medicamento) => (
                    <div
                      key={medicamento.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{medicamento.pacienteNome}</h3>
                        <p className="text-sm text-gray-600">Leito: {medicamento.leito}</p>
                        <p className="text-sm text-gray-600">
                          {medicamento.medicamento} - {medicamento.dosagem}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-orange-500" />
                          <span className="text-xs text-orange-600 font-medium">
                            {medicamento.horario}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            (window.location.href = `/enfermeira/medicamentos?paciente=${medicamento.pacienteId}`)
                          }
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Administrar Medicamento"
                        >
                          <Pill className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Pill className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Nenhum medicamento urgente no momento</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Links de Navegação Rápida */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/enfermeira/sinais-vitais"
            className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
          >
            <Heart className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-blue-800">Sinais Vitais</span>
          </a>

          <a
            href="/enfermeira/medicamentos"
            className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
          >
            <Pill className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-purple-800">Medicamentos</span>
          </a>

          <a
            href="/enfermeira/pacientes"
            className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
          >
            <Users className="h-8 w-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-orange-800">Lista Pacientes</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default EnfermeiraDashboardPage;

/*
 __  ____ ____ _  _ 
/ _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
