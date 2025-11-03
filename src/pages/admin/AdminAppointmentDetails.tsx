import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, FileDown, User, ClipboardCheck, History } from "lucide-react";
import PrescriptionView from "@/components/PrescriptionView";

const AdminAppointmentDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data - seria substituído por dados reais da API
  const appointment = {
    id: id,
    patientName: "Pedro Lima",
    patientAge: 52,
    patientCPF: "123.456.789-00",
    patientPhone: "(11) 98765-4321",
    patientAddress: "Rua das Flores, 123 - São Paulo, SP",
    date: "27/10/2025",
    time: "11:30",
    diagnosis: "Miopia leve",
    optometristName: "Dr. João Silva",
    anamnesis: {
      symptoms: "Dificuldade para enxergar de longe, cansaço visual",
      medications: "Nenhum",
      observations: "Paciente relata sintomas há 6 meses",
    },
    prescription: {
      distance: {
        od: { spherical: "-1.50", cylindrical: "-0.50", axis: "90°", av: "20/20" },
        oe: { spherical: "-1.75", cylindrical: "-0.25", axis: "85°", av: "20/20" },
      },
      lensType: "Lentes antirreflexo",
      returnDate: "27/04/2026",
      observations: "Uso contínuo recomendado",
      recommendations: "Evitar forçar a vista em ambientes com pouca luz",
    },
    exams: [
      {
        name: "Refração",
        result: "Miopia bilateral",
        date: "27/10/2025",
        observations: "Estabilizado",
      },
      {
        name: "Tonometria",
        result: "Normal - 14 mmHg (OD) / 15 mmHg (OE)",
        date: "27/10/2025",
        observations: "Dentro dos parâmetros normais",
      },
    ],
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    console.log("Exportar PDF");
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/appointments")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Prontuário do Atendimento</h1>
              <p className="text-sm text-muted-foreground">
                {appointment.patientName} • {appointment.date} às {appointment.time}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <FileDown className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dados" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Dados do Paciente
            </TabsTrigger>
            <TabsTrigger value="anamnese" className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Anamnese
            </TabsTrigger>
            <TabsTrigger value="exames" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Exames
            </TabsTrigger>
            <TabsTrigger value="receita" className="flex items-center gap-2">
              <FileDown className="w-4 h-4" />
              Receita
            </TabsTrigger>
          </TabsList>

          {/* Dados do Paciente */}
          <TabsContent value="dados" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Informações do Paciente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome Completo</p>
                  <p className="font-medium">{appointment.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Idade</p>
                  <p className="font-medium">{appointment.patientAge} anos</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CPF</p>
                  <p className="font-medium">{appointment.patientCPF}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{appointment.patientPhone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium">{appointment.patientAddress}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Informações do Atendimento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Data do Atendimento</p>
                  <p className="font-medium">{appointment.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium">{appointment.time}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profissional Responsável</p>
                  <p className="font-medium">{appointment.optometristName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Diagnóstico</p>
                  <Badge variant="secondary">{appointment.diagnosis}</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Anamnese */}
          <TabsContent value="anamnese" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Anamnese</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Sintomas Relatados</p>
                  <p className="text-sm">{appointment.anamnesis.symptoms}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Medicamentos em Uso</p>
                  <p className="text-sm">{appointment.anamnesis.medications}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Observações</p>
                  <p className="text-sm">{appointment.anamnesis.observations}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Exames */}
          <TabsContent value="exames" className="space-y-4">
            {appointment.exams.map((exam, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{exam.name}</h3>
                    <p className="text-sm text-muted-foreground">{exam.date}</p>
                  </div>
                  <Badge variant="secondary">Realizado</Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Resultado</p>
                    <p className="text-sm font-medium">{exam.result}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Observações</p>
                    <p className="text-sm">{exam.observations}</p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Receita */}
          <TabsContent value="receita">
            <PrescriptionView prescription={appointment.prescription} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminAppointmentDetails;
