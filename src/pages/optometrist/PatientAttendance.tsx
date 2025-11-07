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
import { CalendarIcon, Save, Edit, Printer, FileDown, ArrowLeft, Loader2 } from "lucide-react";
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
    type: "distance", // distance ou both
    // Para longe apenas
    distanceOD: { spherical: "", cylindrical: "", axis: "", av: "" },
    distanceOE: { spherical: "", cylindrical: "", axis: "", av: "" },
    // Para longe e perto
    nearOD: { spherical: "", cylindrical: "", axis: "", av: "" },
    nearOE: { spherical: "", cylindrical: "", axis: "", av: "" },
    addition: "",
    // Gerais
    lensType: "",
    observations: "",
    recommendations: "",
  });

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
        await fetch(`http://localhost:4000/atendimentos/${id}/prontuario`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prescription: prescriptionData,
            observations: prescriptionData.observations,
            recommendations: prescriptionData.recommendations,
            returnDate: returnDate ? returnDate.toISOString() : undefined,
          })
        });

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
          <TabsList className="grid w-full max-w-3xl grid-cols-3 mb-6">
            <TabsTrigger value="prescription">Prescrição</TabsTrigger>
            <TabsTrigger value="patient">Dados do Paciente</TabsTrigger>
            <TabsTrigger value="serviceOrder">Ordem de Serviço</TabsTrigger>
          </TabsList>

          {/* Prescrição */}
          <TabsContent value="prescription">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Prescrição para Óculos</h2>
              
              <Tabs value={prescriptionData.type} onValueChange={(v) => setPrescriptionData({...prescriptionData, type: v})}>
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                  <TabsTrigger value="distance">Somente Longe</TabsTrigger>
                  <TabsTrigger value="both">Longe e Perto</TabsTrigger>
                </TabsList>

                {/* Distance Only */}
                <TabsContent value="distance" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-base">Para Longe</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        <Label className="col-span-2 md:col-span-1 self-center">OD:</Label>
                        <div>
                          <Label className="text-xs">Esférico</Label>
                          <Input 
                            placeholder="Esf" 
                            value={prescriptionData.distanceOD.spherical}
                            onChange={(e) => setPrescriptionData({
                              ...prescriptionData,
                              distanceOD: {...prescriptionData.distanceOD, spherical: e.target.value}
                            })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Cilíndrico</Label>
                          <Input 
                            placeholder="Cil"
                            value={prescriptionData.distanceOD.cylindrical}
                            onChange={(e) => setPrescriptionData({
                              ...prescriptionData,
                              distanceOD: {...prescriptionData.distanceOD, cylindrical: e.target.value}
                            })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Eixo</Label>
                          <Input 
                            placeholder="°"
                            value={prescriptionData.distanceOD.axis}
                            onChange={(e) => setPrescriptionData({
                              ...prescriptionData,
                              distanceOD: {...prescriptionData.distanceOD, axis: e.target.value}
                            })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">AV</Label>
                          <Input 
                            placeholder="AV"
                            value={prescriptionData.distanceOD.av}
                            onChange={(e) => setPrescriptionData({
                              ...prescriptionData,
                              distanceOD: {...prescriptionData.distanceOD, av: e.target.value}
                            })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        <Label className="col-span-2 md:col-span-1 self-center">OE:</Label>
                        <div>
                          <Label className="text-xs">Esférico</Label>
                          <Input 
                            placeholder="Esf"
                            value={prescriptionData.distanceOE.spherical}
                            onChange={(e) => setPrescriptionData({
                              ...prescriptionData,
                              distanceOE: {...prescriptionData.distanceOE, spherical: e.target.value}
                            })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Cilíndrico</Label>
                          <Input 
                            placeholder="Cil"
                            value={prescriptionData.distanceOE.cylindrical}
                            onChange={(e) => setPrescriptionData({
                              ...prescriptionData,
                              distanceOE: {...prescriptionData.distanceOE, cylindrical: e.target.value}
                            })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Eixo</Label>
                          <Input 
                            placeholder="°"
                            value={prescriptionData.distanceOE.axis}
                            onChange={(e) => setPrescriptionData({
                              ...prescriptionData,
                              distanceOE: {...prescriptionData.distanceOE, axis: e.target.value}
                            })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">AV</Label>
                          <Input 
                            placeholder="AV"
                            value={prescriptionData.distanceOE.av}
                            onChange={(e) => setPrescriptionData({
                              ...prescriptionData,
                              distanceOE: {...prescriptionData.distanceOE, av: e.target.value}
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </TabsContent>

                {/* Distance and Near */}
                <TabsContent value="both" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-base">Para Longe</h3>
                    <div className="space-y-3">
                      {/* OD e OE similar ao distance only */}
                      <div className="text-muted-foreground italic">
                        Implementar campos para longe e perto...
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Adição</Label>
                      <Input 
                        placeholder="Adição para perto"
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
                </TabsContent>
              </Tabs>
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
