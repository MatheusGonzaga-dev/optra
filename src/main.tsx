import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { API_BASE_URL } from "./lib/utils";

// Log inicial para garantir que está sendo executado
console.log('🚀 App iniciando...');
console.log('🚀 API_BASE_URL no main:', API_BASE_URL);
console.log('🚀 VITE_API_URL:', import.meta.env.VITE_API_URL);

createRoot(document.getElementById("root")!).render(<App />);
