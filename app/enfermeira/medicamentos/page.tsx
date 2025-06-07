'use client'

import { useEffect, useState } from 'react'

interface Medicamento {
  id: number
  paciente: string
  leito: string
  medicamento: string
  dosagem: string
  horario: string
}

function MedicamentosPage() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])

  useEffect(() => {
    const mockMedicamentos: Medicamento[] = [
      {
        id: 1,
        paciente: 'Fernanda Dias',
        leito: '301A',
        medicamento: 'Paracetamol',
        dosagem: '500mg',
        horario: '08:00',
      },
      {
        id: 2,
        paciente: 'José Martins',
        leito: '302B',
        medicamento: 'Amoxicilina',
        dosagem: '250mg',
        horario: '12:00',
      },
      {
        id: 3,
        paciente: 'Paula Souza',
        leito: '303C',
        medicamento: 'Dipirona',
        dosagem: '1g',
        horario: '18:00',
      },
    ]

    setMedicamentos(mockMedicamentos)
  }, [])

  return (
    <main className="p-6 bg-green-50 min-h-screen">
      <h1 className="text-3xl font-bold text-green-800 mb-6">
        Administração de Medicamentos
      </h1>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="py-3 px-6 text-left">Paciente</th>
              <th className="py-3 px-6 text-left">Leito</th>
              <th className="py-3 px-6 text-left">Medicamento</th>
              <th className="py-3 px-6 text-left">Dosagem</th>
              <th className="py-3 px-6 text-left">Horário</th>
              <th className="py-3 px-6 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {medicamentos.map((med) => (
              <tr key={med.id} className="border-b hover:bg-green-100">
                <td className="py-3 px-6 text-black">{med.paciente}</td>
                <td className="py-3 px-6 text-black">{med.leito}</td>
                <td className="py-3 px-6 text-black">{med.medicamento}</td>
                <td className="py-3 px-6 text-black">{med.dosagem}</td>
                <td className="py-3 px-6 text-black">{med.horario}</td>
                <td className="py-3 px-6">
                  <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">
                    Administrar
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

export default MedicamentosPage
