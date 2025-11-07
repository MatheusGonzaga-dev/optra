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
  Building2, 
  FileText, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  Receipt,
  Percent,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  FileEdit,
  Search,
  X,
  Tag,
  Split,
  MoreHorizontal
} from "lucide-react";
import SupplierSearchDialog from "@/components/SupplierSearchDialog";
import DesdobramentoDialog from "@/components/DesdobramentoDialog";
import ErrorDialog from "@/components/ErrorDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (expense: {
    fornecedor: string;
    descricao: string;
    categoria_id?: string;
    subcategoria_id?: string;
    especie_documento?: "CONTAS_A_PAGAR" | "NOTA_FISCAL" | "FATURA" | "DUPLICATA" | "BOLETO" | "RECIBO" | "NOTA_FISCAL_SERVICO" | "PEDIDO" | "ORDEM_COMPRA" | "OUTROS";
    numero_documento?: string;
    valor_original: number;
    valor_pago?: number;
    valor_desconto?: number;
    valor_juros?: number;
    data_emissao?: string;
    data_vencimento: string;
    data_pagamento?: string;
    forma_pagamento?: "DINHEIRO" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "PIX" | "BOLETO" | "TRANSFERENCIA";
    status?: "PENDENTE" | "PAGO" | "VENCIDO" | "CANCELADO";
    observacoes?: string;
  }) => void;
}

interface Categoria {
  id: string;
  nome: string;
  tipo: string;
  cor?: string;
  icone?: string;
}

interface Subcategoria {
  id: string;
  categoria_id: string;
  nome: string;
}

const AddExpenseDialog = ({ open, onOpenChange, onAdd }: AddExpenseDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [supplierSearchOpen, setSupplierSearchOpen] = useState(false);
  const [desdobramentoDialogOpen, setDesdobramentoDialogOpen] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);       
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [loadingNumero, setLoadingNumero] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fornecedor: "",
    descricao: "",
    categoria_id: "",
    subcategoria_id: "",
    especie_documento: "CONTAS_A_PAGAR" as "" | "CONTAS_A_PAGAR" | "NOTA_FISCAL" | "FATURA" | "DUPLICATA" | "BOLETO" | "RECIBO" | "NOTA_FISCAL_SERVICO" | "PEDIDO" | "ORDEM_COMPRA" | "OUTROS",
    numero_documento: "",
    valor_original: "",
    valor_pago: "",
    valor_desconto: "",
    valor_juros: "",
    data_emissao: new Date().toISOString().split('T')[0],
    data_vencimento: new Date().toISOString().split('T')[0],
    data_pagamento: "",
    forma_pagamento: "" as "" | "DINHEIRO" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "PIX" | "BOLETO" | "TRANSFERENCIA",
    status: "PENDENTE" as "PENDENTE" | "PAGO" | "VENCIDO" | "CANCELADO",
    observacoes: "",
  });

  // Carregar categorias quando o dialog abrir e resetar formulário
  useEffect(() => {
    if (open) {
      // Resetar formulário com valores padrão ao abrir
      setFormData({
        fornecedor: "",
        descricao: "",
        categoria_id: "",
        subcategoria_id: "",
        especie_documento: "CONTAS_A_PAGAR",
        numero_documento: "",
        valor_original: "",
        valor_pago: "",
        valor_desconto: "",
        valor_juros: "",
        data_emissao: new Date().toISOString().split('T')[0],
        data_vencimento: new Date().toISOString().split('T')[0],
        data_pagamento: "",
        forma_pagamento: "",
        status: "PENDENTE",
        observacoes: "",
      });
      
      fetchCategorias();
      
      // Buscar próximo número automaticamente após resetar
      setTimeout(() => {
        fetchProximoNumero("CONTAS_A_PAGAR");
      }, 300);
    }
  }, [open]);

  // Carregar subcategorias quando uma categoria for selecionada
  useEffect(() => {
    if (formData.categoria_id) {
      fetchSubcategorias(formData.categoria_id);
    } else {
      setSubcategorias([]);
      setFormData(prev => ({ ...prev, subcategoria_id: "" }));
    }
  }, [formData.categoria_id]);

  // Buscar próximo número quando espécie for selecionada e número estiver vazio
  useEffect(() => {
    const especie = formData.especie_documento;
    if (especie && !formData.numero_documento) {
      fetchProximoNumero(especie);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.especie_documento]);

  const fetchCategorias = async () => {
    try {
      setLoadingCategorias(true);
      const response = await fetch('http://localhost:4000/categorias?tipo=DESPESA');
      if (!response.ok) throw new Error('Erro ao buscar categorias');
      const data = await response.json();
      setCategorias(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoadingCategorias(false);
    }
  };

  const fetchSubcategorias = async (categoriaId: string) => {
    try {
      const response = await fetch(`http://localhost:4000/categorias/${categoriaId}/subcategorias`);
      if (!response.ok) throw new Error('Erro ao buscar subcategorias');
      const data = await response.json();
      setSubcategorias(data || []);
    } catch (error) {
      console.error('Erro ao carregar subcategorias:', error);
      setSubcategorias([]);
    }
  };

  const fetchProximoNumero = async (especie: string) => {
    try {
      setLoadingNumero(true);
      const response = await fetch(`http://localhost:4000/contas-pagar/proximo-numero?especie_documento=${especie}`);
      if (!response.ok) throw new Error('Erro ao buscar próximo número');
      const data = await response.json();
      setFormData(prev => ({ ...prev, numero_documento: data.proximo_numero }));
    } catch (error) {
      console.error('Erro ao carregar próximo número:', error);
    } finally {
      setLoadingNumero(false);
    }
  };

  const handleDesdobramento = (parcelas: {
    numero_parcela: number;
    valor: number;
    data_vencimento: string;
  }[]) => {
    // Criar múltiplas despesas (uma para cada parcela)
    parcelas.forEach((parcela) => {
      const expenseData = {
        fornecedor: formData.fornecedor,
        descricao: `${formData.descricao} - Parcela ${parcela.numero_parcela}/${parcelas.length}`,
        categoria_id: formData.categoria_id || undefined,
        subcategoria_id: formData.subcategoria_id || undefined,
        especie_documento: formData.especie_documento || undefined,
        numero_documento: formData.numero_documento 
          ? `${formData.numero_documento}-${parcela.numero_parcela}`
          : undefined,
        valor_original: parcela.valor,
        valor_pago: 0,
        valor_desconto: 0,
        valor_juros: 0,
        data_emissao: formData.data_emissao || undefined,
        data_vencimento: parcela.data_vencimento,
        data_pagamento: undefined,
        forma_pagamento: formData.forma_pagamento || undefined,
        status: formData.status,
        observacoes: formData.observacoes 
          ? `${formData.observacoes} [Parcela ${parcela.numero_parcela}/${parcelas.length}]`
          : `Parcela ${parcela.numero_parcela}/${parcelas.length}`,
      };

      onAdd(expenseData);
    });

    // Fechar o dialog após desdobrar
    setDesdobramentoDialogOpen(false);
    onOpenChange(false);
    setSubcategorias([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      // Validar campos obrigatórios antes de enviar
      if (!formData.fornecedor || !formData.fornecedor.trim()) {
        throw new Error('Fornecedor é obrigatório');
      }
      
      if (!formData.descricao || !formData.descricao.trim()) {
        throw new Error('Descrição é obrigatória');
      }
      
      if (!formData.data_vencimento) {
        throw new Error('Data de vencimento é obrigatória');
      }

      const valorOriginal = parseFloat(formData.valor_original);
      if (isNaN(valorOriginal) || valorOriginal < 0) {
        throw new Error('Valor original deve ser um número válido maior ou igual a zero');
      }

      const expenseData: any = {
        fornecedor: formData.fornecedor.trim(),
        descricao: formData.descricao.trim(),
        valor_original: valorOriginal,
        data_vencimento: formData.data_vencimento,
        status: formData.status,
      };

      // Campos opcionais - só adicionar se tiver valor
      if (formData.categoria_id) {
        expenseData.categoria_id = formData.categoria_id;
      }
      if (formData.subcategoria_id) {
        expenseData.subcategoria_id = formData.subcategoria_id;
      }
      if (formData.especie_documento) {
        expenseData.especie_documento = formData.especie_documento;
      }
      if (formData.numero_documento && formData.numero_documento.trim()) {
        expenseData.numero_documento = formData.numero_documento.trim();
      }
      if (formData.valor_pago) {
        const valorPago = parseFloat(formData.valor_pago);
        if (!isNaN(valorPago) && valorPago >= 0) {
          expenseData.valor_pago = valorPago;
        }
      }
      if (formData.valor_desconto) {
        const valorDesconto = parseFloat(formData.valor_desconto);
        if (!isNaN(valorDesconto) && valorDesconto >= 0) {
          expenseData.valor_desconto = valorDesconto;
        }
      }
      if (formData.valor_juros) {
        const valorJuros = parseFloat(formData.valor_juros);
        if (!isNaN(valorJuros) && valorJuros >= 0) {
          expenseData.valor_juros = valorJuros;
        }
      }
      if (formData.data_emissao && formData.data_emissao.trim()) {
        expenseData.data_emissao = formData.data_emissao;
      }
      if (formData.data_pagamento && formData.data_pagamento.trim()) {
        expenseData.data_pagamento = formData.data_pagamento;
      }
      if (formData.forma_pagamento) {
        expenseData.forma_pagamento = formData.forma_pagamento;
      }
      if (formData.observacoes && formData.observacoes.trim()) {
        expenseData.observacoes = formData.observacoes.trim();
      }

      // onAdd pode lançar erro, então precisamos capturar aqui também
      try {
        onAdd(expenseData);
        // Form será resetado automaticamente quando o dialog fechar e reabrir
        setSubcategorias([]);
      } catch (addError: any) {
        // Se onAdd lançar erro, mostrar no modal
        throw addError;
      }
    } catch (error: any) {
      console.error("Erro ao adicionar despesa:", error);
      // Mostrar erro em modal bonito
      let message = "Ocorreu um erro ao adicionar a conta a pagar";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[95vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl shadow-lg">
              <Receipt className="h-8 w-8 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-bold">Adicionar Conta a Pagar</DialogTitle>
              <DialogDescription className="text-base mt-2">
                Registre uma nova conta a pagar da clínica
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="informacoes" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="informacoes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Informações
              </TabsTrigger>
              <TabsTrigger value="valores-datas" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Valores e Datas
              </TabsTrigger>
              <TabsTrigger value="pagamento" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Pagamento
              </TabsTrigger>
              <TabsTrigger value="outros" className="flex items-center gap-2">
                <MoreHorizontal className="h-4 w-4" />
                Outros
              </TabsTrigger>
            </TabsList>

            <TabsContent value="informacoes" className="space-y-6">
              <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50/50 to-white rounded-xl border-2 border-blue-100">
              <h3 className="text-xl font-bold flex items-center gap-3 text-primary pb-2 border-b">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                Informações Básicas
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fornecedor" className="flex items-center gap-2 text-sm font-semibold">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    Fornecedor *
                  </Label>
                  <div className="relative">
                    <Input
                      id="fornecedor"
                      value={formData.fornecedor}
                      readOnly
                      placeholder="Clique para selecionar um fornecedor"
                      className={`border-2 h-11 cursor-pointer ${formData.fornecedor ? 'pr-10' : 'pr-10'}`}
                      onClick={() => setSupplierSearchOpen(true)}
                      required
                    />
                    {formData.fornecedor ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, fornecedor: "" });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Search className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  {!formData.fornecedor && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Search className="h-3 w-3" />
                      Clique no campo para selecionar um fornecedor
                    </p>
                  )}
                </div>

                                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="especie_documento" className="flex items-center gap-2 text-sm font-semibold">
                        <FileText className="h-4 w-4 text-purple-500" />
                        Espécie do Documento
                      </Label>
                      <Select
                        value={formData.especie_documento || "__none__"}
                        onValueChange={(value) => {
                          const especieValue = value === "__none__" ? "" : value;
                          setFormData({ 
                            ...formData, 
                            especie_documento: especieValue as any,
                            numero_documento: "" // Limpar número quando mudar espécie
                          });
                          // Buscar próximo número automaticamente se uma espécie válida for selecionada
                          if (especieValue && especieValue !== "") {
                            setTimeout(() => {
                              fetchProximoNumero(especieValue);
                            }, 100);
                          }
                        }}
                      >
                        <SelectTrigger className="border-2 h-11">
                          <SelectValue placeholder="Selecione a espécie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Nenhuma espécie</SelectItem>
                          <SelectItem value="CONTAS_A_PAGAR">Contas a Pagar</SelectItem>
                          <SelectItem value="NOTA_FISCAL">Nota Fiscal</SelectItem>
                          <SelectItem value="FATURA">Fatura</SelectItem>
                          <SelectItem value="DUPLICATA">Duplicata</SelectItem>
                          <SelectItem value="BOLETO">Boleto</SelectItem>
                          <SelectItem value="RECIBO">Recibo</SelectItem>
                          <SelectItem value="NOTA_FISCAL_SERVICO">Nota Fiscal de Serviço</SelectItem>
                          <SelectItem value="PEDIDO">Pedido</SelectItem>
                          <SelectItem value="ORDEM_COMPRA">Ordem de Compra</SelectItem>
                          <SelectItem value="OUTROS">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numero_documento" className="flex items-center gap-2 text-sm font-semibold">
                        <FileEdit className="h-4 w-4 text-purple-500" />
                        Número do Documento
                        {loadingNumero && <Loader2 className="h-4 w-4 animate-spin text-purple-500" />}
                      </Label>
                      <Input
                        id="numero_documento"
                        value={formData.numero_documento}
                        onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
                        placeholder={loadingNumero ? "Carregando..." : formData.numero_documento ? formData.numero_documento : "Será gerado automaticamente"}
                        className="border-2 h-11"
                        disabled={loadingNumero}
                      />
                    </div>
                  </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="flex items-center gap-2 text-sm font-semibold">
                    {formData.status === "PAGO" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {formData.status === "PENDENTE" && <Clock className="h-4 w-4 text-yellow-500" />}
                    {formData.status === "VENCIDO" && <AlertCircle className="h-4 w-4 text-red-500" />}
                    {formData.status === "CANCELADO" && <XCircle className="h-4 w-4 text-gray-500" />}
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "PENDENTE" | "PAGO" | "VENCIDO" | "CANCELADO") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger className="border-2 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDENTE">⏳ Pendente</SelectItem>
                      <SelectItem value="PAGO">✅ Pago</SelectItem>
                      <SelectItem value="VENCIDO">⚠️ Vencido</SelectItem>
                      <SelectItem value="CANCELADO">❌ Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="categoria" className="flex items-center gap-2 text-sm font-semibold">
                    <Tag className="h-4 w-4 text-purple-500" />
                    Categoria
                  </Label>
                  <Select
                    value={formData.categoria_id || "__none__"}
                    onValueChange={(value) => {
                      const categoriaValue = value === "__none__" ? "" : value;
                      setFormData({ ...formData, categoria_id: categoriaValue, subcategoria_id: "" });
                    }}
                    disabled={loadingCategorias}
                  >
                    <SelectTrigger className="border-2 h-11">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Nenhuma categoria</SelectItem>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcategoria" className="flex items-center gap-2 text-sm font-semibold">
                    <Tag className="h-4 w-4 text-purple-500" />
                    Subcategoria
                  </Label>
                  <Select
                    value={formData.subcategoria_id || "__none__"}
                    onValueChange={(value) => {
                      const subcategoriaValue = value === "__none__" ? "" : value;
                      setFormData({ ...formData, subcategoria_id: subcategoriaValue });
                    }}
                    disabled={!formData.categoria_id || subcategorias.length === 0}
                  >
                    <SelectTrigger className="border-2 h-11">
                      <SelectValue placeholder={
                        !formData.categoria_id 
                          ? "Selecione primeiro uma categoria" 
                          : subcategorias.length === 0
                          ? "Sem subcategorias disponíveis"
                          : "Selecione uma subcategoria"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Nenhuma subcategoria</SelectItem>
                      {subcategorias.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao" className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  Descrição *
                </Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição detalhada da conta a pagar"
                  className="border-2 h-11"
                  required
                  minLength={1}
                />
              </div>
              </div>
            </TabsContent>

            <TabsContent value="valores-datas" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
              {/* Valores */}
              <div className="space-y-6 p-6 bg-gradient-to-br from-green-50/50 to-white rounded-xl border-2 border-green-100">
                <h3 className="text-xl font-bold flex items-center gap-3 text-primary pb-2 border-b">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  Valores
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor_original" className="flex items-center gap-2 text-sm font-semibold">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      Valor Original *
                    </Label>
                    <Input
                      id="valor_original"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valor_original}
                      onChange={(e) => setFormData({ ...formData, valor_original: e.target.value })}
                      placeholder="0,00"
                      className="border-2 h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valor_pago" className="flex items-center gap-2 text-sm font-semibold">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      Valor Pago
                    </Label>
                    <Input
                      id="valor_pago"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valor_pago}
                      onChange={(e) => setFormData({ ...formData, valor_pago: e.target.value })}
                      placeholder="0,00"
                      className="border-2 h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="valor_desconto" className="flex items-center gap-2 text-sm font-semibold">
                      <Percent className="h-4 w-4 text-green-500" />
                      Desconto (R$)
                    </Label>
                    <Input
                      id="valor_desconto"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valor_desconto}
                      onChange={(e) => setFormData({ ...formData, valor_desconto: e.target.value })}
                      placeholder="0,00"
                      className="border-2 border-green-200 h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valor_juros" className="flex items-center gap-2 text-sm font-semibold">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Juros (R$)
                    </Label>
                    <Input
                      id="valor_juros"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valor_juros}
                      onChange={(e) => setFormData({ ...formData, valor_juros: e.target.value })}
                      placeholder="0,00"
                      className="border-2 border-red-200 h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Datas */}
              <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50/50 to-white rounded-xl border-2 border-blue-100">
                <h3 className="text-xl font-bold flex items-center gap-3 text-primary pb-2 border-b">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  Datas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data_emissao" className="flex items-center gap-2 text-sm font-semibold">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      Data de Emissão
                    </Label>
                    <Input
                      id="data_emissao"
                      type="date"
                      value={formData.data_emissao}
                      onChange={(e) => setFormData({ ...formData, data_emissao: e.target.value })}
                      className="border-2 h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_vencimento" className="flex items-center gap-2 text-sm font-semibold">
                      <Clock className="h-4 w-4 text-orange-500" />
                      Data de Vencimento *
                    </Label>
                    <Input
                      id="data_vencimento"
                      type="date"
                      value={formData.data_vencimento}
                      onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                      className="border-2 h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_pagamento" className="flex items-center gap-2 text-sm font-semibold">
                      <Calendar className="h-4 w-4 text-emerald-500" />
                      Data de Pagamento
                    </Label>
                    <Input
                      id="data_pagamento"
                      type="date"
                      value={formData.data_pagamento}
                      onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })}
                      className="border-2 h-11"
                    />
                  </div>
                </div>
              </div>
              </div>
            </TabsContent>

            <TabsContent value="pagamento" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
              {/* Forma de Pagamento */}
              <div className="space-y-6 p-6 bg-gradient-to-br from-purple-50/50 to-white rounded-xl border-2 border-purple-100">
                <h3 className="text-xl font-bold flex items-center gap-3 text-primary pb-2 border-b">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-purple-600" />
                  </div>
                  Forma de Pagamento
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="forma_pagamento" className="flex items-center gap-2 text-sm font-semibold">
                    <CreditCard className="h-4 w-4 text-pink-500" />
                    Forma de Pagamento
                  </Label>
                  <Select
                    value={formData.forma_pagamento}
                    onValueChange={(value: "DINHEIRO" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "PIX" | "BOLETO" | "TRANSFERENCIA" | "") =>
                      setFormData({ ...formData, forma_pagamento: value || "" })
                    }
                  >
                    <SelectTrigger className="border-2 h-11">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DINHEIRO">💰 Dinheiro</SelectItem>
                      <SelectItem value="CARTAO_CREDITO">💳 Cartão de Crédito</SelectItem>
                      <SelectItem value="CARTAO_DEBITO">💳 Cartão de Débito</SelectItem>
                      <SelectItem value="PIX">📱 PIX</SelectItem>
                      <SelectItem value="BOLETO">📄 Boleto</SelectItem>
                      <SelectItem value="TRANSFERENCIA">🏦 Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50/50 to-white rounded-xl border-2 border-slate-100">
                <h3 className="text-xl font-bold flex items-center gap-3 text-primary pb-2 border-b">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <FileText className="h-6 w-6 text-slate-600" />
                  </div>
                  Observações
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="observacoes" className="flex items-center gap-2 text-sm font-semibold">
                    <FileText className="h-4 w-4 text-slate-500" />
                    Observações Adicionais
                  </Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Digite aqui observações adicionais sobre a conta a pagar..."
                    className="border-2 min-h-[120px] resize-none"
                  />
                </div>
              </div>
              </div>
            </TabsContent>

            <TabsContent value="outros" className="space-y-6">
              <div className="space-y-6 p-6 bg-gradient-to-br from-amber-50/50 to-white rounded-xl border-2 border-amber-100">
              <h3 className="text-xl font-bold flex items-center gap-3 text-primary pb-2 border-b">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <MoreHorizontal className="h-6 w-6 text-amber-600" />
                </div>
                Outros
              </h3>

              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Split className="h-5 w-5 text-purple-600" />
                          <h4 className="font-semibold text-lg">Desdobramento de Título</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Divida este título em várias parcelas com vencimentos distribuídos
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDesdobramentoDialogOpen(true)}
                        disabled={!formData.valor_original || parseFloat(formData.valor_original) <= 0}
                        className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Split className="mr-2 h-4 w-4" />
                        Desdobrar
                      </Button>
                    </div>

                    {(!formData.valor_original || parseFloat(formData.valor_original) <= 0) && (
                      <Card className="bg-yellow-50 border-yellow-200">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2 text-yellow-700">
                            <AlertCircle className="h-4 w-4" />
                            <p className="text-sm font-medium">
                              É necessário informar o valor original antes de desdobrar o título.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="border-t pt-4 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Receipt className="mr-2 h-4 w-4" />
              Adicionar Conta
            </Button>
          </DialogFooter>
        </form>
        
        <SupplierSearchDialog
          open={supplierSearchOpen}
          onOpenChange={setSupplierSearchOpen}
          onSelect={(supplierName) => {
            setFormData({ ...formData, fornecedor: supplierName });
          }}
        />

        <DesdobramentoDialog
          open={desdobramentoDialogOpen}
          onOpenChange={setDesdobramentoDialogOpen}
          valorOriginal={parseFloat(formData.valor_original) || 0}
          dataVencimentoInicial={formData.data_vencimento}
          onConfirm={handleDesdobramento}
        />

        <ErrorDialog
          open={errorDialogOpen}
          onOpenChange={setErrorDialogOpen}
          title="Erro ao Adicionar Conta"
          message={errorMessage}
          details={errorDetails.length > 0 ? errorDetails : undefined}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseDialog;

