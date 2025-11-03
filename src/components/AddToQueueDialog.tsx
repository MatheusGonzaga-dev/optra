import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { mockPatients, mockDoctors, partnerOptics } from "@/data/mockData";
import { toast } from "sonner";
import { Search } from "lucide-react";

const formSchema = z.object({
  patientId: z.string().min(1, "Selecione um paciente"),
  doctorId: z.string().min(1, "Selecione um doutor"),
  partnerOptic: z.string().optional(),
  symptoms: z.string().min(5, "Descreva os sintomas"),
  medications: z.enum(["yes", "no"]),
  medicationsList: z.string().optional(),
  examType: z.string().min(1, "Selecione o tipo de exame"),
});

interface AddToQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: any) => void;
}

export default function AddToQueueDialog({ open, onOpenChange, onAdd }: AddToQueueDialogProps) {
  const [searchPatient, setSearchPatient] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      partnerOptic: "",
      symptoms: "",
      medications: "no",
      medicationsList: "",
      examType: "",
    },
  });

  const watchMedications = form.watch("medications");

  const filteredPatients = mockPatients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchPatient.toLowerCase()) ||
      patient.cpf.replace(/\D/g, "").includes(searchPatient.replace(/\D/g, ""))
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const patient = mockPatients.find((p) => p.id === values.patientId);
    const doctor = mockDoctors.find((d) => d.id === values.doctorId);
    
    onAdd({
      ...values,
      patientName: patient?.name,
      patientCpf: patient?.cpf,
      doctorName: doctor?.name,
    });

    toast.success("Paciente adicionado à fila!");
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Paciente à Fila</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Busca de Paciente */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold">Selecionar Paciente</h3>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar paciente por nome ou CPF..."
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                  className="pl-10"
                />
              </div>

              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paciente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o paciente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredPatients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} - {patient.cpf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Doutor e Ótica */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold">Atendimento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doutor Responsável</FormLabel>
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
                  name="partnerOptic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ótica Parceira (Opcional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a ótica" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Sem indicação</SelectItem>
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
              </div>
            </div>

            {/* Anamnese */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold">Anamnese</h3>

              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sintomas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva os sintomas apresentados"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="medications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faz uso de medicamentos?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="med-yes" />
                          <label htmlFor="med-yes" className="cursor-pointer">
                            Sim
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="med-no" />
                          <label htmlFor="med-no" className="cursor-pointer">
                            Não
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchMedications === "yes" && (
                <FormField
                  control={form.control}
                  name="medicationsList"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quais medicamentos?</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Liste os medicamentos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="examType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Exame</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de exame" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="consulta-completa">Consulta Completa</SelectItem>
                        <SelectItem value="refacao">Refração</SelectItem>
                        <SelectItem value="retorno">Retorno</SelectItem>
                        <SelectItem value="exame-lente-contato">
                          Exame para Lente de Contato
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Adicionar à Fila
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
