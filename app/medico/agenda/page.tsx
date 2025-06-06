'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { withProtectedRoute } from '@/hooks/useAuthentication';
import { agendamentosAPI } from '@/lib/api';
import { UserRole } from '@/types';
import { Calendar, Check, ChevronLeft, ChevronRight, Clock, Eye, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// Interface para agendamento
interface Agendamento {
  id: number;
  paciente: {
    id: number;
    nome: string;
  };
  data: string;
  horario: string;
  tipo: string;
  status: string;
  observacoes?: string;
}

// Interface para resposta da API
interface AgendamentosResponse {
  data?: Agendamento[];
}

function MedicoAgendaPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [dataAtual, setDataAtual] = useState(new Date());
  const [visaoAtual, setVisaoAtual] = useState<'dia' | 'semana' | 'mes'>('semana');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [isLoading, setIsLoading] = useState(true);
  const carregarAgendamentos = async () => {
    try {
      setIsLoading(true);
      const dataFormatada = dataAtual.toISOString().split('T')[0];
      const response = (await agendamentosAPI.getByDate(dataFormatada)) as
        | Agendamento[]
        | AgendamentosResponse;
      // Verifica se a resposta tem a propriedade data, senão usa a resposta diretamente
      setAgendamentos(Array.isArray(response) ? response : response?.data || []);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hook para carregar agendamentos quando a data muda
  useEffect(() => {
    carregarAgendamentos();
  }, [dataAtual]);

  // Filtrar agendamentos por status
  const agendamentosFiltrados = agendamentos.filter((agendamento) => {
    if (filtroStatus === 'todos') return true;
    return agendamento.status === filtroStatus;
  });

  // Funções para navegação de datas
  const proximoDia = () => {
    const novaData = new Date(dataAtual);
    novaData.setDate(novaData.getDate() + 1);
    setDataAtual(novaData);
  };

  const diaAnterior = () => {
    const novaData = new Date(dataAtual);
    novaData.setDate(novaData.getDate() - 1);
    setDataAtual(novaData);
  };

  // Confirmar agendamento
  const confirmarAgendamento = async (id: number) => {
    try {
      await agendamentosAPI.confirmar(id);
      carregarAgendamentos();
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
    }
  };

  // Cancelar agendamento
  const cancelarAgendamento = async (id: number) => {
    try {
      await agendamentosAPI.cancelar(id);
      carregarAgendamentos();
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
    }
  };

  // Realizar consulta
  const realizarConsulta = async (id: number) => {
    try {
      await agendamentosAPI.realizar(id);
      carregarAgendamentos();
    } catch (error) {
      console.error('Erro ao realizar consulta:', error);
    }
  };

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'bg-blue-100 text-blue-800';
      case 'realizado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      case 'falta':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Horários do dia (intervalos de 30 minutos)
  const horariosDisponiveis = [];
  for (let hora = 7; hora <= 18; hora++) {
    horariosDisponiveis.push(`${hora.toString().padStart(2, '0')}:00`);
    horariosDisponiveis.push(`${hora.toString().padStart(2, '0')}:30`);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-700"></div>
        <p className="ml-2 text-blue-800">Carregando agenda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Agenda Médica</h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Controles de navegação e filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Navegação de data */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={diaAnterior}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 py-2 bg-blue-50 rounded-lg min-w-[200px] text-center">
                <p className="font-medium text-blue-900">
                  {dataAtual.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={proximoDia}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-4">
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos os status</option>
                <option value="agendado">Agendado</option>
                <option value="confirmado">Confirmado</option>
                <option value="realizado">Realizado</option>
                <option value="cancelado">Cancelado</option>
              </select>

              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={visaoAtual === 'dia' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setVisaoAtual('dia')}
                >
                  Dia
                </Button>
                <Button
                  variant={visaoAtual === 'semana' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setVisaoAtual('semana')}
                >
                  Semana
                </Button>
                <Button
                  variant={visaoAtual === 'mes' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setVisaoAtual('mes')}
                >
                  Mês
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade de horários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horários do Dia ({agendamentosFiltrados.length} consultas)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {horariosDisponiveis.map((horario) => {
              const agendamentoHorario = agendamentosFiltrados.find((a) => a.horario === horario);

              return (
                <div
                  key={horario}
                  className="flex items-center border rounded-lg p-3 hover:bg-gray-50"
                >
                  <div className="w-20 text-sm font-medium text-gray-600">{horario}</div>

                  {agendamentoHorario ? (
                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {agendamentoHorario.paciente.nome}
                          </p>
                          <p className="text-sm text-gray-600">{agendamentoHorario.tipo}</p>
                        </div>
                        <Badge className={getStatusColor(agendamentoHorario.status)}>
                          {agendamentoHorario.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        {agendamentoHorario.status === 'agendado' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => confirmarAgendamento(agendamentoHorario.id)}
                              className="gap-1"
                            >
                              <Check className="h-4 w-4" />
                              Confirmar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cancelarAgendamento(agendamentoHorario.id)}
                              className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                              Cancelar
                            </Button>
                          </>
                        )}

                        {agendamentoHorario.status === 'confirmado' && (
                          <Button
                            size="sm"
                            onClick={() => realizarConsulta(agendamentoHorario.id)}
                            className="gap-1"
                          >
                            <Check className="h-4 w-4" />
                            Realizar
                          </Button>
                        )}

                        <Button size="sm" variant="outline" className="gap-1">
                          <Eye className="h-4 w-4" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 text-center">
                      <span className="text-gray-400 text-sm">Horário livre</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {agendamentosFiltrados.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum agendamento para esta data.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo do dia */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Agendado</p>
                <p className="text-2xl font-bold text-gray-900">{agendamentos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Check className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Realizados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {agendamentos.filter((a) => a.status === 'realizado').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {agendamentos.filter((a) => ['agendado', 'confirmado'].includes(a.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <X className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Cancelados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {agendamentos.filter((a) => a.status === 'cancelado').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withProtectedRoute([UserRole.MEDICO])(MedicoAgendaPage);

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
