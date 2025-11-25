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
  const { usuario, loading, isAdmin } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  let hasAccess = true;

  // Se o usuário é admin, tem acesso total
  if (isAdmin) {
    hasAccess = true;
  } else {
    // Se o usuário tem grupo de acesso, sempre validar por permissões (não por perfil)
    const temGrupoAcesso = usuario.grupo_acesso_id || usuario.grupo_id;
    
    // Se tem grupo de acesso, SEMPRE validar por permissões, nunca por perfil
    if (temGrupoAcesso) {
      // Se tem grupo de acesso mas não tem permissão especificada na rota, negar acesso
      if (permission) {
        hasAccess = hasPermission(permission);
      } else if (anyPermissions && anyPermissions.length > 0) {
        hasAccess = hasAnyPermission(anyPermissions);
      } else if (allPermissions && allPermissions.length > 0) {
        hasAccess = hasAllPermissions(allPermissions);
      } else if (allowedProfiles && allowedProfiles.length > 0) {
        // Se tem grupo mas rota usa allowedProfiles, negar (deve usar permission)
        hasAccess = false;
      }
    } else {
      // Sem grupo de acesso, usar validação por perfil (modo legado/compatibilidade)
      if (permission) {
        hasAccess = hasPermission(permission);
      } else if (anyPermissions && anyPermissions.length > 0) {
        hasAccess = hasAnyPermission(anyPermissions);
      } else if (allPermissions && allPermissions.length > 0) {
        hasAccess = hasAllPermissions(allPermissions);
      } else if (allowedProfiles && allowedProfiles.length > 0) {
        hasAccess = allowedProfiles.includes(usuario.perfil);
      }
    }
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
