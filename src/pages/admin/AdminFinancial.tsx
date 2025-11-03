import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockPayments, mockPatients, Payment } from "@/data/mockData";
import { DollarSign, TrendingUp, TrendingDown, Download, Filter, FileText } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

const AdminFinancial = () => {
  const [filterPeriod, setFilterPeriod] = useState("today");
  const [filterMethod, setFilterMethod] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Cálculos financeiros
  const totalReceived = mockPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalExpenses = 2450.00; // Mock
  const balance = totalReceived - totalExpenses;

  // Dados para gráficos
  const paymentsByMethod = mockPayments.reduce((acc: any, payment) => {
    const existing = acc.find((item: any) => item.name === payment.method);
    if (existing) {
      existing.value += payment.amount;
    } else {
      acc.push({ name: payment.method, value: payment.amount });
    }
    return acc;
  }, []);

  const dailyRevenue = [
    { day: "Seg", valor: 890 },
    { day: "Ter", valor: 670 },
    { day: "Qua", valor: 1070 },
    { day: "Qui", valor: 450 },
    { day: "Sex", valor: 890 },
    { day: "Sáb", valor: 0 },
    { day: "Dom", valor: 0 },
  ];

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  const handleGenerateReceipt = (payment: Payment) => {
    toast.success(`Recibo gerado para ${payment.patient}`);
  };

  const filteredPayments = mockPayments.filter(payment => {
    if (filterMethod !== "all" && payment.method !== filterMethod) return false;
    return true;
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Financeira</h1>
          <p className="text-muted-foreground mt-1">Controle completo das receitas e despesas da clínica</p>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Recebido</p>
                <p className="text-3xl font-bold text-success mt-2">
                  R$ {totalReceived.toFixed(2)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-xs text-success">+12.5% vs mês anterior</span>
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
                <p className="text-sm font-medium text-muted-foreground">Total Despesas</p>
                <p className="text-3xl font-bold text-destructive mt-2">
                  R$ {totalExpenses.toFixed(2)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  <span className="text-xs text-destructive">+5.2% vs mês anterior</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  R$ {balance.toFixed(2)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-xs text-success">Lucro líquido</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 animate-fade-in">
            <h3 className="text-lg font-semibold mb-4">Receita Diária (Última Semana)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyRevenue}>
                <defs>
                  <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" className="opacity-50" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
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
                  dataKey="valor" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={3} 
                  fill="url(#colorValor)"
                  dot={{ fill: 'hsl(var(--chart-1))', r: 5 }}
                  activeDot={{ r: 7, fill: 'hsl(var(--chart-1))' }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <h3 className="text-lg font-semibold mb-4">Receita por Meio de Pagamento</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={1}/>
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={1}/>
                    <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="gradient3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={1}/>
                    <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="gradient4" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-4))" stopOpacity={1}/>
                    <stop offset="100%" stopColor="hsl(var(--chart-4))" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <Pie
                  data={paymentsByMethod}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1500}
                  animationBegin={0}
                  animationEasing="ease-out"
                >
                  {paymentsByMethod.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#gradient${(index % 4) + 1})`}
                      className="hover:opacity-80 transition-opacity duration-300"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Filtros de Visualização</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Período</Label>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filterPeriod === "custom" && (
              <>
                <div>
                  <Label>Data Início</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <Label>Data Fim</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </>
            )}

            <div>
              <Label>Meio de Pagamento</Label>
              <Select value={filterMethod} onValueChange={setFilterMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                  <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Lista de recebimentos */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recebimentos Detalhados</h3>
            <Button variant="outline" onClick={() => toast.success("Relatório exportado!")}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Meio de Pagamento</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.patient}</TableCell>
                    <TableCell>{payment.cpf}</TableCell>
                    <TableCell>{payment.service}</TableCell>
                    <TableCell className="font-semibold text-success">
                      R$ {payment.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.method}</Badge>
                    </TableCell>
                    <TableCell>{new Date(payment.date).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{payment.time}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleGenerateReceipt(payment)}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Recibo
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminFinancial;
