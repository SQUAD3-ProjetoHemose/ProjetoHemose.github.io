'use client';

import { useState, useEffect } from 'react';
import { withProtectedRoute } from '@/hooks/useAuthentication';
import { UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Search,
  Eye,
  Calendar,
  User,
  Phone,
  Mail,
  Filter,
  MoreVertical,
  FileText,
  Activity,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PacientesService } from '@/lib/services/pacientes.service';

// Interface para paciente na listagem
interface Paciente {
  id: number;
  nome: string;
  cpf: string;
  data_nascimento: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  tipo_sanguineo?: string;
  alergias?: string;
  historico_medico?: string;
  status?: string;
  sexo?: string;
  ultimaConsulta?: string;
}

function MedicoPacientesPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  useEffect(() => {
    carregarPacientes();
  }, []);

  // Função para carregar pacientes da API
  const carregarPacientes = async () => {
    try {
      setIsLoading(true);
      const dados = await PacientesService.getPacientes();
      setPacientes(dados);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar pacientes baseado na busca
  const pacientesFiltrados = pacientes.filter((paciente) => {
    const matchesBusca =
      !termoBusca ||
      paciente.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      paciente.cpf.includes(termoBusca) ||
      (paciente.telefone && paciente.telefone.includes(termoBusca));

    const matchesStatus = filtroStatus === 'todos' || paciente.status === filtroStatus;

    return matchesBusca && matchesStatus;
  });

  // Função para navegar para o prontuário do paciente
  const verProntuario = (pacienteId: number) => {
    router.push(`/medico/pacientes/${pacienteId}`);
  };

  // Função para agendar consulta para o paciente
  const agendarConsulta = (pacienteId: number) => {
    router.push(`/medico/agenda/novo?pacienteId=${pacienteId}`);
  };

  // Função para iniciar consulta com o paciente
  const iniciarConsulta = (pacienteId: number) => {
    router.push(`/medico/atendimento/${pacienteId}`);
  };

  // Função para ver histórico do paciente
  const verHistorico = (pacienteId: number) => {
    router.push(`/medico/pacientes/${pacienteId}/historico`);
  };

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'inativo':
        return 'bg-gray-100 text-gray-800';
      case 'bloqueado':
        return 'bg-red-100 text-red-800';
      case 'internado':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Renderizar loading quando estiver carregando
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-700"></div>
        <p className="ml-2 text-blue-800">Carregando pacientes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Cabeçalho responsivo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pacientes</h1>
        <Button
          onClick={() => router.push('/medico/pacientes/novo')}
          className="gap-2 w-full sm:w-auto"
          size="sm"
        >
          <Users className="h-4 w-4" />
          <span className="hidden lg:inline">Novo Paciente</span>
          <span className="lg:hidden">Novo</span>
        </Button>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Buscar Pacientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="busca" className="sr-only">
                Buscar pacientes
              </label>
              <input
                id="busca"
                type="text"
                placeholder="Buscar por nome, CPF ou telefone..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                aria-label="Campo de busca de pacientes"
              />
            </div>
            <div>
              <label htmlFor="filtro-status" className="sr-only">
                Filtrar por status
              </label>
              <select
                id="filtro-status"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                aria-label="Filtro de status dos pacientes"
              >
                <option value="todos">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="bloqueado">Bloqueado</option>
                <option value="internado">Internado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de pacientes */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">
              Lista de Pacientes ({pacientesFiltrados.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pacientesFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {termoBusca
                  ? 'Nenhum paciente encontrado para a busca.'
                  : 'Nenhum paciente cadastrado.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pacientesFiltrados.map((paciente) => (
                <div
                  key={paciente.id}
                  className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                            {paciente.nome}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {paciente.data_nascimento
                              ? PacientesService.calcularIdade(paciente.data_nascimento)
                              : 'N/A'}{' '}
                            anos
                            {paciente.sexo && ` • ${paciente.sexo}`}
                          </p>
                        </div>
                        <Badge className={getStatusColor(paciente.status || 'inativo')}>
                          {paciente.status || 'inativo'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            CPF: {PacientesService.formatarCPF(paciente.cpf)}
                          </span>
                        </div>
                        {paciente.telefone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                              {PacientesService.formatarTelefone(paciente.telefone)}
                            </span>
                          </div>
                        )}
                        {paciente.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{paciente.email}</span>
                          </div>
                        )}
                      </div>

                      {paciente.ultimaConsulta && (
                        <div className="mt-2 text-xs text-gray-500">
                          Última consulta:{' '}
                          {new Date(paciente.ultimaConsulta).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>

                    {/* Botões de ação responsivos */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full sm:w-auto lg:w-auto">
                      <Button
                        size="sm"
                        onClick={() => verProntuario(paciente.id)}
                        className="gap-1 justify-start text-xs sm:text-sm"
                        aria-label={`Ver prontuário de ${paciente.nome}`}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Ver Prontuário</span>
                        <span className="sm:hidden">Prontuário</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => agendarConsulta(paciente.id)}
                        className="gap-1 justify-start text-xs sm:text-sm"
                        aria-label={`Agendar consulta para ${paciente.nome}`}
                      >
                        <Calendar className="h-4 w-4" />
                        Agendar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => iniciarConsulta(paciente.id)}
                        className="gap-1 justify-start text-xs sm:text-sm"
                        aria-label={`Iniciar consulta com ${paciente.nome}`}
                      >
                        <Activity className="h-4 w-4" />
                        <span className="hidden sm:inline">Iniciar Consulta</span>
                        <span className="sm:hidden">Consulta</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => verHistorico(paciente.id)}
                        className="gap-1 justify-start text-xs sm:text-sm"
                        aria-label={`Ver histórico de ${paciente.nome}`}
                      >
                        <FileText className="h-4 w-4" />
                        Histórico
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas rápidas responsivas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                  Total Pacientes
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{pacientes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center">
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                  Pacientes Ativos
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {pacientes.filter((p) => p.status === 'ativo').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Internados</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {pacientes.filter((p) => p.status === 'internado').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                  Consulta Hoje
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {
                    pacientes.filter(
                      (p) =>
                        p.ultimaConsulta &&
                        new Date(p.ultimaConsulta).toDateString() === new Date().toDateString()
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withProtectedRoute([UserRole.MEDICO])(MedicoPacientesPage);

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
