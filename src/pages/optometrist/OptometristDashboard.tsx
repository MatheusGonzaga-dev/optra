import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { FileText, ClipboardCheck, Pill, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const OptometristDashboard = () => {
  const navigate = useNavigate();
  
  const stats = [
    {
      title: "Atendimentos Hoje",
      value: "12",
      icon: Users,
      description: "Pacientes atendidos",
      trend: { value: "8%", positive: true },
      metricType: "atendimentos",
    },
    {
      title: "Prescrições Emitidas",
      value: "10",
      icon: FileText,
      description: "Hoje",
      trend: { value: "12%", positive: true },
      metricType: "prescricoes",
    },
    {
      title: "Exames Realizados",
      value: "15",
      icon: ClipboardCheck,
      description: "Hoje",
      trend: { value: "3%", positive: false },
      metricType: "exames",
    },
  ];

  const weeklyData = [
    { day: "Seg", atendimentos: 8, prescricoes: 6 },
    { day: "Ter", atendimentos: 12, prescricoes: 10 },
    { day: "Qua", atendimentos: 10, prescricoes: 8 },
    { day: "Qui", atendimentos: 15, prescricoes: 12 },
    { day: "Sex", atendimentos: 12, prescricoes: 10 },
    { day: "Sáb", atendimentos: 6, prescricoes: 4 },
  ];

  const quickActions = [
    {
      title: "Fila de Atendimento",
      description: "Ver pacientes aguardando",
      action: () => navigate("/optometrist/queue"),
      color: "bg-primary",
    },
    {
      title: "Histórico de Atendimentos",
      description: "Ver atendimentos realizados hoje",
      action: () => navigate("/optometrist/appointments"),
      color: "bg-secondary",
    },
  ];

  return (
    <DashboardLayout role="optometrist">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard - Optometrista</h1>
          <p className="text-muted-foreground">
            Acompanhe suas métricas diárias e desempenho
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <StatCard 
              key={stat.title} 
              {...stat} 
              onClick={() => navigate(`/optometrist/metrics/${stat.metricType}`)}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 animate-fade-in">
            <h3 className="text-lg font-semibold mb-6">Atendimentos da Semana</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <defs>
                  <linearGradient id="optLineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="atendimentos"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={3}
                  fill="url(#optLineGradient)"
                  name="Atendimentos"
                  dot={{ fill: 'hsl(var(--chart-1))', r: 5 }}
                  activeDot={{ r: 7, fill: 'hsl(var(--chart-1))' }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <h3 className="text-lg font-semibold mb-6">Prescrições da Semana</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <defs>
                  <linearGradient id="optBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={1}/>
                    <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                />
                <Bar 
                  dataKey="prescricoes" 
                  fill="url(#optBarGradient)" 
                  name="Prescrições" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Ações Rápidas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={action.action}
                className="p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-accent transition-all duration-200 text-left group"
              >
                <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  {action.title}
                </h4>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OptometristDashboard;
