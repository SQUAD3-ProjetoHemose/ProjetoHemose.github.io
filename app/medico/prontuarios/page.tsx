'use client';

import { useState, useEffect } from 'react';
import { withProtectedRoute } from '@/hooks/useAuthentication';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  FileText, 
  User,
  Calendar,
  Eye,
  Plus,
  Filter
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';

// Interface para paciente na lista
interface PacienteListItem {
  id: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  telefone: string;
  ultimaConsulta?: string;
  statusProntuario: 'ativo' | 'inativo';
}

// Página de gerenciamento de prontuários
function MedicoProntuariosPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<PacienteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'inativo'>('todos');

  // Buscar pacientes
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const response = await fetch('/api/pacientes', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPacientes(data.map((p: any) => ({
            ...p,
            statusProntuario: 'ativo', // Em uma app real, viria do backend
            ultimaConsulta: '2024-01-15', // Simulado
          })));
        }
      } catch (error) {
        console.error('Erro ao buscar pacientes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPacientes();
  }, []);

  // Filtrar pacientes baseado na busca e filtros
  const pacientesFiltrados = pacientes.filter(paciente => {
    const matchBusca = !busca || 
      paciente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      paciente.cpf.includes(busca);
    
    const matchStatus = filtroStatus === 'todos' || paciente.statusProntuario === filtroStatus;
    
    return matchBusca && matchStatus;
  });

  // Calcular idade
  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  // Abrir prontuário do paciente
  const abrirProntuario = (pacienteId: number) => {
    router.push(`/medico/prontuarios/${pacienteId}`);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Prontuários Eletrônicos</h1>
        <Button onClick={() => router.push('/medico/prontuarios/novo')} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Prontuário
        </Button>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Campo de busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nome ou CPF..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro de status */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de pacientes/prontuários */}
      <Card>
        <CardHeader>
          <CardTitle>Pacientes Cadastrados ({pacientesFiltrados.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : pacientesFiltrados.length > 0 ? (
            <div className="space-y-4">
              {pacientesFiltrados.map((paciente) => (
                <div
                  key={paciente.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>

                      {/* Informações do paciente */}
                      <div>
                        <h3 className="font-semibold text-gray-900">{paciente.nome}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>CPF: {paciente.cpf}</span>
                          <span>Idade: {calcularIdade(paciente.dataNascimento)} anos</span>
                          <span>Sexo: {paciente.sexo}</span>
                        </div>
                        {paciente.ultimaConsulta && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                            <Calendar className="h-4 w-4" />
                            Última consulta: {new Date(paciente.ultimaConsulta).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status e ações */}
                    <div className="flex items-center gap-3">
                      <Badge 
                        className={
                          paciente.statusProntuario === 'ativo'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {paciente.statusProntuario === 'ativo' ? 'Ativo' : 'Inativo'}
                      </Badge>

                      <Button 
                        onClick={() => abrirProntuario(paciente.id)}
                        className="gap-2"
                        size="sm"
                      >
                        <FileText className="h-4 w-4" />
                        Abrir Prontuário
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {busca ? 'Nenhum paciente encontrado com os critérios de busca.' : 'Nenhum paciente cadastrado.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {pacientes.filter(p => p.statusProntuario === 'ativo').length}
            </div>
            <p className="text-sm text-gray-600">Prontuários Ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {pacientes.filter(p => p.ultimaConsulta).length}
            </div>
            <p className="text-sm text-gray-600">Com Consulta Recente</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {pacientes.length}
            </div>
            <p className="text-sm text-gray-600">Total de Pacientes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// HOC para proteger a rota, permitindo apenas médicos
export default withProtectedRoute([UserRole.MEDICO])(MedicoProntuariosPage);

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
