'use client'

import { useEffect, useState } from 'react'

interface PacienteTriagem {
  id: number
  nome: string
  leito: string
  prioridade: string
  queixa: string
}

function TriagemPage() {
  const [triagem, setTriagem] = useState<PacienteTriagem[]>([])

  useEffect(() => {
    const mockTriagem: PacienteTriagem[] = [
      {
        id: 1,
        nome: 'Ana Paula',
        leito: '201A',
        prioridade: 'Alta',
        queixa: 'Dor intensa no peito',
      },
      {
        id: 2,
        nome: 'Pedro Lima',
        leito: '202B',
        prioridade: 'Média',
        queixa: 'Febre e tosse',
      },
      {
        id: 3,
        nome: 'Luiza Costa',
        leito: '203C',
        prioridade: 'Baixa',
        queixa: 'Dor de cabeça',
      },
    ]
    setTriagem(mockTriagem)
  }, [])

  return (
    <main className="p-6 bg-green-50 min-h-screen">
      <h1 className="text-3xl font-bold text-green-800 mb-6">Triagem de Pacientes</h1>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="py-3 px-6 text-left">Nome</th>
              <th className="py-3 px-6 text-left">Leito</th>
              <th className="py-3 px-6 text-left">Prioridade</th>
              <th className="py-3 px-6 text-left">Queixa</th>
              <th className="py-3 px-6 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {triagem.map((paciente) => (
              <tr key={paciente.id} className="border-b hover:bg-green-100">
                <td className="py-3 px-6 text-black">{paciente.nome}</td>
                <td className="py-3 px-6 text-black">{paciente.leito}</td>
                <td className="py-3 px-6">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      paciente.prioridade === 'Alta'
                        ? 'bg-red-200 text-red-800'
                        : paciente.prioridade === 'Média'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-green-200 text-green-800'
                    }`}
                  >
                    {paciente.prioridade}
                  </span>
                </td>
                <td className="py-3 px-6 text-black">{paciente.queixa}</td>
                <td className="py-3 px-6">
                  <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">
                    Atender
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default TriagemPage
