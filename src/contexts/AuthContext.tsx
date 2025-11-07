import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Usuario } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  usuario: Usuario | null;
  loading: boolean;
  permissions: string[];
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUsuario(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUsuario(session.user.id);
      } else {
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
        .from('grupo_permissao')
        .select('permissoes(nome)')
        .eq('grupo_id', grupoId);

      if (error) throw error;
      
      const permissionsList = data?.map((item: any) => item.permissoes?.nome).filter(Boolean) || [];
      setPermissions(permissionsList);
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
        await fetchUsuario(data.user.id);
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw new Error(error.message || 'Erro ao fazer login');
    }
  };

  const signOut = async () => {
    try {
      // Limpar estado local primeiro
      setUser(null);
      setUsuario(null);
      setPermissions([]);
      
      // Chamar signOut do Supabase (isso já limpa os tokens automaticamente)
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Erro ao sair:', error);
      // Mesmo com erro, garante limpeza do estado
      setUser(null);
      setUsuario(null);
      setPermissions([]);
      toast.error('Erro ao sair do sistema');
    }
  };

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

