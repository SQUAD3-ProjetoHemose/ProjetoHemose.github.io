import { useState, useCallback } from 'react';
import { reportsAPI } from '@/lib/api';

// Interfaces para relatórios
export interface DashboardStats {
  totalPacientes: number;
  totalUsuarios: number;
  totalProntuarios: number;
  agendamentosHoje: number;
  agendamentosSemana: number;
  pacientesInternados: number;
  novosPacientesMes: number;
}

export interface AgendamentosReport {
  agendamentos: any[];
  estatisticas: {
    total: number;
    porStatus: Array<{ status: string; count: number }>;
    porMedico: Array<{ medicoNome: string; count: number }>;
  };
}

export interface PacientesReport {
  porSexo: Array<{ sexo: string; count: number }>;
  porIdade: Array<{ faixaEtaria: string; count: number }>;
  novosPorMes: Array<{ mes: string; count: number }>;
}

export interface ProdutividadeReport {
  consultasPorMedico: Array<{
    medicoNome: string;
    especialidade: string;
    totalConsultas: number;
    consultasRealizadas: number;
    consultasCanceladas: number;
  }>;
  prescricoesPorMedico: Array<{
    medicoNome: string;
    totalPrescricoes: number;
  }>;
}

export interface FinanceiroReport {
  consultasRealizadas: number;
  internacoesAtivas: number;
  totalProcedimentos: number;
  receitaEstimada: number;
}

// Hook personalizado para gerenciar relatórios
export function useReports() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [agendamentosReport, setAgendamentosReport] = useState<AgendamentosReport | null>(null);
  const [pacientesReport, setPacientesReport] = useState<PacientesReport | null>(null);
  const [produtividadeReport, setProdutividadeReport] = useState<ProdutividadeReport | null>(null);
  const [financeiroReport, setFinanceiroReport] = useState<FinanceiroReport | null>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar estatísticas do dashboard
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsAPI.dashboard();
      setDashboardStats(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar estatísticas do dashboard';
      setError(errorMessage);
      console.error('Erro ao buscar estatísticas do dashboard:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Alias para manter compatibilidade
  const fetchDashboard = fetchDashboardStats;

  // Buscar relatório de agendamentos
  const fetchAgendamentosReport = useCallback(async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsAPI.agendamentos(startDate, endDate);
      setAgendamentosReport(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar relatório de agendamentos';
      setError(errorMessage);
      console.error('Erro ao buscar relatório de agendamentos:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar relatório de pacientes
  const fetchPacientesReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsAPI.pacientes();
      setPacientesReport(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar relatório de pacientes';
      setError(errorMessage);
      console.error('Erro ao buscar relatório de pacientes:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar relatório de produtividade médica
  const fetchProdutividadeReport = useCallback(async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsAPI.produtividadeMedica(startDate, endDate);
      setProdutividadeReport(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar relatório de produtividade';
      setError(errorMessage);
      console.error('Erro ao buscar relatório de produtividade:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar relatório financeiro
  const fetchFinanceiroReport = useCallback(async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsAPI.financeiro(startDate, endDate);
      setFinanceiroReport(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar relatório financeiro';
      setError(errorMessage);
      console.error('Erro ao buscar relatório financeiro:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Exportar relatório para CSV
  const exportToCSV = useCallback(async (type: string, startDate?: string, endDate?: string) => {
    try {
      setError(null);
      await reportsAPI.exportCSV(type, startDate, endDate);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao exportar relatório';
      setError(errorMessage);
      console.error('Erro ao exportar relatório:', err);
      throw new Error(errorMessage);
    }
  }, []);

  // Alias para manter compatibilidade
  const exportCSV = exportToCSV;

  return {
    // Estados
    dashboardStats,
    agendamentosReport,
    pacientesReport,
    produtividadeReport,
    financeiroReport,
    loading,
    error,
    
    // Funções principais
    fetchDashboardStats,
    fetchAgendamentosReport,
    fetchPacientesReport,
    fetchProdutividadeReport,
    fetchFinanceiroReport,
    exportToCSV,
    
    // Aliases para compatibilidade
    fetchDashboard,
    exportCSV,
    setError, // Para limpar erros manualmente
  };
}

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
