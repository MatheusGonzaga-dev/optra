import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Save, Edit, Printer, FileDown, ArrowLeft, Loader2, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const PatientAttendance = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ID da fila
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(true);
  const [filaData, setFilaData] = useState<any>(null);
  const [returnDate, setReturnDate] = useState<Date>();
  const [partnerships, setPartnerships] = useState<Array<{id: string; nome: string}>>([]);
  const [serviceOrder, setServiceOrder] = useState({
    serviceName: "",
    basePrice: 0,
    discount: 0,
    addition: 0,
    partnershipId: "",
    serviceId: "",
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  
  // Determinar role e rota de volta
  const getUserRole = () => {
    if (usuario?.perfil === 'ADMINISTRADOR') return 'admin';
    if (usuario?.perfil === 'OPTOMETRISTA') return 'optometrist';
    return 'optometrist';
  };
  
  const getBackRoute = () => {
    if (usuario?.perfil === 'ADMINISTRADOR') return '/admin/queue';
    return '/optometrist/queue';
  };
  const [prescriptionData, setPrescriptionData] = useState({
    distanceOD: { spherical: "", cylindrical: "", axis: "", av: "" },
    distanceOE: { spherical: "", cylindrical: "", axis: "", av: "" },
    lensType: "",
    observations: "",
    recommendations: "",
    addition: "",
  });

  const [exams, setExams] = useState<Array<{
    id?: string;
    nome_exame: string;
    resultado: string;
    observacoes: string;
  }>>([]);

  const addExam = () => {
    setExams([...exams, { nome_exame: "", resultado: "", observacoes: "" }]);
  };

  const removeExam = (index: number) => {
    setExams(exams.filter((_, i) => i !== index));
  };

  const updateExam = (index: number, field: string, value: string) => {
    const updated = [...exams];
    updated[index] = { ...updated[index], [field]: value };
    setExams(updated);
  };

  // Carregar parcerias
  useEffect(() => {
    const fetchPartnerships = async () => {
      try {
        const resp = await fetch('http://localhost:4000/parcerias');
        const data = await resp.json();
        setPartnerships((data || []).map((p: any) => ({ id: p.id, nome: p.nome })));
      } catch {
        // ignore
      }
    };
    fetchPartnerships();
  }, []);

  // Carregar dados da fila
  useEffect(() => {
    const fetchFilaData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:4000/fila/${id}`);
        if (!response.ok) throw new Error('Erro ao buscar dados do atendimento');
        const data = await response.json();
        setFilaData(data);
        // Inicializar Ordem de Serviço com base no atendimento
        const tipoToNome: Record<string, string> = {
          'CONSULTA_COMPLETA': 'Consulta Completa',
          'REFRACAO': 'Refração',
          'RETORNO': 'Retorno',
          'EXAME_LENTE_CONTATO': 'Exame para Lente de Contato',
        };
        
        // Buscar serviço pelo nome para ter o ID
        const servResp = await fetch('http://localhost:4000/servicos');
        const servicos = await servResp.json();
        const nomeServico = tipoToNome[data.tipo_atendimento] || data.tipo_atendimento;
        
        console.log('🔍 Buscando serviço:', nomeServico);
        console.log('📋 Todos os serviços disponíveis:', servicos.map((s: any) => ({ id: s.id, nome: s.nome })));
        
        // Busca exata primeiro
        let servico = servicos.find((s: any) => s.nome === nomeServico);
        
        // Se não encontrar, busca parcial (ignorando maiúsculas/minúsculas)
        if (!servico) {
          const nomeBusca = nomeServico.toLowerCase().trim();
          servico = servicos.find((s: any) => s.nome.toLowerCase().trim() === nomeBusca);
        }
        
        // Se ainda não encontrar, busca por contém
        if (!servico) {
          const nomeBusca = nomeServico.toLowerCase().trim();
          servico = servicos.find((s: any) => 
            s.nome.toLowerCase().trim().includes(nomeBusca) || 
            nomeBusca.includes(s.nome.toLowerCase().trim())
          );
        }
        
        console.log('✅ Serviço encontrado:', servico ? { id: servico.id, nome: servico.nome } : 'NÃO ENCONTRADO');
        
        const serviceId = servico?.id || "";
        console.log('🆔 ServiceId definido:', serviceId || 'VAZIO - Serviço não encontrado!');
        
        setServiceOrder({
          serviceName: nomeServico || "",
          basePrice: Number(data.valor_consulta || 0),
          discount: 0,
          addition: 0,
          partnershipId: "",
          serviceId: serviceId,
        });
      } catch (error: any) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados do atendimento');
        navigate('/optometrist/queue');
      } finally {
        setLoading(false);
      }
    };

    fetchFilaData();
  }, [id, navigate]);

  // Buscar desconto/acréscimo quando parceria e serviço são selecionados
  useEffect(() => {
    const applyPartnershipDiscount = async () => {
      if (!serviceOrder.partnershipId || !serviceOrder.serviceId) {
        // Se não houver parceria selecionada, limpar desconto/acréscimo
        if (!serviceOrder.partnershipId) {
          setServiceOrder(prev => ({
            ...prev,
            discount: 0,
            addition: 0,
          }));
        }
        return;
      }

      try {
        console.log('Buscando desconto para parceria:', serviceOrder.partnershipId, 'serviço:', serviceOrder.serviceId);
        const resp = await fetch(`http://localhost:4000/parcerias/${serviceOrder.partnershipId}/servicos`);
        if (!resp.ok) {
          console.error('Erro ao buscar vínculos:', resp.status);
          return;
        }
        const vínculos = await resp.json();
        console.log('Vínculos encontrados:', vínculos);
        
        const vínculo = vínculos.find((v: any) => {
          const servicoId = v.servico_id || v.servicos?.id;
          console.log('Comparando:', servicoId, 'com', serviceOrder.serviceId);
          return servicoId === serviceOrder.serviceId;
        });
        
        if (vínculo) {
          console.log('Vínculo encontrado:', vínculo);
          let descontoTotal = Number(vínculo.desconto_valor || 0);
          let acrescimoTotal = Number(vínculo.acrescimo_valor || 0);
          
          // Calcular desconto percentual
          if (vínculo.desconto_percentual > 0) {
            const descontoPerc = (serviceOrder.basePrice * Number(vínculo.desconto_percentual) / 100);
            descontoTotal += descontoPerc;
            console.log('Desconto percentual aplicado:', descontoPerc);
          }
          
          // Calcular acréscimo percentual
          if (vínculo.acrescimo_percentual > 0) {
            const acrescimoPerc = (serviceOrder.basePrice * Number(vínculo.acrescimo_percentual) / 100);
            acrescimoTotal += acrescimoPerc;
            console.log('Acréscimo percentual aplicado:', acrescimoPerc);
          }
          
          console.log('Desconto total:', descontoTotal, 'Acréscimo total:', acrescimoTotal);
          
          setServiceOrder(prev => ({
            ...prev,
            discount: descontoTotal,
            addition: acrescimoTotal,
          }));
        } else {
          console.log('Nenhum vínculo encontrado para este serviço');
          // Se não houver vínculo, limpar desconto/acréscimo
          setServiceOrder(prev => ({
            ...prev,
            discount: 0,
            addition: 0,
          }));
        }
      } catch (error) {
        console.error('Erro ao aplicar desconto da parceria:', error);
      }
    };
    applyPartnershipDiscount();
  }, [serviceOrder.partnershipId, serviceOrder.serviceId, serviceOrder.basePrice]);

  const handleSave = async (isDraft: boolean = false) => {
    try {
      // Salvar prontuário
      if (id) {
        console.log('📝 Salvando prontuário:', {
          prescriptionData,
          returnDate: returnDate ? returnDate.toISOString() : undefined
        });
        
        const prontuarioResp = await fetch(`http://localhost:4000/atendimentos/${id}/prontuario`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prescription: prescriptionData,
            observations: prescriptionData.observations,
            recommendations: prescriptionData.recommendations,
            returnDate: returnDate ? returnDate.toISOString() : undefined,
          })
        });
        
        if (!prontuarioResp.ok) {
          const errorText = await prontuarioResp.text();
          console.error('❌ Erro ao salvar prontuário:', errorText);
          throw new Error('Erro ao salvar prontuário');
        }
        
        const prontuarioData = await prontuarioResp.json();
        console.log('✅ Prontuário salvo:', prontuarioData);

        // Salvar exames
        console.log('📝 Salvando exames:', exams);
        const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
        for (const exam of exams) {
          if (exam.nome_exame && exam.resultado) {
            const examResp = await fetch(`${API_BASE_URL}/exames/${id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                nome_exame: exam.nome_exame,
                resultado: exam.resultado,
                observacoes: exam.observacoes || '',
              })
            });
            if (!examResp.ok) {
              const errorText = await examResp.text();
              console.error('❌ Erro ao salvar exame:', errorText);
            } else {
              const examData = await examResp.json();
              console.log('✅ Exame salvo:', examData);
            }
          }
        }
        console.log('✅ Todos os exames foram processados');

        // Salvar ordem de serviço
        const subtotal = serviceOrder.basePrice;
        const desconto = Math.max(0, serviceOrder.discount);
        const acrescimo = Math.max(0, serviceOrder.addition);
        const total = subtotal - desconto + acrescimo;
        await fetch(`http://localhost:4000/atendimentos/${id}/os`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceName: serviceOrder.serviceName || 'Serviço',
            basePrice: subtotal,
            discount: desconto,
            addition: acrescimo,
            total,
            parceria_id: serviceOrder.partnershipId || null,
            createReceivable: !isDraft, // Gera conta a receber apenas ao finalizar (não em rascunho)
          })
        });
      }
      
      toast.success(isDraft ? "Rascunho salvo" : "Atendimento finalizado e título gerado no Contas a Receber");
      
      if (!isDraft) {
        // Marcar como atendido e voltar para fila
        if (id) {
          await fetch(`http://localhost:4000/fila/${id}/finalizar`, { method: 'POST' });
        }
        navigate(getBackRoute());
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar atendimento');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePrintPrescription = () => {
    if (!filaData || !patient) return;

    const formatValue = (value: string) => value?.trim() ? value : "—";
    const formatAdicao = (value: string) => value?.trim() ? value : "";
    const formatDateBr = (date?: Date) => date ? format(date, "dd/MM/yyyy") : "____/____/______";
    const patientFirstName = patient?.nome_completo?.split(" ")[0] || "Optometrista";
    const optometristName = filaData.optometrista_nome || `Dr. ${patientFirstName}`;
    const patientAgeDisplay = patient?.idade ? `${patient.idade} anos` : "_____ anos";

    const distanceOD = prescriptionData.distanceOD;
    const distanceOE = prescriptionData.distanceOE;

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Receituário</title>
    <style>
      @page { size: A4; margin: 8mm; }
      * { box-sizing: border-box; font-family: 'Inter', Arial, sans-serif; }
      body { margin: 0; padding: 4mm; background: #f1f5f9; color: #0f172a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .wrapper { max-width: 720px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 25px 50px rgba(15, 23, 42, 0.12); page-break-inside: avoid; }
      .header { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; background: linear-gradient(135deg, #1d4ed8, #0ea5e9); color: #fff; }
      .brand { display: flex; align-items: center; gap: 12px; }
      .brand__logo { width: 46px; height: 46px; border-radius: 12px; background: rgba(255,255,255,0.22); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 17px; letter-spacing: 0.8px; }
      .brand__title { font-size: 18px; font-weight: 700; }
      .brand__subtitle { font-size: 11px; opacity: 0.92; margin-top: 3px; letter-spacing: 0.15px; }
      .meta { text-align: right; font-size: 11px; opacity: 0.95; }
      .section { padding: 16px 24px; border-top: 1px solid #e2e8f0; page-break-inside: avoid; }
      .section:first-child { border-top: none; }
      .section__title { margin: 0 0 10px; font-size: 13px; font-weight: 600; color: #0f172a; display: flex; align-items: center; gap: 9px; }
      .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
      .info-item { display: flex; flex-direction: column; gap: 4px; }
      .info-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; }
      .info-value { font-size: 12px; font-weight: 600; color: #0f172a; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th, td { border: 1px solid #e2e8f0; padding: 7px 8px; text-align: center; font-size: 11px; }
      th { background: #f8fafc; font-weight: 600; color: #475569; }
      td { font-weight: 500; }
      .table-subtitle { text-align: left; font-size: 11px; font-weight: 600; color: #1e293b; margin-top: 10px; }
      .options { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; margin-top: 10px; }
      .option { display: flex; align-items: center; gap: 7px; font-size: 10px; color: #475569; }
      .checkbox { width: 13px; height: 13px; border: 2px solid #cbd5f5; border-radius: 5px; }
      .recommendations { margin-top: 12px; background: #f8fafc; border-radius: 10px; padding: 13px 16px; border: 1px solid #e2e8f0; }
      .recommendations h4 { margin: 0 0 8px; font-size: 11px; color: #1e293b; font-weight: 600; }
      .recommendations ul { margin: 0; padding-left: 14px; display: grid; gap: 5px; font-size: 9.5px; color: #475569; line-height: 1.4; }
      .footer-info { padding: 14px 24px; border-top: 1px solid #e2e8f0; background: #f8fafc; }
      .footer-text { color: #475569; }
      .footer-text strong { color: #1e293b; }
      .footer { padding: 12px 24px 14px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #64748b; }
      .signature { text-align: right; font-size: 10px; }
      .signature-line { width: 150px; border-bottom: 1px solid #94a3b8; margin-bottom: 5px; margin-left: auto; }
      .badge { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; background: rgba(37, 99, 235, 0.12); color: #1d4ed8; padding: 5px 11px; border-radius: 999px; font-weight: 600; letter-spacing: 0.025em; border: 1px solid rgba(37, 99, 235, 0.18); }
      .badge-dot { width: 6px; height: 6px; border-radius: 999px; background: currentColor; display: inline-block; }
      .adicao-destaque { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; align-items: center; }
      .adicao-box { background: linear-gradient(135deg, #fef3c7, #fde68a); border: 3px solid #f59e0b; border-radius: 12px; padding: 18px 22px; text-align: center; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.22); }
      .adicao-label { display: block; font-size: 12px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 8px; }
      .adicao-value { display: block; font-size: 28px; font-weight: 800; color: #92400e; letter-spacing: 0.05em; min-height: 38px; border-bottom: 3px solid #f59e0b; padding-bottom: 4px; }
      @media print {
        body { background: #f1f5f9; padding: 0; }
        .wrapper { box-shadow: none; border: none; }
        .header { background: linear-gradient(135deg, #1d4ed8, #0ea5e9); color: #fff; }
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <div class="brand">
          <div class="brand__logo">OP</div>
          <div>
            <div class="brand__title">Optra Vision</div>
            <div class="brand__subtitle">Centro de Visão | Receituário Óptico</div>
          </div>
        </div>
        <div class="meta">
          <div><strong>Data:</strong> ${formatDateBr(returnDate)}</div>
          <div><strong>Idade:</strong> ${patientAgeDisplay}</div>
        </div>
      </div>

      <div class="section">
        <h3 class="section__title">Dados do Paciente</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Paciente</span>
            <span class="info-value">${patient.nome_completo || "—"}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Procedimento</span>
            <span class="info-value">${serviceOrder.serviceName || "—"}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Atendido por</span>
            <span class="info-value">${optometristName}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3 class="section__title">Prescrição para Óculos</h3>
        <div class="badge"><span class="badge-dot"></span> Somente Longe</div>

        <div class="table-subtitle">Para Longe</div>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Esférico</th>
              <th>Cilíndrico</th>
              <th>Eixo</th>
              <th>AV</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>OD</td>
              <td>${formatValue(distanceOD.spherical)}</td>
              <td>${formatValue(distanceOD.cylindrical)}</td>
              <td>${formatValue(distanceOD.axis)}</td>
              <td>${formatValue(distanceOD.av)}</td>
            </tr>
            <tr>
              <td>OE</td>
              <td>${formatValue(distanceOE.spherical)}</td>
              <td>${formatValue(distanceOE.cylindrical)}</td>
              <td>${formatValue(distanceOE.axis)}</td>
              <td>${formatValue(distanceOE.av)}</td>
            </tr>
          </tbody>
        </table>

        <div class="adicao-destaque">
          <div class="adicao-box">
            <span class="adicao-label">ADIÇÃO</span>
            <span class="adicao-value">${formatAdicao(prescriptionData.addition)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Tipo de Lente</span>
            <span class="info-value">${formatValue(prescriptionData.lensType)}</span>
          </div>
        </div>

        <div class="options">
          <div class="option"><div class="checkbox"></div> Filtro Blue</div>
          <div class="option"><div class="checkbox"></div> Antirreflexo Digital</div>
          <div class="option"><div class="checkbox"></div> Fotocromático</div>
          <div class="option"><div class="checkbox"></div> Multifocal Digital</div>
          <div class="option"><div class="checkbox"></div> Multifocal Blue</div>
          <div class="option"><div class="checkbox"></div> Multifocal Fotocromático</div>
        </div>

        <div class="info-grid" style="margin-top: 12px;">
          <div class="info-item">
            <span class="info-label">Observações do Profissional</span>
            <span class="info-value" style="min-height: 36px; font-size: 11px; line-height: 1.4;">${formatValue(prescriptionData.observations)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Recomendações Personalizadas</span>
            <span class="info-value" style="min-height: 36px; font-size: 11px; line-height: 1.4;">${formatValue(prescriptionData.recommendations)}</span>
          </div>
        </div>

        <div class="recommendations">
          <h4>Recomendações Importantes</h4>
          <ul>
            <li>Adquira seus óculos na óptica de sua preferência, venda casada é ilegal</li>
            <li>Traga seus óculos pra conferência</li>
            <li>Para lentes de contato sempre siga as orientações de uso do seu especialista</li>
            <li>O paciente encaminhado deve procurar especialista o mais rápido possível</li>
            <li>O atestado optométrico não é um atestado médico, ficando a critério da empresa, instituição ou pessoa física a sua aceitação para abonamento de falta ou similares</li>
          </ul>
        </div>
      </div>

      <div class="footer-info">
        <div class="footer-text">
          <p style="margin: 0 0 7px 0; font-size: 9px; line-height: 1.35;">
            Para maiores informações, contate o Conselho Regional de Óptica e Optometria do Estado de São Paulo - CROOSP<br>
            Telefone: 11 3259-7748 | 11 3331-3537 - www.croosp.org.br<br>
            contato@croosp.org.br
          </p>
          <p style="margin: 0 0 6px 0; font-size: 8.5px; line-height: 1.35;">
            <strong>OPTOMETRIA:</strong> Atividade Profissional da Área da Saúde<br>
            <strong>Classificação Brasileira de Ocupações - CBO - MTE - 3233-05</strong><br>
            <strong>Classificação Nacional das Atividades Econômicas - CNAE - IBGE - 8650-0/99</strong>
          </p>
          <p style="margin: 0; font-size: 8.5px; line-height: 1.35; font-style: italic;">
            Prescrição para correção da visão com lentes corretivas e/ou óculos. Para uso de lentes de contato, necessário fazer conversão da distância ao vértice e compensação.
          </p>
        </div>
      </div>

      <div class="footer">
        <div>
          Resultado de atendimento realizado em conformidade com o CBO nº 3223 / optometria. Documento válido em todo território nacional.
        </div>
        <div class="signature">
          <div class="signature-line"></div>
          <div>${filaData.optometrista_nome || "Optometrista Responsável"}</div>
          <div>Optometrista</div>
        </div>
      </div>
    </div>
    <script>
      window.print();
      window.onafterprint = () => window.close();
    </script>
  </body>
</html>`;

    const printable = window.open("", "_blank");
    if (!printable) {
      toast.error("Não foi possível abrir o receituário para impressão.");
      return;
    }
    printable.document.write(html);
    printable.document.close();
    printable.focus();
  };

  const handleExportPDF = () => {
    toast.info("Funcionalidade em desenvolvimento");
  };

  if (loading) {
    return (
      <DashboardLayout role={getUserRole()}>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Carregando atendimento...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!filaData || !filaData.pacientes) {
    return (
      <DashboardLayout role={getUserRole()}>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Atendimento não encontrado</p>
          <Button onClick={() => navigate(getBackRoute())} className="mt-4">
            Voltar para Fila
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const patient = filaData.pacientes;

  return (
    <DashboardLayout role={getUserRole()}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(getBackRoute())}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Atendimento</h1>
              <p className="text-sm text-muted-foreground">
                {patient.nome_completo}
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

        {/* Patient Info */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block mb-1">Paciente:</span>
              <span className="font-medium">{patient.nome_completo}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1">Atendido por:</span>
              <span className="font-medium">Dr. {patient.nome_completo?.split(' ')[0] || 'Optometrista'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1">Procedimento:</span>
              <span className="font-medium">
                {filaData.tipo_atendimento === 'CONSULTA_COMPLETA' ? 'Consulta Completa' :
                 filaData.tipo_atendimento === 'REFRACAO' ? 'Refração' :
                 filaData.tipo_atendimento === 'RETORNO' ? 'Retorno' :
                 filaData.tipo_atendimento === 'EXAME_LENTE_CONTATO' ? 'Exame Lente de Contato' :
                 filaData.tipo_atendimento}
              </span>
            </div>
          </div>
        </Card>

        {/* Prescription Section */}
        <Tabs defaultValue="prescription" className="w-full">
          <TabsList className="grid w-full max-w-3xl grid-cols-4 mb-6">
            <TabsTrigger value="prescription">Prescrição</TabsTrigger>
            <TabsTrigger value="exams">Exames</TabsTrigger>
            <TabsTrigger value="patient">Dados do Paciente</TabsTrigger>
            <TabsTrigger value="serviceOrder">Ordem de Serviço</TabsTrigger>
          </TabsList>

          {/* Prescrição */}
          <TabsContent value="prescription">
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Prescrição para Óculos</h2>
                  <p className="text-sm text-muted-foreground">
                    Preencha os campos abaixo para gerar o receituário completo.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handlePrintPrescription}>
                  <FileText className="w-4 h-4 mr-2" />
                  Imprimir Receituário
                </Button>
              </div>
              
              <div className="space-y-8">
                {[
                  {
                    label: "OD",
                    distanceKey: "distanceOD" as const,
                  },
                  {
                    label: "OE",
                    distanceKey: "distanceOE" as const,
                  },
                ].map((eye) => (
                  <div key={eye.label} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-base">Olho {eye.label}</h3>
                      <div className="flex-1 border-t border-dashed border-muted ml-4" />
                    </div>
                    <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                      <p className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Para Longe
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                          <Label className="text-xs">Esférico</Label>
                          <Input
                            placeholder="Esf"
                            value={prescriptionData[eye.distanceKey].spherical}
                            onChange={(e) =>
                              setPrescriptionData({
                                ...prescriptionData,
                                [eye.distanceKey]: {
                                  ...prescriptionData[eye.distanceKey],
                                  spherical: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Cilíndrico</Label>
                          <Input
                            placeholder="Cil"
                            value={prescriptionData[eye.distanceKey].cylindrical}
                            onChange={(e) =>
                              setPrescriptionData({
                                ...prescriptionData,
                                [eye.distanceKey]: {
                                  ...prescriptionData[eye.distanceKey],
                                  cylindrical: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Eixo</Label>
                          <Input
                            placeholder="°"
                            value={prescriptionData[eye.distanceKey].axis}
                            onChange={(e) =>
                              setPrescriptionData({
                                ...prescriptionData,
                                [eye.distanceKey]: {
                                  ...prescriptionData[eye.distanceKey],
                                  axis: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-xs">AV</Label>
                          <Input
                            placeholder="AV"
                            value={prescriptionData[eye.distanceKey].av}
                            onChange={(e) =>
                              setPrescriptionData({
                                ...prescriptionData,
                                [eye.distanceKey]: {
                                  ...prescriptionData[eye.distanceKey],
                                  av: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Adição</Label>
                    <Input 
                      placeholder="Informe a adição (opcional)"
                      value={prescriptionData.addition}
                      onChange={(e) => setPrescriptionData({...prescriptionData, addition: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Lente</Label>
                    <Input 
                      placeholder="Tipo de lente"
                      value={prescriptionData.lensType}
                      onChange={(e) => setPrescriptionData({...prescriptionData, lensType: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Retorno em</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !returnDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {returnDate ? format(returnDate, "dd/MM/yyyy") : <span>Selecionar data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={returnDate}
                          onSelect={setReturnDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Observações</Label>
                    <Textarea
                      placeholder="Digite as observações do atendimento..."
                      className="min-h-[100px]"
                      value={prescriptionData.observations}
                      onChange={(e) => setPrescriptionData({...prescriptionData, observations: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Recomendações</Label>
                    <Textarea
                      placeholder="Digite as recomendações para o paciente..."
                      className="min-h-[100px]"
                      value={prescriptionData.recommendations}
                      onChange={(e) => setPrescriptionData({...prescriptionData, recommendations: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Ordem de Serviço */}
          <TabsContent value="serviceOrder">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Ordem de Serviço</h2>
                <Button variant="outline" onClick={() => {
                  const os = serviceOrder;
                  const paciente = filaData?.pacientes?.nome_completo || '';
                  const dataStr = new Date().toLocaleString('pt-BR');
                  const subtotal = os.basePrice;
                  const desconto = Math.max(0, os.discount);
                  const acrescimo = Math.max(0, os.addition);
                  const total = subtotal - desconto + acrescimo;
                  const w = window.open('', '_blank');
                  if (!w) return;
                  w.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Ordem de Serviço</title>
  <style>
    *{box-sizing:border-box}
    body{font-family: Inter, Arial, sans-serif; color:#0f172a; margin:0; padding:32px; background:#f8fafc}
    .os{max-width:820px; margin:0 auto; background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden}
    .os__header{display:flex; align-items:center; justify-content:space-between; padding:24px 28px; background:#0ea5e9; color:#fff}
    .brand{display:flex; align-items:center; gap:12px}
    .brand__logo{width:40px; height:40px; border-radius:8px; background:#fff; display:flex; align-items:center; justify-content:center; color:#0ea5e9; font-weight:700}
    .brand__name{font-size:18px; font-weight:700}
    .os__meta{font-size:12px; opacity:.9; text-align:right}
    .os__section{padding:22px 28px; border-top:1px solid #f1f5f9}
    .title{font-size:16px; font-weight:600; margin:0 0 12px}
    .grid{display:grid; grid-template-columns:1fr 1fr; gap:16px}
    .field{display:flex; flex-direction:column; gap:6px}
    .label{font-size:12px; color:#64748b}
    .value{font-size:14px; font-weight:600}
    table{width:100%; border-collapse:collapse; margin-top:8px}
    th, td{padding:12px 10px; border-bottom:1px solid #e2e8f0; text-align:left}
    th{font-size:12px; color:#64748b; font-weight:600; background:#f8fafc}
    .right{text-align:right}
    .summary{margin-top:8px; width:100%; max-width:360px; margin-left:auto}
    .summary__row{display:flex; align-items:center; justify-content:space-between; padding:8px 0; font-size:14px}
    .summary__row--total{border-top:1px solid #e2e8f0; margin-top:4px; padding-top:12px; font-weight:700; font-size:16px}
    .footer{padding:18px 28px; background:#f8fafc; font-size:12px; color:#64748b}
  </style>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  </head>
<body>
  <div class="os">
    <div class="os__header">
      <div class="brand">
        <div class="brand__logo">OP</div>
        <div>
          <div class="brand__name">Optra Vision</div>
          <div style="font-size:12px;opacity:.9">Ordem de Serviço</div>
        </div>
      </div>
      <div class="os__meta">
        <div><strong>Data:</strong> ${dataStr}</div>
      </div>
    </div>
    <div class="os__section">
      <h3 class="title">Cliente</h3>
      <div class="grid">
        <div class="field">
          <div class="label">Paciente</div>
          <div class="value">${paciente}</div>
        </div>
        <div class="field">
          <div class="label">Procedimento</div>
          <div class="value">${os.serviceName || '-'}</div>
        </div>
      </div>
    </div>
    <div class="os__section">
      <h3 class="title">Serviços</h3>
      <table>
        <thead>
          <tr>
            <th>Descrição</th>
            <th class="right">Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${os.serviceName || 'Serviço'}</td>
            <td class="right">${formatCurrency(subtotal)}</td>
          </tr>
          ${desconto > 0 ? `<tr><td>Desconto</td><td class="right">- ${formatCurrency(desconto)}</td></tr>` : ''}
          ${acrescimo > 0 ? `<tr><td>Acréscimo</td><td class="right">+ ${formatCurrency(acrescimo)}</td></tr>` : ''}
        </tbody>
      </table>
      <div class="summary">
        <div class="summary__row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
        <div class="summary__row"><span>Desconto</span><span>- ${formatCurrency(desconto)}</span></div>
        <div class="summary__row"><span>Acréscimo</span><span>+ ${formatCurrency(acrescimo)}</span></div>
        <div class="summary__row summary__row--total"><span>Total</span><span>${formatCurrency(total)}</span></div>
      </div>
    </div>
    <div class="footer">
      Esta OS é um resumo do serviço prestado. Valores em reais (R$).
    </div>
  </div>
  <script>window.print();window.onafterprint=()=>window.close();</script>
</body></html>`);
                  w.document.close();
                  w.focus();
                }}>
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir OS
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="print-os">
                <div>
                  <h3 className="font-semibold mb-4">Dados do Serviço</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Serviço</Label>
                      <Input value={serviceOrder.serviceName} disabled />
                    </div>
                    <div>
                      <Label>Valor Base</Label>
                      <Input type="number" value={serviceOrder.basePrice}
                        onChange={(e) => setServiceOrder({ ...serviceOrder, basePrice: Number(e.target.value || 0) })} />
                    </div>
                    <div>
                      <Label>Parceria (Opcional)</Label>
                      <Select
                        value={serviceOrder.partnershipId || undefined}
                        onValueChange={async (value) => {
                          const newPartnershipId = value || "";
                          
                          // Aplicar desconto imediatamente quando parceria for selecionada
                          if (newPartnershipId) {
                            try {
                              // Buscar o serviceId atual do estado de forma segura
                              let currentServiceId = serviceOrder.serviceId;
                              let basePrice = serviceOrder.basePrice;
                              
                              // Se não tiver serviceId, buscar baseado no filaData
                              if (!currentServiceId && filaData) {
                                console.warn('⚠️ ServiceId não encontrado, buscando novamente...');
                                const servResp = await fetch('http://localhost:4000/servicos');
                                const servicos = await servResp.json();
                                const tipoToNome: Record<string, string> = {
                                  'CONSULTA_COMPLETA': 'Consulta Completa',
                                  'REFRACAO': 'Refração',
                                  'RETORNO': 'Retorno',
                                  'EXAME_LENTE_CONTATO': 'Exame para Lente de Contato',
                                };
                                const nomeServico = tipoToNome[filaData.tipo_atendimento] || filaData.tipo_atendimento;
                                
                                console.log('🔍 Buscando serviço:', nomeServico);
                                console.log('📋 Serviços disponíveis:', servicos.map((s: any) => s.nome));
                                
                                // Busca exata primeiro
                                let servico = servicos.find((s: any) => s.nome === nomeServico);
                                
                                // Se não encontrar, busca parcial
                                if (!servico) {
                                  const nomeBusca = nomeServico.toLowerCase().trim();
                                  servico = servicos.find((s: any) => s.nome.toLowerCase().trim() === nomeBusca);
                                }
                                
                                // Se ainda não encontrar, busca por contém
                                if (!servico) {
                                  const nomeBusca = nomeServico.toLowerCase().trim();
                                  servico = servicos.find((s: any) => 
                                    s.nome.toLowerCase().trim().includes(nomeBusca) || 
                                    nomeBusca.includes(s.nome.toLowerCase().trim())
                                  );
                                }
                                
                                if (servico?.id) {
                                  currentServiceId = servico.id;
                                  console.log('✅ Serviço encontrado:', servico.nome, 'ID:', servico.id);
                                  // Atualizar o serviceId no estado
                                  setServiceOrder(prev => ({ ...prev, serviceId: servico.id }));
                                } else {
                                  console.error('❌ Serviço não encontrado! Nome buscado:', nomeServico);
                                  console.log('Serviços disponíveis:', servicos.map((s: any) => s.nome));
                                }
                              }
                              
                              console.log('Aplicando desconto - Parceria:', newPartnershipId, 'Serviço:', currentServiceId, 'Valor Base:', basePrice);
                              
                              if (!currentServiceId) {
                                console.error('ServiceId não encontrado!');
                                toast.error('Serviço não identificado. Recarregue a página.');
                                setServiceOrder(prev => ({ ...prev, partnershipId: newPartnershipId }));
                                return;
                              }
                              
                              const resp = await fetch(`http://localhost:4000/parcerias/${newPartnershipId}/servicos`);
                              if (!resp.ok) {
                                console.error('Erro ao buscar vínculos:', resp.status);
                                toast.error('Erro ao buscar descontos da parceria');
                                setServiceOrder(prev => ({ ...prev, partnershipId: newPartnershipId }));
                                return;
                              }
                              
                              const vínculos = await resp.json();
                              console.log('Vínculos retornados da API:', vínculos);
                              console.log('Procurando serviço:', currentServiceId);
                              
                              const vínculo = vínculos.find((v: any) => {
                                const servicoId = v.servico_id || v.servicos?.id;
                                console.log('Verificando vínculo - servico_id:', servicoId, 'esperado:', currentServiceId, 'match:', servicoId === currentServiceId);
                                return servicoId === currentServiceId;
                              });
                              
                              if (vínculo) {
                                console.log('✅ Vínculo encontrado!', vínculo);
                                let descontoTotal = Number(vínculo.desconto_valor || 0);
                                let acrescimoTotal = Number(vínculo.acrescimo_valor || 0);
                                
                                if (vínculo.desconto_percentual > 0) {
                                  const descontoPerc = (basePrice * Number(vínculo.desconto_percentual) / 100);
                                  descontoTotal += descontoPerc;
                                  console.log(`Desconto percentual: ${vínculo.desconto_percentual}% de ${basePrice} = ${descontoPerc}`);
                                }
                                
                                if (vínculo.acrescimo_percentual > 0) {
                                  const acrescimoPerc = (basePrice * Number(vínculo.acrescimo_percentual) / 100);
                                  acrescimoTotal += acrescimoPerc;
                                  console.log(`Acréscimo percentual: ${vínculo.acrescimo_percentual}% de ${basePrice} = ${acrescimoPerc}`);
                                }
                                
                                console.log('💰 Desconto total calculado:', descontoTotal);
                                console.log('💰 Acréscimo total calculado:', acrescimoTotal);
                                
                                setServiceOrder(prev => ({
                                  ...prev,
                                  partnershipId: newPartnershipId,
                                  discount: descontoTotal,
                                  addition: acrescimoTotal,
                                }));
                                toast.success(`Desconto aplicado: R$ ${descontoTotal.toFixed(2)}`);
                                return;
                              } else {
                                console.log('❌ Nenhum vínculo encontrado para este serviço');
                                console.log('Vínculos disponíveis:', vínculos.map((v: any) => ({ 
                                  servico_id: v.servico_id || v.servicos?.id,
                                  servico_nome: v.servicos?.nome
                                })));
                                toast.warning('Esta parceria não possui desconto configurado para este serviço');
                              }
                            } catch (error) {
                              console.error('Erro ao aplicar desconto:', error);
                              toast.error('Erro ao aplicar desconto da parceria');
                            }
                          }
                          
                          // Se não houver vínculo ou parceria removida, limpar desconto
                          setServiceOrder(prev => ({
                            ...prev,
                            partnershipId: newPartnershipId,
                            discount: 0,
                            addition: 0,
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a parceria (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {partnerships.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Ajustes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Desconto (R$)</Label>
                      <Input type="number" value={serviceOrder.discount}
                        onChange={(e) => setServiceOrder({ ...serviceOrder, discount: Number(e.target.value || 0) })}
                      />
                    </div>
                    <div>
                      <Label>Acréscimo (R$)</Label>
                      <Input type="number" value={serviceOrder.addition}
                        onChange={(e) => setServiceOrder({ ...serviceOrder, addition: Number(e.target.value || 0) })}
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(serviceOrder.basePrice)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Desconto</span>
                      <span>- {formatCurrency(Math.max(0, serviceOrder.discount))}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Acréscimo</span>
                      <span>+ {formatCurrency(Math.max(0, serviceOrder.addition))}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 border-t pt-3">
                      <span className="font-semibold">Total</span>
                      <span className="font-semibold">{formatCurrency(serviceOrder.basePrice - Math.max(0, serviceOrder.discount) + Math.max(0, serviceOrder.addition))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Exames */}
          <TabsContent value="exams">
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Exames Clínicos</h2>
                  <p className="text-sm text-muted-foreground">
                    Registre os resultados dos exames realizados durante o atendimento.
                  </p>
                </div>
                <Button onClick={addExam} variant="outline" size="sm">
                  <span className="mr-2">+</span>
                  Adicionar Exame
                </Button>
              </div>

              <div className="space-y-4">
                {exams.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum exame adicionado ainda.</p>
                    <p className="text-sm mt-2">Clique em "Adicionar Exame" para começar.</p>
                  </div>
                ) : (
                  exams.map((exam, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Exame {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExam(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remover
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nome do Exame *</Label>
                          <Input
                            placeholder="Ex: Refração, Tonometria, Biomicroscopia..."
                            value={exam.nome_exame}
                            onChange={(e) => updateExam(index, 'nome_exame', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Resultado *</Label>
                          <Input
                            placeholder="Ex: Miopia bilateral, 14 mmHg..."
                            value={exam.resultado}
                            onChange={(e) => updateExam(index, 'resultado', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Observações</Label>
                        <Textarea
                          placeholder="Observações adicionais sobre o exame..."
                          value={exam.observacoes}
                          onChange={(e) => updateExam(index, 'observacoes', e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Dados do Paciente */}
          <TabsContent value="patient">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Informações do Paciente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                  <p className="text-base mt-1">{patient.nome_completo}</p>
                </div>
                {patient.cpf && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">CPF</label>
                    <p className="text-base mt-1">{patient.cpf}</p>
                  </div>
                )}
                {patient.telefone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                    <p className="text-base mt-1">{patient.telefone}</p>
                  </div>
                )}
              </div>

              {/* Anamnese */}
              {(filaData.sintomas || filaData.usa_medicamentos !== undefined) && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-6">Anamnese</h3>
                  <div className="space-y-4">
                    {filaData.sintomas && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Sintomas Relatados</label>
                        <p className="text-base mt-1">{filaData.sintomas}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Medicamentos em Uso</label>
                      <p className="text-base mt-1">
                        {filaData.usa_medicamentos && filaData.medicamentos_lista 
                          ? filaData.medicamentos_lista 
                          : "Nenhum"}
                      </p>
                    </div>
                    {filaData.observacoes && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Observações</label>
                        <p className="text-base mt-1">{filaData.observacoes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate(getBackRoute())}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={() => handleSave(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Salvar Rascunho
          </Button>
          <Button onClick={() => handleSave(false)}>
            <Save className="w-4 h-4 mr-2" />
            Salvar e Finalizar
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientAttendance;
