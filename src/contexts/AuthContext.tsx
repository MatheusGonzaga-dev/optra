import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Usuario } from '@/lib/supabase';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/utils';

interface Consultorio {
  id: string;
  nome: string;
  descricao?: string;
}

interface AuthContextType {
  user: User | null;
  usuario: Usuario | null;
  loading: boolean;
  permissions: string[];
  isAdmin: boolean;
  consultorioAtivo: Consultorio | null;
  precisaSelecionarConsultorio: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: (reason?: 'manual' | 'timeout') => Promise<void>;
  selecionarConsultorio: (consultorio: Consultorio) => Promise<void>;
  liberarConsultorio: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos
const LAST_ACTIVITY_STORAGE_KEY = 'optra:lastActivity';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [consultorioAtivo, setConsultorioAtivo] = useState<Consultorio | null>(null);
  const [precisaSelecionarConsultorio, setPrecisaSelecionarConsultorio] = useState(false);
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef<number | null>(null);

  const clearInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  };

  const updateLastActivity = () => {
    const now = Date.now();
    localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(now));
    return now;
  };

  const isSessionExpired = () => {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_STORAGE_KEY);
    if (!lastActivity) return false;
    const elapsed = Date.now() - Number(lastActivity);
    return elapsed > INACTIVITY_TIMEOUT_MS;
  };

  const scheduleInactivityTimeout = () => {
    clearInactivityTimer();
    inactivityTimerRef.current = window.setTimeout(() => {
      signOut('timeout');
    }, INACTIVITY_TIMEOUT_MS);
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        if (isSessionExpired()) {
          signOut('timeout');
          return;
        }
        setUser(session.user);
        fetchUsuario(session.user.id);
      } else {
        clearInactivityTimer();
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        if (isSessionExpired()) {
          signOut('timeout');
          return;
        }
        setUser(session.user);
        fetchUsuario(session.user.id);
      } else {
        clearInactivityTimer();
        localStorage.removeItem(LAST_ACTIVITY_STORAGE_KEY);
        setUser(null);
        setUsuario(null);
        setPermissions([]);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUsuario = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .eq('ativo', true)
        .is('deletado_em', null)
        .single();

      if (error) throw error;
      
      // Mapear grupo_id para grupo_acesso_id para consistência
      const usuarioData = {
        ...data,
        grupo_acesso_id: data.grupo_id || null,
      };
      
      setUsuario(usuarioData as Usuario);
      updateLastActivity();
      scheduleInactivityTimeout();
      
      // Buscar permissões se o usuário tiver grupo de acesso
      // Usar grupo_id (nome da coluna no banco) ou grupo_acesso_id (mapeado)
      const grupoId = data.grupo_id || usuarioData.grupo_acesso_id;
      console.log('🔍 Debug fetchUsuario:', {
        userId: data.id,
        grupo_id: data.grupo_id,
        grupo_acesso_id: usuarioData.grupo_acesso_id,
        grupoIdFinal: grupoId
      });
      if (grupoId) {
        console.log('✅ Buscando permissões para grupo:', grupoId);
        await fetchPermissions(grupoId, data.id);
      } else {
        console.warn('⚠️ Usuário não tem grupo de acesso definido');
        setPermissions([]);
        setIsAdmin(false);
        setPrecisaSelecionarConsultorio(false);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      toast.error('Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async (grupoId: string, usuarioId: string) => {
    try {
      console.log('🔍 Buscando permissões para grupo_id:', grupoId);
      
      // Primeiro, buscar os IDs das permissões do grupo
      const { data: grupoPermissoes, error: grupoError } = await supabase
        .from('grupo_permissoes')
        .select('permissao_id')
        .eq('grupo_id', grupoId);

      if (grupoError) {
        console.error('❌ Erro ao buscar grupo_permissoes:', grupoError);
        throw grupoError;
      }

      console.log('📋 Permissões do grupo (IDs):', grupoPermissoes);

      if (!grupoPermissoes || grupoPermissoes.length === 0) {
        console.warn('⚠️ Nenhuma permissão encontrada para o grupo:', grupoId);
        setPermissions([]);
        return;
      }

      // Buscar os códigos das permissões
      const permissaoIds = grupoPermissoes.map((gp: any) => gp.permissao_id);
      const { data: permissoes, error: permissoesError } = await supabase
        .from('permissoes')
        .select('codigo')
        .in('id', permissaoIds);

      if (permissoesError) {
        console.error('❌ Erro ao buscar códigos de permissões:', permissoesError);
        throw permissoesError;
      }

      console.log('📋 Permissões encontradas:', permissoes);
      const permissionsList = permissoes?.map((p: any) => p.codigo).filter(Boolean) || [];
      console.log('✅ Permissões carregadas (códigos):', permissionsList);
      setPermissions(permissionsList);
      
      // Verificar se precisa selecionar consultório
      const precisaConsultorio = permissionsList.includes('consultorio.selecionar');
      
      // Se precisa, verificar se já tem consultório ativo
      if (precisaConsultorio) {
        await verificarConsultorioAtivo(usuarioId);
      } else {
        setPrecisaSelecionarConsultorio(false);
      }
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      setPermissions([]);
    }
  };

  const verificarConsultorioAtivo = async (usuarioId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/consultorios/sessao/ativa/${usuarioId}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.consultorios) {
          setConsultorioAtivo({
            id: data.consultorios.id,
            nome: data.consultorios.nome,
            descricao: data.consultorios.descricao,
          });
          setPrecisaSelecionarConsultorio(false);
        } else {
          setConsultorioAtivo(null);
          setPrecisaSelecionarConsultorio(true);
        }
      } else {
        setConsultorioAtivo(null);
        setPrecisaSelecionarConsultorio(true);
      }
    } catch (error) {
      console.error('Erro ao verificar consultório ativo:', error);
      setConsultorioAtivo(null);
      setPrecisaSelecionarConsultorio(true);
    }
  };

  const selecionarConsultorio = async (consultorio: Consultorio) => {
    if (!usuario?.id) {
      toast.error('Usuário não identificado');
      return;
    }

    try {
      // Salvar no backend
      const response = await fetch(`${API_BASE_URL}/consultorios/sessao/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuario.id,
          consultorio_id: consultorio.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || 'Erro ao salvar consultório');
      }

      // Atualizar estado local
      setConsultorioAtivo(consultorio);
      setPrecisaSelecionarConsultorio(false);
      console.log('✅ Consultório selecionado e salvo:', consultorio.nome);
    } catch (error: any) {
      console.error('Erro ao selecionar consultório:', error);
      toast.error(error.message || 'Erro ao salvar consultório');
    }
  };

  const liberarConsultorio = async () => {
    if (!usuario?.id) {
      toast.error('Usuário não identificado');
      return;
    }

    if (!consultorioAtivo) {
      toast.info('Você não possui um consultório ativo');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/consultorios/sessao/finalizar/${usuario.id}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || 'Erro ao liberar consultório');
      }

      // Atualizar estado local
      const nomeConsultorio = consultorioAtivo.nome;
      setConsultorioAtivo(null);
      setPrecisaSelecionarConsultorio(false);
      toast.success(`Consultório ${nomeConsultorio} liberado com sucesso`);
      console.log('✅ Consultório liberado:', nomeConsultorio);
    } catch (error: any) {
      console.error('Erro ao liberar consultório:', error);
      toast.error(error.message || 'Erro ao liberar consultório');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        updateLastActivity();
        await fetchUsuario(data.user.id);
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw new Error(error.message || 'Erro ao fazer login');
    }
  };

  const signOut = async (reason: 'manual' | 'timeout' = 'manual') => {
    try {
      // Finalizar consultório ativo se houver
      if (usuario?.id) {
        try {
          await fetch(`${API_BASE_URL}/consultorios/sessao/finalizar/${usuario.id}`, {
            method: 'POST',
          });
        } catch (error) {
          console.error('Erro ao finalizar consultório:', error);
          // Não bloqueia o logout se houver erro
        }
      }
      
      // Limpar estado local primeiro
      clearInactivityTimer();
      setUser(null);
      setUsuario(null);
      setPermissions([]);
      setConsultorioAtivo(null);
      setPrecisaSelecionarConsultorio(false);
      localStorage.removeItem(LAST_ACTIVITY_STORAGE_KEY);
      
      // Chamar signOut do Supabase (isso já limpa os tokens automaticamente)
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      if (reason === 'timeout') {
        toast.info('Sua sessão foi encerrada por inatividade. Faça login novamente.');
      }
    } catch (error: any) {
      console.error('Erro ao sair:', error);
      // Mesmo com erro, garante limpeza do estado
      setUser(null);
      setUsuario(null);
      setPermissions([]);
      setConsultorioAtivo(null);
      setPrecisaSelecionarConsultorio(false);
      localStorage.removeItem(LAST_ACTIVITY_STORAGE_KEY);
      if (reason === 'manual') {
        toast.error('Erro ao sair do sistema');
      } else {
        toast.error('Sua sessão foi encerrada por inatividade, mas ocorreu um erro ao confirmar o logout.');
      }
    }
  };

  useEffect(() => {
    if (!user) {
      clearInactivityTimer();
      return;
    }

    const handleActivity = () => {
      updateLastActivity();
      scheduleInactivityTimeout();
    };

    const events: Array<keyof WindowEventMap> = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((eventName) => window.addEventListener(eventName, handleActivity));
    handleActivity();

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, handleActivity));
      clearInactivityTimer();
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      usuario, 
      loading, 
      permissions,
      isAdmin,
      consultorioAtivo,
      precisaSelecionarConsultorio,
      signIn, 
      signOut,
      selecionarConsultorio,
      liberarConsultorio
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

