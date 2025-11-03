import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Search, Clock, User, CalendarDays, Check, ChevronsUpDown, Edit, Trash2, MessageCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { mockAppointments, mockPatients, mockDoctors, partnerOptics } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import EditAppointmentDialog from "@/components/EditAppointmentDialog";

const formSchema = z.object({
  patientId: z.string().min(1, "Selecione um paciente"),
  date: z.string().min(1, "Data é obrigatória"),
  startTime: z.string().min(1, "Horário de início é obrigatório"),
  endTime: z.string().min(1, "Horário de fim é obrigatório"),
  type: z.string().min(1, "Tipo de consulta é obrigatório"),
  doctorId: z.string().min(1, "Selecione um doutor"),
  hasPartnerOptic: z.boolean().default(false),
  partnerOpticId: z.string().optional(),
}).refine((data) => {
  if (data.hasPartnerOptic) {
    return data.partnerOpticId && data.partnerOpticId.length > 0;
  }
  return true;
}, {
  message: "Selecione a ótica parceira",
  path: ["partnerOpticId"],
});

const SecretarySchedule = () => {
  const [date, setDate] = useState<Date>(new Date("2024-01-27"));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSchedulePreviewOpen, setIsSchedulePreviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [appointments, setAppointments] = useState(mockAppointments);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      date: "",
      startTime: "",
      endTime: "",
      type: "",
      doctorId: "",
      hasPartnerOptic: false,
      partnerOpticId: "",
    },
  });

  const watchHasPartnerOptic = form.watch("hasPartnerOptic");
  const selectedPatientId = form.watch("patientId");
  const selectedPatient = mockPatients.find(p => p.id === selectedPatientId);

  const handleNewAppointment = (values: z.infer<typeof formSchema>) => {
    console.log("Novo agendamento:", values);
    toast.success("Agendamento criado com sucesso!");
    setIsDialogOpen(false);
    form.reset();
  };

  const handleCancelAppointment = (appointmentId: string) => {
    setAppointments(appointments.filter((apt) => apt.id !== appointmentId));
    toast.success("Agendamento cancelado!");
  };

  const handleEditAppointment = (appointment: any) => {
    setEditingAppointment(appointment);
    setIsEditDialogOpen(true);
  };

  const handleSaveAppointment = (updatedAppointment: any) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === updatedAppointment.id ? updatedAppointment : apt
      )
    );
  };

  const handleSendReminder = (appointment: any) => {
    toast.success(`Lembrete enviado para ${appointment.patientName} via WhatsApp!`);
  };

  // Filtrar agendamentos pela data selecionada
  const selectedDateStr = date.toISOString().split("T")[0];
  const appointmentsForDate = appointments.filter(
    (apt) => apt.date === selectedDateStr
  );

  // Filtrar agendamentos pela busca
  const filteredAppointments = searchQuery
    ? appointments.filter(
        (apt) =>
          apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          apt.patientCPF.replace(/\D/g, "").includes(searchQuery.replace(/\D/g, ""))
      )
    : appointmentsForDate;

  // Verificar se há agendamentos para cada dia
  const hasAppointments = (day: Date) => {
    const dateStr = day.toISOString().split("T")[0];
    return appointments.some((apt) => apt.date === dateStr);
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
    <DashboardLayout role="secretary">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Agenda</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os agendamentos de consultas
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => toast.success("Lembretes de consulta enviados com sucesso!")}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Enviar Lembrete
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Novo Agendamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo Agendamento</DialogTitle>
                </DialogHeader>

                {/* Botão Prévia da Agenda */}
                <Dialog open={isSchedulePreviewOpen} onOpenChange={setIsSchedulePreviewOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Ver Prévia da Agenda
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Prévia da Agenda - Próximos 7 Dias</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {Array.from({ length: 7 }).map((_, index) => {
                      const previewDate = new Date();
                      previewDate.setDate(previewDate.getDate() + index);
                      const dateStr = previewDate.toISOString().split("T")[0];
                      const dayAppointments = appointments.filter(apt => apt.date === dateStr);
                        
                        return (
                          <div key={dateStr} className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-2">
                              {previewDate.toLocaleDateString("pt-BR", {
                                weekday: "long",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </h4>
                            {dayAppointments.length === 0 ? (
                              <p className="text-sm text-muted-foreground">Sem agendamentos</p>
                            ) : (
                              <div className="space-y-2">
                                {dayAppointments.map(apt => (
                                  <div key={apt.id} className="flex items-center justify-between text-sm bg-accent/30 p-2 rounded">
                                    <span>{apt.startTime} - {apt.endTime}</span>
                                    <span className="font-medium">{apt.patientName}</span>
                                    <span className="text-muted-foreground">{apt.type}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </DialogContent>
                </Dialog>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleNewAppointment)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Paciente</FormLabel>
                          <Popover open={patientSearchOpen} onOpenChange={setPatientSearchOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? mockPatients.find((patient) => patient.id === field.value)?.name
                                    : "Buscar paciente..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0">
                              <Command>
                                <CommandInput placeholder="Buscar por nome ou CPF..." />
                                <CommandList>
                                  <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
                                  <CommandGroup>
                                    {mockPatients.map((patient) => (
                                      <CommandItem
                                        value={`${patient.name} ${patient.cpf}`}
                                        key={patient.id}
                                        onSelect={() => {
                                          form.setValue("patientId", patient.id);
                                          setPatientSearchOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            patient.id === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        <div className="flex flex-col">
                                          <span className="font-medium">{patient.name}</span>
                                          <span className="text-sm text-muted-foreground">
                                            CPF: {patient.cpf}
                                          </span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedPatient && (
                      <div className="p-3 bg-accent/50 rounded-lg text-sm space-y-1">
                        <p><strong>Telefone:</strong> {selectedPatient.phone}</p>
                        <p><strong>Última visita:</strong> {new Date(selectedPatient.lastVisit).toLocaleDateString("pt-BR")}</p>
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="doctorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doutor</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o doutor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockDoctors.map((doctor) => (
                                <SelectItem key={doctor.id} value={doctor.id}>
                                  {doctor.name} - {doctor.specialty}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horário de Início</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horário de Fim</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Consulta</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Consulta Completa">
                                Consulta Completa
                              </SelectItem>
                              <SelectItem value="Retorno">Retorno</SelectItem>
                              <SelectItem value="Refração">Refração</SelectItem>
                              <SelectItem value="Exame para Lente de Contato">
                                Exame para Lente de Contato
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hasPartnerOptic"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Possui Ótica Parceira
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    {watchHasPartnerOptic && (
                      <FormField
                        control={form.control}
                        name="partnerOpticId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ótica Parceira</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a ótica" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {partnerOptics.map((optic) => (
                                  <SelectItem key={optic.id} value={optic.id}>
                                    {optic.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="flex-1">
                        Agendar
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
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
                            <p className="text-sm text-muted-foreground">
                              Doutor: {getDoctorName(appointment.doctorId)}
                            </p>
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
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditAppointment(appointment)}
                              title="Editar agendamento"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  title="Cancelar agendamento"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja cancelar o agendamento de{" "}
                                    {appointment.patientName}? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Não</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelAppointment(appointment.id)}
                                  >
                                    Sim, Cancelar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        <EditAppointmentDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          appointment={editingAppointment}
          onSave={handleSaveAppointment}
        />
      </div>
    </DashboardLayout>
  );
};

export default SecretarySchedule;
