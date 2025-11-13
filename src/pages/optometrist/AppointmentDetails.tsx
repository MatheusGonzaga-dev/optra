import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, FileDown, User, History, Loader2, AlertCircle, ClipboardCheck } from "lucide-react";
import PrescriptionView from "@/components/PrescriptionView";
import type { PrescriptionData } from "@/components/PrescriptionView";
import { API_BASE_URL } from "@/lib/utils";

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

const AppointmentDetails = () => {
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
          console.log('📋 Prontuário carregado do banco:', prontData);
          const prontuarioSelecionado = Array.isArray(prontData) ? prontData[0] ?? null : null;
          console.log('📄 Prontuário selecionado:', prontuarioSelecionado);
          setProntuario(prontuarioSelecionado);
        } else {
          console.warn('⚠️ Nenhum prontuário encontrado para fila_id:', id);
          setProntuario(null);
        }

        // Buscar exames
        const examsResp = await fetch(`${API_BASE_URL}/exames?fila_id=${id}`);
        if (examsResp.ok) {
          const examsData = await examsResp.json();
          console.log('🔬 Exames carregados:', examsData);
          setExams(examsData || []);
        } else {
          console.warn('⚠️ Nenhum exame encontrado para fila_id:', id);
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
    console.log('🔍 Processando prescrição - prontuario:', prontuario);
    if (!prontuario?.prescricao_json) {
      console.warn('⚠️ Nenhuma prescrição encontrada no prontuário');
      return null;
    }
    const raw = prontuario.prescricao_json;
    console.log('📝 Prescrição raw:', raw);
    let json: any = raw;
    if (typeof raw === "string") {
      try {
        json = JSON.parse(raw);
        console.log('✅ Prescrição parsed:', json);
      } catch (error) {
        console.error("❌ Erro ao analisar prescrição salva:", error);
        return null;
      }
    }

    const distance = json.distance ?? {};
    const prescriptionData = {
      distanceOD: json.distanceOD ?? distance.od ?? null,
      distanceOE: json.distanceOE ?? distance.oe ?? null,
      addition: json.addition ?? "",
      lensType: json.lensType ?? "",
      returnDate: json.returnDate ?? prontuario.data_retorno ?? "",
      observations: json.observations ?? prontuario.observacoes ?? "",
      recommendations: json.recommendations ?? prontuario.recomendacoes ?? "",
    };
    console.log('📊 Prescrição final montada:', prescriptionData);
    return prescriptionData;
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

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    console.log("Exportar PDF");
  };

  if (loading) {
    return (
      <DashboardLayout role="optometrist">
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando prontuário...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !filaData) {
    return (
      <DashboardLayout role="optometrist">
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-base font-semibold">
            {error || "Prontuário não encontrado para este atendimento."}
          </p>
          <Button variant="outline" onClick={() => navigate("/optometrist/appointments")}>
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
        <Tabs defaultValue="patient" className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-4">
            <TabsTrigger value="patient">
              <User className="w-4 h-4 mr-2" />
              Dados do Paciente
            </TabsTrigger>
            <TabsTrigger value="anamnesis">
              <History className="w-4 h-4 mr-2" />
              Anamnese
            </TabsTrigger>
            <TabsTrigger value="exams">
              Exames
            </TabsTrigger>
            <TabsTrigger value="prescription">
              Prescrição
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
                  <p className="text-base mt-1">{patient?.nome_completo ?? "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">CPF</label>
                  <p className="text-base mt-1">{patient?.cpf ?? "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Idade</label>
                  <p className="text-base mt-1">
                    {patientAge !== null ? `${patientAge} anos` : "___ anos"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <p className="text-base mt-1">{patient?.telefone ?? "—"}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                  <p className="text-base mt-1">{patient?.endereco ?? "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data do Atendimento</label>
                  <p className="text-base mt-1">{atendimentoDataHora}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Procedimento</label>
                  <Badge className="mt-1 capitalize">
                    {formatProcedure(filaData?.tipo_atendimento)}
                  </Badge>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Exames */}
          <TabsContent value="exams">
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

          {/* Prescrição */}
          <TabsContent value="prescription">
            <PrescriptionView prescription={prescription} />
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
                  <p className="text-base mt-2">{anamnesis.symptoms}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Medicamentos em Uso</label>
                  <p className="text-base mt-2">{anamnesis.medications}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Observações Gerais</label>
                  <p className="text-base mt-2">{anamnesis.observations}</p>
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
