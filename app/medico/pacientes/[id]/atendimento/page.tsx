'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { withProtectedRoute } from '@/hooks/useAuthentication';
import { UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  User,
  FileText,
  Edit3,
  Pill,
  TrendingUp,
  Activity,
  FlaskConical,
  Save,
  Printer,
  Plus,
  Eye,
  Clock
} from 'lucide-react';
import ProntuarioEletronico from '@/components/medico/ProntuarioEletronico';
import SinaisVitaisForm from '@/components/medico/SinaisVitaisForm';
import AnotacaoMedicaForm from '@/components/medico/AnotacaoMedicaForm';
import AtestadoForm from '@/components/medico/AtestadoForm';
import PrescricaoForm from '@/components/medico/PrescricaoForm';

// Interface para dados do paciente
interface Paciente {
  id: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  telefone: string;
  email: string;
  prioridade?: string;
  queixaPrincipal?: string;
}

// Interface para dados do atendimento atual
interface AtendimentoAtual {
  id?: number;
  dataInicio: string;
  status: 'em_andamento' | 'finalizado';
  motivoConsulta?: string;
  observacoes?: string;
}

function AtendimentoPacientePage() {
  const params = useParams();
  const router = useRouter();
  const pacienteId = parseInt(params.id as string);

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [atendimento, setAtendimento] = useState<AtendimentoAtual | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('consulta');
  const [showModalForm, setShowModalForm] = useState<string | null>(null);

  useEffect(() => {
    const carregarDadosPaciente = async () => {
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
          email: 'maria.silva@email.com',
          prioridade: 'amarelo',
          queixaPrincipal: 'Dor abdominal há 2 dias'
        };

        // Simular dados do atendimento atual
        const atendimentoData: AtendimentoAtual = {
          id: 1,
          dataInicio: new Date().toISOString(),
          status: 'em_andamento',
          motivoConsulta: 'Dor abdominal',
          observacoes: ''
        };

        setPaciente(pacienteData);
        setAtendimento(atendimentoData);

      } catch (error) {
        console.error('Erro ao carregar dados do paciente:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDadosPaciente();
  }, [pacienteId]);

  // Função para finalizar atendimento
  const finalizarAtendimento = async () => {
    try {
      // Lógica para finalizar atendimento
      console.log('Finalizando atendimento...');
      router.push('/medico');
    } catch (error) {
      console.error('Erro ao finalizar atendimento:', error);
    }
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
      {/* Header do Atendimento */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Atendimento em Andamento</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">
            <Clock className="h-3 w-3 mr-1" />
            Em andamento
          </Badge>
          <Button onClick={finalizarAtendimento} className="bg-red-600 hover:bg-red-700">
            Finalizar Atendimento
          </Button>
        </div>
      </div>

      {/* Informações do Paciente */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
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
                {paciente.queixaPrincipal && (
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Queixa principal:</strong> {paciente.queixaPrincipal}
                  </p>
                )}
              </div>
            </div>
            {atendimento && (
              <div className="text-right text-sm text-gray-600">
                <p>Atendimento iniciado em:</p>
                <p className="font-medium">
                  {new Date(atendimento.dataInicio).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Navegação Principal do Atendimento */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="consulta" className="gap-2">
            <Edit3 className="h-4 w-4" />
            Consulta Atual
          </TabsTrigger>
          <TabsTrigger value="prontuario" className="gap-2">
            <FileText className="h-4 w-4" />
            Prontuário
          </TabsTrigger>
          <TabsTrigger value="prescricao" className="gap-2">
            <Pill className="h-4 w-4" />
            Prescrição
          </TabsTrigger>
          <TabsTrigger value="documentos" className="gap-2">
            <Printer className="h-4 w-4" />
            Documentos
          </TabsTrigger>
        </TabsList>

        {/* Tab da Consulta Atual */}
        <TabsContent value="consulta">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulários Rápidos */}
            <Card>
              <CardHeader>
                <CardTitle>Registros da Consulta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setShowModalForm('sinais-vitais')}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Registrar Sinais Vitais
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setShowModalForm('anotacao')}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Nova Anotação Médica
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setShowModalForm('exame')}
                >
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Solicitar Exame
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setShowModalForm('evolucao')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Evolução do Paciente
                </Button>
              </CardContent>
            </Card>

            {/* Resumo da Consulta */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo da Consulta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Motivo da Consulta
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Descreva o motivo da consulta..."
                      defaultValue={atendimento?.motivoConsulta}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observações Gerais
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Observações sobre a consulta..."
                      defaultValue={atendimento?.observacoes}
                    />
                  </div>

                  <Button className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Observações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab do Prontuário */}
        <TabsContent value="prontuario">
          <ProntuarioEletronico pacienteId={pacienteId} />
        </TabsContent>

        {/* Tab de Prescrição */}
        <TabsContent value="prescricao">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Prescrição Médica</CardTitle>
                <Button onClick={() => setShowModalForm('prescricao')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Prescrição
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                Nenhuma prescrição criada para este atendimento.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Documentos */}
        <TabsContent value="documentos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Atestados e Declarações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setShowModalForm('atestado')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Atestado Médico
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Declaração de Comparecimento
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Relatório Médico
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documentos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  Nenhum documento gerado ainda.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals para Formulários */}
      {showModalForm === 'sinais-vitais' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <SinaisVitaisForm
              onSave={() => setShowModalForm(null)}
              onCancel={() => setShowModalForm(null)}
              pacienteId={pacienteId}
            />
          </div>
        </div>
      )}

      {showModalForm === 'anotacao' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <AnotacaoMedicaForm
              onSave={() => setShowModalForm(null)}
              onCancel={() => setShowModalForm(null)}
              pacienteId={pacienteId}
            />
          </div>
        </div>
      )}

      {showModalForm === 'atestado' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <AtestadoForm
              onSave={() => setShowModalForm(null)}
              onCancel={() => setShowModalForm(null)}
              pacienteId={pacienteId}
              pacienteNome={paciente.nome}
            />
          </div>
        </div>
      )}

      {showModalForm === 'prescricao' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <PrescricaoForm
              onSave={() => setShowModalForm(null)}
              onCancel={() => setShowModalForm(null)}
              pacienteId={pacienteId}
              pacienteNome={paciente.nome}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default withProtectedRoute([UserRole.MEDICO])(AtendimentoPacientePage);

/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
