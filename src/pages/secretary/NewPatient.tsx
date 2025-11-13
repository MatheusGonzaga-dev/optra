import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
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
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, "CPF inválido"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  phone1: z.string().min(10, "Telefone deve ter no mínimo 10 dígitos"),
  phone2: z.string().optional(),
  address: z.string().min(5, "Endereço deve ter no mínimo 5 caracteres"),
  skipAnamnesis: z.boolean().default(false),
  symptoms: z.string().optional(),
  medications: z.enum(["yes", "no"]).optional(),
  medicationsList: z.string().optional(),
  examType: z.string().optional(),
  partnerOptic: z.string().optional(),
  paymentAmount: z.string().min(1, "Valor do recebimento é obrigatório"),
  paymentMethod: z.string().min(1, "Forma de pagamento é obrigatória"),
  sendToQueue: z.boolean().default(false),
  priority: z.enum(["NORMAL", "ALTA", "URGENTE"]).optional().default("NORMAL"),
}).refine((data) => {
  if (!data.skipAnamnesis) {
    return data.symptoms && data.symptoms.length > 0 && 
           data.medications && 
           data.examType && data.examType.length > 0;
  }
  return true;
}, {
  message: "Preencha todos os campos da anamnese ou marque 'Pular Anamnese'",
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

const NewPatient = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [services, setServices] = useState<Array<{id:string; nome:string; valor:number}>>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const resp = await fetch(`${API_BASE_URL}/servicos`);
        const data = await resp.json();
        setServices((data || []).map((s: any) => ({ id: s.id, nome: s.nome, valor: Number(s.valor) })));
      } catch { /* ignore */ }
    };
    fetchServices();
  }, []);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cpf: "",
      birthDate: "",
      phone1: "",
      phone2: "",
      address: "",
      skipAnamnesis: false,
      symptoms: "",
      medications: "no",
      medicationsList: "",
      examType: "",
      partnerOptic: "",
      paymentAmount: "",
      paymentMethod: "",
      sendToQueue: false,
      priority: "NORMAL",
    },
  });

  const watchMedications = form.watch("medications");
  const watchSkipAnamnesis = form.watch("skipAnamnesis");
  const watchSendToQueue = form.watch("sendToQueue");

  // Mock de óticas parceiras - futuramente será cadastrado pelo admin
  const partnerOptics = [
    { id: "1", name: "Ótica Visão Clara" },
    { id: "2", name: "Ótica Nova Visão" },
    { id: "3", name: "Ótica Luz & Estilo" },
  ];

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // 1. Cadastrar o paciente
      const pacienteData: any = {
        nome_completo: values.name,
        cpf: values.cpf.replace(/\D/g, ""),
        data_nascimento: values.birthDate,
        telefone: values.phone1,
        telefone2: values.phone2 || undefined,
        logradouro: values.address,
        ativo: true,
        cadastrado_por_id: usuario?.id || undefined,
      };

      Object.keys(pacienteData).forEach(key => {
        if (pacienteData[key] === undefined || (typeof pacienteData[key] === 'string' && pacienteData[key] === '')) {
          delete pacienteData[key];
        }
      });

      const response = await fetch(`${API_BASE_URL}/pacientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pacienteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.message || 'Erro ao cadastrar paciente');
      }

      const pacienteCadastrado = await response.json();
      toast.success(`${values.name} foi cadastrado com sucesso!`);

      // 2. Se marcou para enviar para fila, adicionar à fila
      // IMPORTANTE: Só envia se o usuário explicitamente marcou o checkbox (sendToQueue === true)
      const deveEnviarParaFila = values.sendToQueue === true && !values.skipAnamnesis && values.examType;
      
      if (deveEnviarParaFila) {
        try {
          const servicoSelecionado = services.find(s => s.id === values.examType);
          const nome = servicoSelecionado?.nome || '';
          const tipoAtendimentoMapByName: Record<string, string> = {
            'Consulta Completa': 'CONSULTA_COMPLETA',
            'Refração': 'REFRACAO',
            'Retorno': 'RETORNO',
            'Exame para Lente de Contato': 'EXAME_LENTE_CONTATO',
          };

          const formaPagamentoMap: Record<string, string> = {
            'dinheiro': 'DINHEIRO',
            'cartao-debito': 'CARTAO_DEBITO',
            'cartao-credito': 'CARTAO_CREDITO',
            'pix': 'PIX',
          };

          const filaData = {
            paciente_id: pacienteCadastrado.id,
            tipo_atendimento: tipoAtendimentoMapByName[nome] || 'CONSULTA_COMPLETA',
            prioridade: values.priority || 'NORMAL',
            sintomas: values.symptoms,
            usa_medicamentos: values.medications === 'yes',
            medicamentos_lista: values.medications === 'yes' ? values.medicationsList : undefined,
            valor_consulta: servicoSelecionado ? Number(servicoSelecionado.valor) : undefined,
            forma_pagamento: formaPagamentoMap[values.paymentMethod] || 'PENDENTE',
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
            navigate("/secretary/queue");
          } else {
            const filaError = await filaResponse.json();
            console.error('Erro ao adicionar à fila:', filaError);
            toast.warning('Paciente cadastrado, mas não foi possível adicionar à fila');
            navigate("/secretary/dashboard");
          }
        } catch (filaError) {
          console.error('Erro ao adicionar à fila:', filaError);
          toast.warning('Paciente cadastrado, mas não foi possível adicionar à fila');
          navigate("/secretary/dashboard");
        }
      } else {
        // Se não enviou para fila, voltar ao dashboard
        navigate("/secretary/dashboard");
      }
    } catch (error: any) {
      console.error('Erro ao cadastrar paciente:', error);
      toast.error(error.message || 'Erro ao cadastrar paciente');
    }
  };

  return (
    <DashboardLayout role="secretary">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/secretary/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Cadastrar Novo Paciente</h1>
            <p className="text-muted-foreground">
              Preencha todos os dados do paciente
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Dados Pessoais */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Dados Pessoais</h3>
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
                  name="phone2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone Secundário (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Endereço completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Anamnese */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Anamnese</h3>
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
              <div className="space-y-4">{!watchSkipAnamnesis && (
                <>
                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sintomas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva os sintomas apresentados pelo paciente"
                          className="min-h-[100px]"
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
                            placeholder="Liste os medicamentos que o paciente toma"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                </>
              )}
              {watchSkipAnamnesis && (
                <p className="text-sm text-muted-foreground">
                  Anamnese será preenchida posteriormente
                </p>
              )}
              </div>
            </Card>

            {/* Exame Clínico */}
            {!watchSkipAnamnesis && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Exame Clínico</h3>
              <FormField
                control={form.control}
                name="examType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Exame</FormLabel>
                    <Select onValueChange={(val) => {
                      field.onChange(val);
                      const s = services.find(sv => sv.id === val);
                      if (s) {
                        // opcional: ajustar automaticamente o valor de recebimento
                        form.setValue('paymentAmount', String(s.valor));
                      }
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de exame" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
            )}

            {/* Ótica Parceira */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Indicação</h3>
              <FormField
                control={form.control}
                name="partnerOptic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ótica Parceira (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a ótica de indicação" />
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
            </Card>

            {/* Dados de Recebimento */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Dados de Recebimento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="paymentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor</FormLabel>
                      <FormControl>
                        <Input placeholder="R$ 0,00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma de Pagamento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="cartao-debito">Cartão de Débito</SelectItem>
                          <SelectItem value="cartao-credito">Cartão de Crédito</SelectItem>
                          <SelectItem value="pix">PIX</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Enviar para Fila */}
            {!watchSkipAnamnesis && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Fila de Atendimento</h3>
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
                            // Garantir que seja sempre booleano
                            field.onChange(checked === true);
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none flex-1">
                        <FormLabel 
                          className="cursor-pointer font-semibold"
                          onClick={() => {
                            // Permitir clicar no label para marcar/desmarcar
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
            </Card>
            )}

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/secretary/dashboard")}
              >
                Cancelar
              </Button>
              <Button type="submit" size="lg">
                {watchSendToQueue && !watchSkipAnamnesis ? "Cadastrar e Enviar para Fila" : "Cadastrar Paciente"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default NewPatient;

                      </FormControl>

                      <FormMessage />

                    </FormItem>

                  )}

                />

              </div>

            </Card>



            {/* Anamnese */}

            <Card className="p-6">

              <div className="flex items-center justify-between mb-4">

                <h3 className="text-lg font-semibold">Anamnese</h3>

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

              <div className="space-y-4">{!watchSkipAnamnesis && (

                <>

                <FormField

                  control={form.control}

                  name="symptoms"

                  render={({ field }) => (

                    <FormItem>

                      <FormLabel>Sintomas</FormLabel>

                      <FormControl>

                        <Textarea

                          placeholder="Descreva os sintomas apresentados pelo paciente"

                          className="min-h-[100px]"

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

                            placeholder="Liste os medicamentos que o paciente toma"

                            {...field}

                          />

                        </FormControl>

                        <FormMessage />

                      </FormItem>

                    )}

                  />

                )}

                </>

              )}

              {watchSkipAnamnesis && (

                <p className="text-sm text-muted-foreground">

                  Anamnese será preenchida posteriormente

                </p>

              )}

              </div>

            </Card>



            {/* Exame Clínico */}

            {!watchSkipAnamnesis && (

            <Card className="p-6">

              <h3 className="text-lg font-semibold mb-4">Exame Clínico</h3>

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

            </Card>

            )}



            {/* Ótica Parceira */}

            <Card className="p-6">

              <h3 className="text-lg font-semibold mb-4">Indicação</h3>

              <FormField

                control={form.control}

                name="partnerOptic"

                render={({ field }) => (

                  <FormItem>

                    <FormLabel>Ótica Parceira (Opcional)</FormLabel>

                    <Select onValueChange={field.onChange} defaultValue={field.value}>

                      <FormControl>

                        <SelectTrigger>

                          <SelectValue placeholder="Selecione a ótica de indicação" />

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

            </Card>



            {/* Dados de Recebimento */}

            <Card className="p-6">

              <h3 className="text-lg font-semibold mb-4">Dados de Recebimento</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <FormField

                  control={form.control}

                  name="paymentAmount"

                  render={({ field }) => (

                    <FormItem>

                      <FormLabel>Valor</FormLabel>

                      <FormControl>

                        <Input placeholder="R$ 0,00" {...field} />

                      </FormControl>

                      <FormMessage />

                    </FormItem>

                  )}

                />



                <FormField

                  control={form.control}

                  name="paymentMethod"

                  render={({ field }) => (

                    <FormItem>

                      <FormLabel>Forma de Pagamento</FormLabel>

                      <Select onValueChange={field.onChange} defaultValue={field.value}>

                        <FormControl>

                          <SelectTrigger>

                            <SelectValue placeholder="Selecione" />

                          </SelectTrigger>

                        </FormControl>

                        <SelectContent>

                          <SelectItem value="dinheiro">Dinheiro</SelectItem>

                          <SelectItem value="cartao-debito">Cartão de Débito</SelectItem>

                          <SelectItem value="cartao-credito">Cartão de Crédito</SelectItem>

                          <SelectItem value="pix">PIX</SelectItem>

                        </SelectContent>

                      </Select>

                      <FormMessage />

                    </FormItem>

                  )}

                />

              </div>

            </Card>



            {/* Enviar para Fila */}

            {!watchSkipAnamnesis && (

            <Card className="p-6">

              <h3 className="text-lg font-semibold mb-4">Fila de Atendimento</h3>

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

                            // Garantir que seja sempre booleano

                            field.onChange(checked === true);

                          }}

                        />

                      </FormControl>

                      <div className="space-y-1 leading-none flex-1">

                        <FormLabel 

                          className="cursor-pointer font-semibold"

                          onClick={() => {

                            // Permitir clicar no label para marcar/desmarcar

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

            </Card>

            )}



            <div className="flex gap-4 justify-end">

              <Button

                type="button"

                variant="outline"

                onClick={() => navigate("/secretary/dashboard")}

              >

                Cancelar

              </Button>

              <Button type="submit" size="lg">

                {watchSendToQueue && !watchSkipAnamnesis ? "Cadastrar e Enviar para Fila" : "Cadastrar Paciente"}

              </Button>

            </div>

          </form>

        </Form>

      </div>

    </DashboardLayout>

  );

};



export default NewPatient;



                      </FormControl>

                      <FormMessage />

                    </FormItem>

                  )}

                />

              </div>

            </Card>



            {/* Anamnese */}

            <Card className="p-6">

              <div className="flex items-center justify-between mb-4">

                <h3 className="text-lg font-semibold">Anamnese</h3>

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

              <div className="space-y-4">{!watchSkipAnamnesis && (

                <>

                <FormField

                  control={form.control}

                  name="symptoms"

                  render={({ field }) => (

                    <FormItem>

                      <FormLabel>Sintomas</FormLabel>

                      <FormControl>

                        <Textarea

                          placeholder="Descreva os sintomas apresentados pelo paciente"

                          className="min-h-[100px]"

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

                            placeholder="Liste os medicamentos que o paciente toma"

                            {...field}

                          />

                        </FormControl>

                        <FormMessage />

                      </FormItem>

                    )}

                  />

                )}

                </>

              )}

              {watchSkipAnamnesis && (

                <p className="text-sm text-muted-foreground">

                  Anamnese será preenchida posteriormente

                </p>

              )}

              </div>

            </Card>



            {/* Exame Clínico */}

            {!watchSkipAnamnesis && (

            <Card className="p-6">

              <h3 className="text-lg font-semibold mb-4">Exame Clínico</h3>

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

            </Card>

            )}



            {/* Ótica Parceira */}

            <Card className="p-6">

              <h3 className="text-lg font-semibold mb-4">Indicação</h3>

              <FormField

                control={form.control}

                name="partnerOptic"

                render={({ field }) => (

                  <FormItem>

                    <FormLabel>Ótica Parceira (Opcional)</FormLabel>

                    <Select onValueChange={field.onChange} defaultValue={field.value}>

                      <FormControl>

                        <SelectTrigger>

                          <SelectValue placeholder="Selecione a ótica de indicação" />

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

            </Card>



            {/* Dados de Recebimento */}

            <Card className="p-6">

              <h3 className="text-lg font-semibold mb-4">Dados de Recebimento</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <FormField

                  control={form.control}

                  name="paymentAmount"

                  render={({ field }) => (

                    <FormItem>

                      <FormLabel>Valor</FormLabel>

                      <FormControl>

                        <Input placeholder="R$ 0,00" {...field} />

                      </FormControl>

                      <FormMessage />

                    </FormItem>

                  )}

                />



                <FormField

                  control={form.control}

                  name="paymentMethod"

                  render={({ field }) => (

                    <FormItem>

                      <FormLabel>Forma de Pagamento</FormLabel>

                      <Select onValueChange={field.onChange} defaultValue={field.value}>

                        <FormControl>

                          <SelectTrigger>

                            <SelectValue placeholder="Selecione" />

                          </SelectTrigger>

                        </FormControl>

                        <SelectContent>

                          <SelectItem value="dinheiro">Dinheiro</SelectItem>

                          <SelectItem value="cartao-debito">Cartão de Débito</SelectItem>

                          <SelectItem value="cartao-credito">Cartão de Crédito</SelectItem>

                          <SelectItem value="pix">PIX</SelectItem>

                        </SelectContent>

                      </Select>

                      <FormMessage />

                    </FormItem>

                  )}

                />

              </div>

            </Card>



            {/* Enviar para Fila */}

            {!watchSkipAnamnesis && (

            <Card className="p-6">

              <h3 className="text-lg font-semibold mb-4">Fila de Atendimento</h3>

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

                            // Garantir que seja sempre booleano

                            field.onChange(checked === true);

                          }}

                        />

                      </FormControl>

                      <div className="space-y-1 leading-none flex-1">

                        <FormLabel 

                          className="cursor-pointer font-semibold"

                          onClick={() => {

                            // Permitir clicar no label para marcar/desmarcar

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

            </Card>

            )}



            <div className="flex gap-4 justify-end">

              <Button

                type="button"

                variant="outline"

                onClick={() => navigate("/secretary/dashboard")}

              >

                Cancelar

              </Button>

              <Button type="submit" size="lg">

                {watchSendToQueue && !watchSkipAnamnesis ? "Cadastrar e Enviar para Fila" : "Cadastrar Paciente"}

              </Button>

            </div>

          </form>

        </Form>

      </div>

    </DashboardLayout>

  );

};



export default NewPatient;


