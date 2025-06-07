'use client'

import { useEffect, useState } from 'react'

interface Leito {
  id: number
  numero: string
  status: string
  paciente?: string
}

interface MiniCardPosition {
  top: number
  left: number
}

function LeitosPage() {
  const [leitos, setLeitos] = useState<Leito[]>([])
  const [editingLeitoId, setEditingLeitoId] = useState<number | null>(null)
  const [selectedPaciente, setSelectedPaciente] = useState<string>('')
  const [pacientes, setPacientes] = useState<string[]>([])
  const [miniCardPosition, setMiniCardPosition] = useState<MiniCardPosition | null>(null)

  useEffect(() => {
    setLeitos([
      { id: 1, numero: '401A', status: 'Ocupado', paciente: 'Lucas Almeida' },
      { id: 2, numero: '402B', status: 'Disponível' },
      { id: 3, numero: '403C', status: 'Manutenção' },
    ])

    setPacientes(['João Silva', 'Maria Souza', 'Carlos Santos'])
  }, [])

  const handleStatusUpdate = (leitoId: number, newStatus: string) => {
    if (newStatus === 'Ocupado' && !selectedPaciente) {
      alert('Selecione um paciente antes de ocupar o leito.')
      return
    }

    setLeitos(prev =>
      prev.map(leito =>
        leito.id === leitoId
          ? {
              ...leito,
              status: newStatus,
              paciente: newStatus === 'Ocupado' ? selectedPaciente : undefined,
            }
          : leito
      )
    )

    setEditingLeitoId(null)
    setSelectedPaciente('')
    setMiniCardPosition(null)
  }

  const openMiniCard = (leitoId: number, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()

    setEditingLeitoId(leitoId)
    setMiniCardPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
    })
  }

  return (
    <main className="p-6 bg-green-50 min-h-screen relative">
      <h1 className="text-3xl font-bold text-green-800 mb-6">Controle de Leitos</h1>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="py-3 px-6 text-left">Número</th>
              <th className="py-3 px-6 text-left">Status</th>
              <th className="py-3 px-6 text-left">Paciente</th>
              <th className="py-3 px-6 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {leitos.map(leito => (
              <tr key={leito.id} className="border-b hover:bg-green-100">
                <td className="py-3 px-6 text-black">{leito.numero}</td>
                <td className="py-3 px-6">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      leito.status === 'Ocupado'
                        ? 'bg-red-200 text-red-800'
                        : leito.status === 'Disponível'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-yellow-200 text-yellow-800'
                    }`}
                  >
                    {leito.status}
                  </span>
                </td>
                <td className="py-3 px-6 text-black">{leito.paciente || '—'}</td>
                <td className="py-3 px-6">
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                    onClick={e =>
                      editingLeitoId === leito.id
                        ? setEditingLeitoId(null)
                        : openMiniCard(leito.id, e)
                    }
                  >
                    Alterar Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingLeitoId !== null && miniCardPosition && (
        <div
          className="fixed bg-white border border-gray-300 shadow-lg rounded p-3 w-48 z-50"
          style={{
            top: miniCardPosition.top,
            left: miniCardPosition.left,
          }}
        >
          <p className="text-sm font-semibold text-black mb-2">Selecionar status:</p>

          <div className="flex flex-col gap-2">
            {['Ocupado', 'Disponível', 'Manutenção'].map(status => (
              <button
                key={status}
                onClick={() => {
                  if (status !== 'Ocupado') {
                    handleStatusUpdate(editingLeitoId, status)
                  }
                }}
                className="text-xs px-2 py-1 rounded text-black border hover:bg-green-100"
              >
                {status}
              </button>
            ))}
          </div>

          <div className="mt-2">
            <label className="text-xs text-black">Paciente:</label>
            <select
              className="block w-full mt-1 p-1 border rounded text-sm text-black"
              value={selectedPaciente}
              onChange={e => setSelectedPaciente(e.target.value)}
            >
              <option value="">Selecione</option>
              {pacientes.map(pac => (
                <option key={pac} value={pac}>
                  {pac}
                </option>
              ))}
            </select>

            <button
              onClick={() => handleStatusUpdate(editingLeitoId, 'Ocupado')}
              className="mt-2 bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition text-xs w-full"
            >
              Confirmar Ocupação
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default LeitosPage
