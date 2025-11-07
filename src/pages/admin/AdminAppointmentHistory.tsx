import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// Dados agora virão do backend
import { FileText, User, Calendar, Clock, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const AdminAppointmentHistory = () => {
  const navigate = useNavigate();
  const [filterDoctor, setFilterDoctor] = useState("all");
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch('http://localhost:4000/atendimentos/historico');
        const data = await resp.json();
        setRecords(Array.isArray(data) ? data : []);
      } catch (e) {
        setRecords([]);
      }
    };
    load();
  }, []);

  const completedAppointments = records;
  const filteredAppointments = completedAppointments.filter((apt) => {
    if (filterDoctor !== 'all' && (apt.profissional?.nome_completo !== filterDoctor)) return false;
    return true;
  });

  // Estatísticas por profissional
  const statsByDoctor = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of records) {
      const name = r.profissional?.nome_completo || 'Profissional';
      map[name] = (map[name] || 0) + 1;
    }
    return Object.entries(map).map(([fullName, atendimentos]) => ({
      name: (fullName.split(' ').slice(-1)[0]) || fullName,
      atendimentos,
      fullName,
    }));
  }, [records]);

  // Estatísticas por tipo de atendimento
  const statsByType = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of records) {
      const t = r.tipo_atendimento || 'Tipo';
      map[t] = (map[t] || 0) + 1;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [records]);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  const getDoctorName = (doctorId: string) => {
    return mockDoctors.find(d => d.id === doctorId)?.name || "N/A";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      "concluido": "default",
      "em-andamento": "secondary",
      "agendado": "outline",
      "cancelado": "destructive"
    };
    
    const labels: Record<string, string> = {
      "concluido": "Concluído",
      "em-andamento": "Em Andamento",
      "agendado": "Agendado",
      "cancelado": "Cancelado"
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Histórico de Atendimentos</h1>
          <p className="text-muted-foreground mt-1">Visualize todos os atendimentos realizados e estatísticas</p>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Atendimentos</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {completedAppointments.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          {statsByDoctor.slice(0, 3).map((doctor, index) => {
            const doctorStats = doctor;
            return (
              <Card key={doctor.fullName} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{doctor.fullName}</p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {doctorStats?.atendimentos || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">atendimentos</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-chart-${index + 1}/10 flex items-center justify-center`}>
                    <User className={`w-6 h-6 text-chart-${index + 1}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 animate-fade-in">
            <h3 className="text-lg font-semibold mb-4">Atendimentos por Profissional</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statsByDoctor}>
                <defs>
                  <linearGradient id="adminBarGradient1" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#adminBarGradient1)" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <h3 className="text-lg font-semibold mb-4">Tipos de Atendimento</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  <linearGradient id="adminPieGradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={1}/>
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="adminPieGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={1}/>
                    <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="adminPieGradient3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={1}/>
                    <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="adminPieGradient4" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-4))" stopOpacity={1}/>
                    <stop offset="100%" stopColor="hsl(var(--chart-4))" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <Pie
                  data={statsByType}
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
                  {statsByType.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#adminPieGradient${(index % 4) + 1})`}
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
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por profissional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Profissionais</SelectItem>
                  {statsByDoctor.map(doctor => (
                    <SelectItem key={doctor.fullName} value={doctor.fullName}>
                      {doctor.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Lista de atendimentos */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Lista Completa de Atendimentos</h3>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.paciente?.nome_completo}</TableCell>
                    <TableCell>{a.paciente?.cpf || '-'}</TableCell>
                    <TableCell>{a.profissional?.nome_completo || '-'}</TableCell>
                    <TableCell>{a.tipo_atendimento}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {new Date(a.hora_fim_atendimento || a.hora_inicio_atendimento).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {new Date(a.hora_fim_atendimento || a.hora_inicio_atendimento).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge('concluido')}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/admin/appointment/${a.id}`)}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Ver Prontuário
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

export default AdminAppointmentHistory;
