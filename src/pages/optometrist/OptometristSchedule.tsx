import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, Clock, User } from "lucide-react";
import { mockAppointments, mockDoctors, partnerOptics } from "@/data/mockData";

const OptometristSchedule = () => {
  const [date, setDate] = useState<Date>(new Date("2024-01-27"));
  const [searchQuery, setSearchQuery] = useState("");
  
  // Simular ID do doutor logado (em produção, isso viria da autenticação)
  const loggedDoctorId = "1"; // Dr. Carlos Silva

  // Filtrar agendamentos pela data selecionada e pelo doutor logado
  const selectedDateStr = date.toISOString().split("T")[0];
  const appointmentsForDoctor = mockAppointments.filter(
    (apt) => apt.doctorId === loggedDoctorId
  );
  
  const appointmentsForDate = appointmentsForDoctor.filter(
    (apt) => apt.date === selectedDateStr
  );

  // Filtrar agendamentos pela busca
  const filteredAppointments = searchQuery
    ? appointmentsForDoctor.filter(
        (apt) =>
          apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          apt.patientCPF.replace(/\D/g, "").includes(searchQuery.replace(/\D/g, ""))
      )
    : appointmentsForDate;

  // Verificar se há agendamentos para cada dia
  const hasAppointments = (day: Date) => {
    const dateStr = day.toISOString().split("T")[0];
    return appointmentsForDoctor.some((apt) => apt.date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "em-andamento":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "concluido":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "cancelado":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = mockDoctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : "Não especificado";
  };

  const getPartnerOpticName = (opticId?: string) => {
    if (!opticId) return null;
    const optic = partnerOptics.find(o => o.id === opticId);
    return optic ? optic.name : null;
  };

  return (
    <DashboardLayout role="optometrist">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Minha Agenda</h1>
            <p className="text-muted-foreground mt-1">
              Visualize suas consultas agendadas
            </p>
          </div>
        </div>

        {/* Busca de Pacientes */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente por nome ou CPF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendário */}
          <Card className="p-6 lg:col-span-1">
            <h3 className="font-semibold mb-4">Selecione uma Data</h3>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border w-full"
              modifiers={{
                hasAppointments: (day) => hasAppointments(day),
              }}
              modifiersStyles={{
                hasAppointments: {
                  fontWeight: "bold",
                  textDecoration: "underline",
                },
              }}
            />
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Data selecionada:</p>
              <p className="font-medium text-foreground">
                {date.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </Card>

          {/* Lista de Agendamentos */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="font-semibold mb-4">
              {searchQuery
                ? "Resultados da Busca"
                : `Agendamentos - ${date.toLocaleDateString("pt-BR")}`}
            </h3>
            <div className="space-y-3">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery
                    ? "Nenhum agendamento encontrado"
                    : "Não há agendamentos para esta data"}
                </div>
              ) : (
                filteredAppointments.map((appointment) => {
                  const opticName = getPartnerOpticName(appointment.partnerOpticId);
                  
                  return (
                    <div
                      key={appointment.id}
                      className="p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{appointment.patientName}</p>
                            <p className="text-sm text-muted-foreground">
                              CPF: {appointment.patientCPF}
                            </p>
                            <p className="text-sm mt-1">{appointment.type}</p>
                            {opticName && (
                              <p className="text-sm text-muted-foreground">
                                Ótica: {opticName}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {appointment.startTime} - {appointment.endTime}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge
                            className={getStatusColor(appointment.status)}
                            variant="outline"
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OptometristSchedule;
