import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingDown, Filter, Pencil, Trash2, Loader2, Receipt, DollarSign, Calendar, CreditCard, AlertCircle, CheckCircle, XCircle, Clock, Building2, User } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AddExpenseDialog from "@/components/AddExpenseDialog";
import EditExpenseDialog from "@/components/EditExpenseDialog";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Expense {
  id: string;
  fornecedor: string;
  descricao: string;
  categoria_id?: string;
  subcategoria_id?: string;
  especie_documento?: "CONTAS_A_PAGAR" | "NOTA_FISCAL" | "FATURA" | "DUPLICATA" | "BOLETO" | "RECIBO" | "NOTA_FISCAL_SERVICO" | "PEDIDO" | "ORDEM_COMPRA" | "OUTROS";
  numero_documento?: string;
  valor_original: number;
  valor_pago: number;
  valor_desconto: number;
  valor_juros: number;
  valor_final?: number; // Calculado automaticamente
  data_emissao?: string;
  data_vencimento: string;
  data_pagamento?: string;
  forma_pagamento?: "DINHEIRO" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "PIX" | "BOLETO" | "TRANSFERENCIA";
  status: "PENDENTE" | "PAGO" | "VENCIDO" | "CANCELADO";
  observacoes?: string;
}

const AdminExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [filterPeriod, setFilterPeriod] = useState("month");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_BASE_URL}/contas-pagar`);
      if (!resp.ok) throw new Error('Erro ao buscar contas a pagar');
      const data = await resp.json();
      setExpenses((data || []).map((e: any) => ({
        id: e.id,
        fornecedor: e.fornecedor,
        descricao: e.descricao,
        categoria_id: e.categoria_id,
        subcategoria_id: e.subcategoria_id,
        especie_documento: e.especie_documento,
        numero_documento: e.numero_documento,
        valor_original: Number(e.valor_original || 0),
        valor_pago: Number(e.valor_pago || 0),
        valor_desconto: Number(e.valor_desconto || 0),
        valor_juros: Number(e.valor_juros || 0),
        valor_final: Number(e.valor_final || 0),
        data_emissao: e.data_emissao,
        data_vencimento: e.data_vencimento,
        data_pagamento: e.data_pagamento,
        forma_pagamento: e.forma_pagamento,
        status: e.status || 'PENDENTE',
        observacoes: e.observacoes,
      })));
    } catch (error) {
      console.error('Erro ao buscar contas a pagar:', error);
      toast.error('Erro ao carregar contas a pagar');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expense: Omit<Expense, "id">) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/contas-pagar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      if (!resp.ok) {
        const error = await resp.json();
        // Criar erro com detalhes para o modal
        const errorObj: any = new Error('Erro ao adicionar conta a pagar');
        if (error.detalhes && Array.isArray(error.detalhes)) {
          errorObj.message = 'Erro de validação';
          errorObj.detalhes = error.detalhes;
        } else if (error.error) {
          errorObj.message = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
        }
        throw errorObj;
      }
      toast.success("Conta a pagar adicionada com sucesso!");
    setIsAddDialogOpen(false);
      fetchExpenses();
    } catch (error: any) {
      console.error('Erro ao adicionar conta a pagar:', error);
      toast.error(error.message || 'Erro ao adicionar conta a pagar');
    }
  };

  const handleEditExpense = async (updatedExpense: Expense) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/contas-pagar/${updatedExpense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedExpense),
      });
      if (!resp.ok) {
        const error = await resp.json();
        throw new Error(error.error || 'Erro ao atualizar conta a pagar');
      }
      toast.success("Conta a pagar atualizada com sucesso!");
    setIsEditDialogOpen(false);
      fetchExpenses();
    } catch (error: any) {
      console.error('Erro ao atualizar conta a pagar:', error);
      toast.error(error.message || 'Erro ao atualizar conta a pagar');
    }
  };

  const handleDeleteClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedExpense) {
      try {
        const resp = await fetch(`${API_BASE_URL}/contas-pagar/${selectedExpense.id}`, {
          method: 'DELETE',
        });
        if (!resp.ok) {
          const error = await resp.json();
          throw new Error(error.error || 'Erro ao excluir conta a pagar');
        }
        toast.success("Conta a pagar excluída com sucesso!");
      setDeleteDialogOpen(false);
      setSelectedExpense(null);
        fetchExpenses();
      } catch (error: any) {
        console.error('Erro ao excluir conta a pagar:', error);
        toast.error(error.message || 'Erro ao excluir conta a pagar');
      }
    }
  };

  const handleEditClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditDialogOpen(true);
  };

  const filterExpenses = () => {
    let filtered = [...expenses];

    // Filter by category (se tiver categoria_id, filtra por isso; senão usa categoria antiga)
    if (filterCategory !== "all") {
      // Por enquanto, vamos manter compatibilidade com categoria antiga se existir
      // Depois pode ser ajustado para usar categoria_id
      filtered = filtered; // Mantém todas, pode ser expandido depois
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(e => e.status === filterStatus);
    }

    // Filter by date (vencimento)
    const now = new Date();
    if (filterPeriod === "today") {
      const today = now.toISOString().split('T')[0];
      filtered = filtered.filter(e => e.data_vencimento === today);
    } else if (filterPeriod === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(e => new Date(e.data_vencimento) >= weekAgo);
    } else if (filterPeriod === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(e => new Date(e.data_vencimento) >= monthAgo);
    } else if (filterPeriod === "custom" && startDate && endDate) {
      filtered = filtered.filter(e => {
        const expenseDate = new Date(e.data_vencimento);
        return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
      });
    }

    return filtered;
  };

  const filteredExpenses = filterExpenses();

  const totalExpenses = filteredExpenses.reduce((sum, expense) => {
    return sum + (expense.valor_final || (expense.valor_original + expense.valor_juros - expense.valor_desconto));
  }, 0);
  const recurringExpenses = 0; // Removido recorrente por enquanto
  const oneTimeExpenses = totalExpenses;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PENDENTE: "outline",
      PAGO: "default",
      VENCIDO: "destructive",
      CANCELADO: "secondary"
    };
    const labels: Record<string, string> = {
      PENDENTE: "Pendente",
      PAGO: "Pago",
      VENCIDO: "Vencido",
      CANCELADO: "Cancelado"
    };
    return { variant: variants[status] || "outline", label: labels[status] || status };
  };

  const getValorTotal = (expense: Expense) => {
    return expense.valor_final || (expense.valor_original + expense.valor_juros - expense.valor_desconto);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
              <Receipt className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Despesas
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie todos os custos da clínica
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Adicionar Despesa
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-red-500" />
                Total de Despesas
              </CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-1">
                {formatCurrency(totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Receipt className="h-3 w-3" />
                {filteredExpenses.length} despesa(s) no período
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                Custos Recorrentes
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {formatCurrency(recurringExpenses)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Custos fixos mensais
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Custos Eventuais
              </CardTitle>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {formatCurrency(oneTimeExpenses)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Receipt className="h-3 w-3" />
                Custos não recorrentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Filtros</CardTitle>
                <CardDescription className="mt-1">Filtre as despesas por período e categoria</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Período</Label>
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Última Semana</SelectItem>
                    <SelectItem value="month">Último Mês</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="fixed">Custos Fixos</SelectItem>
                    <SelectItem value="procedure">Procedimentos</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="PENDENTE">Pendente</SelectItem>
                    <SelectItem value="PAGO">Pago</SelectItem>
                    <SelectItem value="VENCIDO">Vencido</SelectItem>
                    <SelectItem value="CANCELADO">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filterPeriod === "custom" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Data Inicial</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Final</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses List */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-500/5 to-red-600/10 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Receipt className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Lista de Despesas</CardTitle>
                  <CardDescription className="mt-1">{filteredExpenses.length} despesa(s) encontrada(s)</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center p-12 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma despesa encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold text-sm">Fornecedor</th>
                      <th className="text-left p-4 font-semibold text-sm">Descrição</th>
                      <th className="text-left p-4 font-semibold text-sm">Nº Doc</th>
                      <th className="text-right p-4 font-semibold text-sm">Valor Original</th>
                      <th className="text-right p-4 font-semibold text-sm">Valor Pago</th>
                      <th className="text-left p-4 font-semibold text-sm">Vencimento</th>
                      <th className="text-left p-4 font-semibold text-sm">Status</th>
                      <th className="text-right p-4 font-semibold text-sm">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{expense.fornecedor}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="max-w-xs truncate">{expense.descricao}</div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {expense.numero_documento || '-'}
                        </td>
                        <td className="p-4 text-right font-semibold text-red-600">
                          {formatCurrency(expense.valor_original)}
                        </td>
                        <td className="p-4 text-right font-medium">
                          {formatCurrency(expense.valor_pago)}
                        </td>
                        <td className="p-4 text-sm">
                          {formatDate(expense.data_vencimento)}
                        </td>
                        <td className="p-4">
                          <Badge variant={getStatusBadge(expense.status).variant}>
                            {getStatusBadge(expense.status).label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(expense)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(expense)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddExpenseDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddExpense}
      />

      {selectedExpense && (
        <EditExpenseDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          expense={selectedExpense}
          onEdit={handleEditExpense}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a conta a pagar "{selectedExpense?.fornecedor}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminExpenses;
