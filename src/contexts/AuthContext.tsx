import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Usuario } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  usuario: Usuario | null;
  loading: boolean;
  permissions: string[];
  signIn: (email: string, password: string) => Promise<void>;
  signOut: (reason?: 'manual' | 'timeout') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos
const LAST_ACTIVITY_STORAGE_KEY = 'optra:lastActivity';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
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
      setUsuario(data as Usuario);
      updateLastActivity();
      scheduleInactivityTimeout();
      
      // Buscar permissões se o usuário tiver grupo de acesso
      if (data?.grupo_acesso_id) {
        await fetchPermissions(data.grupo_acesso_id);
      } else {
        setPermissions([]);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      toast.error('Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async (grupoId: string) => {
    try {
      const { data, error } = await supabase
        .from('grupo_permissoes')
        .select('permissoes(codigo)')
        .eq('grupo_id', grupoId);

      if (error) throw error;
      
      const permissionsList = data?.map((item: any) => item.permissoes?.codigo).filter(Boolean) || [];
      setPermissions(permissionsList);
      console.log('Permissões carregadas:', permissionsList);
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      setPermissions([]);
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
      // Limpar estado local primeiro
      clearInactivityTimer();
      setUser(null);
      setUsuario(null);
      setPermissions([]);
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
    <AuthContext.Provider value={{ user, usuario, loading, permissions, signIn, signOut }}>
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

