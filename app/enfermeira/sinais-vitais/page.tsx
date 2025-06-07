'use client'

import { useEffect, useState } from 'react'

interface SinalVital {
  id: number
  paciente: string
  leito: string
  pressao: string
  frequencia: string
  temperatura: string
  dataHora: string
}

interface MiniCardPosition {
  top: number
  left: number
}

function SinaisVitaisPage() {
  const [sinaisVitais, setSinaisVitais] = useState<SinalVital[]>([])
  const [editingSinalId, setEditingSinalId] = useState<number | null>(null)
  const [miniCardPosition, setMiniCardPosition] = useState<MiniCardPosition | null>(null)
  const [updatedSinal, setUpdatedSinal] = useState<{
    pressao: string
    frequencia: string
    temperatura: string
  }>({
    pressao: '',
    frequencia: '',
    temperatura: '',
  })

  const MINI_CARD_WIDTH = 260

  useEffect(() => {
    const mockSinais: SinalVital[] = [
      {
        id: 1,
        paciente: 'Marcos Silva',
        leito: '501A',
        pressao: '120/80',
        frequencia: '75 bpm',
        temperatura: '36.7 °C',
        dataHora: '25/05/2025 08:00',
      },
      {
        id: 2,
        paciente: 'Rafaela Mendes',
        leito: '502B',
        pressao: '130/85',
        frequencia: '82 bpm',
        temperatura: '37.1 °C',
        dataHora: '25/05/2025 09:30',
      },
      {
        id: 3,
        paciente: 'Cláudia Rocha',
        leito: '503C',
        pressao: '110/70',
        frequencia: '68 bpm',
        temperatura: '36.4 °C',
        dataHora: '25/05/2025 10:15',
      },
    ]
    setSinaisVitais(mockSinais)
  }, [])

  const openMiniCard = (sinal: SinalVital, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    let left = rect.left + window.scrollX

    if (left + MINI_CARD_WIDTH > window.innerWidth) {
      left = window.innerWidth - MINI_CARD_WIDTH - 16
    }

    setEditingSinalId(sinal.id)
    setMiniCardPosition({
      top: rect.bottom + window.scrollY + 8,
      left,
    })
    setUpdatedSinal({
      pressao: sinal.pressao,
      frequencia: sinal.frequencia,
      temperatura: sinal.temperatura,
    })
  }

  const handleConfirm = () => {
    if (editingSinalId === null) return

    const now = new Date()
    const formattedDate =
      now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR').slice(0, 5)

    setSinaisVitais((prev) =>
      prev.map((sinal) =>
        sinal.id === editingSinalId
          ? {
              ...sinal,
              pressao: updatedSinal.pressao,
              frequencia: updatedSinal.frequencia,
              temperatura: updatedSinal.temperatura,
              dataHora: formattedDate,
            }
          : sinal
      )
    )

    setEditingSinalId(null)
    setMiniCardPosition(null)
  }

  return (
    <main className="p-6 bg-green-50 min-h-screen relative">
      <h1 className="text-3xl font-bold text-green-800 mb-6">Registro de Sinais Vitais</h1>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="py-3 px-6 text-left">Paciente</th>
              <th className="py-3 px-6 text-left">Leito</th>
              <th className="py-3 px-6 text-left">Pressão</th>
              <th className="py-3 px-6 text-left">Frequência</th>
              <th className="py-3 px-6 text-left">Temperatura</th>
              <th className="py-3 px-6 text-left">Data/Hora</th>
              <th className="py-3 px-6 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sinaisVitais.map((sinal) => (
              <tr key={sinal.id} className="border-b hover:bg-green-100">
                <td className="py-3 px-6 text-black">{sinal.paciente}</td>
                <td className="py-3 px-6 text-black">{sinal.leito}</td>
                <td className="py-3 px-6 text-black">{sinal.pressao}</td>
                <td className="py-3 px-6 text-black">{sinal.frequencia}</td>
                <td className="py-3 px-6 text-black">{sinal.temperatura}</td>
                <td className="py-3 px-6 text-black">{sinal.dataHora}</td>
                <td className="py-3 px-6">
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                    onClick={(e) =>
                      editingSinalId === sinal.id
                        ? setEditingSinalId(null)
                        : openMiniCard(sinal, e)
                    }
                  >
                    Registrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingSinalId && miniCardPosition && (
        <div
          className="fixed bg-white border border-gray-300 shadow-lg rounded p-3 z-50"
          style={{
            top: miniCardPosition.top,
            left: miniCardPosition.left,
            width: `${MINI_CARD_WIDTH}px`,
          }}
        >
          <p className="text-sm font-semibold text-black mb-2">Atualizar Sinais Vitais</p>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-black">
              Pressão:
              <input
                className="block w-full mt-1 p-1 border rounded text-sm text-black"
                value={updatedSinal.pressao}
                onChange={(e) =>
                  setUpdatedSinal((prev) => ({ ...prev, pressao: e.target.value }))
                }
              />
            </label>

            <label className="text-xs text-black">
              Frequência:
              <input
                className="block w-full mt-1 p-1 border rounded text-sm text-black"
                value={updatedSinal.frequencia}
                onChange={(e) =>
                  setUpdatedSinal((prev) => ({ ...prev, frequencia: e.target.value }))
                }
              />
            </label>

            <label className="text-xs text-black">
              Temperatura:
              <input
                className="block w-full mt-1 p-1 border rounded text-sm text-black"
                value={updatedSinal.temperatura}
                onChange={(e) =>
                  setUpdatedSinal((prev) => ({ ...prev, temperatura: e.target.value }))
                }
              />
            </label>
          </div>

          <button
            onClick={handleConfirm}
            className="mt-3 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition text-sm"
          >
            Confirmar
          </button>
        </div>
      )}
    </main>
  )
}

export default SinaisVitaisPage
