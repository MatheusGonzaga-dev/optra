import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingUp, Filter, Pencil, Trash2, Loader2, Receipt, DollarSign, Calendar, CheckCircle, XCircle, Clock, User } from "lucide-react";
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
import AddReceivableDialog from "@/components/AddReceivableDialog";
import EditReceivableDialog from "@/components/EditReceivableDialog";
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

interface Receivable {
  id: string;
  paciente_id: string;
  paciente_nome?: string; // Para exibição
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
  valor_final?: number; // Calculado automaticamente
  data_emissao?: string;
  data_vencimento: string;
  data_recebimento?: string;
  forma_pagamento?: "DINHEIRO" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "PIX" | "BOLETO" | "TRANSFERENCIA";
  status: "PENDENTE" | "PAGO" | "VENCIDO" | "CANCELADO";
  observacoes?: string;
}

const AdminReceivables = () => {
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [filterPeriod, setFilterPeriod] = useState("month");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchReceivables();
  }, []);

  const fetchReceivables = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_BASE_URL}/contas-receber');
      if (!resp.ok) throw new Error('Erro ao buscar contas a receber');
      const data = await resp.json();

      // Buscar pacientes para obter os nomes
      const pacientesResp = await fetch(`${API_BASE_URL}/pacientes');
      const pacientesData = pacientesResp.ok ? await pacientesResp.json() : [];
      const pacientesMap = new Map(pacientesData.map((p: any) => [p.id, p.nome_completo]));

      setReceivables((data || []).map((r: any) => ({
        id: r.id,
        paciente_id: r.paciente_id,
        paciente_nome: pacientesMap.get(r.paciente_id) || 'Paciente não encontrado',
        consulta_id: r.consulta_id,
        descricao: r.descricao,
        categoria_id: r.categoria_id,
        subcategoria_id: r.subcategoria_id,
        especie_documento: r.especie_documento,
        numero_documento: r.numero_documento,
        valor_original: Number(r.valor_original || 0),
        valor_recebido: Number(r.valor_recebido || 0),
        valor_desconto: Number(r.valor_desconto || 0),
        valor_juros: Number(r.valor_juros || 0),
        valor_final: Number(r.valor_final || 0),
        data_emissao: r.data_emissao,
        data_vencimento: r.data_vencimento,
        data_recebimento: r.data_recebimento,
        forma_pagamento: r.forma_pagamento,
        status: r.status || 'PENDENTE',
        observacoes: r.observacoes,
      })));
    } catch (error) {
      console.error('Erro ao buscar contas a receber:', error);
      toast.error('Erro ao carregar contas a receber');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReceivable = async (receivable: Omit<Receivable, "id">) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/contas-receber', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receivable),
      });
      if (!resp.ok) {
        const error = await resp.json();
        // Criar erro com detalhes para o modal
        const errorObj: any = new Error('Erro ao adicionar conta a receber');
        if (error.detalhes && Array.isArray(error.detalhes)) {
          errorObj.message = 'Erro de validação';
          errorObj.detalhes = error.detalhes;
        } else if (error.error) {
          errorObj.message = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
        }
        throw errorObj;
      }
      toast.success("Conta a receber adicionada com sucesso!");
    setIsAddDialogOpen(false);
      fetchReceivables();
    } catch (error: any) {
      console.error('Erro ao adicionar conta a receber:', error);
      toast.error(error.message || 'Erro ao adicionar conta a receber');
    }
  };

  const handleEditReceivable = async (updatedReceivable: Receivable) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/contas-receber/${updatedReceivable.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedReceivable),
      });
      if (!resp.ok) {
        const error = await resp.json();
        throw new Error(error.error || 'Erro ao atualizar conta a receber');
      }
      toast.success("Conta a receber atualizada com sucesso!");
    setIsEditDialogOpen(false);
      fetchReceivables();
    } catch (error: any) {
      console.error('Erro ao atualizar conta a receber:', error);
      toast.error(error.message || 'Erro ao atualizar conta a receber');
    }
  };

  const handleDeleteClick = (receivable: Receivable) => {
    setSelectedReceivable(receivable);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedReceivable) {
      try {
        const resp = await fetch(`${API_BASE_URL}/contas-receber/${selectedReceivable.id}`, {
          method: 'DELETE',
        });
        if (!resp.ok) {
          const error = await resp.json();
          throw new Error(error.error || 'Erro ao excluir conta a receber');
        }
        toast.success("Conta a receber excluída com sucesso!");
      setDeleteDialogOpen(false);
      setSelectedReceivable(null);
        fetchReceivables();
      } catch (error: any) {
        console.error('Erro ao excluir conta a receber:', error);
        toast.error(error.message || 'Erro ao excluir conta a receber');
      }
    }
  };

  const handleEditClick = (receivable: Receivable) => {
    setSelectedReceivable(receivable);
    setIsEditDialogOpen(true);
  };

  const filterReceivables = () => {
    let filtered = [...receivables];

    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered; // Pode ser expandido depois
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    // Filter by date (vencimento)
    const now = new Date();
    if (filterPeriod === "today") {
      const today = now.toISOString().split('T')[0];
      filtered = filtered.filter(r => r.data_vencimento === today);
    } else if (filterPeriod === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(r => new Date(r.data_vencimento) >= weekAgo);
    } else if (filterPeriod === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(r => new Date(r.data_vencimento) >= monthAgo);
    } else if (filterPeriod === "custom" && startDate && endDate) {
      filtered = filtered.filter(r => {
        const receivableDate = new Date(r.data_vencimento);
        return receivableDate >= new Date(startDate) && receivableDate <= new Date(endDate);
      });
    }

    return filtered;
  };

  const filteredReceivables = filterReceivables();

  const totalAReceber = filteredReceivables
    .filter(r => r.status === 'PENDENTE')
    .reduce((sum, receivable) => {
      return sum + (receivable.valor_final || (receivable.valor_original + receivable.valor_juros - receivable.valor_desconto));
    }, 0);

  const recebidoMes = filteredReceivables
    .filter(r => r.status === 'PAGO')
    .reduce((sum, receivable) => {
      return sum + (receivable.valor_recebido || receivable.valor_original);
    }, 0);

  const vencidos = filteredReceivables
    .filter(r => r.status === 'VENCIDO')
    .reduce((sum, receivable) => {
      return sum + (receivable.valor_final || (receivable.valor_original + receivable.valor_juros - receivable.valor_desconto));
    }, 0);

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
      PAGO: "Recebido",
      VENCIDO: "Vencido",
      CANCELADO: "Cancelado"
    };
    return { variant: variants[status] || "outline", label: labels[status] || status };
  };

  const getValorTotal = (receivable: Receivable) => {
    return receivable.valor_final || (receivable.valor_original + receivable.valor_juros - receivable.valor_desconto);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                Contas a Receber
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os recebíveis da clínica
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Adicionar Recebível
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                Total a Receber
              </CardTitle>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {formatCurrency(totalAReceber)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Receipt className="h-3 w-3" />
                Pendentes no período
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Recebido no Mês
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {formatCurrency(recebidoMes)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Valores já recebidos
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Valores Vencidos
              </CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-1">
                {formatCurrency(vencidos)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Receipt className="h-3 w-3" />
                Títulos vencidos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500/5 to-green-600/10 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Filter className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Filtros</CardTitle>
                <CardDescription className="mt-1">Filtre as contas a receber por período e status</CardDescription>
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
                    <SelectItem value="PAGO">Recebido</SelectItem>
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

        {/* Receivables List */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500/5 to-green-600/10 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Receipt className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Lista de Recebíveis</CardTitle>
                  <CardDescription className="mt-1">{filteredReceivables.length} conta(s) a receber</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredReceivables.length === 0 ? (
              <div className="text-center p-12 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma conta a receber encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold text-sm">Paciente</th>
                      <th className="text-left p-4 font-semibold text-sm">Descrição</th>
                      <th className="text-left p-4 font-semibold text-sm">Nº Doc</th>
                      <th className="text-right p-4 font-semibold text-sm">Valor Original</th>
                      <th className="text-right p-4 font-semibold text-sm">Valor Recebido</th>
                      <th className="text-left p-4 font-semibold text-sm">Vencimento</th>
                      <th className="text-left p-4 font-semibold text-sm">Status</th>
                      <th className="text-right p-4 font-semibold text-sm">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReceivables.map((receivable) => (
                      <tr key={receivable.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{receivable.paciente_nome}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="max-w-xs truncate">{receivable.descricao}</div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {receivable.numero_documento || '-'}
                        </td>
                        <td className="p-4 text-right font-semibold text-green-600">
                          {formatCurrency(receivable.valor_original)}
                        </td>
                        <td className="p-4 text-right font-medium">
                          {formatCurrency(receivable.valor_recebido)}
                        </td>
                        <td className="p-4 text-sm">
                          {formatDate(receivable.data_vencimento)}
                        </td>
                        <td className="p-4">
                          <Badge variant={getStatusBadge(receivable.status).variant}>
                            {getStatusBadge(receivable.status).label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(receivable)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(receivable)}
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

      <AddReceivableDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddReceivable}
      />

      {selectedReceivable && (
        <EditReceivableDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          receivable={selectedReceivable}
          onSave={handleEditReceivable}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta conta a receber? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminReceivables;

