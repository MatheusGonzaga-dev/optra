import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação mais amigável - não quebra a aplicação
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl ? '✅' : '❌',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? '✅' : '❌',
  });
  
  // Em desenvolvimento, mostra erro mas não quebra
  if (import.meta.env.DEV) {
    console.warn('⚠️ Supabase não configurado. Configure as variáveis de ambiente.');
  }
}

// Cria cliente mesmo sem variáveis (para não quebrar a aplicação)
// O erro será tratado quando tentar usar o cliente
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// Função helper para verificar se está configurado
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

export type PerfilUsuario = 'ADMINISTRADOR' | 'SECRETARIA' | 'OPTOMETRISTA';

export interface Usuario {
  id: string;
  nome_completo: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  crm?: string;
  estado_crm?: string;
}

