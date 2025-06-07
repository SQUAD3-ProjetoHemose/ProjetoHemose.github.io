'use client'

import { useEffect, useState } from 'react'

interface Paciente {
  id: number
  nome: string
  leito: string
  status: string
  diagnostico: string
}

function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [editingPacienteId, setEditingPacienteId] = useState<number | null>(null)

  useEffect(() => {
    const mockPacientes: Paciente[] = [
      {
        id: 1,
        nome: 'João Silva',
        leito: '101A',
        status: 'Estável',
        diagnostico: 'Pneumonia',
      },
      {
        id: 2,
        nome: 'Maria Souza',
        leito: '102B',
        status: 'Crítico',
        diagnostico: 'Infarto',
      },
      {
        id: 3,
        nome: 'Carlos Santos',
        leito: '103C',
        status: 'Estável',
        diagnostico: 'Fratura',
      },
    ]

    setPacientes(mockPacientes)
  }, [])

  const handleStatusUpdate = (pacienteId: number, newStatus: string) => {
    setPacientes(prev =>
      prev.map(p =>
        p.id === pacienteId ? { ...p, status: newStatus } : p
      )
    )
    setEditingPacienteId(null)
  }

  return (
    <main className="p-6 bg-green-50 min-h-screen relative">
      <h1 className="text-3xl font-bold text-green-800 mb-6">Pacientes Internados</h1>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="py-3 px-6 text-left">Nome</th>
              <th className="py-3 px-6 text-left">Leito</th>
              <th className="py-3 px-6 text-left">Status</th>
              <th className="py-3 px-6 text-left">Diagnóstico</th>
              <th className="py-3 px-6 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map(paciente => (
              <tr key={paciente.id} className="border-b hover:bg-green-100">
                <td className="py-3 px-6 text-black">{paciente.nome}</td>
                <td className="py-3 px-6 text-black">{paciente.leito}</td>
                <td className="py-3 px-6">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      paciente.status === 'Crítico'
                        ? 'bg-red-200 text-red-800'
                        : 'bg-green-200 text-green-800'
                    }`}
                  >
                    {paciente.status}
                  </span>
                </td>
                <td className="py-3 px-6 text-black">{paciente.diagnostico}</td>
                <td className="py-3 px-6 space-x-2">
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                    onClick={() => setSelectedPaciente(paciente)}
                  >
                    Ver Detalhes
                  </button>
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                    onClick={() =>
                      setEditingPacienteId(
                        editingPacienteId === paciente.id ? null : paciente.id
                      )
                    }
                  >
                    Atualizar Status
                  </button>

                  {editingPacienteId === paciente.id && (
                    <div className="mt-2 flex gap-2">
                      {['Estável', 'Crítico', 'Em Observação'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(paciente.id, status)}
                          className={`text-xs px-2 py-1 rounded ${
                            paciente.status === status
                              ? 'bg-green-700 text-white'
                              : 'bg-green-200 text-green-800 hover:bg-green-300'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPaciente && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white text-black p-6 rounded-lg shadow-xl border border-gray-200 w-80">
            <h2 className="text-xl font-bold mb-4">Detalhes do Paciente</h2>
            <p><strong>Nome:</strong> {selectedPaciente.nome}</p>
            <p><strong>Leito:</strong> {selectedPaciente.leito}</p>
            <p><strong>Status:</strong> {selectedPaciente.status}</p>
            <p><strong>Diagnóstico:</strong> {selectedPaciente.diagnostico}</p>
            <button
              onClick={() => setSelectedPaciente(null)}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default PacientesPage
