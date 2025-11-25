import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { isSupabaseConfigured } from "@/lib/supabase";
import ConsultorioSelectDialog from "@/components/ConsultorioSelectDialog";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import ConfigError from "./pages/ConfigError";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFinancial from "./pages/admin/AdminFinancial";
import AdminAppointmentHistory from "./pages/admin/AdminAppointmentHistory";
import AdminAppointmentDetails from "./pages/admin/AdminAppointmentDetails";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAccess from "./pages/admin/AdminAccess";
import AdminServices from "./pages/admin/AdminServices";
import AdminPartnerships from "./pages/admin/AdminPartnerships";
import AdminExpenses from "./pages/admin/AdminExpenses";
import AdminReceivables from "./pages/admin/AdminReceivables";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminGroups from "./pages/admin/Groups";
import AdminConsultorios from "./pages/admin/AdminConsultorios";
import SecretaryDashboard from "./pages/secretary/SecretaryDashboard";
import NewPatient from "./pages/secretary/NewPatient";
import PatientList from "./pages/secretary/PatientList";
import PatientDetails from "./pages/secretary/PatientDetails";
import SecretarySchedule from "./pages/secretary/SecretarySchedule";
import SecretaryQueue from "./pages/secretary/SecretaryQueue";
import OptometristDashboard from "./pages/optometrist/OptometristDashboard";
import PatientAttendance from "./pages/optometrist/PatientAttendance";
import PatientQueue from "./pages/optometrist/PatientQueue";
import OptometristSchedule from "./pages/optometrist/OptometristSchedule";
import AppointmentHistory from "./pages/optometrist/AppointmentHistory";
import AppointmentDetails from "./pages/optometrist/AppointmentDetails";
import MetricDetails from "./pages/optometrist/MetricDetails";
import TVQueue from "./pages/TVQueue";

const queryClient = new QueryClient();

// Verificar se as variáveis de ambiente estão configuradas
const checkEnvironment = () => {
  // Em desenvolvimento, permite continuar mesmo sem variáveis
  if (import.meta.env.DEV) {
    return true;
  }
  // Em produção, verifica se está configurado
  return isSupabaseConfigured();
};

const AppContent = () => {
  const { usuario, precisaSelecionarConsultorio, selecionarConsultorio } = useAuth();

  return (
    <>
      <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/tv" element={<TVQueue />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute permission="dashboard.view"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/patients" element={<ProtectedRoute permission="pacientes.view"><PatientList /></ProtectedRoute>} />
            <Route path="/admin/patient/:id" element={<ProtectedRoute permission="pacientes.view"><PatientDetails /></ProtectedRoute>} />
            <Route path="/admin/queue" element={<ProtectedRoute permission="fila.view"><SecretaryQueue /></ProtectedRoute>} />
            <Route path="/admin/attendance/:id" element={<ProtectedRoute permission="atendimentos.view"><PatientAttendance /></ProtectedRoute>} />
            <Route path="/admin/financial" element={<ProtectedRoute permission="contas_pagar.view"><AdminFinancial /></ProtectedRoute>} />
            <Route path="/admin/appointments" element={<ProtectedRoute permission="atendimentos.view"><AdminAppointmentHistory /></ProtectedRoute>} />
            <Route path="/admin/appointment/:id" element={<ProtectedRoute permission="atendimentos.view"><AdminAppointmentDetails /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute permission="relatorios.view"><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/services" element={<ProtectedRoute permission="servicos.view"><AdminServices /></ProtectedRoute>} />
            <Route path="/admin/partnerships" element={<ProtectedRoute permission="parcerias.view"><AdminPartnerships /></ProtectedRoute>} />
            <Route path="/admin/expenses" element={<ProtectedRoute permission="contas_pagar.view"><AdminExpenses /></ProtectedRoute>} />
            <Route path="/admin/receivables" element={<ProtectedRoute permission="contas_receber.view"><AdminReceivables /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute permission="categorias.view"><AdminCategories /></ProtectedRoute>} />
            <Route path="/admin/groups" element={<ProtectedRoute permission="grupos.view"><AdminGroups /></ProtectedRoute>} />
            <Route path="/admin/access" element={<ProtectedRoute permission="usuarios.view"><AdminAccess /></ProtectedRoute>} />
            <Route path="/admin/consultorios" element={<ProtectedRoute permission="consultorio.view"><AdminConsultorios /></ProtectedRoute>} />
            <Route path="/optometrist/consultorios" element={<ProtectedRoute permission="consultorio.view"><AdminConsultorios /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute permission="configuracoes.view"><AdminSettings /></ProtectedRoute>} />
            
            {/* Secretary Routes */}
            <Route path="/secretary/dashboard" element={<ProtectedRoute permission="dashboard.view"><SecretaryDashboard /></ProtectedRoute>} />
            <Route path="/secretary/patients" element={<ProtectedRoute permission="pacientes.view"><PatientList /></ProtectedRoute>} />
            <Route path="/secretary/patient/:id" element={<ProtectedRoute permission="pacientes.view"><PatientDetails /></ProtectedRoute>} />
            <Route path="/secretary/schedule" element={<ProtectedRoute permission="agenda.view"><SecretarySchedule /></ProtectedRoute>} />
            <Route path="/secretary/queue" element={<ProtectedRoute permission="fila.view"><SecretaryQueue /></ProtectedRoute>} />
            
            {/* Optometrist Routes */}
            <Route path="/optometrist" element={<ProtectedRoute permission="dashboard.view"><OptometristDashboard /></ProtectedRoute>} />
            <Route path="/optometrist/dashboard" element={<ProtectedRoute permission="dashboard.view"><OptometristDashboard /></ProtectedRoute>} />
            <Route path="/optometrist/queue" element={<ProtectedRoute permission="fila.view"><PatientQueue /></ProtectedRoute>} />
            <Route path="/optometrist/schedule" element={<ProtectedRoute permission="agenda.view"><OptometristSchedule /></ProtectedRoute>} />
            <Route path="/optometrist/appointments" element={<ProtectedRoute permission="atendimentos.view"><AppointmentHistory /></ProtectedRoute>} />
            <Route path="/optometrist/appointment/:id" element={<ProtectedRoute permission="atendimentos.view"><AppointmentDetails /></ProtectedRoute>} />
            <Route path="/optometrist/attendance/:id" element={<ProtectedRoute permission="atendimentos.view"><PatientAttendance /></ProtectedRoute>} />
            <Route path="/optometrist/metrics/:metricType" element={<ProtectedRoute permission="dashboard.view"><MetricDetails /></ProtectedRoute>} />
            <Route path="/optometrist/patients" element={<ProtectedRoute permission="pacientes.view"><PatientList /></ProtectedRoute>} />
            <Route path="/optometrist/patient/:id" element={<ProtectedRoute permission="pacientes.view"><PatientDetails /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
      </Routes>
      
      {usuario && (
        <ConsultorioSelectDialog
          open={precisaSelecionarConsultorio}
          usuarioId={usuario.id}
          onSelect={selecionarConsultorio}
          obrigatorio={precisaSelecionarConsultorio}
        />
      )}
    </>
  );
};

const App = () => {
  // Se não estiver configurado em produção, mostra página de erro
  if (!checkEnvironment()) {
    return <ConfigError />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
