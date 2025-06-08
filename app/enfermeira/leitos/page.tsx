'use client';

import { EnfermagemService, Leito } from '@/lib/services/enfermagem.service';
import {
  Activity,
  AlertCircle,
  Bed,
  Calendar,
  CheckCircle,
  MapPin,
  Search,
  User,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Interface para filtros
interface FiltrosLeitos {
  ala: string;
  status: string;
  busca: string;
}

function LeitosPage() {
  const [leitos, setLeitos] = useState<Leito[]>([]);
  const [filtros, setFiltros] = useState<FiltrosLeitos>({
    ala: '',
    status: '',
    busca: '',
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; mensagem: string } | null>(
    null
  );

  // Buscar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const leitosData = await EnfermagemService.getLeitos();
        setLeitos(leitosData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setFeedback({
          tipo: 'erro',
          mensagem: 'Erro ao carregar dados iniciais',
        });
      }
    };

    carregarDados();
  }, []);

  // Limpar feedback automaticamente
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Atualizar status do leito
  const atualizarStatusLeito = async (leitoId: string, novoStatus: string) => {
    setLoading(true);

    try {
      await EnfermagemService.atualizarStatusLeito(leitoId, novoStatus);

      // Atualizar localmente
      setLeitos((prev) =>
        prev.map((leito) =>
          leito.id === leitoId ? { ...leito, status: novoStatus as any } : leito
        )
      );

      setFeedback({
        tipo: 'sucesso',
        mensagem: 'Status do leito atualizado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao atualizar status do leito:', error);
      setFeedback({
        tipo: 'erro',
        mensagem: 'Erro ao atualizar status do leito',
      });
    } finally {
      setLoading(false);
    }
  };

  // Obter cor do status
  const obterCorStatus = (status: string): string => {
    switch (status) {
      case 'ocupado':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'livre':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'manutencao':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'limpeza':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obter ícone do status
  const obterIconeStatus = (status: string) => {
    switch (status) {
      case 'ocupado':
        return <User className="w-4 h-4" />;
      case 'livre':
        return <CheckCircle className="w-4 h-4" />;
      case 'manutencao':
        return <AlertCircle className="w-4 h-4" />;
      case 'limpeza':
        return <Activity className="w-4 h-4" />;
      default:
        return <Bed className="w-4 h-4" />;
    }
  };

  // Filtrar leitos
  const leitosFiltrados = leitos.filter((leito) => {
    const matchAla = !filtros.ala || leito.ala.toLowerCase().includes(filtros.ala.toLowerCase());
    const matchStatus = !filtros.status || leito.status === filtros.status;
    const matchBusca =
      !filtros.busca ||
      leito.numero.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      leito.pacienteNome?.toLowerCase().includes(filtros.busca.toLowerCase());

    return matchAla && matchStatus && matchBusca;
  });

  // Obter estatísticas
  const estatisticas = {
    total: leitos.length,
    ocupados: leitos.filter((l) => l.status === 'ocupado').length,
    livres: leitos.filter((l) => l.status === 'livre').length,
    manutencao: leitos.filter((l) => l.status === 'manutencao').length,
    limpeza: leitos.filter((l) => l.status === 'limpeza').length,
  };

  // Obter alas únicas
  const alasUnicas = [...new Set(leitos.map((l) => l.ala))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bed className="w-7 h-7 text-green-600" />
          Gestão de Leitos
        </h1>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-lg ${
            feedback.tipo === 'sucesso'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.mensagem}
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-gray-900">{estatisticas.total}</div>
          <div className="text-sm text-gray-600">Total de Leitos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-red-600">{estatisticas.ocupados}</div>
          <div className="text-sm text-gray-600">Ocupados</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-green-600">{estatisticas.livres}</div>
          <div className="text-sm text-gray-600">Livres</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-yellow-600">{estatisticas.manutencao}</div>
          <div className="text-sm text-gray-600">Manutenção</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-blue-600">{estatisticas.limpeza}</div>
          <div className="text-sm text-gray-600">Limpeza</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Filtros
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar por Leito/Paciente
            </label>
            <input
              type="text"
              placeholder="Digite o número do leito ou nome do paciente"
              value={filtros.busca}
              onChange={(e) => setFiltros((prev) => ({ ...prev, busca: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ala</label>
            <select
              value={filtros.ala}
              onChange={(e) => setFiltros((prev) => ({ ...prev, ala: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todas as alas</option>
              {alasUnicas.map((ala) => (
                <option key={ala} value={ala}>
                  {ala}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filtros.status}
              onChange={(e) => setFiltros((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              <option value="ocupado">Ocupado</option>
              <option value="livre">Livre</option>
              <option value="manutencao">Manutenção</option>
              <option value="limpeza">Limpeza</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Leitos */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Leitos ({leitosFiltrados.length})
        </h2>

        {leitosFiltrados.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhum leito encontrado com os filtros aplicados.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {leitosFiltrados.map((leito) => (
              <div
                key={leito.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Cabeçalho do card */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold text-gray-900">Leito {leito.numero}</span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${obterCorStatus(
                      leito.status
                    )}`}
                  >
                    {obterIconeStatus(leito.status)}
                    {leito.status.charAt(0).toUpperCase() + leito.status.slice(1)}
                  </span>
                </div>

                {/* Informações da ala */}
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{leito.ala}</span>
                </div>

                {/* Informações do paciente (se ocupado) */}
                {leito.status === 'ocupado' && leito.pacienteNome && (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {leito.pacienteNome}
                      </span>
                    </div>
                    {leito.dataInternacao && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Internado em: {new Date(leito.dataInternacao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Ações */}
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 mb-2">Alterar status:</div>
                  <div className="grid grid-cols-2 gap-1">
                    {leito.status !== 'livre' && (
                      <button
                        onClick={() => atualizarStatusLeito(leito.id, 'livre')}
                        disabled={loading}
                        className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                      >
                        Livre
                      </button>
                    )}
                    {leito.status !== 'ocupado' && (
                      <button
                        onClick={() => atualizarStatusLeito(leito.id, 'ocupado')}
                        disabled={loading}
                        className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        Ocupar
                      </button>
                    )}
                    {leito.status !== 'limpeza' && (
                      <button
                        onClick={() => atualizarStatusLeito(leito.id, 'limpeza')}
                        disabled={loading}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                      >
                        Limpeza
                      </button>
                    )}
                    {leito.status !== 'manutencao' && (
                      <button
                        onClick={() => atualizarStatusLeito(leito.id, 'manutencao')}
                        disabled={loading}
                        className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors disabled:opacity-50"
                      >
                        Manutenção
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumo por Ala */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Resumo por Ala
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alasUnicas.map((ala) => {
            const leitosAla = leitos.filter((l) => l.ala === ala);
            const ocupados = leitosAla.filter((l) => l.status === 'ocupado').length;
            const livres = leitosAla.filter((l) => l.status === 'livre').length;
            const total = leitosAla.length;

            return (
              <div key={ala} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">{ala}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ocupados:</span>
                    <span className="font-medium text-red-600">{ocupados}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Livres:</span>
                    <span className="font-medium text-green-600">{livres}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${total > 0 ? (ocupados / total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {total > 0 ? Math.round((ocupados / total) * 100) : 0}% ocupação
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LeitosPage;

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
