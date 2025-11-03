import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, FileDown, User, ClipboardCheck, History } from "lucide-react";
import PrescriptionView from "@/components/PrescriptionView";

const AppointmentDetails = () => {
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
    <DashboardLayout role="optometrist">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/optometrist/appointments")}
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
        <Tabs defaultValue="patient" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="patient">
              <User className="w-4 h-4 mr-2" />
              Dados do Paciente
            </TabsTrigger>
            <TabsTrigger value="prescription">
              Prescrição
            </TabsTrigger>
            <TabsTrigger value="exams">
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Exames
            </TabsTrigger>
            <TabsTrigger value="anamnesis">
              <History className="w-4 h-4 mr-2" />
              Anamnese
            </TabsTrigger>
          </TabsList>

          {/* Dados do Paciente */}
          <TabsContent value="patient">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações do Paciente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                  <p className="text-base mt-1">{appointment.patientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">CPF</label>
                  <p className="text-base mt-1">{appointment.patientCPF}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Idade</label>
                  <p className="text-base mt-1">{appointment.patientAge} anos</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <p className="text-base mt-1">{appointment.patientPhone}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                  <p className="text-base mt-1">{appointment.patientAddress}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data do Atendimento</label>
                  <p className="text-base mt-1">{appointment.date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Diagnóstico</label>
                  <Badge className="mt-1">{appointment.diagnosis}</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Prescrição */}
          <TabsContent value="prescription">
            <PrescriptionView prescription={appointment.prescription} />
          </TabsContent>

          {/* Exames */}
          <TabsContent value="exams">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                Exames Realizados
              </h3>
              <div className="space-y-4">
                {appointment.exams.map((exam, index) => (
                  <div key={index} className="p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{exam.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {exam.date}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Resultado</label>
                        <p className="text-sm mt-1">{exam.result}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Observações</label>
                        <p className="text-sm mt-1">{exam.observations}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Anamnese */}
          <TabsContent value="anamnesis">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <History className="w-5 h-5" />
                Anamnese
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sintomas Relatados</label>
                  <p className="text-base mt-2">{appointment.anamnesis.symptoms}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Medicamentos em Uso</label>
                  <p className="text-base mt-2">{appointment.anamnesis.medications}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Observações Gerais</label>
                  <p className="text-base mt-2">{appointment.anamnesis.observations}</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentDetails;
