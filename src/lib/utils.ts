import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Configuração centralizada da API
// Se VITE_API_URL não estiver configurada, usa URL relativa (mesmo domínio)
// Isso permite usar /api quando tudo está na Vercel
export const API_BASE_URL = (() => {
  // Log inicial para debug
  console.log('🔍 DEBUG API_BASE_URL - Iniciando verificação...');
  console.log('🔍 VITE_API_URL existe?', !!import.meta.env.VITE_API_URL);
  console.log('🔍 VITE_API_URL valor:', import.meta.env.VITE_API_URL);
  console.log('🔍 PROD:', import.meta.env.PROD);
  console.log('🔍 Hostname:', window.location.hostname);
  
  // Se VITE_API_URL estiver definida, usa ela
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL;
    console.log('✅ API_BASE_URL configurado:', url);
    return url;
  }
  
  // Se estiver em produção (Vercel), usa /api
  // Detecta produção verificando se não está em localhost
  const isProduction = 
    import.meta.env.PROD || 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1';
  
  const fallbackUrl = isProduction ? '/api' : 'http://localhost:4000';
  console.log('⚠️ VITE_API_URL não configurada. Usando fallback:', fallbackUrl);
  console.log('⚠️ isProduction:', isProduction);
  
  return fallbackUrl;
})();

// Log final
console.log('🎯 API_BASE_URL FINAL:', API_BASE_URL);
