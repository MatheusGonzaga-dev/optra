import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Edit, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast as sonnerToast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { usuario } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [anamneses, setAnamneses] = useState<any[]>([]);
  const [services, setServices] = useState<Array<{id: string; nome: string; valor: number}>>([]);

  const getUserRole = () => {
    if (usuario?.perfil === 'ADMINISTRADOR') return 'admin';
    if (usuario?.perfil === 'SECRETARIA') return 'secretary';
    return 'secretary';
  };

  const getBackPath = () => {
    return usuario?.perfil === 'ADMINISTRADOR' ? '/admin/patients' : '/secretary/patients';
  };

  const getDashboardPath = () => {
    return usuario?.perfil === 'ADMINISTRADOR' ? '/admin/dashboard' : '/secretary/dashboard';
  };
  
  const [newAnamnesis, setNewAnamnesis] = useState({
    symptoms: "",
    medications: "",
    clinicalExam: "",
    clinicalExamId: "",
    observations: "",
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const resp = await fetch('http://localhost:4000/servicos');
        const data = await resp.json();
        setServices((data || []).map((s: any) => ({
          id: s.id,
          nome: s.nome,
          valor: Number(s.valor),
        })));
      } catch {
        // ignore
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const resp = await fetch(`http://localhost:4000/pacientes/${id}`);
        if (!resp.ok) throw new Error('Erro ao buscar paciente');
        const data = await resp.json();
        setPatient(data);
        
        // Buscar histórico de atendimentos deste paciente
        const prontuariosResp = await fetch(`http://localhost:4000/atendimentos/historico`);
        if (prontuariosResp.ok) {
          const todosAtendimentos = await prontuariosResp.json();
          const prontuarios = todosAtendimentos.filter((p: any) => p.paciente?.id === id);
          
          // Buscar prontuários completos para este paciente
          const prontuariosCompletos = await Promise.all(
            prontuarios.map(async (atend: any) => {
              try {
                const prontResp = await fetch(`http://localhost:4000/atendimentos/prontuarios?fila_id=${atend.id}`);
                if (prontResp.ok) {
                  const prontData = await prontResp.json();
                  return { ...atend, prontuario: Array.isArray(prontData) && prontData.length > 0 ? prontData[0] : null };
                }
                return atend;
              } catch {
                return atend;
              }
            })
          );
          
          setPrescriptions(prontuariosCompletos.filter((p: any) => p.prontuario?.prescricao_json).map((p: any) => ({
            id: p.id,
            date: p.hora_fim_atendimento || p.hora_inicio_atendimento,
            medications: p.prontuario?.prescricao_json?.lensType || '',
            observations: p.prontuario?.observacoes || '',
          })));
          
          setAnamneses(prontuarios.map((p: any) => ({
            id: p.id,
            date: p.hora_fim_atendimento || p.hora_inicio_atendimento,
            symptoms: p.sintomas || '',
            medications: p.medicamentos_lista || 'Nenhum',
            clinicalExam: p.tipo_atendimento || '',
            observations: p.observacoes || '',
          })));
        }
      } catch (e) {
        console.error('Erro ao carregar paciente:', e);
        sonnerToast.error('Erro ao carregar dados do paciente');
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout role={getUserRole()}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return (
      <DashboardLayout role={getUserRole()}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Paciente não encontrado</p>
          <Button onClick={() => navigate(getBackPath())} className="mt-4">
            Voltar para lista
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmitAnamnesis = async () => {
    if (!newAnamnesis.symptoms || !newAnamnesis.clinicalExamId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha os sintomas e selecione o tipo de exame clínico",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedService = services.find(s => s.id === newAnamnesis.clinicalExamId);
      if (!selectedService || !id) return;

      // Mapear nome do serviço para tipo_atendimento
      const tipoAtendimentoMap: Record<string, string> = {
        'Consulta Completa': 'CONSULTA_COMPLETA',
        'Refração': 'REFRACAO',
        'Retorno': 'RETORNO',
        'Exame para Lente de Contato': 'EXAME_LENTE_CONTATO',
      };
      const tipoAtendimento = tipoAtendimentoMap[selectedService.nome] || 'CONSULTA_COMPLETA';

      const filaData: any = {
        paciente_id: id,
        tipo_atendimento: tipoAtendimento,
        prioridade: 'NORMAL',
        usa_medicamentos: !!newAnamnesis.medications && newAnamnesis.medications.toLowerCase() !== 'nenhum',
        valor_consulta: Number(selectedService.valor) || 0,
        forma_pagamento: 'PENDENTE',
      };

      // Adicionar campos opcionais apenas se tiverem valor
      if (newAnamnesis.symptoms && newAnamnesis.symptoms.trim()) {
        filaData.sintomas = newAnamnesis.symptoms.trim();
      }
      if (newAnamnesis.medications && newAnamnesis.medications.trim() && newAnamnesis.medications.toLowerCase() !== 'nenhum') {
        filaData.medicamentos_lista = newAnamnesis.medications.trim();
      }
      if (newAnamnesis.observations && newAnamnesis.observations.trim()) {
        filaData.observacoes = newAnamnesis.observations.trim();
      }
      if (usuario?.id) {
        filaData.cadastrado_por_id = usuario.id;
      }

      const response = await fetch('http://localhost:4000/fila', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filaData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro ao adicionar à fila' }));
        console.error('Erro do backend:', errorData);
        
        if (errorData.error === 'Paciente já está na fila de atendimento') {
          // Se houver ID da entrada existente, oferecer opção de limpar
          if (errorData.existingEntryId) {
            sonnerToast.error('Paciente já está na fila. Tente atualizar a página ou limpar entradas órfãs.');
          } else {
            sonnerToast.error('Paciente já está na fila de atendimento. Verifique a fila.');
          }
          throw new Error(errorData.error);
        }
        
        throw new Error(errorData.error?.message || errorData.error || 'Erro ao adicionar à fila');
      }

      sonnerToast.success("Anamnese registrada e paciente enviado para fila de atendimento!");

      // Limpar formulário
      setNewAnamnesis({
        symptoms: "",
        medications: "",
        clinicalExam: "",
        clinicalExamId: "",
        observations: "",
      });

      // Navegar para fila após 2 segundos
      setTimeout(() => {
        const queuePath = usuario?.perfil === 'ADMINISTRADOR' ? '/admin/queue' : '/secretary/queue';
        navigate(queuePath);
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao registrar anamnese:', error);
      sonnerToast.error('Erro ao registrar anamnese e adicionar à fila');
    }
  };

  return (
    <DashboardLayout role={getUserRole()}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(getBackPath())}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{patient.nome_completo || 'Paciente'}</h1>
            <p className="text-muted-foreground">CPF: {patient.cpf || 'N/A'}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescrições</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="new-anamnesis">Nova Anamnese</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Informações Pessoais</CardTitle>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Nome Completo</Label>
                    <p className="font-medium mt-1">{patient.nome_completo || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">CPF</Label>
                    <p className="font-medium mt-1">{patient.cpf || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Data de Nascimento</Label>
                    <p className="font-medium mt-1">
                      {patient.data_nascimento ? new Date(patient.data_nascimento).toLocaleDateString("pt-BR") : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Idade</Label>
                    <p className="font-medium mt-1">{calculateAge(patient.data_nascimento)} anos</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Telefone Principal</Label>
                    <p className="font-medium mt-1">{patient.telefone || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Telefone Secundário</Label>
                    <p className="font-medium mt-1">{patient.telefone2 || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-muted-foreground">Endereço</Label>
                    <p className="font-medium mt-1">{patient.logradouro || 'N/A'}</p>
                  </div>
                  {patient.email && (
                    <div className="md:col-span-2">
                      <Label className="text-muted-foreground">E-mail</Label>
                      <p className="font-medium mt-1">{patient.email}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Prescrições</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {prescriptions.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Nenhuma prescrição registrada</p>
                    ) : (
                      prescriptions.map((prescription) => (
                      <Card key={prescription.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">
                              {new Date(prescription.date).toLocaleDateString("pt-BR")}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div>
                            <Label className="text-muted-foreground">Medicamentos</Label>
                            <p className="mt-1">{prescription.medications}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Observações</Label>
                            <p className="mt-1">{prescription.observations}</p>
                          </div>
                        </CardContent>
                      </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Anamneses</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {anamneses.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Nenhuma anamnese registrada</p>
                    ) : (
                      anamneses.map((anamnesis) => (
                      <Card key={anamnesis.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {new Date(anamnesis.date).toLocaleDateString("pt-BR")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-muted-foreground">Sintomas</Label>
                            <p className="mt-1">{anamnesis.symptoms}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Medicamentos</Label>
                            <p className="mt-1">{anamnesis.medications}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Exame Clínico</Label>
                            <p className="mt-1">{anamnesis.clinicalExam}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Observações</Label>
                            <p className="mt-1">{anamnesis.observations}</p>
                          </div>
                        </CardContent>
                      </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new-anamnesis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Nova Anamnese</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="symptoms">
                    Sintomas / Queixas <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="symptoms"
                    placeholder="Descreva os sintomas apresentados pelo paciente..."
                    value={newAnamnesis.symptoms}
                    onChange={(e) =>
                      setNewAnamnesis({ ...newAnamnesis, symptoms: e.target.value })
                    }
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medications">Medicamentos em Uso</Label>
                  <Textarea
                    id="medications"
                    placeholder="Liste os medicamentos que o paciente está tomando ou escreva 'Nenhum'"
                    value={newAnamnesis.medications}
                    onChange={(e) =>
                      setNewAnamnesis({ ...newAnamnesis, medications: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicalExam">
                    Tipo de Exame Clínico <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={newAnamnesis.clinicalExamId}
                    onValueChange={(value) => {
                      const selected = services.find(s => s.id === value);
                      setNewAnamnesis({
                        ...newAnamnesis,
                        clinicalExamId: value,
                        clinicalExam: selected?.nome || '',
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de exame" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations">Observações Gerais</Label>
                  <Textarea
                    id="observations"
                    placeholder="Observações adicionais sobre o paciente..."
                    value={newAnamnesis.observations}
                    onChange={(e) =>
                      setNewAnamnesis({ ...newAnamnesis, observations: e.target.value })
                    }
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleSubmitAnamnesis}
                  size="lg"
                  className="w-full"
                >
                  <Send className="mr-2 h-5 w-5" />
                  Enviar para Fila de Atendimento
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
