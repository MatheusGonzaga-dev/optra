import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Users, Calendar, DollarSign, TrendingUp, Clock, CheckCircle, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const stats = [
    {
      title: "Pacientes Ativos",
      value: "1.247",
      icon: Users,
      description: "Total cadastrado",
      trend: { value: "12%", positive: true },
    },
    {
      title: "Consultas Hoje",
      value: "28",
      icon: Calendar,
      description: "5 em andamento",
      trend: { value: "8%", positive: true },
    },
    {
      title: "Faturamento Mês",
      value: "R$ 45.8k",
      icon: DollarSign,
      description: "Dezembro 2024",
      trend: { value: "15%", positive: true },
    },
    {
      title: "Taxa de Conclusão",
      value: "94%",
      icon: TrendingUp,
      description: "Últimos 30 dias",
      trend: { value: "3%", positive: true },
    },
  ];

  const recentAppointments = [
    { patient: "Maria Silva", time: "09:00", status: "completed", doctor: "Dr. João" },
    { patient: "José Santos", time: "10:30", status: "in-progress", doctor: "Dra. Ana" },
    { patient: "Ana Costa", time: "11:00", status: "waiting", doctor: "Dr. João" },
    { patient: "Pedro Lima", time: "14:00", status: "waiting", doctor: "Dra. Ana" },
  ];

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
          {stats.map((stat) => (
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
              {recentAppointments.map((appointment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {appointment.patient.split(" ")[0][0]}
                        {appointment.patient.split(" ")[1][0]}
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
              ))}
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
