import { useNavigate } from "react-router-dom";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Clock, FileText } from "lucide-react";

const AppointmentHistory = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const generateCPF = () => {
    const random = () => Math.floor(Math.random() * 9);
    return `${random()}${random()}${random()}.${random()}${random()}${random()}.${random()}${random()}${random()}-${random()}${random()}`;
  };

  const allAppointments = [
    {
      id: 1,
      name: "Pedro Henrique Lima",
      cpf: generateCPF(),
      age: 52,
      time: "11:30",
      diagnosis: "Miopia leve",
      status: "completed",
      prescriptionIssued: true,
      examPerformed: true,
    },
    {
      id: 2,
      name: "Laura Mendes Silva",
      cpf: generateCPF(),
      age: 34,
      time: "10:45",
      diagnosis: "Astigmatismo",
      status: "completed",
      prescriptionIssued: true,
      examPerformed: true,
    },
    {
      id: 3,
      name: "Roberto Silva Santos",
      cpf: generateCPF(),
      age: 67,
      time: "09:30",
      diagnosis: "Presbiopia",
      status: "completed",
      prescriptionIssued: false,
      examPerformed: true,
    },
    {
      id: 4,
      name: "Juliana Costa Oliveira",
      cpf: generateCPF(),
      age: 29,
      time: "08:45",
      diagnosis: "Consulta de rotina - Sem alterações",
      status: "completed",
      prescriptionIssued: false,
      examPerformed: true,
    },
    {
      id: 5,
      name: "Fernando Alves Rodrigues",
      cpf: generateCPF(),
      age: 41,
      time: "08:00",
      diagnosis: "Hipermetropia",
      status: "completed",
      prescriptionIssued: true,
      examPerformed: true,
    },
    {
      id: 6,
      name: "Ana Carolina Souza",
      cpf: generateCPF(),
      age: 38,
      time: "14:30",
      diagnosis: "Miopia moderada",
      status: "completed",
      prescriptionIssued: true,
      examPerformed: true,
    },
    {
      id: 7,
      name: "Marcos Vinicius Costa",
      cpf: generateCPF(),
      age: 45,
      time: "15:15",
      diagnosis: "Astigmatismo hipermetrópico",
      status: "completed",
      prescriptionIssued: true,
      examPerformed: true,
    },
    {
      id: 8,
      name: "Beatriz Fernandes Lima",
      cpf: generateCPF(),
      age: 56,
      time: "16:00",
      diagnosis: "Presbiopia inicial",
      status: "completed",
      prescriptionIssued: true,
      examPerformed: true,
    },
  ];

  const appointments = allAppointments.filter((appointment) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      appointment.name.toLowerCase().includes(query) ||
      appointment.cpf.replace(/\D/g, "").includes(query.replace(/\D/g, ""))
    );
  });

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
          <div>
            <h1 className="text-3xl font-bold mb-2">Histórico de Atendimentos</h1>
            <p className="text-muted-foreground">
              Atendimentos realizados hoje
            </p>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success" />
              <h3 className="text-lg font-semibold">
                Pacientes Atendidos Hoje
              </h3>
              <Badge variant="outline" className="text-sm">
                {allAppointments.length} atendimentos
              </Badge>
            </div>
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

          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-5 rounded-lg border border-border hover:border-primary hover:bg-accent transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/optometrist/appointment/${appointment.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-success" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold">{appointment.name}</p>
                        <span className="text-sm text-muted-foreground">
                          • {appointment.cpf} • {appointment.age} anos
                        </span>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {appointment.time}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {appointment.diagnosis}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {appointment.prescriptionIssued && (
                          <Badge variant="secondary" className="text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            Prescrição emitida
                          </Badge>
                        )}
                        {appointment.examPerformed && (
                          <Badge variant="secondary" className="text-xs">
                            Exame realizado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate(`/optometrist/appointment/${appointment.id}`)}
                  >
                    Ver Prontuário
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {appointments.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "Nenhum atendimento encontrado com os critérios de busca" : "Nenhum atendimento realizado hoje"}
              </p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentHistory;
