import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, UserPlus, MessageSquare, PartyPopper, Loader2, Phone, Mail, Calendar } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import SendMessageDialog from "@/components/SendMessageDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/utils";
import { partnerOptics, mockDoctors } from "@/data/mockData";

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cpf: z.string().regex(/^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})$/, "CPF inválido").optional(),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  phone1: z.string().min(10, "Telefone deve ter no mínimo 10 dígitos"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  convenio: z.string().optional(),
  numero_carteirinha: z.string().optional(),
  alergias: z.string().optional(),
  medicamentos_uso: z.string().optional(),
  observacoes: z.string().optional(),
  phone2: z.string().optional(),
  doctorId: z.string().optional(),
  partnerOptic: z.string().optional(),
  skipAnamnesis: z.boolean().default(false),
  symptoms: z.string().optional(),
  medications: z.enum(["yes", "no"]).optional(),
  medicationsList: z.string().optional(),
  examType: z.string().optional(),
  sendToQueue: z.boolean().default(false),
  priority: z.enum(["NORMAL", "ALTA", "URGENTE"]).optional().default("NORMAL"),
}).refine((data) => {
  if (!data.skipAnamnesis) {
    // Validar sintomas
    if (!data.symptoms || data.symptoms.trim().length < 5) {
      return false;
    }
    // Validar medicamentos
    if (!data.medications) {
      return false;
    }
    // Se usa medicamentos, precisa listar quais
    if (data.medications === "yes" && (!data.medicationsList || data.medicationsList.trim().length < 3)) {
      return false;
    }
    // Validar tipo de exame
    if (!data.examType || data.examType.length === 0) {
      return false;
    }
    return true;
  }
  return true;
}, {
  message: "Para enviar à fila, preencha TODOS os campos da anamnese: Sintomas (mínimo 5 caracteres), Medicamentos, e Tipo de Exame. Ou marque 'Pular Anamnese' para cadastrar sem enviar à fila.",
  path: ["symptoms"],
}).refine((data) => {
  if (data.sendToQueue && !data.skipAnamnesis) {
    return data.examType && data.examType.length > 0;
  }
  return true;
}, {
  message: "Para enviar para a fila, é necessário preencher a anamnese e selecionar o tipo de exame",
  path: ["sendToQueue"],
});

export default function PatientList() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isBirthdayAnimating, setIsBirthdayAnimating] = useState(false);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getUserRole = () => {
    if (usuario?.perfil === 'ADMINISTRADOR') return 'admin';
    if (usuario?.perfil === 'SECRETARIA') return 'secretary';
    return 'secretary';
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cpf: "",
      birthDate: "",
      phone1: "",
      email: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      convenio: "",
      numero_carteirinha: "",
      alergias: "",
      medicamentos_uso: "",
      observacoes: "",
      phone2: "",
      doctorId: "",
      partnerOptic: "",
      skipAnamnesis: false,
      symptoms: "",
      medications: "no",
      medicationsList: "",
      examType: "",
      sendToQueue: false,
      priority: "NORMAL",
    },
  });

  const watchMedications = form.watch("medications");
  const watchSkipAnamnesis = form.watch("skipAnamnesis");
  const watchSendToQueue = form.watch("sendToQueue");

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/pacientes`);
        if (!response.ok) throw new Error('Erro ao buscar pacientes');
        const data = await response.json();
        setPacientes(data);
      } catch (error: any) {
        console.error('Erro ao carregar pacientes:', error);
        toast.error('Erro ao carregar lista de pacientes');
      } finally {
        setLoading(false);
      }
    };

    fetchPacientes();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const pacienteData: any = {
        nome_completo: values.name,
        cpf: values.cpf || undefined,
        data_nascimento: values.birthDate,
        telefone: values.phone1,
        email: values.email || undefined,
        cep: values.cep || undefined,
        logradouro: values.logradouro || undefined,
        numero: values.numero || undefined,
        complemento: values.complemento || undefined,
        bairro: values.bairro || undefined,
        cidade: values.cidade || undefined,
        estado: values.estado || undefined,
        convenio: values.convenio || undefined,
        numero_carteirinha: values.numero_carteirinha || undefined,
        alergias: values.alergias || undefined,
        medicamentos_uso: values.medicamentos_uso || undefined,
        observacoes: values.observacoes || undefined,
        ativo: true,
        cadastrado_por_id: usuario?.id || undefined,
      };

      Object.keys(pacienteData).forEach(key => {
        if (pacienteData[key] === undefined || (typeof pacienteData[key] === 'string' && pacienteData[key] === '')) {
          delete pacienteData[key];
        }
      });

      console.log('Dados enviados para o backend:', pacienteData);

      const response = await fetch(`${API_BASE_URL}/pacientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pacienteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro detalhado do backend:', errorData);
        
        let errorMessage = 'Erro ao cadastrar paciente';
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = JSON.stringify(errorData.error);
        }
        
        throw new Error(errorMessage);
      }

      const pacienteCadastrado = await response.json();
      toast.success(`${values.name} foi cadastrado com sucesso!`);

      // IMPORTANTE: Só envia se o usuário explicitamente marcou o checkbox (sendToQueue === true)
      const deveEnviarParaFila = values.sendToQueue === true && !values.skipAnamnesis && values.examType;
      
      if (deveEnviarParaFila) {
        try {
          const filaData = {
            paciente_id: pacienteCadastrado.id,
            tipo_atendimento: values.examType === 'consulta-completa' ? 'CONSULTA_COMPLETA' :
                             values.examType === 'refacao' ? 'REFRACAO' :
                             values.examType === 'retorno' ? 'RETORNO' :
                             values.examType === 'exame-lente-contato' ? 'EXAME_LENTE_CONTATO' : 'CONSULTA_COMPLETA',
            prioridade: values.priority || 'NORMAL',
            sintomas: values.symptoms,
            usa_medicamentos: values.medications === 'yes',
            medicamentos_lista: values.medications === 'yes' ? values.medicationsList : undefined,
            valor_consulta: values.examType === 'consulta-completa' ? 180 :
                           values.examType === 'refacao' ? 150 :
                           values.examType === 'retorno' ? 80 :
                           values.examType === 'exame-lente-contato' ? 220 : 150,
            forma_pagamento: 'PENDENTE',
            cadastrado_por_id: usuario?.id,
          };

          const filaResponse = await fetch(`${API_BASE_URL}/fila`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(filaData),
          });

          if (filaResponse.ok) {
            toast.success('Paciente adicionado à fila de atendimento!');
          } else {
            const filaError = await filaResponse.json();
            console.error('Erro ao adicionar à fila:', filaError);
            toast.warning('Paciente cadastrado, mas não foi possível adicionar à fila');
          }
        } catch (filaError) {
          console.error('Erro ao adicionar à fila:', filaError);
          toast.warning('Paciente cadastrado, mas não foi possível adicionar à fila');
        }
      }

    setIsDialogOpen(false);
    form.reset();
      
      const updatedResponse = await fetch(`${API_BASE_URL}/pacientes');
      if (updatedResponse.ok) {
        const data = await updatedResponse.json();
        setPacientes(data);
      }
    } catch (error: any) {
      console.error('Erro ao cadastrar paciente:', error);
      toast.error(error.message || 'Erro ao cadastrar paciente');
    }
  };

  const filteredPatients = pacientes.filter(
    (patient) =>
      (patient.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (patient.cpf?.replace(/\D/g, "").includes(searchTerm.replace(/\D/g, "")) || false)
  );

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleBirthdayMessage = () => {
    setIsBirthdayAnimating(true);
    setTimeout(() => setIsBirthdayAnimating(false), 2000);
  };

  const handleSendMessage = (patient: any) => {
    setSelectedPatient(patient);
    setIsMessageDialogOpen(true);
  };

  return (
    <DashboardLayout role={getUserRole()}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gerencie e visualize todos os pacientes cadastrados no sistema
            </p>
          </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
              <Button size="default" className="w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                  Novo Paciente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold">Dados Pessoais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do paciente" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cpf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF</FormLabel>
                            <FormControl>
                              <Input placeholder="000.000.000-00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Nascimento</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone Principal</FormLabel>
                            <FormControl>
                              <Input placeholder="(00) 00000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Email (Opcional)</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="email@exemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-semibold">Endereço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="cep"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP</FormLabel>
                            <FormControl>
                              <Input placeholder="00000-000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="logradouro"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Logradouro</FormLabel>
                            <FormControl>
                              <Input placeholder="Rua, Avenida, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="numero"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número</FormLabel>
                            <FormControl>
                              <Input placeholder="123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="complemento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Complemento</FormLabel>
                            <FormControl>
                              <Input placeholder="Apto, bloco, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bairro"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bairro</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do bairro" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cidade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome da cidade" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="estado"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <FormControl>
                              <Input placeholder="SP, RJ, MG..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-semibold">Convênio e Informações Médicas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="convenio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Convênio (Opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do convênio" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="numero_carteirinha"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nº da Carteirinha</FormLabel>
                            <FormControl>
                              <Input placeholder="Número da carteirinha" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="alergias"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Alergias (Opcional)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Liste as alergias conhecidas" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="medicamentos_uso"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Medicamentos em Uso (Opcional)</FormLabel>
                              <FormControl>
                              <Textarea placeholder="Liste os medicamentos que o paciente usa regularmente" {...field} />
                              </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="observacoes"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Observações (Opcional)</FormLabel>
                              <FormControl>
                              <Textarea placeholder="Observações gerais sobre o paciente" {...field} />
                              </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold">Anamnese</h3>
                      <FormField
                        control={form.control}
                        name="skipAnamnesis"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-4 h-4 rounded border-border"
                                />
                                <FormLabel className="!mt-0 cursor-pointer">
                                  Pular Anamnese
                                </FormLabel>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {!watchSkipAnamnesis ? (
                      <div className="space-y-4">
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
                                  <Textarea
                                    placeholder="Liste os medicamentos"
                                    {...field}
                                  />
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
                                  <SelectItem value="exame-lente-contato">Exame para Lente de Contato</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Anamnese será preenchida posteriormente
                      </p>
                    )}
                  </div>

                  {/* Enviar para Fila */}
                  {!watchSkipAnamnesis && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-md font-semibold mb-3">Fila de Atendimento</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="sendToQueue"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value === true}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked === true);
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none flex-1">
                              <FormLabel 
                                className="cursor-pointer font-semibold"
                                onClick={() => {
                                  field.onChange(!field.value);
                                }}
                              >
                                Enviar para a fila de atendimento?
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                {field.value 
                                  ? "O paciente será adicionado à fila após o cadastro" 
                                  : "Marque esta opção se deseja que o paciente seja adicionado à fila imediatamente"}
                              </p>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watchSendToQueue && (
                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prioridade</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a prioridade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="NORMAL">Normal</SelectItem>
                                  <SelectItem value="ALTA">Alta (Preferencial)</SelectItem>
                                  <SelectItem value="URGENTE">Urgente</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>
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
                      {watchSendToQueue && !watchSkipAnamnesis ? "Cadastrar e Enviar para Fila" : "Cadastrar Paciente"}
                    </Button>
                  </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-xl">Lista de Pacientes</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredPatients.length} {filteredPatients.length === 1 ? 'paciente cadastrado' : 'pacientes cadastrados'}
                </p>
              </div>
              <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
              />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Carregando pacientes...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <UserPlus className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium mb-1">Nenhum paciente encontrado</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm ? 'Tente ajustar os filtros de busca' : 'Comece cadastrando seu primeiro paciente'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Cadastrar Primeiro Paciente
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Paciente</TableHead>
                        <TableHead className="hidden md:table-cell">Contato</TableHead>
                        <TableHead className="hidden lg:table-cell">Informações</TableHead>
                        <TableHead className="text-right font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                      {filteredPatients.map((patient) => {
                        const initials = patient.nome_completo
                          ?.split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2) || '??';
                        const age = patient.data_nascimento ? calculateAge(patient.data_nascimento) : null;
                        
                        return (
                          <TableRow key={patient.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-primary">{initials}</span>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{patient.nome_completo}</p>
                                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                    {patient.cpf && (
                                      <span className="flex items-center gap-1">
                                        <span className="font-mono">{patient.cpf}</span>
                                      </span>
                                    )}
                                    {age && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {age} anos
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                      </TableCell>
                        <TableCell className="hidden md:table-cell">
                              <div className="flex flex-col gap-1">
                                {patient.telefone && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="font-mono">{patient.telefone}</span>
                                  </div>
                                )}
                                {patient.email && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="truncate max-w-[200px]">{patient.email}</span>
                                  </div>
                                )}
                              </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                              <div className="flex flex-col gap-1 text-sm">
                                {patient.convenio && (
                                  <span className="flex items-center gap-1">
                                    <span className="text-muted-foreground">Convênio:</span>
                                    <span className="font-medium">{patient.convenio}</span>
                                  </span>
                                )}
                                {patient.criado_em && (
                                  <span className="text-muted-foreground">
                                    Cadastrado em {new Date(patient.criado_em).toLocaleDateString("pt-BR")}
                                  </span>
                                )}
                              </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                                  variant="ghost"
                              size="sm"
                              onClick={() => handleSendMessage(patient)}
                                  className="text-xs"
                            >
                                  <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                                  variant="ghost"
                              size="sm"
                              onClick={() => {
                                const basePath = usuario?.perfil === 'ADMINISTRADOR' ? '/admin/patient' : '/secretary/patient';
                                navigate(`${basePath}/${patient.id}`);
                              }}
                                  className="text-xs"
                            >
                                  Ver
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </div>
              </div>
            )}
          </CardContent>
        </Card>

        <SendMessageDialog
          open={isMessageDialogOpen}
          onOpenChange={setIsMessageDialogOpen}
          patientName={selectedPatient?.nome_completo || selectedPatient?.name}
        />

        {isBirthdayAnimating && (
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
            <div className="text-6xl animate-bounce">
              🎈🎉🎂🎊
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
