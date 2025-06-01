'use client';

import { useState, useEffect } from 'react';
import { withProtectedRoute } from '@/hooks/useAuthentication';
import { Stats, UserRole } from '@/types';
import { useAuthentication } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Users, 
  Activity, 
  AlertTriangle,
  FileText,
  Play,
  Eye,
  UserCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Interface para pacientes na fila
interface PacienteFila {
  id: number;
  nome: string;
  prioridade: 'verde' | 'azul' | 'amarelo' | 'laranja' | 'vermelho';
  descricaoPrioridade: string;
  horarioChegada: string;
  queixaPrincipal: string;
  idade: number;
  tipoAtendimento: 'consulta' | 'retorno' | 'urgencia';
}

// Interface para próximos agendamentos
interface ProximoAtendimento {
  id: number;
  nome: string;
  horario: string;
  tipo: string;
}

function MedicoDashboardPage() {
  const { user } = useAuthentication();
  const router = useRouter();
  
  // Estados para armazenar dados dinâmicos do médico
  const [stats, setStats] = useState<Stats>({
    pacientesInternados: 0,
    pacientesTriagem: 0,
    medicamentosAdministrar: 0,
    leitosDisponiveis: 0,
    totalConsultas: 0,
    consultasRealizadas: 0,
    consultasCanceladas: 0,
    totalAtendimentos: 0
  });

  const [filaEspera, setFilaEspera] = useState<PacienteFila[]>([]);
  const [proximosAtendimentos, setProximosAtendimentos] = useState<ProximoAtendimento[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Definir cores e descrições das prioridades da triagem
  const prioridadeConfig = {
    verde: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Não Urgente', description: 'Casos simples, atendimento ambulatorial' },
    azul: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Pouco Urgente', description: 'Atendimento programado' },
    amarelo: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Urgente', description: 'Atendimento em até 1 hora' },
    laranja: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Muito Urgente', description: 'Atendimento em até 10 minutos' },
    vermelho: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Emergência', description: 'Atendimento imediato' }
  };

  useEffect(() => {
    const carregarDadosMedico = async () => {
      try {
        setIsLoading(true);
        
        // Simular dados da fila de espera com prioridades da triagem
        setFilaEspera([
          {
            id: 1,
            nome: 'Maria Silva Santos',
            prioridade: 'vermelho',
            descricaoPrioridade: 'Dor no peito intensa',
            horarioChegada: '08:30',
            queixaPrincipal: 'Dor torácica com irradiação para braço esquerdo',
            idade: 58,
            tipoAtendimento: 'urgencia'
          },
          {
            id: 2,
            nome: 'José Carlos Oliveira',
            prioridade: 'amarelo',
            descricaoPrioridade: 'Febre alta persistente',
            horarioChegada: '09:15',
            queixaPrincipal: 'Febre 39°C há 2 dias com mal-estar',
            idade: 45,
            tipoAtendimento: 'consulta'
          },
          {
            id: 3,
            nome: 'Ana Paula Ferreira',
            prioridade: 'verde',
            descricaoPrioridade: 'Consulta de rotina',
            horarioChegada: '10:00',
            queixaPrincipal: 'Check-up preventivo anual',
            idade: 32,
            tipoAtendimento: 'consulta'
          },
          {
            id: 4,
            nome: 'Roberto Lima',
            prioridade: 'azul',
            descricaoPrioridade: 'Retorno pós-cirúrgico',
            horarioChegada: '10:30',
            queixaPrincipal: 'Acompanhamento cirurgia de vesícula',
            idade: 52,
            tipoAtendimento: 'retorno'
          }
        ]);
        
        // Simular próximos agendamentos
        setProximosAtendimentos([
          { id: 1, nome: 'Pedro Santos', horario: '13:30', tipo: 'Consulta' },
          { id: 2, nome: 'Lucia Mendes', horario: '14:15', tipo: 'Retorno' },
          { id: 3, nome: 'Carlos Ramos', horario: '15:00', tipo: 'Exame' },
        ]);

        // Simular estatísticas
        setStats({
          pacientesInternados: 8,
          pacientesTriagem: filaEspera.length,
          medicamentosAdministrar: 15,
          leitosDisponiveis: 5,
          totalConsultas: 24,
          consultasRealizadas: 18,
          consultasCanceladas: 2,
          totalAtendimentos: 32
        });

      } catch (error) {
        console.error('Erro ao carregar dados do dashboard médico:', error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDadosMedico();
  }, []);

  // Função para iniciar consulta
  const iniciarConsulta = (pacienteId: number) => {
    router.push(`/medico/pacientes/${pacienteId}/atendimento`);
  };

  // Função para ver histórico do paciente
  const verHistorico = (pacienteId: number) => {
    router.push(`/medico/pacientes/${pacienteId}/historico`);
  };

  // Ordenar fila por prioridade (vermelho > laranja > amarelo > azul > verde)
  const ordenarPorPrioridade = (pacientes: PacienteFila[]) => {
    const ordemPrioridade = { vermelho: 1, laranja: 2, amarelo: 3, azul: 4, verde: 5 };
    return [...pacientes].sort((a, b) => ordemPrioridade[a.prioridade] - ordemPrioridade[b.prioridade]);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-700"></div>
        <p className="ml-2 text-blue-800">Carregando dados médicos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Médico</h1>
        {user && (
          <p className="text-gray-600">Bem-vindo(a), Dr(a). {user.nome}</p>
        )}
      </div>
      
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Fila de Espera</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pacientesTriagem}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Consultas Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{stats.consultasRealizadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pacientes Internados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pacientesInternados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Atendimentos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAtendimentos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Fila de Espera por Prioridade */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Fila de Espera - Triagem
              </CardTitle>
              <p className="text-sm text-gray-600">Pacientes organizados por prioridade da triagem</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ordenarPorPrioridade(filaEspera).map((paciente) => {
                  const config = prioridadeConfig[paciente.prioridade];
                  return (
                    <div key={paciente.id} className={`border rounded-lg p-4 ${config.color.replace('bg-', 'border-')}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{paciente.nome}</h4>
                            <Badge className={config.color}>
                              {config.label}
                            </Badge>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {paciente.horarioChegada}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Descrição:</strong> {paciente.descricaoPrioridade}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Queixa:</strong> {paciente.queixaPrincipal}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {paciente.idade} anos • {paciente.tipoAtendimento}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button 
                            size="sm"
                            onClick={() => iniciarConsulta(paciente.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-1"
                          >
                            <Play className="h-4 w-4" />
                            Iniciar Consulta
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => verHistorico(paciente.id)}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Ver Histórico
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filaEspera.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum paciente na fila de espera</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Próximos Agendamentos */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Próximos Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {proximosAtendimentos.map((atendimento) => (
                  <div key={atendimento.id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{atendimento.nome}</p>
                        <p className="text-sm text-gray-600">{atendimento.tipo}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-blue-600">{atendimento.horario}</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => verHistorico(atendimento.id)}
                          className="mt-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {proximosAtendimentos.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Nenhum agendamento hoje</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Novo Atestado
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Buscar Paciente
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Agenda Completa
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withProtectedRoute([UserRole.MEDICO])(MedicoDashboardPage);

/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
 */