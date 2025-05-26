'use client';

import { useState, useEffect } from 'react';
import { auditAPI } from '@/lib/api';
import { AuditLog } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Download, 
  Filter,
  Clock,
  User
} from 'lucide-react';

// Interface local para paginação flexível
interface AuditPagination {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next_page?: boolean;
  has_prev_page?: boolean;
}

// Interface para resposta da API de auditoria
interface AuditResponse {
  data: AuditLog[];
  pagination: AuditPagination;
  message?: string;
  success?: boolean;
}

// Interface para filtros de auditoria
interface AuditFilters {
  action?: string;
  resource?: string;
  userId?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}

// Componente para gestão de auditoria
export default function AuditManagement() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuditFilters>({});
  const [pagination, setPagination] = useState<AuditPagination>({
    current_page: 1,
    per_page: 50,
    total: 0,
    total_pages: 0,
    has_next_page: false,
    has_prev_page: false,
  });

  // Buscar logs de auditoria usando o auditAPI
  const fetchAuditLogs = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        limit: pagination.per_page,
        ...filters
      };

      const response: AuditResponse = await auditAPI.getLogs(params);
      setLogs(response.data);
      
      // Calcular propriedades de paginação se não estiverem presentes
      const updatedPagination: AuditPagination = {
        ...response.pagination,
        has_next_page: response.pagination.has_next_page ?? 
          (response.pagination.current_page < response.pagination.total_pages),
        has_prev_page: response.pagination.has_prev_page ?? 
          (response.pagination.current_page > 1),
      };
      
      setPagination(updatedPagination);
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error);
      setError(error instanceof Error ? error.message : 'Erro ao buscar logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [filters]);

  // Aplicar filtros
  const handleFilterChange = (key: keyof AuditFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  // Exportar logs para CSV usando o auditAPI
  const exportToCSV = async () => {
    try {
      await auditAPI.exportCSV();
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
      setError(error instanceof Error ? error.message : 'Erro ao exportar logs');
    }
  };

  // Obter cor do badge baseado no status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obter cor da ação
  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'bg-blue-100 text-blue-800';
      case 'update': return 'bg-orange-100 text-orange-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'login': return 'bg-green-100 text-green-800';
      case 'logout': return 'bg-gray-100 text-gray-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Auditoria do Sistema</h1>
        <Button onClick={exportToCSV} className="gap-2" disabled={loading}>
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ação
              </label>
              <select
                value={filters.action || ''}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as ações</option>
                <option value="CREATE">Criar</option>
                <option value="UPDATE">Atualizar</option>
                <option value="DELETE">Excluir</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recurso
              </label>
              <select
                value={filters.resource || ''}
                onChange={(e) => handleFilterChange('resource', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os recursos</option>
                <option value="User">Usuários</option>
                <option value="Paciente">Pacientes</option>
                <option value="Agendamento">Agendamentos</option>
                <option value="Prontuario">Prontuários</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Início
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Fim
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria</CardTitle>
          <p className="text-sm text-gray-600">
            Total: {pagination.total} registros
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center text-red-600 mb-4">
              <p>{error}</p>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Primeira linha: Ação, Recurso e Status */}
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                        <Badge variant="outline">
                          {log.resource}
                        </Badge>
                      </div>

                      {/* Segunda linha: Usuário e IP */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {log.user?.nome || 'Sistema'}
                        </div>
                        <div>
                          IP: {log.ip_address || 'N/A'}
                        </div>
                      </div>

                      {/* Terceira linha: Data e detalhes */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </div>
                        {log.resource_id && (
                          <div>
                            ID do Recurso: {log.resource_id}
                          </div>
                        )}
                      </div>

                      {/* Detalhes adicionais (se houver) */}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    <Button variant="outline" size="sm" className="gap-1">
                      <Eye className="h-4 w-4" />
                      Detalhes
                    </Button>
                  </div>
                </div>
              ))}

              {/* Paginação */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-600">
                    Página {pagination.current_page} de {pagination.total_pages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchAuditLogs(pagination.current_page - 1)}
                      disabled={!pagination.has_prev_page || loading}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchAuditLogs(pagination.current_page + 1)}
                      disabled={!pagination.has_next_page || loading}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/

   */
