import { ReactNode, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Calendar, FileText, Settings, LogOut, Menu, X, UserPlus, ClipboardList, DollarSign, Clock, UserCog, Package, Handshake, Receipt } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import eyeLogo from "@/assets/eye-logo-white.png";
interface DashboardLayoutProps {
  children: ReactNode;
  role: "admin" | "secretary" | "optometrist";
}
const DashboardLayout = ({
  children,
  role
}: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const roleNames = {
    admin: "Administrador",
    secretary: "Secretaria",
    optometrist: "Optometrista"
  };
  const menuItems = {
    admin: [{
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/admin/dashboard"
    }, {
      icon: Users,
      label: "Pacientes",
      path: "/admin/patients"
    }, {
      icon: Clock,
      label: "Fila de Atendimento",
      path: "/admin/queue"
    }, {
      icon: ClipboardList,
      label: "Histórico de Atendimentos",
      path: "/admin/appointments"
    }, {
      icon: FileText,
      label: "Relatórios",
      path: "/admin/reports"
    }, {
      icon: Package,
      label: "Serviços",
      path: "/admin/services"
    }, {
      icon: Handshake,
      label: "Parcerias",
      path: "/admin/partnerships"
    }, {
      icon: Receipt,
      label: "Despesas",
      path: "/admin/expenses"
    }, {
      icon: UserCog,
      label: "Acessos",
      path: "/admin/access"
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
  const currentMenuItems = menuItems[role];
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
      <aside className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 text-white z-50 transition-transform duration-300 shadow-2xl ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="p-6 border-b border-white/20 bg-gradient-to-r from-blue-600 to-blue-500">
          <div className="flex items-center gap-3 mb-2 animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center p-2 shadow-lg animate-pulse">
              <img src={eyeLogo} alt="Optra Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-extrabold text-white drop-shadow-lg">Optra System</span>
          </div>
          <p className="text-sm text-white/90 mt-2 font-medium">{roleNames[role]}</p>
        </div>

        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {currentMenuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return <li key={item.path} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <Link to={item.path} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover-scale ${isActive ? "bg-white/20 text-white font-semibold shadow-lg backdrop-blur-sm" : "hover:bg-white/10 text-white/90"}`}>
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