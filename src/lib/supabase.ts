import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

