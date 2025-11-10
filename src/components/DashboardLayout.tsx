import { ReactNode, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Calendar, FileText, Settings, LogOut, Menu, X, UserPlus, ClipboardList, DollarSign, Clock, UserCog, Package, Handshake, Receipt, TrendingUp, Tag, ChevronDown, Wrench, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import eyeLogo from "@/assets/eye-logo-white.png";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "admin" | "secretary" | "optometrist";
}

type MenuItem = {
  icon: LucideIcon;
  label: string;
  path?: string;
  children?: MenuItem[];
  permission?: string; // Permissão necessária para visualizar este item
};

const DashboardLayout = ({
  children,
  role
}: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, usuario } = useAuth();
  const { hasPermission } = usePermissions();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Atendimento: true,
    Cadastros: true,
    Financeiro: true,
    Ferramentas: true,
    Relatórios: true
  });
  const roleNames = {
    admin: "Administrador",
    secretary: "Secretaria",
    optometrist: "Optometrista"
  };
  const menuItems: Record<DashboardLayoutProps["role"], MenuItem[]> = {
    admin: [{
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/admin/dashboard",
      permission: "dashboard.view"
    }, {
      icon: ClipboardList,
      label: "Atendimento",
      children: [{
        icon: Clock,
        label: "Fila de Atendimento",
        path: "/admin/queue",
        permission: "fila.view"
      }, {
        icon: ClipboardList,
        label: "Histórico de Atendimentos",
        path: "/admin/appointments",
        permission: "atendimentos.view"
      }]
    }, {
      icon: UserPlus,
      label: "Cadastros",
      children: [{
        icon: Users,
        label: "Pacientes",
        path: "/admin/patients",
        permission: "pacientes.view"
      }, {
        icon: Handshake,
        label: "Parcerias",
        path: "/admin/partnerships",
        permission: "parcerias.view"
      }, {
        icon: Package,
        label: "Serviços",
        path: "/admin/services",
        permission: "servicos.view"
      }, {
        icon: Tag,
        label: "Categorias",
        path: "/admin/categories",
        permission: "categorias.view"
      }]
    }, {
      icon: DollarSign,
      label: "Financeiro",
      children: [{
        icon: Receipt,
        label: "Contas a Pagar",
        path: "/admin/expenses",
        permission: "contas_pagar.view"
      }, {
        icon: TrendingUp,
        label: "Contas a Receber",
        path: "/admin/receivables",
        permission: "contas_receber.view"
      }]
    }, {
      icon: Wrench,
      label: "Ferramentas",
      children: [{
        icon: Shield,
        label: "Grupos",
        path: "/admin/groups",
        permission: "grupos.view"
      }, {
        icon: UserCog,
        label: "Acessos",
        path: "/admin/access",
        permission: "usuarios.view"
      }]
    }, {
      icon: FileText,
      label: "Relatórios",
      permission: "relatorios.view",
      children: [{
        icon: FileText,
        label: "Visão Geral",
        path: "/admin/reports",
        permission: "relatorios.view"
      }, {
        icon: Handshake,
        label: "Parcerias",
        path: "/admin/reports?tab=parcerias",
        permission: "relatorios.view"
      }]
    }, {
      icon: Settings,
      label: "Configurações",
      path: "/admin/settings"
    }],
    secretary: [{
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/secretary/dashboard"
    }, {
      icon: Users,
      label: "Pacientes",
      path: "/secretary/patients"
    }, {
      icon: Calendar,
      label: "Agenda",
      path: "/secretary/schedule"
    }, {
      icon: Clock,
      label: "Fila",
      path: "/secretary/queue"
    }],
    optometrist: [{
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/optometrist/dashboard"
    }, {
      icon: Clock,
      label: "Fila de Atendimento",
      path: "/optometrist/queue"
    }, {
      icon: Calendar,
      label: "Agenda",
      path: "/optometrist/schedule"
    }, {
      icon: ClipboardList,
      label: "Atendimentos",
      path: "/optometrist/appointments"
    }]
  };

  const toggleSection = (label: string) => {
    setOpenSections(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso");
      navigate("/login");
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo com erro, redireciona para login
      navigate("/login");
    }
  };

  // Filtrar menu items baseado nas permissões do usuário
  const filterMenuItemsByPermissions = (items: MenuItem[]): MenuItem[] => {
    // Se for ADMINISTRADOR (perfil), mostra tudo
    if (usuario?.perfil === 'ADMINISTRADOR') {
      return items;
    }

    return items
      .map(item => {
        // Se o item tem children, filtrar os children
        if (item.children) {
          const filteredChildren = item.children.filter(child => {
            // Se não tem permissão definida, mostra o item
            if (!child.permission) return true;
            // Se tem permissão, verifica se o usuário tem essa permissão
            return hasPermission(child.permission);
          });

          // Se não sobrou nenhum child após o filtro, não mostra o item pai
          if (filteredChildren.length === 0) return null;

          return {
            ...item,
            children: filteredChildren
          };
        }

        // Se o item não tem children, verifica a permissão dele diretamente
        if (item.permission && !hasPermission(item.permission)) {
          return null;
        }

        return item;
      })
      .filter((item): item is MenuItem => item !== null);
  };

  const currentMenuItems = useMemo(() => {
    const filtered = filterMenuItemsByPermissions(menuItems[role]);
    console.log('Menu filtrado:', filtered);
    console.log('Perfil do usuário:', usuario?.perfil);
    return filtered;
  }, [role, usuario?.perfil, hasPermission]);
  const isRouteActive = (target?: string) => {
    if (!target) return false;
    const [path, search] = target.split("?");
    if (search !== undefined) {
      return location.pathname === path && location.search === `?${search}`;
    }
    return location.pathname === path;
  };
  return <div className="min-h-screen w-full bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-500 to-blue-600 border-b border-blue-700 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center p-1">
            <img src={eyeLogo} alt="Optra Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-lg text-white">Optra</span>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </header>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 text-white z-50 transition-transform duration-300 shadow-2xl ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 flex flex-col`}>
        <div className="p-6 border-b border-white/20 bg-gradient-to-r from-blue-600 to-blue-500">
          <div className="flex items-center gap-3 mb-2 animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center p-2 shadow-lg animate-pulse">
              <img src={eyeLogo} alt="Optra Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-extrabold text-white drop-shadow-lg">Optra System</span>
          </div>
          <p className="text-sm text-white/90 mt-2 font-medium">{roleNames[role]}</p>
        </div>

        <nav className="p-4 flex-1 overflow-y-auto hide-scrollbar">
          <ul className="space-y-2">
            {currentMenuItems.map((item, index) => {
            const isActive = item.path ? isRouteActive(item.path) : false;
            if (item.children && item.children.length > 0) {
              const hasActiveChild = item.children.some(child => child.path && isRouteActive(child.path));
              const isOpen = openSections[item.label] ?? true;
              return <li key={item.label} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <button type="button" onClick={() => toggleSection(item.label)} className={`flex w-full items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover-scale ${hasActiveChild ? "bg-white/20 text-white font-semibold shadow-lg backdrop-blur-sm" : "hover:bg-white/10 text-white/90"}`}>
                      <div className="flex items-center gap-3">
                        <item.icon size={20} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`} />
                    </button>
                    {isOpen && <ul className="mt-2 space-y-1 pl-8">
                        {item.children.map(child => {
                        const childActive = child.path ? isRouteActive(child.path) : false;
                        return <li key={child.path}>
                              <Link to={child.path || "#"} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 hover-scale ${childActive ? "bg-white/20 text-white font-semibold shadow" : "hover:bg-white/10 text-white/90"}`}>
                                <child.icon size={18} />
                                <span>{child.label}</span>
                              </Link>
                            </li>;
                      })}
                      </ul>}
                  </li>;
            }
            return <li key={item.path} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <Link to={item.path || "#"} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover-scale ${isActive ? "bg-white/20 text-white font-semibold shadow-lg backdrop-blur-sm" : "hover:bg-white/10 text-white/90"}`}>
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>;
          })}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/20 bg-gradient-to-r from-blue-700 to-blue-600">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/20 hover-scale transition-all duration-300" onClick={handleLogout}>
            <LogOut size={20} className="mr-3" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>;
};
export default DashboardLayout;