import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Printer,
  FileDown,
  User,
  ClipboardCheck,
  History,
  Loader2,
  AlertCircle,
} from "lucide-react";
import PrescriptionView from "@/components/PrescriptionView";
import type { PrescriptionData } from "@/components/PrescriptionView";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
const formatProcedure = (value?: string | null) =>
  value ? value.replace(/_/g, " ").toLowerCase() : "—";

const formatDateTime = (iso?: string | null) => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const calculateAge = (birth?: string | null) => {
  if (!birth) return null;
  const birthDate = new Date(birth);
  if (Number.isNaN(birthDate.getTime())) return null;
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const AdminAppointmentDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filaData, setFilaData] = useState<any>(null);
  const [prontuario, setProntuario] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const filaResp = await fetch(`${API_BASE_URL}/fila/${id}`);
        if (!filaResp.ok) throw new Error("Não foi possível carregar os dados do atendimento.");
        const filaJson = await filaResp.json();
        setFilaData(filaJson);

        const prontResp = await fetch(`${API_BASE_URL}/atendimentos/prontuarios?fila_id=${id}`);
        if (prontResp.ok) {
          const prontData = await prontResp.json();
          setProntuario(Array.isArray(prontData) ? prontData[0] ?? null : null);
        } else {
          setProntuario(null);
        }

        // Buscar exames
        const examsResp = await fetch(`${API_BASE_URL}/exames?fila_id=${id}`);
        if (examsResp.ok) {
          const examsData = await examsResp.json();
          setExams(examsData || []);
        } else {
          setExams([]);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erro ao carregar o atendimento.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const patient = filaData?.pacientes;
  const patientAge = calculateAge(patient?.data_nascimento);

  const prescription: PrescriptionData | null = useMemo(() => {
    if (!prontuario?.prescricao_json) return null;
    const raw = prontuario.prescricao_json;
    let json: any = raw;
    if (typeof raw === "string") {
      try {
        json = JSON.parse(raw);
      } catch (error) {
        console.error("Erro ao analisar prescrição salva:", error);
        return null;
      }
    }
    const distance = json.distance ?? {};
    return {
      distanceOD: json.distanceOD ?? distance.od ?? null,
      distanceOE: json.distanceOE ?? distance.oe ?? null,
      addition: json.addition ?? "",
      lensType: json.lensType ?? "",
      returnDate: json.returnDate ?? prontuario.data_retorno ?? "",
      observations: json.observations ?? prontuario.observacoes ?? "",
      recommendations: json.recommendations ?? prontuario.recomendacoes ?? "",
    };
  }, [prontuario]);

  const anamnesis = {
    symptoms: filaData?.sintomas ?? "—",
    medications:
      filaData?.usa_medicamentos && filaData?.medicamentos_lista
        ? filaData.medicamentos_lista
        : filaData?.usa_medicamentos
          ? "Utiliza medicamentos (não informado)"
          : "Nenhum",
    observations: filaData?.observacoes ?? "—",
  };

  const optometristName = filaData?.optometrista_nome ?? "Profissional não identificado";

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    console.log("Exportar PDF");
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando prontuário...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !filaData) {
    return (
      <DashboardLayout role="admin">
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-base font-semibold">
            {error || "Prontuário não encontrado para este atendimento."}
          </p>
          <Button variant="outline" onClick={() => navigate("/admin/appointments")}>
            Voltar para Histórico
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const atendimentoDataHora =
    formatDateTime(filaData.hora_inicio_atendimento) !== "—"
      ? formatDateTime(filaData.hora_inicio_atendimento)
      : formatDateTime(filaData.criado_em);

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
                {patient?.nome_completo ?? "Paciente"} • {atendimentoDataHora}
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
                  <p className="font-medium">{patient?.nome_completo ?? "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Idade</p>
                  <p className="font-medium">
                    {patientAge !== null ? `${patientAge} anos` : "___ anos"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CPF</p>
                  <p className="font-medium">{patient?.cpf ?? "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{patient?.telefone ?? "—"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium">{patient?.endereco ?? "—"}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Informações do Atendimento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Data do Atendimento</p>
                  <p className="font-medium">{atendimentoDataHora}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profissional Responsável</p>
                  <p className="font-medium">{optometristName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Procedimento</p>
                  <Badge variant="secondary">{formatProcedure(filaData?.tipo_atendimento)}</Badge>
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
                  <p className="text-sm">{anamnesis.symptoms}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Medicamentos em Uso</p>
                  <p className="text-sm">{anamnesis.medications}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Observações</p>
                  <p className="text-sm">{anamnesis.observations}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Exames */}
          <TabsContent value="exames" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                Exames Clínicos
              </h3>
              {exams.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Este atendimento ainda não possui exames cadastrados no sistema.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {exams.map((exam, index) => (
                    <div key={exam.id || index} className="p-4 rounded-lg border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-base">{exam.nome_exame}</h4>
                        <Badge variant="outline" className="text-xs">
                          {new Date(exam.data_realizacao).toLocaleDateString("pt-BR")}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Resultado</label>
                          <p className="text-sm mt-1">{exam.resultado}</p>
                        </div>
                        {exam.observacoes && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Observações</label>
                            <p className="text-sm mt-1">{exam.observacoes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Receita */}
          <TabsContent value="receita">
            <PrescriptionView prescription={prescription} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminAppointmentDetails;
