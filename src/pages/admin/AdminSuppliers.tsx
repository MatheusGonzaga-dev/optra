import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Building2, Pencil, Trash2, Loader2, Search, Phone, Mail, MapPin, FileText } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AddSupplierDialog from "@/components/AddSupplierDialog";
import EditSupplierDialog from "@/components/EditSupplierDialog";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface Supplier {
  id: string;
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  ativo: boolean;
}

const AdminSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_BASE_URL}/fornecedores`);
      if (!resp.ok) throw new Error('Erro ao buscar fornecedores');
      const data = await resp.json();
      setSuppliers((data || []).map((s: any) => ({
        id: s.id,
        nome: s.nome,
        cnpj: s.cnpj,
        telefone: s.telefone,
        email: s.email,
        endereco: s.endereco,
        cidade: s.cidade,
        estado: s.estado,
        cep: s.cep,
        observacoes: s.observacoes,
        ativo: s.ativo !== false,
      })));
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      toast.error('Erro ao carregar fornecedores');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async (supplier: Omit<Supplier, "id">) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/fornecedores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplier),
      });
      if (!resp.ok) {
        const error = await resp.json();
        throw new Error(error.error || 'Erro ao adicionar fornecedor');
      }
      toast.success("Fornecedor adicionado com sucesso!");
      setIsAddDialogOpen(false);
      fetchSuppliers();
    } catch (error: any) {
      console.error('Erro ao adicionar fornecedor:', error);
      toast.error(error.message || 'Erro ao adicionar fornecedor');
    }
  };

  const handleEditSupplier = async (updatedSupplier: Supplier) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/fornecedores/${updatedSupplier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSupplier),
      });
      if (!resp.ok) {
        const error = await resp.json();
        throw new Error(error.error || 'Erro ao atualizar fornecedor');
      }
      toast.success("Fornecedor atualizado com sucesso!");
      setIsEditDialogOpen(false);
      fetchSuppliers();
    } catch (error: any) {
      console.error('Erro ao atualizar fornecedor:', error);
      toast.error(error.message || 'Erro ao atualizar fornecedor');
    }
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedSupplier) {
      try {
        const resp = await fetch(`${API_BASE_URL}/fornecedores/${selectedSupplier.id}`, {
          method: 'DELETE',
        });
        if (!resp.ok) {
          const error = await resp.json();
          throw new Error(error.error || 'Erro ao excluir fornecedor');
        }
        toast.success("Fornecedor excluído com sucesso!");
        setDeleteDialogOpen(false);
        setSelectedSupplier(null);
        fetchSuppliers();
      } catch (error: any) {
        console.error('Erro ao excluir fornecedor:', error);
        toast.error(error.message || 'Erro ao excluir fornecedor');
      }
    }
  };

  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditDialogOpen(true);
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.cnpj?.replace(/\D/g, "").includes(searchTerm.replace(/\D/g, "")) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Fornecedores
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie todos os fornecedores da clínica
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Adicionar Fornecedor
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                Total de Fornecedores
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {suppliers.length}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {filteredSuppliers.length} fornecedor(es) encontrado(s)
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-500" />
                Fornecedores Ativos
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {suppliers.filter(s => s.ativo).length}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Fornecedores ativos no sistema
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-orange-500" />
                Fornecedores Inativos
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building2 className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {suppliers.filter(s => !s.ativo).length}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Fornecedores inativos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Buscar Fornecedores</CardTitle>
                <CardDescription className="mt-1">Pesquise por nome, CNPJ ou email</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CNPJ ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 h-11"
              />
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Table */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Lista de Fornecedores</CardTitle>
            <CardDescription>
              {filteredSuppliers.length} fornecedor(es) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Carregando fornecedores...</p>
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhum fornecedor encontrado</h3>
                <p className="text-muted-foreground mt-2">
                  {searchTerm 
                    ? 'Tente ajustar os termos de busca ou adicionar um novo fornecedor.'
                    : 'Comece adicionando seu primeiro fornecedor.'}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Primeiro Fornecedor
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Fornecedor</TableHead>
                      <TableHead className="hidden md:table-cell">CNPJ</TableHead>
                      <TableHead className="hidden lg:table-cell">Contato</TableHead>
                      <TableHead className="hidden lg:table-cell">Endereço</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right font-semibold">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Building2 className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-lg">{supplier.nome}</p>
                              {supplier.email && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Mail className="h-3 w-3" />
                                  {supplier.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {supplier.cnpj ? (
                            <span className="font-mono text-sm">{supplier.cnpj}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-col gap-1">
                            {supplier.telefone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="font-mono">{supplier.telefone}</span>
                              </div>
                            )}
                            {supplier.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="truncate max-w-[200px]">{supplier.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {supplier.endereco ? (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="truncate max-w-[200px]">
                                {supplier.endereco}
                                {supplier.cidade && `, ${supplier.cidade}`}
                                {supplier.estado && ` - ${supplier.estado}`}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={supplier.ativo ? "default" : "secondary"} className="font-semibold">
                            {supplier.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditClick(supplier)}
                              className="border-2 hover:bg-blue-50 hover:border-blue-300"
                            >
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteClick(supplier)}
                              className="border-2 hover:bg-red-50 hover:border-red-300"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddSupplierDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddSupplier}
      />

      {selectedSupplier && (
        <EditSupplierDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          supplier={selectedSupplier}
          onEdit={handleEditSupplier}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o fornecedor "{selectedSupplier?.nome}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminSuppliers;





