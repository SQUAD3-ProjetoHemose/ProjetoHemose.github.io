'use client';

import { useState, useEffect } from 'react';
import { withProtectedRoute } from '@/hooks/useAuthentication';
import { UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardList, 
  Plus, 
  Eye, 
  Download,
  Search,
  Calendar,
  User,
  Filter,
  Edit,
  Pill
} from 'lucide-react';
import { MedicoService } from '@/lib/services/medico.service';

// Interface para prescrição
interface Prescricao {
  id: number;
  paciente: {
    id: number;
    nome: string;
  };
  dataEmissao: string;
  dataValidade: string;
  orientacoes?: string;
  observacoes?: string;
  retorno?: string;
  status: string;
  medicamentos: Array<{
    id: number;
    nome: string;
    dosagem: string;
    via: string;
    frequencia: string;
    duracao: string;
    observacoes?: string;
  }>;
}

function MedicoPrescricoesPage() {
  const [prescricoes, setPrescricoes] = useState<Prescricao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [showNovaPrescricao, setShowNovaPrescricao] = useState(false);

  useEffect(() => {
    carregarPrescricoes();
  }, []);

  const carregarPrescricoes = async () => {
    try {
      setIsLoading(true);
      const response = await MedicoService.getPrescricoes();
      setPrescricoes(response || []); 
    } catch (error) {
      console.error('Erro ao carregar prescrições:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar prescrições
  const prescricoesFiltradas = prescricoes.filter(prescricao => {
    const matchesBusca = !termoBusca || 
      prescricao.paciente.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      prescricao.medicamentos.some(m => m.nome.toLowerCase().includes(termoBusca.toLowerCase()));
    
    const matchesStatus = filtroStatus === 'todos' || prescricao.status === filtroStatus;
    
    return matchesBusca && matchesStatus;
  });

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-green-100 text-green-800';
      case 'dispensada': return 'bg-blue-100 text-blue-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      case 'expirada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Verificar se prescrição está próxima do vencimento
  const isPrescricaoVencendo = (dataValidade: string) => {
    const hoje = new Date();
    const validade = new Date(dataValidade);
    const diffDias = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diffDias <= 7 && diffDias > 0;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-700"></div>
        <p className="ml-2 text-blue-800">Carregando prescrições...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Prescrições Médicas</h1>
        <Button onClick={() => setShowNovaPrescricao(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Prescrição
        </Button>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Prescrições
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Buscar por paciente ou medicamento..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos os status</option>
                <option value="ativa">Ativa</option>
                <option value="dispensada">Dispensada</option>
                <option value="cancelada">Cancelada</option>
                <option value="expirada">Expirada</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de prescrições */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Prescrições ({prescricoesFiltradas.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {prescricoesFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {termoBusca ? 'Nenhuma prescrição encontrada para a busca.' : 'Nenhuma prescrição emitida.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {prescricoesFiltradas.map((prescricao) => (
                <div key={prescricao.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="font-semibold text-gray-900">
                          {prescricao.paciente.nome}
                        </h4>
                        <Badge className={getStatusColor(prescricao.status)}>
                          {prescricao.status}
                        </Badge>
                        
                        {isPrescricaoVencendo(prescricao.dataValidade) && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Vencendo em breve
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-2">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Emissão: {new Date(prescricao.dataEmissao).toLocaleDateString('pt-BR')}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Validade: {new Date(prescricao.dataValidade).toLocaleDateString('pt-BR')}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Pill className="h-4 w-4" />
                            <span>{prescricao.medicamentos.length} medicamento(s)</span>
                          </div>
                        </div>
                        
                        {/* Lista de medicamentos */}
                        <div className="bg-gray-50 rounded-lg p-3 mt-3">
                          <p className="font-medium text-gray-700 mb-2">Medicamentos:</p>
                          <div className="space-y-1">
                            {prescricao.medicamentos.map((medicamento, index) => (
                              <div key={medicamento.id || index} className="text-sm">
                                <span className="font-medium">{medicamento.nome}</span>
                                <span className="text-gray-500 ml-2">
                                  {medicamento.dosagem} - {medicamento.via} - {medicamento.frequencia} - {medicamento.duracao}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {prescricao.orientacoes && (
                          <div className="mt-2">
                            <span className="font-medium text-gray-700">Orientações:</span>
                            <p className="text-gray-600">{prescricao.orientacoes}</p>
                          </div>
                        )}
                        
                        {prescricao.retorno && (
                          <div className="mt-2">
                            <span className="font-medium text-gray-700">Retorno:</span>
                            <p className="text-gray-600">{prescricao.retorno}</p>
                          </div>
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
                      {prescricao.status === 'ativa' && (
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
              <ClipboardList className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Emitidas</p>
                <p className="text-2xl font-bold text-gray-900">{prescricoes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ClipboardList className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ativas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prescricoes.filter(p => p.status === 'ativa').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ClipboardList className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Este Mês</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prescricoes.filter(p => 
                    new Date(p.dataEmissao).getMonth() === new Date().getMonth()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Pill className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Medicamentos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prescricoes.reduce((total, p) => total + p.medicamentos.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withProtectedRoute([UserRole.MEDICO])(MedicoPrescricoesPage);

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
