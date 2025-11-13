import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { isSupabaseConfigured } from "@/lib/supabase";
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
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedProfiles={['ADMINISTRADOR']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/patients" element={<ProtectedRoute allowedProfiles={['ADMINISTRADOR']}><PatientList /></ProtectedRoute>} />
            <Route path="/admin/patient/:id" element={<ProtectedRoute allowedProfiles={['ADMINISTRADOR']}><PatientDetails /></ProtectedRoute>} />
            <Route path="/admin/queue" element={<ProtectedRoute allowedProfiles={['ADMINISTRADOR']}><SecretaryQueue /></ProtectedRoute>} />
            <Route path="/admin/attendance/:id" element={<ProtectedRoute allowedProfiles={['ADMINISTRADOR']}><PatientAttendance /></ProtectedRoute>} />
            <Route path="/admin/financial" element={<ProtectedRoute allowedProfiles={['ADMINISTRADOR']}><AdminFinancial /></ProtectedRoute>} />
            <Route path="/admin/appointments" element={<ProtectedRoute allowedProfiles={['ADMINISTRADOR']}><AdminAppointmentHistory /></ProtectedRoute>} />
            <Route path="/admin/appointment/:id" element={<ProtectedRoute allowedProfiles={['ADMINISTRADOR']}><AdminAppointmentDetails /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedProfiles={['ADMINISTRADOR']}><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/services" element={<ProtectedRoute allowedProfiles={['ADMINISTRADOR']}><AdminServices /></ProtectedRoute>} />
            <Route path="/admin/partnerships" element={<ProtectedRoute allowedProfiles={['ADMINISTRADOR']}><AdminPartnerships /></ProtectedRoute>} />
            <Route path="/admin/expenses" element={<ProtectedRoute allowedProfiles={['ADMINISTRADOR']}><AdminExpenses /></ProtectedRoute>} />
            <Route path="/admin/receivables" element={<ProtectedRoute allowedProfiles={['ADMINISTRADOR']}><AdminReceivables /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute allowedProfiles={['ADMINISTRADOR']}><AdminCategories /></ProtectedRoute>} />
            <Route path="/admin/groups" element={<ProtectedRoute allowedProfiles={['ADMINISTRADOR']}><AdminGroups /></ProtectedRoute>} />
            <Route path="/admin/access" element={<ProtectedRoute allowedProfiles={['ADMINISTRADOR']}><AdminAccess /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedProfiles={['ADMINISTRADOR']}><AdminSettings /></ProtectedRoute>} />
            
            {/* Secretary Routes */}
            <Route path="/secretary/dashboard" element={<ProtectedRoute allowedProfiles={['SECRETARIA']}><SecretaryDashboard /></ProtectedRoute>} />
            <Route path="/secretary/patients" element={<ProtectedRoute allowedProfiles={['SECRETARIA']}><PatientList /></ProtectedRoute>} />
            <Route path="/secretary/patient/:id" element={<ProtectedRoute allowedProfiles={['SECRETARIA']}><PatientDetails /></ProtectedRoute>} />
            <Route path="/secretary/schedule" element={<ProtectedRoute allowedProfiles={['SECRETARIA']}><SecretarySchedule /></ProtectedRoute>} />
            <Route path="/secretary/queue" element={<ProtectedRoute allowedProfiles={['SECRETARIA']}><SecretaryQueue /></ProtectedRoute>} />
            
            {/* Optometrist Routes */}
            <Route path="/optometrist" element={<ProtectedRoute allowedProfiles={['OPTOMETRISTA']}><OptometristDashboard /></ProtectedRoute>} />
            <Route path="/optometrist/dashboard" element={<ProtectedRoute allowedProfiles={['OPTOMETRISTA']}><OptometristDashboard /></ProtectedRoute>} />
            <Route path="/optometrist/queue" element={<ProtectedRoute allowedProfiles={['OPTOMETRISTA']}><PatientQueue /></ProtectedRoute>} />
            <Route path="/optometrist/schedule" element={<ProtectedRoute allowedProfiles={['OPTOMETRISTA']}><OptometristSchedule /></ProtectedRoute>} />
            <Route path="/optometrist/appointments" element={<ProtectedRoute allowedProfiles={['OPTOMETRISTA']}><AppointmentHistory /></ProtectedRoute>} />
            <Route path="/optometrist/appointment/:id" element={<ProtectedRoute allowedProfiles={['OPTOMETRISTA']}><AppointmentDetails /></ProtectedRoute>} />
            <Route path="/optometrist/attendance/:id" element={<ProtectedRoute allowedProfiles={['OPTOMETRISTA']}><PatientAttendance /></ProtectedRoute>} />
            <Route path="/optometrist/metrics/:metricType" element={<ProtectedRoute allowedProfiles={['OPTOMETRISTA']}><MetricDetails /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
