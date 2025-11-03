import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingDown, Filter, Pencil, Trash2 } from "lucide-react";
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
  name: string;
  value: number;
  date: string;
  isRecurring: boolean;
  category: "fixed" | "procedure" | "other";
}

const AdminExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      name: "Aluguel",
      value: 3500,
      date: "2024-01-01",
      isRecurring: true,
      category: "fixed"
    },
    {
      id: "2",
      name: "Energia Elétrica",
      value: 450,
      date: "2024-01-05",
      isRecurring: true,
      category: "fixed"
    },
    {
      id: "3",
      name: "Material de Exame - Consulta",
      value: 85,
      date: "2024-01-10",
      isRecurring: false,
      category: "procedure"
    },
    {
      id: "4",
      name: "Copos Descartáveis",
      value: 35,
      date: "2024-01-12",
      isRecurring: false,
      category: "other"
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [filterPeriod, setFilterPeriod] = useState("month");
  const [filterCategory, setFilterCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleAddExpense = (expense: Omit<Expense, "id">) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
    };
    setExpenses([...expenses, newExpense]);
    toast.success("Despesa adicionada com sucesso!");
    setIsAddDialogOpen(false);
  };

  const handleEditExpense = (updatedExpense: Expense) => {
    setExpenses(expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    toast.success("Despesa atualizada com sucesso!");
    setIsEditDialogOpen(false);
  };

  const handleDeleteClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedExpense) {
      setExpenses(expenses.filter(e => e.id !== selectedExpense.id));
      toast.success("Despesa excluída com sucesso!");
      setDeleteDialogOpen(false);
      setSelectedExpense(null);
    }
  };

  const handleEditClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditDialogOpen(true);
  };

  const filterExpenses = () => {
    let filtered = [...expenses];

    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter(e => e.category === filterCategory);
    }

    // Filter by date
    const now = new Date();
    if (filterPeriod === "today") {
      const today = now.toISOString().split('T')[0];
      filtered = filtered.filter(e => e.date === today);
    } else if (filterPeriod === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(e => new Date(e.date) >= weekAgo);
    } else if (filterPeriod === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(e => new Date(e.date) >= monthAgo);
    } else if (filterPeriod === "custom" && startDate && endDate) {
      filtered = filtered.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
      });
    }

    return filtered;
  };

  const filteredExpenses = filterExpenses();

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.value, 0);
  const recurringExpenses = filteredExpenses.filter(e => e.isRecurring).reduce((sum, e) => sum + e.value, 0);
  const oneTimeExpenses = filteredExpenses.filter(e => !e.isRecurring).reduce((sum, e) => sum + e.value, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      fixed: "Custo Fixo",
      procedure: "Procedimento",
      other: "Outros"
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Despesas</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todos os custos da clínica
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Despesa
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredExpenses.length} despesa(s) no período
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custos Recorrentes</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {formatCurrency(recurringExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                Custos fixos mensais
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custos Eventuais</CardTitle>
              <TrendingDown className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {formatCurrency(oneTimeExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                Custos não recorrentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Filtros</CardTitle>
            </div>
            <CardDescription>Filtre as despesas por período e categoria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
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
        <Card>
          <CardHeader>
            <CardTitle>Lista de Despesas</CardTitle>
            <CardDescription>
              {filteredExpenses.length} despesa(s) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{expense.name}</h4>
                      <Badge variant={expense.isRecurring ? "default" : "secondary"}>
                        {expense.isRecurring ? "Recorrente" : "Único"}
                      </Badge>
                      <Badge variant="outline">
                        {getCategoryLabel(expense.category)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(expense.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-4">
                      <p className="text-lg font-bold text-destructive">
                        {formatCurrency(expense.value)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(expense)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(expense)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}

              {filteredExpenses.length === 0 && (
                <div className="text-center py-12">
                  <TrendingDown className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Nenhuma despesa encontrada</h3>
                  <p className="text-muted-foreground mt-2">
                    Tente ajustar os filtros ou adicionar uma nova despesa.
                  </p>
                </div>
              )}
            </div>
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
              Tem certeza que deseja excluir a despesa "{selectedExpense?.name}"? 
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
