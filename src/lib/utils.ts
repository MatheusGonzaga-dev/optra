import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Configuração centralizada da API
// Se VITE_API_URL não estiver configurada, usa URL relativa (mesmo domínio)
// Isso permite usar /api quando tudo está na Vercel
export const API_BASE_URL = import.meta.env.VITE_API_URL 
  ?? (import.meta.env.PROD ? '/api' : 'http://localhost:4000');
