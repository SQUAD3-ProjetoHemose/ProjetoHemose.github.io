'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { withProtectedRoute } from '@/hooks/useAuthentication';
import { UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  User,
  Calendar,
  FileText,
  Activity,
  Eye,
  Clock,
  Stethoscope,
  FlaskConical,
  Pill
} from 'lucide-react';

// Interface para histórico de consultas
interface ConsultaHistorico {
  id: number;
  data: string;
  tipo: string;
  profissional: string;
  diagnostico?: string;
  status: string;
  resumo: string;
}

// Interface para dados do paciente
interface Paciente {
  id: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  telefone: string;
  email: string;
}

function HistoricoPacientePage() {
  const params = useParams();
  const router = useRouter();
  const pacienteId = parseInt(params.id as string);

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [consultas, setConsultas] = useState<ConsultaHistorico[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  useEffect(() => {
    const carregarHistorico = async () => {
      try {
        setLoading(true);
        
        // Simular carregamento de dados do paciente
        const pacienteData: Paciente = {
          id: pacienteId,
          nome: 'Maria Silva Santos',
          cpf: '123.456.789-00',
          dataNascimento: '1985-06-15',
          sexo: 'Feminino',
          telefone: '(11) 99999-9999',
          email: 'maria.silva@email.com'
        };

        // Simular histórico de consultas
        const consultasData: ConsultaHistorico[] = [
          {
            id: 1,
            data: '2024-01-15T14:30:00Z',
            tipo: 'Consulta',
            profissional: 'Dr. João Silva',
            diagnostico: 'Hipertensão Arterial - I10',
            status: 'Concluída',
            resumo: 'Paciente apresenta pressão arterial elevada. Iniciado tratamento anti-hipertensivo. Orientações sobre dieta e exercícios.'
          },
          {
            id: 2,
            data: '2024-01-08T09:15:00Z',
            tipo: 'Retorno',
            profissional: 'Dr. João Silva',
            diagnostico: 'Acompanhamento - Z09',
            status: 'Concluída',
            resumo: 'Retorno para avaliação de exames. Paciente refere melhora dos sintomas. Ajuste na medicação.'
          },
          {
            id: 3,
            data: '2023-12-20T16:00:00Z',
            tipo: 'Urgência',
            profissional: 'Dra. Ana Costa',
            diagnostico: 'Cefaleia - G44',
            status: 'Concluída',
            resumo: 'Paciente com cefaleia intensa há 2 dias. Medicação sintomática prescrita. Melhora significativa após tratamento.'
          },
          {
            id: 4,
            data: '2023-11-15T11:30:00Z',
            tipo: 'Consulta',
            profissional: 'Dr. Carlos Lima',
            diagnostico: 'Check-up - Z00',
            status: 'Concluída',
            resumo: 'Consulta de rotina. Exames laboratoriais normais. Paciente sem queixas. Orientações gerais de saúde.'
          }
        ];

        setPaciente(pacienteData);
        setConsultas(consultasData);

      } catch (error) {
        console.error('Erro ao carregar histórico do paciente:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarHistorico();
  }, [pacienteId]);

  // Filtrar consultas por tipo
  const consultasFiltradas = consultas.filter(consulta => {
    if (filtroTipo === 'todos') return true;
    return consulta.tipo.toLowerCase() === filtroTipo.toLowerCase();
  });

  // Obter cor do badge baseado no tipo
  const getTipoColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'consulta': return 'bg-blue-100 text-blue-800';
      case 'retorno': return 'bg-green-100 text-green-800';
      case 'urgência': return 'bg-red-100 text-red-800';
      case 'urgencia': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obter ícone baseado no tipo
  const getTipoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'consulta': return Stethoscope;
      case 'retorno': return Activity;
      case 'urgência': return FlaskConical;
      case 'urgencia': return FlaskConical;
      default: return FileText;
    }
  };

  // Função para iniciar novo atendimento
  const iniciarNovoAtendimento = () => {
    router.push(`/medico/pacientes/${pacienteId}/atendimento`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Paciente não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Histórico do Paciente</h1>
        </div>
        <Button onClick={iniciarNovoAtendimento} className="gap-2">
          <Stethoscope className="h-4 w-4" />
          Iniciar Novo Atendimento
        </Button>
      </div>

      {/* Informações do Paciente */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{paciente.nome}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>CPF: {paciente.cpf}</span>
                <span>Sexo: {paciente.sexo}</span>
                <span>
                  Idade: {new Date().getFullYear() - new Date(paciente.dataNascimento).getFullYear()} anos
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span>Telefone: {paciente.telefone}</span>
                <span>Email: {paciente.email}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros e Estatísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Filtros</CardTitle>
                <div className="text-sm text-gray-600">
                  {consultasFiltradas.length} consulta(s) encontrada(s)
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filtroTipo === 'todos' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroTipo('todos')}
                >
                  Todos
                </Button>
                <Button
                  variant={filtroTipo === 'consulta' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroTipo('consulta')}
                >
                  Consultas
                </Button>
                <Button
                  variant={filtroTipo === 'retorno' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroTipo('retorno')}
                >
                  Retornos
                </Button>
                <Button
                  variant={filtroTipo === 'urgência' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroTipo('urgência')}
                >
                  Urgências
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo estatístico */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total de consultas:</span>
              <span className="font-medium">{consultas.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Última consulta:</span>
              <span className="font-medium">
                {consultas.length > 0 ? new Date(consultas[0].data).toLocaleDateString('pt-BR') : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Primeiro atendimento:</span>
              <span className="font-medium">
                {consultas.length > 0 ? new Date(consultas[consultas.length - 1].data).toLocaleDateString('pt-BR') : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Consultas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Consultas</CardTitle>
        </CardHeader>
        <CardContent>
          {consultasFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma consulta encontrada para os filtros selecionados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {consultasFiltradas.map((consulta) => {
                const TipoIcon = getTipoIcon(consulta.tipo);
                
                return (
                  <div key={consulta.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <TipoIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getTipoColor(consulta.tipo)}>
                                {consulta.tipo}
                              </Badge>
                              <Badge variant="outline" className="text-green-700">
                                {consulta.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(consulta.data).toLocaleString('pt-BR')}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {consulta.profissional}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Diagnóstico */}
                        {consulta.diagnostico && (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-700">Diagnóstico: </span>
                            <span className="text-sm text-gray-600">{consulta.diagnostico}</span>
                          </div>
                        )}

                        {/* Resumo */}
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">Resumo: </span>
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            {consulta.resumo}
                          </p>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex flex-col gap-2 ml-4">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Eye className="h-4 w-4" />
                          Ver Detalhes
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1">
                          <FileText className="h-4 w-4" />
                          Prontuário
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default withProtectedRoute([UserRole.MEDICO])(HistoricoPacientePage);

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
