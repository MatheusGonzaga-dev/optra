import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Building2, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import AddPartnershipDialog from "@/components/AddPartnershipDialog";
import EditPartnershipDialog from "@/components/EditPartnershipDialog";

interface Partnership {
  id: string;
  name: string;
  cnpj: string;
  phone: string;
  address: string;
  partnershipDate: string;
}

const AdminPartnerships = () => {
  // Mock data - será substituído por dados do Supabase
  const [partnerships, setPartnerships] = useState<Partnership[]>([
    {
      id: "1",
      name: "Ótica Visão Clara",
      cnpj: "12.345.678/0001-90",
      phone: "(11) 98765-4321",
      address: "Rua das Flores, 123 - Centro - São Paulo/SP",
      partnershipDate: "2024-01-15"
    },
    {
      id: "2",
      name: "Dr. João Silva",
      cnpj: "987.654.321-00",
      phone: "(11) 91234-5678",
      address: "Av. Paulista, 1000 - Bela Vista - São Paulo/SP",
      partnershipDate: "2024-02-20"
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);

  const handleAddPartnership = (partnership: Omit<Partnership, "id">) => {
    const newPartnership = {
      ...partnership,
      id: Date.now().toString(),
    };
    setPartnerships([...partnerships, newPartnership]);
    toast.success("Parceria adicionada com sucesso!");
    setIsAddDialogOpen(false);
  };

  const handleEditClick = (partnership: Partnership) => {
    setSelectedPartnership(partnership);
    setIsEditDialogOpen(true);
  };

  const handleEditPartnership = (updatedPartnership: Partnership) => {
    setPartnerships(partnerships.map(p => 
      p.id === updatedPartnership.id ? updatedPartnership : p
    ));
    toast.success("Parceria atualizada com sucesso!");
    setIsEditDialogOpen(false);
    setSelectedPartnership(null);
  };

  const handleDeleteClick = (partnership: Partnership) => {
    setSelectedPartnership(partnership);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedPartnership) {
      setPartnerships(partnerships.filter(p => p.id !== selectedPartnership.id));
      toast.success("Parceria removida com sucesso!");
      setDeleteDialogOpen(false);
      setSelectedPartnership(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Parcerias</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie óticas e profissionais parceiros
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Parceria
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {partnerships.map((partnership) => (
            <Card key={partnership.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{partnership.name}</CardTitle>
                      <CardDescription className="text-xs">
                        Parceria desde {formatDate(partnership.partnershipDate)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(partnership)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(partnership)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium">CNPJ/CPF</p>
                  <p className="text-sm text-muted-foreground">{partnership.cnpj}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Telefone</p>
                  <p className="text-sm text-muted-foreground">{partnership.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Endereço</p>
                  <p className="text-sm text-muted-foreground">{partnership.address}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {partnerships.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhuma parceria cadastrada</h3>
              <p className="text-muted-foreground mt-2">
                Comece adicionando sua primeira parceria.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Parceria
              </Button>
            </div>
          </Card>
        )}
      </div>

      <AddPartnershipDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddPartnership}
      />

      {selectedPartnership && (
        <EditPartnershipDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          partnership={selectedPartnership}
          onEdit={handleEditPartnership}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a parceria com {selectedPartnership?.name}?
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

export default AdminPartnerships;
