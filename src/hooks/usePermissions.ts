import { useAuth } from '@/contexts/AuthContext';

export function usePermissions() {
  const { permissions, isAdmin, usuario } = useAuth();

  const hasPermission = (permission: string): boolean => {
    // Se o grupo do usuário tem flag is_admin, tem acesso total
    if (isAdmin) {
      return true;
    }
    
    // Compatibilidade com perfil (modo legado)
    if (usuario?.perfil === 'ADMINISTRADOR') {
      return true;
    }
    
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList: string[]): boolean => {
    // Se o grupo do usuário tem flag is_admin, tem acesso total
    if (isAdmin) {
      return true;
    }
    
    // Compatibilidade com perfil (modo legado)
    if (usuario?.perfil === 'ADMINISTRADOR') {
      return true;
    }
    
    return permissionList.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (permissionList: string[]): boolean => {
    // Se o grupo do usuário tem flag is_admin, tem acesso total
    if (isAdmin) {
      return true;
    }
    
    // Compatibilidade com perfil (modo legado)
    if (usuario?.perfil === 'ADMINISTRADOR') {
      return true;
    }
    
    return permissionList.every(permission => permissions.includes(permission));
  };

  return {
    permissions,
    isAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}

