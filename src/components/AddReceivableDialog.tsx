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
  Tag,
  Split,
  MoreHorizontal
} from "lucide-react";
import DesdobramentoDialog from "@/components/DesdobramentoDialog";
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

interface AddReceivableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (receivable: {
    paciente_id: string;
    consulta_id?: string;
    descricao: string;
    categoria_id?: string;
    subcategoria_id?: string;
    especie_documento?: "NOTA_FISCAL" | "RECIBO" | "FATURA" | "DUPLICATA" | "BOLETO" | "PIX" | "OUTROS";
    numero_documento?: string;
    valor_original: number;
    valor_recebido?: number;
    valor_desconto?: number;
    valor_juros?: number;
    data_emissao?: string;
    data_vencimento: string;
    data_recebimento?: string;
    forma_pagamento?: "DINHEIRO" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "PIX" | "BOLETO" | "TRANSFERENCIA";
    status?: "PENDENTE" | "PAGO" | "VENCIDO" | "CANCELADO";
    observacoes?: string;
  }) => void;
}

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

const AddReceivableDialog = ({ open, onOpenChange, onSave }: AddReceivableDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [desdobramentoDialogOpen, setDesdobramentoDialogOpen] = useState(false);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);       
  const [loadingPacientes, setLoadingPacientes] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [loadingNumero, setLoadingNumero] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    paciente_id: "",
    consulta_id: "",
    descricao: "",
    categoria_id: "",
    subcategoria_id: "",
    especie_documento: "RECIBO" as "" | "NOTA_FISCAL" | "RECIBO" | "FATURA" | "DUPLICATA" | "BOLETO" | "PIX" | "OUTROS",
    numero_documento: "",
    valor_original: "",
    valor_recebido: "",
    valor_desconto: "",
    valor_juros: "",
    data_emissao: new Date().toISOString().split('T')[0],
    data_vencimento: new Date().toISOString().split('T')[0],
    data_recebimento: "",
    forma_pagamento: "" as "" | "DINHEIRO" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "PIX" | "BOLETO" | "TRANSFERENCIA",
    status: "PENDENTE" as "PENDENTE" | "PAGO" | "VENCIDO" | "CANCELADO",
    observacoes: "",
  });

  // Carregar dados quando o dialog abrir e resetar formulário
  useEffect(() => {
    if (open) {
      // Resetar formulário com valores padrão ao abrir
      setFormData({
        paciente_id: "",
        consulta_id: "",
        descricao: "",
        categoria_id: "",
        subcategoria_id: "",
        especie_documento: "RECIBO",
        numero_documento: "",
        valor_original: "",
        valor_recebido: "",
        valor_desconto: "",
        valor_juros: "",
        data_emissao: new Date().toISOString().split('T')[0],
        data_vencimento: new Date().toISOString().split('T')[0],
        data_recebimento: "",
        forma_pagamento: "",
        status: "PENDENTE",
        observacoes: "",
      });
      
      fetchPacientes();
      fetchCategorias();
      // O fetchProximoNumero será chamado pelo useEffect de especie_documento
    }
  }, [open]);

  // Atualizar subcategorias quando categoria mudar
  useEffect(() => {
    if (formData.categoria_id) {
      fetchSubcategorias(formData.categoria_id);
    } else {
      setSubcategorias([]);
      setFormData(prev => ({ ...prev, subcategoria_id: "" }));
    }
  }, [formData.categoria_id]);

  // Buscar próximo número quando espécie mudar (somente quando dialog estiver aberto)
  useEffect(() => {
    if (formData.especie_documento && open) {
      const timeoutId = setTimeout(() => {
        fetchProximoNumero(formData.especie_documento);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.especie_documento, open]);

  const fetchPacientes = async () => {
    try {
      setLoadingPacientes(true);
      const resp = await fetch(`${API_BASE_URL}/pacientes');
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
      const resp = await fetch(`${API_BASE_URL}/categorias?tipo=RECEITA');
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

  const fetchProximoNumero = async (especie: string) => {
    try {
      setLoadingNumero(true);
      const response = await fetch(`${API_BASE_URL}/contas-receber/proximo-numero?especie_documento=${especie}`);
      if (!response.ok) throw new Error('Erro ao buscar próximo número');
      const data = await response.json();
      setFormData(prev => ({ ...prev, numero_documento: data.proximo_numero }));
    } catch (error) {
      console.error('Erro ao carregar próximo número:', error);
    } finally {
      setLoadingNumero(false);
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
      console.error("Erro ao adicionar recebível:", error);
      
      // Mostrar erro em modal bonito
      let message = "Ocorreu um erro ao adicionar a conta a receber";
      let details: string[] = [];
      
      if (error.message) {
        message = error.message;
      }
      
      // Se for erro de validação com detalhes, extrair os detalhes
      if (error.details && Array.isArray(error.details)) {
        details = error.details.map((d: any) => {
          if (typeof d === 'string') {
            return d;
          }
          const campo = d.campo || '';
          const mensagem = d.mensagem || '';
          return campo ? `${campo}: ${mensagem}` : mensagem;
        });
      } else if (error.detalhes && Array.isArray(error.detalhes)) {
        // Formato alternativo do backend
        details = error.detalhes.map((d: any) => {
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

  const handleDesdobramentoConfirm = async (parcelas: {numero_parcela: number; valor: number; data_vencimento: string}[]) => {
    try {
      setLoading(true);
      
      // Criar cada parcela
      for (const parcela of parcelas) {
        await onSave({
          paciente_id: formData.paciente_id,
          consulta_id: formData.consulta_id || undefined,
          descricao: `${formData.descricao} - Parcela ${parcela.numero_parcela}/${parcelas.length}`,
          categoria_id: formData.categoria_id || undefined,
          subcategoria_id: formData.subcategoria_id || undefined,
          especie_documento: formData.especie_documento || undefined,
          numero_documento: undefined, // Será gerado automaticamente
          valor_original: parcela.valor,
          valor_recebido: 0,
          valor_desconto: 0,
          valor_juros: 0,
          data_emissao: formData.data_emissao || undefined,
          data_vencimento: parcela.data_vencimento,
          data_recebimento: undefined,
          forma_pagamento: formData.forma_pagamento || undefined,
          status: "PENDENTE",
          observacoes: formData.observacoes || undefined,
        });
      }
      
      setDesdobramentoDialogOpen(false);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao desdobrar recebível:", error);
      setErrorMessage("Erro ao criar parcelas");
      setErrorDetails([error.message || "Ocorreu um erro ao criar as parcelas"]);
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const valorOriginalNum = parseFloat(formData.valor_original) || 0;
  const desdobramentoDisabled = !valorOriginalNum || valorOriginalNum <= 0;

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
              Adicionar Conta a Receber
            </DialogTitle>
            <DialogDescription>
              Preencha as informações da nova conta a receber
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="informacoes" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="informacoes">Informações</TabsTrigger>
              <TabsTrigger value="valores">Valores e Datas</TabsTrigger>
              <TabsTrigger value="pagamento">Pagamento</TabsTrigger>
              <TabsTrigger value="outros">Outros</TabsTrigger>
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
                        onValueChange={(value: any) => {
                          setFormData({...formData, especie_documento: value});
                        }}
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue placeholder="Selecione a espécie" />
                        </SelectTrigger>
                        <SelectContent>
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
                      <div className="flex gap-2">
                        <Input
                          value={formData.numero_documento}
                          onChange={(e) => setFormData({...formData, numero_documento: e.target.value})}
                          placeholder="Número automático"
                          className="border-2"
                        />
                        {loadingNumero && (
                          <Loader2 className="h-4 w-4 animate-spin self-center" />
                        )}
                      </div>
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
                          {loadingCategorias ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : categorias.length === 0 ? (
                            <SelectItem value="none" disabled>
                              Nenhuma categoria encontrada
                            </SelectItem>
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
                          {filteredSubcategorias.length === 0 ? (
                            <SelectItem value="none" disabled>
                              Nenhuma subcategoria disponível
                            </SelectItem>
                          ) : (
                            filteredSubcategorias.map((sub) => (
                              <SelectItem key={sub.id} value={sub.id}>
                                {sub.nome}
                              </SelectItem>
                            ))
                          )}
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

            {/* Tab: Outros */}
            <TabsContent value="outros" className="space-y-4">
              <Card className="border-2 border-orange-200">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Split className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Desdobramento</h3>
                          <p className="text-sm text-muted-foreground">
                            Criar múltiplas parcelas com o valor original completo
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDesdobramentoDialogOpen(true)}
                        disabled={desdobramentoDisabled}
                        className="border-2 border-orange-300 hover:bg-orange-50"
                      >
                        <Split className="mr-2 h-4 w-4" />
                        Desdobrar
                      </Button>
                    </div>
                    
                    {desdobramentoDisabled && (
                      <p className="text-sm text-amber-600 flex items-center gap-2">
                        <MoreHorizontal className="h-4 w-4" />
                        Informe o valor original para habilitar o desdobramento
                      </p>
                    )}
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
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DesdobramentoDialog
        open={desdobramentoDialogOpen}
        onOpenChange={setDesdobramentoDialogOpen}
        valorOriginal={valorOriginalNum}
        dataVencimentoInicial={formData.data_vencimento}
        onConfirm={handleDesdobramentoConfirm}
      />

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

export default AddReceivableDialog;

