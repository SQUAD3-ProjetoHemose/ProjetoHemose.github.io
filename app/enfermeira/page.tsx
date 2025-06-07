'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Stats, UserRole } from '@/types'
import { withProtectedRoute } from '@/hooks'

interface EnfermeiraDashboardPageProps {
  user: User
}

interface PacienteUrgente {
  id: number | string
  nome: string
  leito: string
  status: string
  sinaisVitais: string
}

interface Medicacao {
  id: number | string
  paciente: string
  leito: string
  medicamento: string
  dosagem: string
  horario: string
}

function EnfermeiraDashboardPage({ user }: EnfermeiraDashboardPageProps) {
  const router = useRouter()

  const [stats, setStats] = useState<Stats>({
    pacientesInternados: 0,
    pacientesTriagem: 0,
    medicamentosAdministrar: 0,
    leitosDisponiveis: 0,
  })

  const [pacientesUrgentes, setPacientesUrgentes] = useState<PacienteUrgente[]>([])
  const [medicacoes, setMedicacoes] = useState<Medicacao[]>([])
  const [loadingId, setLoadingId] = useState<number | string | null>(null)
  const [expandedPacienteId, setExpandedPacienteId] = useState<number | string | null>(null)
  const [painel, setPainel] = useState<'detalhes' | 'sinais' | null>(null)

  useEffect(() => {
    setStats({
      pacientesInternados: 32,
      pacientesTriagem: 8,
      medicamentosAdministrar: 15,
      leitosDisponiveis: 18,
    })

    setPacientesUrgentes([
      {
        id: 1,
        nome: 'Roberto Almeida',
        leito: '12A',
        status: 'Crítico',
        sinaisVitais: 'PA: 160/100, FC: 110',
      },
      {
        id: 2,
        nome: 'Mariana Costa',
        leito: '08B',
        status: 'Instável',
        sinaisVitais: 'PA: 90/60, FC: 120',
      },
      {
        id: 3,
        nome: 'Paulo Ferreira',
        leito: '15C',
        status: 'Em observação',
        sinaisVitais: 'PA: 140/90, FC: 95',
      },
    ])

    setMedicacoes([
      {
        id: 1,
        paciente: 'Roberto Almeida',
        leito: '12A',
        medicamento: 'Dipirona',
        dosagem: '500mg',
        horario: '12:00',
      },
      {
        id: 2,
        paciente: 'Mariana Costa',
        leito: '08B',
        medicamento: 'Amoxicilina',
        dosagem: '500mg',
        horario: '12:45',
      },
      {
        id: 3,
        paciente: 'Paulo Ferreira',
        leito: '15C',
        medicamento: 'Paracetamol',
        dosagem: '750mg',
        horario: '13:15',
      },
    ])
  }, [])

  const togglePainel = (pacienteId: number | string, tipo: 'detalhes' | 'sinais') => {
    if (expandedPacienteId === pacienteId && painel === tipo) {
      setExpandedPacienteId(null)
      setPainel(null)
    } else {
      setExpandedPacienteId(pacienteId)
      setPainel(tipo)
    }
  }

  const handleAdministrarMedicamento = async (medicacaoId: number | string) => {
    setLoadingId(medicacaoId)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    alert(`Medicamento ${medicacaoId} administrado com sucesso!`)
    setLoadingId(null)
  }

  const iniciarTriagem = () => router.push('/enfermeira/triagem')
  const administrarMedicamentos = () => router.push('/enfermeira/medicamentos')
  const registrarSinaisVitais = () => router.push('/enfermeira/sinais-vitais')
  const gerenciarLeitos = () => router.push('/enfermeira/leitos')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-black">Dashboard de Enfermagem</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Pacientes Internados', value: stats.pacientesInternados },
          { label: 'Aguardando Triagem', value: stats.pacientesTriagem },
          { label: 'Medicamentos a Administrar', value: stats.medicamentosAdministrar },
          { label: 'Leitos Disponíveis', value: stats.leitosDisponiveis },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-black">{stat.label}</h2>
            <p className="text-3xl font-bold text-black">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black mb-4">Pacientes que Requerem Atenção</h2>

          {pacientesUrgentes.length > 0 ? (
            <div className="divide-y divide-green-200">
              {pacientesUrgentes.map((paciente) => (
                <div key={paciente.id} className="py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-black">{paciente.nome}</p>
                      <p className="text-sm text-black">Leito: {paciente.leito}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      paciente.status === 'Crítico'
                        ? 'bg-green-300 text-black'
                        : paciente.status === 'Instável'
                        ? 'bg-green-200 text-black'
                        : 'bg-green-100 text-black'
                    }`}>
                      {paciente.status}
                    </span>
                  </div>
                  <p className="text-sm mt-1 text-black">{paciente.sinaisVitais}</p>
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => togglePainel(paciente.id, 'detalhes')}
                      className="text-xs bg-green-700 hover:bg-green-800 text-white px-2 py-1 rounded"
                    >
                      Ver detalhes
                    </button>
                    <button
                      onClick={() => togglePainel(paciente.id, 'sinais')}
                      className="text-xs bg-green-700 hover:bg-green-800 text-white px-2 py-1 rounded"
                    >
                      Registrar sinais
                    </button>
                  </div>

                  {expandedPacienteId === paciente.id && painel === 'detalhes' && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-sm text-black">
                      <p><strong>Histórico:</strong> Hipertensão, Diabetes</p>
                      <p><strong>Alergias:</strong> Nenhuma</p>
                      <p><strong>Último atendimento:</strong> 20/05/2025</p>
                    </div>
                  )}

                  {expandedPacienteId === paciente.id && painel === 'sinais' && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-sm text-black">
                      <p><strong>PA atual:</strong> {paciente.sinaisVitais.split(',')[0]}</p>
                      <p><strong>FC atual:</strong> {paciente.sinaisVitais.split(',')[1]}</p>
                      <p className="mt-2"><strong>Registrar novo sinal:</strong></p>
                      <input
                        type="text"
                        placeholder="Ex: PA: 120/80"
                        className="mt-1 p-1 border rounded w-full"
                      />
                      <button className="mt-2 bg-green-700 hover:bg-green-800 text-white px-2 py-1 rounded text-xs">
                        Salvar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-black">Nenhum paciente requer atenção imediata.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-black mb-4">Ações Rápidas</h2>

          <div className="space-y-3">
            <button
              onClick={iniciarTriagem}
              className="block w-full text-center bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
            >
              Iniciar Triagem
            </button>
            <button
              onClick={administrarMedicamentos}
              className="block w-full text-center bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
            >
              Administrar Medicamentos
            </button>
            <button
              onClick={registrarSinaisVitais}
              className="block w-full text-center bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
            >
              Registrar Sinais Vitais
            </button>
            <button
              onClick={gerenciarLeitos}
              className="block w-full text-center bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
            >
              Gerenciar Leitos
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-black mb-4">Medicamentos a Administrar</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-green-200">
            <thead className="bg-green-50">
              <tr>
                {['Paciente', 'Leito', 'Medicamento', 'Dosagem', 'Horário', 'Ação'].map((header) => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-green-200">
              {medicacoes.map((med) => (
                <tr key={med.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{med.paciente}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{med.leito}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{med.medicamento}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{med.dosagem}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{med.horario}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      className="bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded text-xs"
                    >
                      Administrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-right">
          <button
            onClick={administrarMedicamentos}
            className="text-black hover:underline text-sm font-medium"
          >
            Ver todos os medicamentos →
          </button>
        </div>
      </div>
    </div>
  )
}

export default withProtectedRoute([UserRole.ENFERMEIRA])(EnfermeiraDashboardPage)
