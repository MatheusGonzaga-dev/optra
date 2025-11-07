import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

interface ProtectedRouteProps {
  children: ReactNode;
  // Para compatibilidade com código existente
  allowedProfiles?: string[];
  // Para novo sistema de permissões
  permission?: string;
  anyPermissions?: string[];
  allPermissions?: string[];
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  allowedProfiles,
  permission,
  anyPermissions,
  allPermissions,
  fallback = <Navigate to="/unauthorized" replace />,
}: ProtectedRouteProps) {
  const { usuario, loading } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  let hasAccess = true;

  // Verificar por perfil (modo legado/compatibilidade)
  if (allowedProfiles && allowedProfiles.length > 0) {
    hasAccess = allowedProfiles.includes(usuario.perfil);
  }
  // Verificar por permissão (novo sistema)
  else if (permission) {
    hasAccess = hasPermission(permission);
  } else if (anyPermissions && anyPermissions.length > 0) {
    hasAccess = hasAnyPermission(anyPermissions);
  } else if (allPermissions && allPermissions.length > 0) {
    hasAccess = hasAllPermissions(allPermissions);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
