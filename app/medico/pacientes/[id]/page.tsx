'use client';

import { useState, useEffect } from 'react';
import { withProtectedRoute } from '@/hooks/useAuthentication';
import { UserRole } from '@/types';
import { useParams } from 'next/navigation';
import ProntuarioEletronico from '@/components/medico/ProntuarioEletronico';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Edit,
  FileText,
  Activity,
  UserCheck,
  Heart,
  Clock,
  AlertTriangle,
  Stethoscope,
  Printer,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PacientesService } from '@/lib/services/pacientes.service';

// Interface para dados do paciente com campos adicionais - alinhada com o serviço
interface Paciente {
  id: number;
  nome: string;
  cpf: string;
  telefone?: string;
  email?: string;
  sexo?: string;
  status?: string; // Status pode ser indefinido para alinhar com o tipo de dados do serviço
  data_nascimento: string;
  endereco?: string; // Mudado de objeto para string para alinhar com o serviço
  contato_emergencia?: {
    nome: string;
    telefone: string;
    parentesco: string;
  };
  // Campos adicionais para contexto médico
  tipo_sanguineo?: string;
  alergias?: string;
  historico_medico?: string;
  medicamentos_uso?: string[];
  condicoes_preexistentes?: string[];
  ultima_consulta?: string;
  proxima_consulta?: string;
}

// Interface para resumo médico rápido
interface ResumoMedico {
  consultas_total: number;
  ultima_consulta: string | null;
  proxima_consulta: string | null;
  medicamentos_ativos: number;
  exames_pendentes: number;
  alertas: string[];
}

function MedicoPacienteDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const pacienteId = parseInt(params.id as string);

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [resumoMedico, setResumoMedico] = useState<ResumoMedico | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dados' | 'prontuario'>('dados');

  useEffect(() => {
    if (pacienteId) {
      carregarPaciente();
    }
  }, [pacienteId]);

  // Função para carregar dados do paciente
  const carregarPaciente = async () => {
    try {
      setIsLoading(true);
      const dados = await PacientesService.getPacienteById(pacienteId);
      setPaciente(dados);

      // Simular resumo médico - em produção seria uma chamada à API específica
      setResumoMedico({
        consultas_total: Math.floor(Math.random() * 20) + 1,
        ultima_consulta:
          Math.random() > 0.3
            ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            : null,
        proxima_consulta:
          Math.random() > 0.5
            ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            : null,
        medicamentos_ativos: Math.floor(Math.random() * 5),
        exames_pendentes: Math.floor(Math.random() * 3),
        alertas: Math.random() > 0.7 ? ['Hipertensão controlada', 'Alergia à penicilina'] : [],
      });
    } catch (error) {
      console.error('Erro ao carregar paciente:', error);
      router.push('/medico/pacientes');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para iniciar consulta
  const iniciarConsulta = () => {
    router.push(`/medico/atendimento/${pacienteId}`);
  };

  // Função para agendar consulta
  const agendarConsulta = () => {
    router.push(`/medico/agenda/novo?pacienteId=${pacienteId}`);
  };

  // Função para editar paciente
  const editarPaciente = () => {
    router.push(`/medico/pacientes/${pacienteId}/editar`);
  };

  // Função para imprimir prontuário
  const imprimirProntuario = () => {
    window.print();
  };

  // Função para obter cor do status
  const getStatusColor = (status?: string) => {
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

  // Renderizar loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-blue-700"></div>
        <p className="ml-2 text-blue-800 text-sm sm:text-base">Carregando dados do paciente...</p>
      </div>
    );
  }

  // Renderizar erro se paciente não encontrado
  if (!paciente) {
    return (
      <div className="text-center py-8 px-4">
        <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">Paciente não encontrado.</p>
        <Button onClick={() => router.push('/medico/pacientes')} className="w-full sm:w-auto">
          Voltar para Lista
        </Button>
      </div>
    );
  }

  const idade = PacientesService.calcularIdade(paciente.data_nascimento);

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Cabeçalho com botão voltar - responsivo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/medico/pacientes')}
          className="gap-2 w-full sm:w-auto"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Prontuário do Paciente</h1>
      </div>

      {/* Cabeçalho do paciente com ações rápidas - responsivo */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {paciente.nome}
                </h2>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                  <Badge className={`${getStatusColor(paciente.status)} text-xs sm:text-sm`}>
                    {paciente.status || 'Não informado'}
                  </Badge>
                  <span className="text-xs sm:text-sm text-gray-600">{idade} anos</span>
                  {paciente.sexo && (
                    <span className="text-xs sm:text-sm text-gray-600">{paciente.sexo}</span>
                  )}
                  {paciente.tipo_sanguineo && (
                    <Badge variant="outline" className="text-xs">
                      {paciente.tipo_sanguineo}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <Button
                onClick={iniciarConsulta}
                size="sm"
                className="gap-1 justify-center text-xs sm:text-sm"
              >
                <Stethoscope className="h-4 w-4" />
                <span className="hidden sm:inline">Iniciar Consulta</span>
                <span className="sm:hidden">Consulta</span>
              </Button>
              <Button
                variant="outline"
                onClick={agendarConsulta}
                size="sm"
                className="gap-1 justify-center text-xs sm:text-sm"
              >
                <Calendar className="h-4 w-4" />
                Agendar
              </Button>
              <Button
                variant="outline"
                onClick={editarPaciente}
                size="sm"
                className="gap-1 justify-center text-xs sm:text-sm"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
              <Button
                variant="outline"
                onClick={imprimirProntuario}
                size="sm"
                className="gap-1 justify-center text-xs sm:text-sm"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Imprimir</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Resumo médico rápido - responsivo */}
        {resumoMedico && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {resumoMedico.consultas_total}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Consultas</p>
              </div>
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {resumoMedico.medicamentos_ativos}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Medicamentos</p>
              </div>
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {resumoMedico.exames_pendentes}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Exames Pend.</p>
              </div>
              <div className="text-center col-span-2 sm:col-span-1">
                <p className="text-xs sm:text-sm text-gray-600">
                  {resumoMedico.ultima_consulta
                    ? `Última: ${new Date(resumoMedico.ultima_consulta).toLocaleDateString(
                        'pt-BR'
                      )}`
                    : 'Sem consultas'}
                </p>
              </div>
              <div className="text-center col-span-2 sm:col-span-3 lg:col-span-1">
                <p className="text-xs sm:text-sm text-gray-600">
                  {resumoMedico.proxima_consulta
                    ? `Próxima: ${new Date(resumoMedico.proxima_consulta).toLocaleDateString(
                        'pt-BR'
                      )}`
                    : 'Sem agendamentos'}
                </p>
              </div>
            </div>

            {/* Alertas médicos */}
            {resumoMedico.alertas.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-yellow-800">Alertas Médicos</h4>
                    <ul className="mt-1 text-sm text-yellow-700">
                      {resumoMedico.alertas.map((alerta, index) => (
                        <li key={index}>• {alerta}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Tabs de navegação - responsivas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dados')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'dados'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dados Pessoais
          </button>
          <button
            onClick={() => setActiveTab('prontuario')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'prontuario'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Prontuário Eletrônico
          </button>
        </nav>
      </div>

      {/* Conteúdo das tabs */}
      {activeTab === 'dados' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Dados pessoais */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                  Dados Pessoais
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">
                      CPF: {PacientesService.formatarCPF(paciente.cpf)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">
                      Nascimento: {new Date(paciente.data_nascimento).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {paciente.tipo_sanguineo && (
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">Tipo Sanguíneo: {paciente.tipo_sanguineo}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contato */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Contato</h3>
                <div className="space-y-2 text-sm">
                  {paciente.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">
                        {PacientesService.formatarTelefone(paciente.telefone)}
                      </span>
                    </div>
                  )}
                  {paciente.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{paciente.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Endereço */}
              {paciente.endereco && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                    Endereço
                  </h3>
                  <div className="text-sm space-y-1">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="break-words">{paciente.endereco}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Informações médicas adicionais */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">
                Informações Médicas
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Alergias */}
                {paciente.alergias && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 text-sm">Alergias</h4>
                    <p className="text-sm text-gray-600 p-3 bg-red-50 border border-red-200 rounded-md">
                      {paciente.alergias}
                    </p>
                  </div>
                )}

                {/* Histórico médico */}
                {paciente.historico_medico && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 text-sm">Histórico Médico</h4>
                    <p className="text-sm text-gray-600 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      {paciente.historico_medico}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Contato de emergência */}
            {paciente.contato_emergencia && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">
                  Contato de Emergência
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 block mb-1">Nome:</span>
                    <p className="font-medium">{paciente.contato_emergencia.nome}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-1">Telefone:</span>
                    <p className="font-medium">
                      {PacientesService.formatarTelefone(paciente.contato_emergencia.telefone)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-1">Parentesco:</span>
                    <p className="font-medium">{paciente.contato_emergencia.parentesco}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab do prontuário eletrônico */}
      {activeTab === 'prontuario' && <ProntuarioEletronico pacienteId={pacienteId} />}
    </div>
  );
}

export default withProtectedRoute([UserRole.MEDICO])(MedicoPacienteDetalhePage);

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
