import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Configuração centralizada da API
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
