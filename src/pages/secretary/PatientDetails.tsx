import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Edit } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

// Mock data - será substituído por dados reais do backend
const mockPatientData = {
  "1": {
    id: "1",
    name: "João Silva Santos",
    cpf: "123.456.789-00",
    birthDate: "1985-03-15",
    age: 39,
    phone1: "(11) 98765-4321",
    phone2: "(11) 3456-7890",
    address: "Rua das Flores, 123, Centro, São Paulo - SP",
    prescriptions: [
      {
        id: "p1",
        date: "2024-01-15",
        medications: "Colirio Lubrificante 3x ao dia",
        observations: "Uso contínuo por 30 dias",
      },
      {
        id: "p2",
        date: "2023-12-10",
        medications: "Óculos para miopia -2.00 em ambos os olhos",
        observations: "Uso contínuo",
      },
    ],
    exams: [
      {
        id: "e1",
        date: "2024-01-15",
        type: "Teste de Acuidade Visual",
        result: "OD: 20/40, OE: 20/30",
        observations: "Leve piora em relação ao último exame",
      },
      {
        id: "e2",
        date: "2023-12-10",
        type: "Tonometria",
        result: "OD: 14mmHg, OE: 15mmHg",
        observations: "Valores normais",
      },
    ],
    anamneses: [
      {
        id: "a1",
        date: "2024-01-15",
        symptoms: "Vista cansada, dor de cabeça ao final do dia",
        medications: "Não faz uso de medicamentos contínuos",
        clinicalExam: "Refração completa",
        observations: "Paciente trabalha muitas horas em frente ao computador",
      },
      {
        id: "a2",
        date: "2023-12-10",
        symptoms: "Visão embaçada para longe",
        medications: "Nenhum",
        clinicalExam: "Exame de refração",
        observations: "Primeira consulta do paciente",
      },
    ],
  },
};

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("personal");
  
  const [newAnamnesis, setNewAnamnesis] = useState({
    symptoms: "",
    medications: "",
    clinicalExam: "",
    observations: "",
  });

  const patient = mockPatientData[id as keyof typeof mockPatientData];

  if (!patient) {
    return (
      <DashboardLayout role="secretary">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Paciente não encontrado</p>
          <Button onClick={() => navigate("/secretary/patients")} className="mt-4">
            Voltar para lista
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmitAnamnesis = () => {
    if (!newAnamnesis.symptoms || !newAnamnesis.clinicalExam) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha os sintomas e o tipo de exame clínico",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Anamnese registrada!",
      description: "Paciente enviado para fila de atendimento",
    });

    // Limpar formulário
    setNewAnamnesis({
      symptoms: "",
      medications: "",
      clinicalExam: "",
      observations: "",
    });

    // Navegar para dashboard após 2 segundos
    setTimeout(() => {
      navigate("/secretary/dashboard");
    }, 2000);
  };

  return (
    <DashboardLayout role="secretary">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/secretary/patients")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{patient.name}</h1>
            <p className="text-muted-foreground">CPF: {patient.cpf}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescrições</TabsTrigger>
            <TabsTrigger value="exams">Exames</TabsTrigger>
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
                    <p className="font-medium mt-1">{patient.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">CPF</Label>
                    <p className="font-medium mt-1">{patient.cpf}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Data de Nascimento</Label>
                    <p className="font-medium mt-1">
                      {new Date(patient.birthDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Idade</Label>
                    <p className="font-medium mt-1">{patient.age} anos</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Telefone Principal</Label>
                    <p className="font-medium mt-1">{patient.phone1}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Telefone Secundário</Label>
                    <p className="font-medium mt-1">{patient.phone2}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-muted-foreground">Endereço</Label>
                    <p className="font-medium mt-1">{patient.address}</p>
                  </div>
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
                    {patient.prescriptions.map((prescription) => (
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
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exames Clínicos Realizados</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {patient.exams.map((exam) => (
                      <Card key={exam.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{exam.type}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(exam.date).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div>
                            <Label className="text-muted-foreground">Resultado</Label>
                            <p className="mt-1 font-medium">{exam.result}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Observações</Label>
                            <p className="mt-1">{exam.observations}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
                    {patient.anamneses.map((anamnesis) => (
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
                    ))}
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
                  <Input
                    id="clinicalExam"
                    placeholder="Ex: Refração completa, Tonometria, etc."
                    value={newAnamnesis.clinicalExam}
                    onChange={(e) =>
                      setNewAnamnesis({ ...newAnamnesis, clinicalExam: e.target.value })
                    }
                  />
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
