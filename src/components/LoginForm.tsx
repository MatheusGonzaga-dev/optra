import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type LoginFormProps = {
  onSuccess?: () => void;
};

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { signIn, usuario, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && usuario) {
      // Redirect based on user profile
      const routes = {
        ADMINISTRADOR: "/admin/dashboard",
        SECRETARIA: "/secretary/dashboard",
        OPTOMETRISTA: "/optometrist/dashboard",
      };
      const redirectTo = routes[usuario.perfil] || "/";
      
      if (onSuccess) {
        onSuccess();
      }
      
      navigate(redirectTo);
    }
  }, [authLoading, usuario, onSuccess, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Preencha email e senha");
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      toast.success("Login realizado com sucesso!");
    } catch (error: any) {
      if (error?.message?.includes("Invalid login credentials")) {
        toast.error("Email ou senha incorretos");
      } else if (error?.message?.includes("Email not confirmed")) {
        toast.error("Email não confirmado. Verifique sua caixa de entrada.");
      } else {
        toast.error("Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-base">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={isLoading}
          className="h-12 text-base"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-base">Senha</Label>
          <button
            type="button"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
            onClick={() => toast.info("Funcionalidade em desenvolvimento")}
          >
            Esqueceu a senha?
          </button>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={isLoading}
            className="h-12 pr-12 text-base"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar no Sistema"
        )}
      </Button>
    </form>
  );
};

export default LoginForm;


