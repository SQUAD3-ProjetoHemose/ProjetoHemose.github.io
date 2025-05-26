'use client';

import { useEffect } from 'react';
import { useReports } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  FileText, 
  TrendingUp,
  Hospital,
  Activity,
  AlertCircle 
} from 'lucide-react';

// Componente principal do dashboard administrativo
export default function AdminDashboard() {
  // Usar o hook de relatórios para buscar estatísticas
  const {
    dashboardStats,
    loading,
    error,
    fetchDashboardStats: fetchDashboard,
  } = useReports();

  // Buscar estatísticas na inicialização
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <p>Erro ao carregar dados: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <div className="text-sm text-gray-500">
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </div>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Pacientes"
          value={dashboardStats?.totalPacientes || 0}
          icon={Users}
          color="bg-blue-500"
          change="+12% este mês"
        />
        
        <StatsCard
          title="Usuários do Sistema"
          value={dashboardStats?.totalUsuarios || 0}
          icon={UserCheck}
          color="bg-green-500"
          change="+5% este mês"
        />
        
        <StatsCard
          title="Agendamentos Hoje"
          value={dashboardStats?.agendamentosHoje || 0}
          icon={Calendar}
          color="bg-orange-500"
          change="Próximas 24h"
        />
        
        <StatsCard
          title="Pacientes Internados"
          value={dashboardStats?.pacientesInternados || 0}
          icon={Hospital}
          color="bg-red-500"
          change="Atualmente"
        />
      </div>

      {/* Estatísticas secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prontuários Eletrônicos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalProntuarios || 0}</div>
            <p className="text-xs text-muted-foreground">Total registrado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Semana</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.agendamentosSemana || 0}</div>
            <p className="text-xs text-muted-foreground">Próximos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Pacientes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.novosPacientesMes || 0}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de alertas/notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Alertas e Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Sistema de backup agendado para manutenção às 02:00h
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ 15 agendamentos pendentes de confirmação
              </p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Todos os sistemas operando normalmente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente reutilizável para cards de estatísticas
interface StatsCardProps {
  title: string;
  value: number;
  icon: any;
  color: string;
  change: string;
}

function StatsCard({ title, value, icon: Icon, color, change }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`${color} p-2 rounded-full`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString('pt-BR')}</div>
        <p className="text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  );
}

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/

   */