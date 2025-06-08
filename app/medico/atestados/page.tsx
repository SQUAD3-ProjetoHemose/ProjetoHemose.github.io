'use client';

import { useState, useEffect } from 'react';
import { withProtectedRoute } from '@/hooks/useAuthentication';
import { UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  Eye, 
  Download,
  Search,
  Calendar,
  User,
  Filter,
  Edit
} from 'lucide-react';
import { MedicoService } from '@/lib/services/medico.service';

// Interface para atestado
interface Atestado {
  id: number;
  paciente: {
    id: number;
    nome: string;
  };
  tipo: string;
  conteudo: string;
  observacoes?: string;
  dataEmissao: string;
  dataValidade?: string;
  diasAfastamento: number;
  status: string;
}

function MedicoAtestadosPage() {
  const [atestados, setAtestados] = useState<Atestado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [showNovoAtestado, setShowNovoAtestado] = useState(false);

  useEffect(() => {
    carregarAtestados();
  }, []);

  const carregarAtestados = async () => {
    try {
      setIsLoading(true);
      const response = await MedicoService.getAtestados();
      setAtestados(response || []); 
    } catch (error) {
      console.error('Erro ao carregar atestados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar atestados
  const atestadosFiltrados = atestados.filter(atestado => {
    const matchesBusca = !termoBusca || 
      atestado.paciente.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      atestado.tipo.toLowerCase().includes(termoBusca.toLowerCase());
    
    const matchesTipo = filtroTipo === 'todos' || atestado.tipo === filtroTipo;
    const matchesStatus = filtroStatus === 'todos' || atestado.status === filtroStatus;
    
    return matchesBusca && matchesTipo && matchesStatus;
  });

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      case 'expirado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obter cor do tipo
  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'liberacao_trabalho': return 'bg-blue-100 text-blue-800';
      case 'restricao_atividade': return 'bg-orange-100 text-orange-800';
      case 'saude_geral': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-700"></div>
        <p className="ml-2 text-blue-800">Carregando atestados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Atestados Médicos</h1>
        <Button onClick={() => setShowNovoAtestado(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Atestado
        </Button>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Atestados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Buscar por paciente ou tipo..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos os tipos</option>
                <option value="liberacao_trabalho">Liberação para Trabalho</option>
                <option value="restricao_atividade">Restrição de Atividade</option>
                <option value="saude_geral">Saúde Geral</option>
              </select>
            </div>
            <div>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="cancelado">Cancelado</option>
                <option value="expirado">Expirado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de atestados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Atestados ({atestadosFiltrados.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {atestadosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {termoBusca ? 'Nenhum atestado encontrado para a busca.' : 'Nenhum atestado emitido.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {atestadosFiltrados.map((atestado) => (
                <div key={atestado.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {atestado.paciente.nome}
                        </h4>
                        <Badge className={getTipoColor(atestado.tipo)}>
                          {atestado.tipo.replace('_', ' ')}
                        </Badge>
                        <Badge className={getStatusColor(atestado.status)}>
                          {atestado.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Emissão: {new Date(atestado.dataEmissao).toLocaleDateString('pt-BR')}</span>
                          </div>
                          
                          {atestado.dataValidade && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Validade: {new Date(atestado.dataValidade).toLocaleDateString('pt-BR')}</span>
                            </div>
                          )}
                          
                          {atestado.diasAfastamento && (
                            <span>{atestado.diasAfastamento} dias de afastamento</span>
                          )}
                        </div>
                        
                        <p className="mt-2 line-clamp-2">
                          {atestado.conteudo}
                        </p>
                        
                        {atestado.observacoes && (
                          <p className="text-gray-500 italic">
                            Obs: {atestado.observacoes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" variant="outline" className="gap-1">
                        <Eye className="h-4 w-4" />
                        Visualizar
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      {atestado.status === 'ativo' && (
                        <Button size="sm" variant="outline" className="gap-1">
                          <Edit className="h-4 w-4" />
                          Editar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Emitidos</p>
                <p className="text-2xl font-bold text-gray-900">{atestados.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {atestados.filter(a => a.status === 'ativo').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Este Mês</p>
                <p className="text-2xl font-bold text-gray-900">
                  {atestados.filter(a => 
                    new Date(a.dataEmissao).getMonth() === new Date().getMonth()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tipos Únicos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(atestados.map(a => a.tipo)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withProtectedRoute([UserRole.MEDICO])(MedicoAtestadosPage);

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
