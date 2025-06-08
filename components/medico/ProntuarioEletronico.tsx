'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Eye,
  Activity,
  Stethoscope,
  FlaskConical,
  TrendingUp,
  Heart,
  Thermometer,
  Calendar,
  User,
  Save,
  X
} from 'lucide-react';
import SinaisVitaisForm from './SinaisVitaisForm';
import AnotacaoMedicaForm from './AnotacaoMedicaForm';
import SinaisVitaisList from './SinaisVitaisList';
import AnotacoesList from './AnotacoesList';
import ExamesList from './ExamesList';
import ExameForm from './ExameForm';

// Interfaces para o prontuário eletrônico
interface Paciente {
  id: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  telefone: string;
  email: string;
}

interface SinaisVitais {
  id?: number;
  dataMedicao: string;
  pressaoSistolica?: number;
  pressaoDiastolica?: number;
  frequenciaCardiaca?: number;
  frequenciaRespiratoria?: number;
  temperatura?: number;
  saturacaoOxigenio?: number;
  glicemia?: number;
  peso?: number;
  altura?: number;
  escalaDor?: number;
  observacoes?: string;
}

interface AnotacaoMedica {
  id?: number;
  tipo: string;
  titulo?: string;
  conteudo: string;
  prioridade: string;
  visivelOutros: boolean;
  anotacaoPrivada: boolean;
  profissional: {
    nome: string;
  };
  createdAt: string;
}

interface Exame {
  id?: number;
  tipoExame: string;
  nomeExame: string;
  descricao?: string;
  status: string;
  dataSolicitacao: string;
  dataAgendada?: string;
  dataRealizacao?: string;
  resultado?: string;
  interpretacaoMedica?: string;
  prioridade: string;
  medicoSolicitante: {
    nome: string;
  };
}

// Componente principal do prontuário eletrônico
interface ProntuarioEletronicoProps {
  pacienteId: number;
}

export default function ProntuarioEletronico({ pacienteId }: ProntuarioEletronicoProps) {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [sinaisVitais, setSinaisVitais] = useState<SinaisVitais[]>([]);
  const [anotacoes, setAnotacoes] = useState<AnotacaoMedica[]>([]);
  const [exames, setExames] = useState<Exame[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumo');

  // Estados para formulários
  const [showSinaisForm, setShowSinaisForm] = useState(false);
  const [showAnotacaoForm, setShowAnotacaoForm] = useState(false);
  const [showExameForm, setShowExameForm] = useState(false);

  // Carregar dados do paciente
  useEffect(() => {
    const fetchPacienteData = async () => {
      setLoading(true);
      try {
        // Buscar dados do paciente
        const pacienteResponse = await fetch(`/api/pacientes/${pacienteId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        if (pacienteResponse.ok) {
          setPaciente(await pacienteResponse.json());
        }

        // Buscar sinais vitais
        const sinaisResponse = await fetch(`/api/prontuario-eletronico/sinais-vitais/${pacienteId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        if (sinaisResponse.ok) {
          setSinaisVitais(await sinaisResponse.json());
        }

        // Buscar anotações médicas
        const anotacoesResponse = await fetch(`/api/prontuario-eletronico/anotacoes/${pacienteId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        if (anotacoesResponse.ok) {
          setAnotacoes(await anotacoesResponse.json());
        }

        // Buscar exames
        const examesResponse = await fetch(`/api/prontuario-eletronico/exames/${pacienteId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        if (examesResponse.ok) {
          setExames(await examesResponse.json());
        }

      } catch (error) {
        console.error('Erro ao carregar dados do prontuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPacienteData();
  }, [pacienteId]);

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
      {/* Cabeçalho do Paciente */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{paciente.nome}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>CPF: {paciente.cpf}</span>
                  <span>Sexo: {paciente.sexo}</span>
                  <span>
                    Idade: {new Date().getFullYear() - new Date(paciente.dataNascimento).getFullYear()} anos
                  </span>
                </div>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">
              Prontuário Ativo
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Navegação por Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="resumo" className="gap-2">
            <FileText className="h-4 w-4" />
            Resumo
          </TabsTrigger>
          <TabsTrigger value="sinais-vitais" className="gap-2">
            <Activity className="h-4 w-4" />
            Sinais Vitais
          </TabsTrigger>
          <TabsTrigger value="anotacoes" className="gap-2">
            <Edit3 className="h-4 w-4" />
            Anotações
          </TabsTrigger>
          <TabsTrigger value="exames" className="gap-2">
            <FlaskConical className="h-4 w-4" />
            Exames
          </TabsTrigger>
          <TabsTrigger value="evolucao" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Evolução
          </TabsTrigger>
        </TabsList>

        {/* Tab Resumo */}
        <TabsContent value="resumo">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Últimos sinais vitais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Últimos Sinais Vitais
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sinaisVitais.length > 0 ? (
                  <UltimosSinaisVitais sinais={sinaisVitais[0]} />
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum sinal vital registrado
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Últimas anotações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-blue-500" />
                  Anotações Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {anotacoes.slice(0, 3).map((anotacao) => (
                  <div key={anotacao.id} className="border-b border-gray-200 pb-2 mb-2 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{anotacao.tipo}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(anotacao.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm mt-1 line-clamp-2">{anotacao.conteudo}</p>
                  </div>
                ))}
                {anotacoes.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Nenhuma anotação registrada
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Sinais Vitais */}
        <TabsContent value="sinais-vitais">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sinais Vitais</CardTitle>
                <Button onClick={() => setShowSinaisForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Registrar Sinais
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showSinaisForm ? (
                <SinaisVitaisForm 
                  onSave={(sinais) => {
                    setSinaisVitais([sinais, ...sinaisVitais]);
                    setShowSinaisForm(false);
                  }}
                  onCancel={() => setShowSinaisForm(false)}
                  pacienteId={pacienteId}
                />
              ) : (
                <SinaisVitaisList sinais={sinaisVitais} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Anotações */}
        <TabsContent value="anotacoes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Anotações Médicas</CardTitle>
                <Button onClick={() => setShowAnotacaoForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Anotação
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAnotacaoForm ? (
                <AnotacaoMedicaForm 
                  onSave={(anotacao) => {
                    setAnotacoes([anotacao, ...anotacoes]);
                    setShowAnotacaoForm(false);
                  }}
                  onCancel={() => setShowAnotacaoForm(false)}
                  pacienteId={pacienteId}
                />
              ) : (
                <AnotacoesList anotacoes={anotacoes} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Exames */}
        <TabsContent value="exames">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Exames Médicos</CardTitle>
                <Button onClick={() => setShowExameForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Solicitar Exame
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showExameForm ? (
                <ExameForm 
                  onSave={(exame) => {
                    setExames([exame, ...exames]);
                    setShowExameForm(false);
                  }}
                  onCancel={() => setShowExameForm(false)}
                  pacienteId={pacienteId}
                />
              ) : (
                <ExamesList exames={exames} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Evolução */}
        <TabsContent value="evolucao">
          <Card>
            <CardHeader>
              <CardTitle>Evolução do Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                Funcionalidade de evolução em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente para exibir últimos sinais vitais
function UltimosSinaisVitais({ sinais }: { sinais: SinaisVitais }) {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-red-500" />
        <span>PA: {sinais.pressaoSistolica}/{sinais.pressaoDiastolica} mmHg</span>
      </div>
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-blue-500" />
        <span>FC: {sinais.frequenciaCardiaca} bpm</span>
      </div>
      <div className="flex items-center gap-2">
        <Thermometer className="h-4 w-4 text-orange-500" />
        <span>Temp: {sinais.temperatura}°C</span>
      </div>
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-green-500" />
        <span>SpO2: {sinais.saturacaoOxigenio}%</span>
      </div>
    </div>
  );
}

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
