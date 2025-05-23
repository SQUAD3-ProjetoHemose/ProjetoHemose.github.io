// Hook para lógica de usuários
import { useState, useCallback, useMemo } from 'react';
import useUserStore from '@/store/userStore';
import { User, UserRole } from '@/types';

// Hook para formulário de usuário
export const useUserForm = (userInicial?: Partial<User>) => {
  // Estado local do formulário
  const [formData, setFormData] = useState<Partial<User>>({
    nome: userInicial?.nome || '',
    email: userInicial?.email || '',
    tipo: userInicial?.tipo || 'recepcionista' as UserRole,
    ativo: userInicial?.ativo ?? true
  });

  // Estado para senha (não incluída no User)
  const [senha, setSenha] = useState<string>('');
  const [confirmarSenha, setConfirmarSenha] = useState<string>('');

  // Acesso às ações do store
  const { createUser, updateUser } = useUserStore();

  // Tratamento de mudanças no formulário
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'senha') {
      setSenha(value);
    } else if (name === 'confirmarSenha') {
      setConfirmarSenha(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  // Validação de formulário
  const validarFormulario = useCallback(() => {
    // Verifica se os campos obrigatórios estão preenchidos
    if (!formData.nome || !formData.email || !formData.tipo) {
      return { valido: false, mensagem: 'Preencha todos os campos obrigatórios' };
    }
    
    // Verifica se o email é válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return { valido: false, mensagem: 'Email inválido' };
    }
    
    // Verifica se a senha é necessária (novo usuário) e está correta
    if (!userInicial?.id) {
      if (!senha) {
        return { valido: false, mensagem: 'A senha é obrigatória para novos usuários' };
      }
      
      if (senha.length < 6) {
        return { valido: false, mensagem: 'A senha deve ter pelo menos 6 caracteres' };
      }
      
      if (senha !== confirmarSenha) {
        return { valido: false, mensagem: 'As senhas não coincidem' };
      }
    } else if (senha && senha !== confirmarSenha) {
      return { valido: false, mensagem: 'As senhas não coincidem' };
    }
    
    return { valido: true, mensagem: '' };
  }, [formData, senha, confirmarSenha, userInicial]);

  // Tratamento de submissão do formulário
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validacao = validarFormulario();
    if (!validacao.valido) {
      throw new Error(validacao.mensagem);
    }
    
    try {
      // Prepara os dados, incluindo senha se informada
      const userData: Partial<User & { senha?: string }> = { ...formData };
      if (senha) {
        userData.senha = senha;
      }
      
      if (userInicial?.id) {
        // Atualização de usuário existente
        return await updateUser(userInicial.id, userData);
      } else {
        // Criação de novo usuário
        return await createUser(userData);
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      throw error;
    }
  }, [formData, senha, userInicial, createUser, updateUser, validarFormulario]);

  // Reset do formulário
  const resetForm = useCallback(() => {
    setFormData({
      nome: '',
      email: '',
      tipo: 'recepcionista' as UserRole,
      ativo: true
    });
    setSenha('');
    setConfirmarSenha('');
  }, []);

  return {
    formData,
    senha,
    confirmarSenha,
    setFormData,
    setSenha,
    setConfirmarSenha,
    handleChange,
    handleSubmit,
    resetForm,
    validarFormulario
  };
};

// Hook para gerenciamento de usuários
export const useUserManager = () => {
  // Estado do componente
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
  const [filtroNome, setFiltroNome] = useState<string>('');
  const [filtroAtivo, setFiltroAtivo] = useState<boolean | null>(null);

  // Acesso ao estado e ações da store
  const { 
    users, 
    userSelecionado,
    loading, 
    error,
    fetchUsers,
    deleteUser
  } = useUserStore();

  // Buscar usuários
  const buscarUsuarios = useCallback(async () => {
    try {
      return await fetchUsers(filtroTipo);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }, [fetchUsers, filtroTipo]);

  // Usuários filtrados
  const usuariosFiltrados = useMemo(() => {
    let resultado = [...users];
    
    if (filtroNome) {
      resultado = resultado.filter(u => 
        u.nome.toLowerCase().includes(filtroNome.toLowerCase()) ||
        u.email.toLowerCase().includes(filtroNome.toLowerCase())
      );
    }
    
    if (filtroAtivo !== null) {
      resultado = resultado.filter(u => u.ativo === filtroAtivo);
    }
    
    return resultado;
  }, [users, filtroNome, filtroAtivo]);

  // Tipos de usuário traduzidos
  const tiposUsuario = useMemo(() => ({
    'admin': 'Administrador',
    'medico': 'Médico',
    'enfermeira': 'Enfermeira',
    'recepcionista': 'Recepcionista'
  }), []);

  return {
    // Estado
    users,
    userSelecionado,
    loading,
    error,
    filtroTipo,
    filtroNome,
    filtroAtivo,
    usuariosFiltrados,
    tiposUsuario,
    
    // Ações
    setFiltroTipo,
    setFiltroNome,
    setFiltroAtivo,
    buscarUsuarios,
    deleteUser
  };
};
            
            
/*             
  __  ____ ____ _  _ 
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
