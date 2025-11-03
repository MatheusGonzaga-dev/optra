import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import eyeLogo from "@/assets/eye-logo.png";
import LoginForm from "@/components/LoginForm";

const Login = () => {
  const navigate = useNavigate();
  const { usuario, loading: authLoading } = useAuth();

  const redirectByProfile = (perfil: string) => {
    const routes = {
      ADMINISTRADOR: "/admin/dashboard",
      SECRETARIA: "/secretary/dashboard",
      OPTOMETRISTA: "/optometrist/dashboard",
    };
    navigate(routes[perfil as keyof typeof routes] || "/");
  };

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && usuario) {
      redirectByProfile(usuario.perfil);
    }
  }, [authLoading, usuario]);

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 p-4 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-700/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <Card className="w-full max-w-md p-8 md:p-10 shadow-2xl relative z-10 animate-fade-in backdrop-blur-sm bg-background/95">
        <div className="flex flex-col items-center mb-8 animate-scale-in">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4 shadow-lg animate-pulse">
            <img src={eyeLogo} alt="Optra System Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Optra Vision</h1>
          <p className="text-muted-foreground text-center">Sistema de Gestão Optométrica</p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Acesso restrito a profissionais autorizados
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
