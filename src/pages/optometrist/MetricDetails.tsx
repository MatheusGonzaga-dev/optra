import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Users, FileText, ClipboardCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import PrescriptionView from "@/components/PrescriptionView";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MetricDetails = () => {
  const { metricType } = useParams();
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState("today");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const metricConfig = {
    atendimentos: {
      title: "Atendimentos",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    prescricoes: {
      title: "Prescrições Emitidas",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    exames: {
      title: "Exames Realizados",
      icon: ClipboardCheck,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  };

  const config = metricConfig[metricType as keyof typeof metricConfig];
  const Icon = config?.icon || Users;

  // Mock historical data
  const generateHistoricalData = () => {
    const data = [];
    const days = dateFilter === "today" ? 1 : dateFilter === "week" ? 7 : dateFilter === "month" ? 30 : 30;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      data.push({
        date: format(date, "dd/MM", { locale: ptBR }),
        fullDate: format(date, "dd/MM/yyyy", { locale: ptBR }),
        value: Math.floor(Math.random() * 20) + 5,
      });
    }
    return data;
  };

  const historicalData = generateHistoricalData();
  const totalValue = historicalData.reduce((sum, item) => sum + item.value, 0);
  const averageValue = (totalValue / historicalData.length).toFixed(1);

  // Mock detailed records with realistic data
  const generateDetailedRecords = () => {
    const names = [
      "Ana Silva Santos", "Carlos Eduardo Lima", "Maria Fernanda Costa", "José Roberto Alves",
      "Juliana Oliveira", "Pedro Henrique Souza", "Camila Rodrigues", "Fernando Martins",
      "Patricia Gomes", "Ricardo Santos", "Beatriz Ferreira", "Lucas Pereira",
      "Amanda Ribeiro", "Rafael Costa", "Gabriela Almeida", "Thiago Barbosa",
      "Larissa Cardoso", "Marcelo Dias", "Fernanda Lima", "Bruno Carvalho",
      "Mariana Rocha", "Felipe Monteiro", "Isabela Araújo", "Daniel Nascimento",
      "Vanessa Correia", "André Mendes", "Carolina Teixeira", "Gustavo Pinto",
      "Renata Castro", "Leonardo Freitas", "Tatiana Moreira", "Rodrigo Cunha",
      "Priscila Campos", "Vinicius Ramos", "Aline Duarte", "Marcos Vinicius",
      "Bruna Cavalcanti", "Diego Silva", "Natália Borges", "César Augusto",
      "Viviane Lopes", "Alexandre Nunes", "Cristina Azevedo", "Eduardo Pires",
      "Simone Reis", "Paulo Henriques", "Luciana Melo", "Roberto Carlos"
    ];

    const generateCPF = () => {
      const random = () => Math.floor(Math.random() * 9);
      return `${random()}${random()}${random()}.${random()}${random()}${random()}.${random()}${random()}${random()}-${random()}${random()}`;
    };

    const records = [];
    const count = dateFilter === "today" ? 12 : dateFilter === "week" ? 45 : 120;
    
    for (let i = 0; i < count; i++) {
      const date = subDays(new Date(), Math.floor(Math.random() * (dateFilter === "today" ? 1 : dateFilter === "week" ? 7 : 30)));
      const name = names[i % names.length];
      const record: any = {
        id: i + 1,
        patient: name,
        cpf: generateCPF(),
        date: format(date, "dd/MM/yyyy", { locale: ptBR }),
        time: `${String(8 + Math.floor(Math.random() * 9)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
        details: getDetailsForMetric(metricType as string),
      };

      if (metricType === "prescricoes") {
        const sphericalValues = ["-0.25", "-0.50", "-0.75", "-1.00", "-1.25", "-1.50", "-1.75", "-2.00", "-2.25", "-2.50"];
        const cylindricalValues = ["0.00", "-0.25", "-0.50", "-0.75", "-1.00", "-1.25"];
        const axisValues = ["0°", "15°", "30°", "45°", "60°", "75°", "90°", "105°", "120°", "135°", "150°", "165°", "180°"];
        
        record.prescription = {
          distance: {
            od: {
              spherical: sphericalValues[Math.floor(Math.random() * sphericalValues.length)],
              cylindrical: cylindricalValues[Math.floor(Math.random() * cylindricalValues.length)],
              axis: axisValues[Math.floor(Math.random() * axisValues.length)],
              av: "20/20",
            },
            oe: {
              spherical: sphericalValues[Math.floor(Math.random() * sphericalValues.length)],
              cylindrical: cylindricalValues[Math.floor(Math.random() * cylindricalValues.length)],
              axis: axisValues[Math.floor(Math.random() * axisValues.length)],
              av: "20/20",
            },
          },
          lensType: ["Lentes antirreflexo", "Lentes multifocais", "Lentes transitions", "Lentes blue light"][Math.floor(Math.random() * 4)],
          returnDate: format(subDays(new Date(), -180), "dd/MM/yyyy", { locale: ptBR }),
          observations: "Uso contínuo recomendado",
          recommendations: "Evitar forçar a vista em ambientes com pouca luz",
        };
      }

      records.push(record);
    }
    return records.sort((a, b) => new Date(b.date.split("/").reverse().join("-")).getTime() - new Date(a.date.split("/").reverse().join("-")).getTime());
  };

  const getDetailsForMetric = (type: string) => {
    switch (type) {
      case "atendimentos":
        return "Consulta de rotina";
      case "prescricoes":
        return "OD: -1.50 -0.75 x 180° | OE: -1.25 -0.50 x 175°";
      case "exames":
        return "Tonometria - Pressão ocular normal";
      default:
        return "Detalhes do registro";
    }
  };

  const allRecords = generateDetailedRecords();

  // Filter records based on search query
  const detailedRecords = allRecords.filter((record) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      record.patient.toLowerCase().includes(query) ||
      record.cpf.replace(/\D/g, "").includes(query.replace(/\D/g, ""))
    );
  });

  const handleViewPrescription = (record: any) => {
    setSelectedPrescription(record.prescription);
    setIsPrescriptionDialogOpen(true);
  };

  const getDateRangeLabel = () => {
    const today = new Date();
    switch (dateFilter) {
      case "today":
        return format(today, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      case "week":
        return `${format(startOfWeek(today), "dd/MM", { locale: ptBR })} - ${format(endOfWeek(today), "dd/MM/yyyy", { locale: ptBR })}`;
      case "month":
        return format(today, "MMMM 'de' yyyy", { locale: ptBR });
      case "custom":
        return customStartDate && customEndDate ? `${customStartDate} - ${customEndDate}` : "Selecione as datas";
      default:
        return "";
    }
  };

  if (!config) {
    return <div>Métrica não encontrada</div>;
  }

  return (
    <DashboardLayout role="optometrist">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/optometrist/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-12 h-12 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${config.color}`} />
              </div>
              <h1 className="text-3xl font-bold">{config.title}</h1>
            </div>
            <p className="text-muted-foreground">
              Histórico detalhado e análise de dados
            </p>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Período:</span>
              <Badge variant="outline">{getDateRangeLabel()}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {dateFilter === "custom" && (
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Data Inicial</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Data Final</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background"
                />
              </div>
              <div className="flex items-end">
                <Button>Aplicar Filtro</Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Total</p>
              <p className="text-3xl font-bold">{totalValue}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Média Diária</p>
              <p className="text-3xl font-bold">{averageValue}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Registros</p>
              <p className="text-3xl font-bold">{detailedRecords.length}</p>
            </Card>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Tendência no Período</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name={config.title}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold">Registros Detalhados</h3>
            <div className="w-full sm:w-auto">
              <input
                type="text"
                placeholder="Buscar por nome ou CPF..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-[300px] px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="space-y-2">
            {detailedRecords.map((record) => (
              <div
                key={record.id}
                className="p-4 rounded-lg border border-border hover:border-primary hover:bg-accent transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold">{record.patient}</p>
                      <span className="text-sm text-muted-foreground">• {record.cpf}</span>
                      <Badge variant="outline" className="text-xs">
                        {record.date} • {record.time}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{record.details}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => metricType === "prescricoes" ? handleViewPrescription(record) : null}
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {detailedRecords.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? "Nenhum registro encontrado com os critérios de busca" : "Nenhum registro encontrado"}
              </p>
            </div>
          )}
        </Card>

        <Dialog open={isPrescriptionDialogOpen} onOpenChange={setIsPrescriptionDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Prescrição Detalhada</DialogTitle>
            </DialogHeader>
            {selectedPrescription && (
              <PrescriptionView prescription={selectedPrescription} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default MetricDetails;
