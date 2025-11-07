import { useAuth } from '@/contexts/AuthContext';

export function usePermissions() {
  const { permissions, usuario } = useAuth();

  const hasPermission = (permission: string): boolean => {
    // Admin tem todas as permissões
    if (usuario?.perfil === 'admin') {
      return true;
    }
    
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList: string[]): boolean => {
    // Admin tem todas as permissões
    if (usuario?.perfil === 'admin') {
      return true;
    }
    
    return permissionList.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (permissionList: string[]): boolean => {
    // Admin tem todas as permissões
    if (usuario?.perfil === 'admin') {
      return true;
    }
    
    return permissionList.every(permission => permissions.includes(permission));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}

