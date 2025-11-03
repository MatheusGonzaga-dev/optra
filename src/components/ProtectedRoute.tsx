import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { PerfilUsuario } from '@/lib/supabase';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedProfiles?: PerfilUsuario[];
}

export function ProtectedRoute({ children, allowedProfiles }: ProtectedRouteProps) {
  const { usuario, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !usuario) {
      navigate('/login');
    } else if (!loading && usuario && allowedProfiles && !allowedProfiles.includes(usuario.perfil)) {
      navigate('/unauthorized');
    }
  }, [usuario, loading, navigate, allowedProfiles]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!usuario) {
    return null;
  }

  if (allowedProfiles && !allowedProfiles.includes(usuario.perfil)) {
    return null;
  }

  return <>{children}</>;
}

