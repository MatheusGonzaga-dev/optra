import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockAppointments, mockDoctors, mockPayments } from "@/data/mockData";
import { TrendingUp, Users, DollarSign, Calendar, Download, BarChart3 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

const AdminReports = () => {
  // Estatísticas gerais
  const totalAppointments = mockAppointments.length;
  const totalRevenue = mockPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const avgTicket = totalRevenue / totalAppointments;

  // Produtividade por profissional
  const productivityByDoctor = mockDoctors.map(doctor => {
    const doctorAppointments = mockAppointments.filter(apt => apt.doctorId === doctor.id);
    const doctorPayments = mockPayments.filter(payment => {
      const apt = mockAppointments.find(a => a.patientName === payment.patient);
      return apt?.doctorId === doctor.id;
    });
    const revenue = doctorPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      name: doctor.name.split(' ')[1],
      fullName: doctor.name,
      atendimentos: doctorAppointments.length,
      receita: revenue,
      ticketMedio: revenue / doctorAppointments.length || 0
    };
  });

  // Comparação de faturamento (últimos 6 meses - dados simulados)
  const revenueComparison = [
    { mes: "Ago", atual: 15200, anterior: 14300 },
    { mes: "Set", atual: 16800, anterior: 15100 },
    { mes: "Out", atual: 18200, anterior: 16900 },
    { mes: "Nov", atual: 17500, anterior: 18000 },
    { mes: "Dez", atual: 19800, anterior: 17200 },
    { mes: "Jan", atual: 21300, anterior: 19500 },
  ];

  // Atendimentos ao longo do tempo (última semana)
  const appointmentsOverTime = [
    { dia: "Seg", quantidade: 12 },
    { dia: "Ter", quantidade: 8 },
    { dia: "Qua", quantidade: 15 },
    { dia: "Qui", quantidade: 6 },
    { dia: "Sex", quantidade: 13 },
    { dia: "Sáb", quantidade: 0 },
    { dia: "Dom", quantidade: 0 },
  ];

  const handleExportReport = (reportType: string) => {
    toast.success(`Relatório de ${reportType} exportado com sucesso!`);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios e Análises</h1>
            <p className="text-muted-foreground mt-1">Análises completas de desempenho e produtividade</p>
          </div>
          <Button onClick={() => handleExportReport("geral")}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório Geral
          </Button>
        </div>

        {/* Cards de resumo executivo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Atendimentos</p>
                <p className="text-3xl font-bold text-foreground mt-2">{totalAppointments}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-xs text-success">+8.2% vs período anterior</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  R$ {totalRevenue.toFixed(2)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-xs text-success">+12.5% vs período anterior</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  R$ {avgTicket.toFixed(2)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-xs text-success">+3.8% vs período anterior</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-chart-2" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profissionais Ativos</p>
                <p className="text-3xl font-bold text-foreground mt-2">{mockDoctors.length}</p>
                <p className="text-xs text-muted-foreground mt-2">em atividade</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-chart-3" />
              </div>
            </div>
          </Card>
        </div>

        {/* Produtividade por profissional */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Produtividade por Profissional</h3>
            <Button variant="outline" onClick={() => handleExportReport("produtividade")}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productivityByDoctor}>
                <defs>
                  <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={1}/>
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" className="opacity-50" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="atendimentos" 
                  fill="url(#barGradient1)" 
                  name="Atendimentos" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productivityByDoctor}>
                <defs>
                  <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={1}/>
                    <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" className="opacity-50" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="receita" 
                  fill="url(#barGradient2)" 
                  name="Receita (R$)" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Profissional</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">Atendimentos</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Receita</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Ticket Médio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {productivityByDoctor.map((doctor, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{doctor.fullName}</td>
                      <td className="px-4 py-3 text-center">{doctor.atendimentos}</td>
                      <td className="px-4 py-3 text-right text-success font-semibold">
                        R$ {doctor.receita.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        R$ {doctor.ticketMedio.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Análise comparativa de faturamento */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Análise Comparativa de Faturamento</h3>
            <Button variant="outline" onClick={() => handleExportReport("faturamento")}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenueComparison}>
              <defs>
                <linearGradient id="lineGradient1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="lineGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" className="opacity-50" />
              <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="atual" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={3}
                fill="url(#lineGradient1)"
                name="Período Atual"
                dot={{ fill: 'hsl(var(--chart-1))', r: 5 }}
                activeDot={{ r: 7, fill: 'hsl(var(--chart-1))' }}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
              <Line 
                type="monotone" 
                dataKey="anterior" 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#lineGradient2)"
                name="Período Anterior"
                dot={{ fill: 'hsl(var(--muted-foreground))', r: 4 }}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Atendimentos ao longo do tempo */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Atendimentos por Período</h3>
            <Button variant="outline" onClick={() => handleExportReport("atendimentos")}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentsOverTime}>
              <defs>
                <linearGradient id="barGradient3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={1}/>
                  <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" className="opacity-50" />
              <XAxis dataKey="dia" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar 
                dataKey="quantidade" 
                fill="url(#barGradient3)" 
                name="Atendimentos" 
                radius={[8, 8, 0, 0]}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
