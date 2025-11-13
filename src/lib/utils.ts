import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Configuração centralizada da API
// Se VITE_API_URL não estiver configurada, usa URL relativa (mesmo domínio)
// Isso permite usar /api quando tudo está na Vercel
export const API_BASE_URL = (() => {
  // Se VITE_API_URL estiver definida, usa ela
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Se estiver em produção (Vercel), usa /api
  // Detecta produção verificando se não está em localhost
  const isProduction = 
    import.meta.env.PROD || 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1';
  
  return isProduction ? '/api' : 'http://localhost:4000';
})();
