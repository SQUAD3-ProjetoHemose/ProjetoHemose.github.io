'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { withProtectedRoute } from '@/hooks/useAuthentication';
import { UserRole } from '@/types';
import { Badge, Edit, Search, Trash2, UserPlus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

// Interface para usuário
interface User {
  id: number;
  nome: string;
  email: string;
  tipo: 'admin' | 'medico' | 'enfermeira' | 'recepcionista';
  ativo: boolean;
  created_at: string;
  especialidade?: string;
  registroProfissional?: string;
  // Campos de compatibilidade (mantidos para backward compatibility)
  crm?: string;
  coren?: string;
}

// Interface para formulário
interface FormData {
  nome: string;
  email: string;
  senha?: string;
  tipo: 'admin' | 'medico' | 'enfermeira' | 'recepcionista';
  ativo: boolean;
  especialidade?: string;
  registroProfissional?: string;
  // Campos de compatibilidade
  crm?: string;
  coren?: string;
}

function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    senha: '',
    tipo: 'medico',
    ativo: true,
  });

  // Buscar usuários
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuários
  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTab = activeTab === 'todos' || user.tipo === activeTab;
    return matchSearch && matchTab;
  });

  // Abrir modal para criar usuário
  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      nome: '',
      email: '',
      senha: '',
      tipo: 'medico',
      ativo: true,
    });
    setShowModal(true);
  };
  // Abrir modal para editar usuário
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      senha: '',
      tipo: user.tipo,
      ativo: user.ativo,
      especialidade: user.especialidade,
      registroProfissional: user.registroProfissional || user.crm || user.coren || '',
      // Mantém compatibilidade com campos antigos
      crm: user.crm,
      coren: user.coren,
    });
    setShowModal(true);
  };

  // Manipular mudanças no formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';

      // Se editando e senha vazia, remover do payload
      const payload = { ...formData };
      if (editingUser && !payload.senha) {
        delete payload.senha;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchUsers();
        setShowModal(false);
      } else {
        console.error('Erro ao salvar usuário');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  // Excluir usuário
  const handleDelete = async (userId: number) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
    }
  };

  // Obter nome do tipo de usuário
  const getUserTypeName = (tipo: string) => {
    const types = {
      admin: 'Administrador',
      medico: 'Médico',
      enfermeira: 'Enfermeira',
      recepcionista: 'Recepcionista',
    };
    return types[tipo as keyof typeof types] || tipo;
  };

  // Obter cor do badge do tipo
  const getUserTypeColor = (tipo: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      medico: 'bg-blue-100 text-blue-800',
      enfermeira: 'bg-green-100 text-green-800',
      recepcionista: 'bg-yellow-100 text-yellow-800',
    };
    return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
        <Button onClick={openCreateModal} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Novo Usuário
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
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de filtro por tipo */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="medico">Médicos</TabsTrigger>
          <TabsTrigger value="enfermeira">Enfermeiras</TabsTrigger>
          <TabsTrigger value="recepcionista">Recepcionistas</TabsTrigger>
          <TabsTrigger value="admin">Administradores</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{user.nome}</h3>
                            <Badge className={getUserTypeColor(user.tipo)}>
                              {getUserTypeName(user.tipo)}
                            </Badge>
                            <Badge
                              className={
                                user.ativo
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {user.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                          {user.especialidade && (
                            <p className="text-sm text-gray-500">
                              Especialidade: {user.especialidade}
                            </p>
                          )}

                          {/* Exibe registro profissional unificado ou campos antigos para compatibilidade */}
                          {user.registroProfissional && (
                            <p className="text-sm text-gray-500">
                              {user.tipo === 'medico'
                                ? 'CRM'
                                : user.tipo === 'enfermeira'
                                ? 'COREN'
                                : 'Registro'}
                              : {user.registroProfissional}
                            </p>
                          )}

                          {/* Fallback para compatibilidade com dados antigos */}
                          {!user.registroProfissional && user.crm && (
                            <p className="text-sm text-gray-500">CRM: {user.crm}</p>
                          )}

                          {!user.registroProfissional && user.coren && (
                            <p className="text-sm text-gray-500">COREN: {user.coren}</p>
                          )}

                          <p className="text-xs text-gray-400 mt-2">
                            Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditModal(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhum usuário encontrado.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para criar/editar usuário */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha {editingUser && '(deixe em branco para manter)'}
                </label>
                <input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleInputChange}
                  required={!editingUser}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Usuário *
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="medico">Médico</option>
                  <option value="enfermeira">Enfermeira</option>
                  <option value="recepcionista">Recepcionista</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>{' '}
              {/* Campos específicos para médicos e enfermeiras */}
              {(formData.tipo === 'medico' || formData.tipo === 'enfermeira') && (
                <>
                  {formData.tipo === 'medico' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Especialidade
                      </label>
                      <input
                        type="text"
                        name="especialidade"
                        value={formData.especialidade || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Cardiologia, Neurologia..."
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.tipo === 'medico' ? 'CRM' : 'COREN'}
                    </label>
                    <input
                      type="text"
                      name="registroProfissional"
                      value={formData.registroProfissional || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={formData.tipo === 'medico' ? 'Ex: 12345/SP' : 'Ex: 123456/SP'}
                    />
                  </div>
                </>
              )}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="ativo"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="ativo" className="ml-2 block text-sm text-gray-700">
                  Usuário ativo
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{editingUser ? 'Atualizar' : 'Criar'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default withProtectedRoute([UserRole.ADMIN])(AdminUsersPage);

/* 
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
