import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Users, Calendar, DollarSign, TrendingUp, Clock, CheckCircle, FileText, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface DashboardStats {
  pacientesAtivos: {
    value: string;
    description: string;
    trend: { value: string; positive: boolean };
  };
  consultasHoje: {
    value: string;
    description: string;
    trend: { value: string; positive: boolean };
  };
  faturamentoMes: {
    value: string;
    description: string;
    trend: { value: string; positive: boolean };
  };
  taxaConclusao: {
    value: string;
    description: string;
    trend: { value: string; positive: boolean };
  };
}

interface RecentAppointment {
  patient: string;
  time: string;
  status: "completed" | "in-progress" | "waiting";
  doctor: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:4000/dashboard/stats');
        
        if (!response.ok) {
          throw new Error('Erro ao buscar dados do dashboard');
        }

        const data = await response.json();
        setStats(data.stats);
        setRecentAppointments(data.recentAppointments || []);
      } catch (error: any) {
        console.error('Erro ao carregar dashboard:', error);
        toast.error('Erro ao carregar dados do dashboard');
        
        // Fallback para dados padrão em caso de erro
        setStats({
          pacientesAtivos: { value: "0", description: "Total cadastrado", trend: { value: "0%", positive: true } },
          consultasHoje: { value: "0", description: "0 em andamento", trend: { value: "0%", positive: true } },
          faturamentoMes: { value: "R$ 0", description: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }), trend: { value: "0%", positive: true } },
          taxaConclusao: { value: "0%", description: "Últimos 30 dias", trend: { value: "0%", positive: true } },
        });
        setRecentAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formattedStats = stats ? [
    {
      title: "Pacientes Ativos",
      value: stats.pacientesAtivos.value,
      icon: Users,
      description: stats.pacientesAtivos.description,
      trend: stats.pacientesAtivos.trend,
    },
    {
      title: "Consultas Hoje",
      value: stats.consultasHoje.value,
      icon: Calendar,
      description: stats.consultasHoje.description,
      trend: stats.consultasHoje.trend,
    },
    {
      title: "Faturamento Mês",
      value: stats.faturamentoMes.value,
      icon: DollarSign,
      description: stats.faturamentoMes.description,
      trend: stats.faturamentoMes.trend,
    },
    {
      title: "Taxa de Conclusão",
      value: stats.taxaConclusao.value,
      icon: TrendingUp,
      description: stats.taxaConclusao.description,
      trend: stats.taxaConclusao.trend,
    },
  ] : [];

  const statusColors = {
    completed: "text-success",
    "in-progress": "text-warning",
    waiting: "text-muted-foreground",
  };

  const statusLabels = {
    completed: "Concluído",
    "in-progress": "Em Andamento",
    waiting: "Aguardando",
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando dados do dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">
            Visão geral e estatísticas do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {formattedStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Cards de acesso rápido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary"
            onClick={() => navigate("/admin/appointments")}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Histórico de Atendimentos</p>
                <p className="text-lg font-semibold text-foreground mb-2">Visualizar todos os atendimentos</p>
                <p className="text-xs text-muted-foreground">
                  Acesse prontuários, filtre por profissional e veja estatísticas completas
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-chart-1/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-chart-1" />
              </div>
            </div>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary"
            onClick={() => navigate("/admin/reports")}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Relatórios e Análises</p>
                <p className="text-lg font-semibold text-foreground mb-2">Análises administrativas</p>
                <p className="text-xs text-muted-foreground">
                  Produtividade, comparações e indicadores visuais de desempenho
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-chart-2" />
              </div>
            </div>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary"
            onClick={() => navigate("/admin/financial")}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Dashboard Financeira</p>
                <p className="text-lg font-semibold text-foreground mb-2">Controle financeiro completo</p>
                <p className="text-xs text-muted-foreground">
                  Receitas, despesas, recibos e relatórios financeiros detalhados
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Atendimentos Recentes</h3>
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {recentAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum atendimento recente
                </p>
              ) : (
                recentAppointments.map((appointment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {appointment.patient.split(" ")[0]?.[0] || ''}
                        {appointment.patient.split(" ")[1]?.[0] || ''}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{appointment.patient}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.doctor}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{appointment.time}</p>
                    <p
                      className={`text-xs ${
                        statusColors[appointment.status as keyof typeof statusColors]
                      }`}
                    >
                      {statusLabels[appointment.status as keyof typeof statusLabels]}
                    </p>
                  </div>
                </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Tarefas Pendentes</h3>
              <CheckCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {[
                "Revisar relatório financeiro mensal",
                "Aprovar folgas da equipe",
                "Atualizar cadastro de fornecedores",
                "Reunião com equipe técnica",
              ].map((task, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors cursor-pointer"
                >
                  <div className="w-5 h-5 rounded border-2 border-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{task}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
