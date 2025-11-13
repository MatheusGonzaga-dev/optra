import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, 
  User, 
  FileText, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  Receipt,
  Percent,
  Tag
} from "lucide-react";
import ErrorDialog from "@/components/ErrorDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_BASE_URL } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface Paciente {
  id: string;
  nome_completo: string;
}

interface Categoria {
  id: string;
  nome: string;
  tipo: string;
}

interface Subcategoria {
  id: string;
  categoria_id: string;
  nome: string;
}

interface Receivable {
  id: string;
  paciente_id: string;
  consulta_id?: string;
  descricao: string;
  categoria_id?: string;
  subcategoria_id?: string;
  especie_documento?: "NOTA_FISCAL" | "RECIBO" | "FATURA" | "DUPLICATA" | "BOLETO" | "PIX" | "OUTROS";
  numero_documento?: string;
  valor_original: number;
  valor_recebido: number;
  valor_desconto: number;
  valor_juros: number;
  valor_final?: number;
  data_emissao?: string;
  data_vencimento: string;
  data_recebimento?: string;
  forma_pagamento?: "DINHEIRO" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "PIX" | "BOLETO" | "TRANSFERENCIA";
  status: "PENDENTE" | "PAGO" | "VENCIDO" | "CANCELADO";
  observacoes?: string;
}

interface EditReceivableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receivable: Receivable;
  onSave: (receivable: Receivable) => void;
}

const EditReceivableDialog = ({ open, onOpenChange, receivable, onSave }: EditReceivableDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);       
  const [loadingPacientes, setLoadingPacientes] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    paciente_id: "",
    consulta_id: "",
    descricao: "",
    categoria_id: "",
    subcategoria_id: "",
    especie_documento: "" as "" | "NOTA_FISCAL" | "RECIBO" | "FATURA" | "DUPLICATA" | "BOLETO" | "PIX" | "OUTROS",
    numero_documento: "",
    valor_original: "",
    valor_recebido: "",
    valor_desconto: "",
    valor_juros: "",
    data_emissao: "",
    data_vencimento: "",
    data_recebimento: "",
    forma_pagamento: "" as "" | "DINHEIRO" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "PIX" | "BOLETO" | "TRANSFERENCIA",
    status: "PENDENTE" as "PENDENTE" | "PAGO" | "VENCIDO" | "CANCELADO",
    observacoes: "",
  });

  // Carregar dados quando o dialog abrir
  useEffect(() => {
    if (open && receivable) {
      setFormData({
        paciente_id: receivable.paciente_id || "",
        consulta_id: receivable.consulta_id || "",
        descricao: receivable.descricao || "",
        categoria_id: receivable.categoria_id || "",
        subcategoria_id: receivable.subcategoria_id || "",
        especie_documento: receivable.especie_documento || "",
        numero_documento: receivable.numero_documento || "",
        valor_original: receivable.valor_original?.toString() || "",
        valor_recebido: receivable.valor_recebido?.toString() || "",
        valor_desconto: receivable.valor_desconto?.toString() || "",
        valor_juros: receivable.valor_juros?.toString() || "",
        data_emissao: receivable.data_emissao || "",
        data_vencimento: receivable.data_vencimento || "",
        data_recebimento: receivable.data_recebimento || "",
        forma_pagamento: receivable.forma_pagamento || "",
        status: receivable.status || "PENDENTE",
        observacoes: receivable.observacoes || "",
      });
      
      fetchPacientes();
      fetchCategorias();
    }
  }, [open, receivable]);

  // Atualizar subcategorias quando categoria mudar
  useEffect(() => {
    if (formData.categoria_id) {
      fetchSubcategorias(formData.categoria_id);
    } else {
      setSubcategorias([]);
    }
  }, [formData.categoria_id]);

  const fetchPacientes = async () => {
    try {
      setLoadingPacientes(true);
      const resp = await fetch(`${API_BASE_URL}/pacientes`);
      if (!resp.ok) throw new Error('Erro ao buscar pacientes');
      const data = await resp.json();
      setPacientes(data || []);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    } finally {
      setLoadingPacientes(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      setLoadingCategorias(true);
      const resp = await fetch(`${API_BASE_URL}/categorias?tipo=RECEITA`);
      if (!resp.ok) throw new Error('Erro ao buscar categorias');
      const data = await resp.json();
      setCategorias(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    } finally {
      setLoadingCategorias(false);
    }
  };

  const fetchSubcategorias = async (categoriaId: string) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/categorias/${categoriaId}/subcategorias`);
      if (!resp.ok) throw new Error('Erro ao buscar subcategorias');
      const data = await resp.json();
      setSubcategorias(data || []);
    } catch (error) {
      console.error('Erro ao buscar subcategorias:', error);
      setSubcategorias([]);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validação frontend
      if (!formData.paciente_id) {
        setErrorMessage("Paciente é obrigatório");
        setErrorDetails(["Por favor, selecione um paciente."]);
        setErrorDialogOpen(true);
        return;
      }

      if (!formData.descricao || formData.descricao.trim() === "") {
        setErrorMessage("Descrição é obrigatória");
        setErrorDetails(["Por favor, informe uma descrição para a conta a receber."]);
        setErrorDialogOpen(true);
        return;
      }

      if (!formData.data_vencimento) {
        setErrorMessage("Data de vencimento é obrigatória");
        setErrorDetails(["Por favor, informe a data de vencimento."]);
        setErrorDialogOpen(true);
        return;
      }

      if (!formData.valor_original || parseFloat(formData.valor_original) <= 0) {
        setErrorMessage("Valor original é obrigatório");
        setErrorDetails(["Por favor, informe um valor original maior que zero."]);
        setErrorDialogOpen(true);
        return;
      }

      setLoading(true);
      
      await onSave({
        id: receivable.id,
        paciente_id: formData.paciente_id,
        consulta_id: formData.consulta_id || undefined,
        descricao: formData.descricao,
        categoria_id: formData.categoria_id || undefined,
        subcategoria_id: formData.subcategoria_id || undefined,
        especie_documento: formData.especie_documento || undefined,
        numero_documento: formData.numero_documento || undefined,
        valor_original: parseFloat(formData.valor_original) || 0,
        valor_recebido: parseFloat(formData.valor_recebido) || 0,
        valor_desconto: parseFloat(formData.valor_desconto) || 0,
        valor_juros: parseFloat(formData.valor_juros) || 0,
        data_emissao: formData.data_emissao || undefined,
        data_vencimento: formData.data_vencimento,
        data_recebimento: formData.data_recebimento || undefined,
        forma_pagamento: formData.forma_pagamento || undefined,
        status: formData.status,
        observacoes: formData.observacoes || undefined,
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao atualizar recebível:", error);
      
      // Mostrar erro em modal bonito
      let message = "Ocorreu um erro ao atualizar a conta a receber";
      let details: string[] = [];
      
      if (error.message) {
        message = error.message;
      }
      
      if (error.details && Array.isArray(error.details)) {
        details = error.details.map((d: any) => {
          if (typeof d === 'string') {
            return d;
          }
          const campo = d.campo || '';
          const mensagem = d.mensagem || '';
          return campo ? `${campo}: ${mensagem}` : mensagem;
        });
      }
      
      setErrorMessage(message);
      setErrorDetails(details);
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubcategorias = subcategorias.filter(
    sub => sub.categoria_id === formData.categoria_id
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Receipt className="h-6 w-6" />
              Editar Conta a Receber
            </DialogTitle>
            <DialogDescription>
              Atualize as informações da conta a receber
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="informacoes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="informacoes">Informações</TabsTrigger>
              <TabsTrigger value="valores">Valores e Datas</TabsTrigger>
              <TabsTrigger value="pagamento">Pagamento</TabsTrigger>
            </TabsList>

            {/* Tab: Informações */}
            <TabsContent value="informacoes" className="space-y-4">
              <Card className="border-2 border-primary/20">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-semibold">
                      <User className="h-4 w-4 text-primary" />
                      Paciente *
                    </Label>
                    <Select 
                      value={formData.paciente_id} 
                      onValueChange={(value) => setFormData({...formData, paciente_id: value})}
                    >
                      <SelectTrigger className="border-2">
                        <SelectValue placeholder="Selecione um paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingPacientes ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : pacientes.length === 0 ? (
                          <SelectItem value="none" disabled>
                            Nenhum paciente encontrado
                          </SelectItem>
                        ) : (
                          pacientes.map((paciente) => (
                            <SelectItem key={paciente.id} value={paciente.id}>
                              {paciente.nome_completo}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-semibold">
                        <Receipt className="h-4 w-4 text-primary" />
                        Espécie de Documento
                      </Label>
                      <Select 
                        value={formData.especie_documento} 
                        onValueChange={(value: any) => setFormData({...formData, especie_documento: value})}
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhum</SelectItem>
                          <SelectItem value="RECIBO">Recibo</SelectItem>
                          <SelectItem value="NOTA_FISCAL">Nota Fiscal</SelectItem>
                          <SelectItem value="FATURA">Fatura</SelectItem>
                          <SelectItem value="DUPLICATA">Duplicata</SelectItem>
                          <SelectItem value="BOLETO">Boleto</SelectItem>
                          <SelectItem value="PIX">PIX</SelectItem>
                          <SelectItem value="OUTROS">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-semibold">
                        <FileText className="h-4 w-4 text-primary" />
                        Número do Documento
                      </Label>
                      <Input
                        value={formData.numero_documento}
                        onChange={(e) => setFormData({...formData, numero_documento: e.target.value})}
                        placeholder="Número do documento"
                        className="border-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-semibold">
                        <Tag className="h-4 w-4 text-primary" />
                        Status
                      </Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value: any) => setFormData({...formData, status: value})}
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDENTE">Pendente</SelectItem>
                          <SelectItem value="PAGO">Recebido</SelectItem>
                          <SelectItem value="VENCIDO">Vencido</SelectItem>
                          <SelectItem value="CANCELADO">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-semibold">
                        <Tag className="h-4 w-4 text-primary" />
                        Categoria
                      </Label>
                      <Select 
                        value={formData.categoria_id} 
                        onValueChange={(value) => setFormData({...formData, categoria_id: value})}
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhuma</SelectItem>
                          {loadingCategorias ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : (
                            categorias.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.nome}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.categoria_id && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-semibold">
                        <Tag className="h-4 w-4 text-primary" />
                        Subcategoria
                      </Label>
                      <Select 
                        value={formData.subcategoria_id} 
                        onValueChange={(value) => setFormData({...formData, subcategoria_id: value})}
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue placeholder="Selecione uma subcategoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhuma</SelectItem>
                          {filteredSubcategorias.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-semibold">
                      <FileText className="h-4 w-4 text-primary" />
                      Descrição *
                    </Label>
                    <Input
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                      placeholder="Descrição da conta a receber"
                      className="border-2"
                      required
                      minLength={1}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Valores e Datas */}
            <TabsContent value="valores" className="space-y-4">
              <Card className="border-2 border-green-200">
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-semibold">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        Valor Original *
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.valor_original}
                        onChange={(e) => setFormData({...formData, valor_original: e.target.value})}
                        placeholder="0.00"
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-semibold">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        Valor Recebido
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.valor_recebido}
                        onChange={(e) => setFormData({...formData, valor_recebido: e.target.value})}
                        placeholder="0.00"
                        className="border-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-semibold">
                        <Percent className="h-4 w-4 text-blue-600" />
                        Desconto
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.valor_desconto}
                        onChange={(e) => setFormData({...formData, valor_desconto: e.target.value})}
                        placeholder="0.00"
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-semibold">
                        <Percent className="h-4 w-4 text-red-600" />
                        Juros
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.valor_juros}
                        onChange={(e) => setFormData({...formData, valor_juros: e.target.value})}
                        placeholder="0.00"
                        className="border-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-semibold">
                        <Calendar className="h-4 w-4 text-primary" />
                        Data de Emissão
                      </Label>
                      <Input
                        type="date"
                        value={formData.data_emissao}
                        onChange={(e) => setFormData({...formData, data_emissao: e.target.value})}
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-semibold">
                        <Calendar className="h-4 w-4 text-primary" />
                        Data de Vencimento *
                      </Label>
                      <Input
                        type="date"
                        value={formData.data_vencimento}
                        onChange={(e) => setFormData({...formData, data_vencimento: e.target.value})}
                        className="border-2"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-semibold">
                        <Calendar className="h-4 w-4 text-green-600" />
                        Data de Recebimento
                      </Label>
                      <Input
                        type="date"
                        value={formData.data_recebimento}
                        onChange={(e) => setFormData({...formData, data_recebimento: e.target.value})}
                        className="border-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Pagamento */}
            <TabsContent value="pagamento" className="space-y-4">
              <Card className="border-2 border-purple-200">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-semibold">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                      Forma de Pagamento
                    </Label>
                    <Select 
                      value={formData.forma_pagamento} 
                      onValueChange={(value: any) => setFormData({...formData, forma_pagamento: value})}
                    >
                      <SelectTrigger className="border-2">
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhuma</SelectItem>
                        <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                        <SelectItem value="CARTAO_CREDITO">Cartão de Crédito</SelectItem>
                        <SelectItem value="CARTAO_DEBITO">Cartão de Débito</SelectItem>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="BOLETO">Boleto</SelectItem>
                        <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-semibold">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Observações
                    </Label>
                    <Textarea
                      value={formData.observacoes}
                      onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                      placeholder="Observações adicionais..."
                      className="border-2 min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ErrorDialog
        open={errorDialogOpen}
        onOpenChange={setErrorDialogOpen}
        title="Erro"
        message={errorMessage}
        details={errorDetails}
      />
    </>
  );
};

export default EditReceivableDialog;

