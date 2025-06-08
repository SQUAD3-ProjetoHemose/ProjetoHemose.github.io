'use client';

import { useState, useEffect } from 'react';
import { withProtectedRoute } from '@/hooks/useAuthentication';
import { useReports } from '@/hooks';
import { UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Download, 
  Calendar,
  Users,
  FileText,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

// Interface para dados de relatórios
interface DashboardData {
  totalPacientes: number;
  totalUsuarios: number;
  totalProntuarios: number;
  agendamentosHoje: number;
  agendamentosSemana: number;
  pacientesInternados: number;
  novosPacientesMes: number;
}

interface AgendamentosData {
  agendamentos: any[];
  estatisticas: {
    total: number;
    porStatus: any[];
    porMedico: any[];
  };
}

interface PacientesData {
  porSexo: any[];
  porIdade: any[];
  novosPorMes: any[];
}

interface ProdutividadeData {
  consultasPorMedico: any[];
  prescricoesPorMedico: any[];
}

interface FinanceiroData {
  consultasRealizadas: number;
  internacoesAtivas: number;
  totalProcedimentos: number;
  receitaEstimada: number;
}

// Página de relatórios administrativos
function AdminReportsPage() {
  const [tipoRelatorio, setTipoRelatorio] = useState('dashboard');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Usar o hook de relatórios
  const {
    dashboardStats,
    agendamentosReport,
    pacientesReport,
    produtividadeReport,
    financeiroReport,
    loading,
    error,
    fetchDashboard,
    fetchAgendamentosReport,
    fetchPacientesReport,
    fetchProdutividadeReport,
    fetchFinanceiroReport,
    exportCSV
  } = useReports();

  // Inicializar datas padrão (último mês)
  useEffect(() => {
    const hoje = new Date();
    const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate());
    
    setDataFim(hoje.toISOString().split('T')[0]);
    setDataInicio(mesPassado.toISOString().split('T')[0]);
  }, []);

  // Gerar relatório usando os métodos do hook
  const gerarRelatorio = async () => {
    try {
      switch (tipoRelatorio) {
        case 'agendamentos':
          await fetchAgendamentosReport(dataInicio, dataFim);
          break;
        case 'pacientes':
          await fetchPacientesReport();
          break;
        case 'produtividade':
          await fetchProdutividadeReport(dataInicio, dataFim);
          break;
        case 'financeiro':
          await fetchFinanceiroReport(dataInicio, dataFim);
          break;
        default:
          await fetchDashboard();
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    }
  };

  // Carregar dashboard automaticamente
  useEffect(() => {
    if (tipoRelatorio === 'dashboard') {
      fetchDashboard();
    }
  }, [tipoRelatorio, fetchDashboard]);

  // Exportar para CSV usando o método do hook
  const exportarCSV = async () => {
    try {
      await exportCSV(tipoRelatorio, dataInicio, dataFim);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
    }
  };

  // Renderizar conteúdo do relatório baseado no tipo
  const renderRelatorioContent = () => {
    let dados = null;
    
    switch (tipoRelatorio) {
      case 'dashboard':
        dados = dashboardStats;
        break;
      case 'agendamentos':
        dados = agendamentosReport;
        break;
      case 'pacientes':
        dados = pacientesReport;
        break;
      case 'produtividade':
        dados = produtividadeReport;
        break;
      case 'financeiro':
        dados = financeiroReport;
        break;
    }

    if (!dados) return null;

    switch (tipoRelatorio) {
      case 'dashboard':
        return <DashboardContent data={dados as DashboardData} />;
      case 'agendamentos':
        return <AgendamentosContent data={dados as AgendamentosData} />;
      case 'pacientes':
        return <PacientesContent data={dados as PacientesData} />;
      case 'produtividade':
        return <ProdutividadeContent data={dados as ProdutividadeData} />;
      case 'financeiro':
        return <FinanceiroContent data={dados as FinanceiroData} />;
      default:
        return <pre className="text-sm overflow-auto">{JSON.stringify(dados, null, 2)}</pre>;
    }
  };

  const hasData = () => {
    switch (tipoRelatorio) {
      case 'dashboard':
        return !!dashboardStats;
      case 'agendamentos':
        return !!agendamentosReport;
      case 'pacientes':
        return !!pacientesReport;
      case 'produtividade':
        return !!produtividadeReport;
      case 'financeiro':
        return !!financeiroReport;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Relatórios do Sistema</h1>
        <div className="flex gap-2">
          <Button onClick={gerarRelatorio} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button onClick={exportarCSV} className="gap-2" disabled={!hasData()}>
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros e configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Relatório
              </label>
              <select
                value={tipoRelatorio}
                onChange={(e) => setTipoRelatorio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dashboard">Dashboard Geral</option>
                <option value="agendamentos">Agendamentos</option>
                <option value="pacientes">Pacientes</option>
                <option value="produtividade">Produtividade Médica</option>
                <option value="financeiro">Financeiro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Início
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Fim
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <Button onClick={gerarRelatorio} disabled={loading} className="w-full gap-2">
                <BarChart3 className="h-4 w-4" />
                {loading ? 'Gerando...' : 'Gerar Relatório'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de relatórios rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow" 
          onClick={() => setTipoRelatorio('agendamentos')}
        >
          <CardContent className="p-6 text-center">
            <Calendar className="h-12 w-12 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Agendamentos</h3>
            <p className="text-sm text-gray-600">Relatório de consultas agendadas</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow" 
          onClick={() => setTipoRelatorio('pacientes')}
        >
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Pacientes</h3>
            <p className="text-sm text-gray-600">Estatísticas de pacientes</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow" 
          onClick={() => setTipoRelatorio('produtividade')}
        >
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-12 w-12 text-orange-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Produtividade</h3>
            <p className="text-sm text-gray-600">Relatório médico</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow" 
          onClick={() => setTipoRelatorio('financeiro')}
        >
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Financeiro</h3>
            <p className="text-sm text-gray-600">Relatório financeiro básico</p>
          </CardContent>
        </Card>
      </div>

      {/* Resultados do relatório */}
      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Carregando relatório...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {hasData() && !loading && !error && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados do Relatório - {tipoRelatorio}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderRelatorioContent()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Componentes para renderizar cada tipo de relatório
function DashboardContent({ data }: { data: DashboardData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900">Total de Pacientes</h4>
        <p className="text-2xl font-bold text-blue-700">{data.totalPacientes}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-semibold text-green-900">Usuários do Sistema</h4>
        <p className="text-2xl font-bold text-green-700">{data.totalUsuarios}</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-semibold text-purple-900">Prontuários</h4>
        <p className="text-2xl font-bold text-purple-700">{data.totalProntuarios}</p>
      </div>
      <div className="bg-orange-50 p-4 rounded-lg">
        <h4 className="font-semibold text-orange-900">Agendamentos Hoje</h4>
        <p className="text-2xl font-bold text-orange-700">{data.agendamentosHoje}</p>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="font-semibold text-yellow-900">Agendamentos Semana</h4>
        <p className="text-2xl font-bold text-yellow-700">{data.agendamentosSemana}</p>
      </div>
      <div className="bg-red-50 p-4 rounded-lg">
        <h4 className="font-semibold text-red-900">Pacientes Internados</h4>
        <p className="text-2xl font-bold text-red-700">{data.pacientesInternados}</p>
      </div>
    </div>
  );
}

function AgendamentosContent({ data }: { data: AgendamentosData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3">Por Status</h4>
          <div className="space-y-2">
            {data.estatisticas.porStatus.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>{item.status}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Por Médico</h4>
          <div className="space-y-2">
            {data.estatisticas.porMedico.slice(0, 5).map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>{item.medicoNome}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PacientesContent({ data }: { data: PacientesData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3">Distribuição por Sexo</h4>
          <div className="space-y-2">
            {data.porSexo.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>{item.sexo}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Distribuição por Idade</h4>
          <div className="space-y-2">
            {data.porIdade.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>{item.faixaEtaria}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProdutividadeContent({ data }: { data: ProdutividadeData }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-3">Consultas por Médico</h4>
        <div className="space-y-2">
          {data.consultasPorMedico.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <span className="font-medium">{item.medicoNome}</span>
                {item.especialidade && (
                  <span className="text-sm text-gray-600 ml-2">({item.especialidade})</span>
                )}
              </div>
              <div className="text-right">
                <div>Total: {item.totalConsultas}</div>
                <div className="text-sm text-green-600">Realizadas: {item.consultasRealizadas}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinanceiroContent({ data }: { data: FinanceiroData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-semibold text-green-900">Consultas Realizadas</h4>
        <p className="text-2xl font-bold text-green-700">{data.consultasRealizadas}</p>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900">Internações Ativas</h4>
        <p className="text-2xl font-bold text-blue-700">{data.internacoesAtivas}</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-semibold text-purple-900">Total Procedimentos</h4>
        <p className="text-2xl font-bold text-purple-700">{data.totalProcedimentos}</p>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="font-semibold text-yellow-900">Receita Estimada</h4>
        <p className="text-2xl font-bold text-yellow-700">
          R$ {data.receitaEstimada.toLocaleString('pt-BR')}
        </p>
      </div>
    </div>
  );
}
export default withProtectedRoute([UserRole.ADMIN])(AdminReportsPage);

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
