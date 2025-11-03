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

  const handleSave = async (isDraft: boolean = false) => {
    try {
      // Aqui você salvaria a prescrição no backend
      console.log('Salvando prescrição:', prescriptionData);
      
      toast.success(isDraft ? "Rascunho salvo" : "Atendimento finalizado");
      
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
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="prescription">Prescrição</TabsTrigger>
            <TabsTrigger value="patient">Dados do Paciente</TabsTrigger>
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
