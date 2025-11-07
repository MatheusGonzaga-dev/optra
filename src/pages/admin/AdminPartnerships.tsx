import { useState, useEffect } from "react";
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
import PartnershipServicesDialog from "@/components/PartnershipServicesDialog";

interface Partnership {
  id: string;
  name: string;
  cnpj: string;
  phone: string;
  address: string;
  partnershipDate: string;
}

const AdminPartnerships = () => {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [servicesDialogOpen, setServicesDialogOpen] = useState(false);
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);

  useEffect(() => {
    const fetchPartnerships = async () => {
      try {
        setLoading(true);
        const resp = await fetch('http://localhost:4000/parcerias');
        if (!resp.ok) {
          const errorData = await resp.json().catch(() => ({ error: 'Erro ao carregar parcerias' }));
          throw new Error(errorData.error || 'Erro ao carregar parcerias');
        }
        const data = await resp.json();
        // Garantir que data é um array
        if (!Array.isArray(data)) {
          console.error('Resposta não é um array:', data);
          setPartnerships([]);
          return;
        }
        setPartnerships(data.map((p: any) => ({
          id: p.id,
          name: p.nome,
          cnpj: p.cnpj_cpf,
          phone: p.telefone || '',
          address: p.endereco || '',
          partnershipDate: p.data_parceria || new Date().toISOString().split('T')[0],
        })));
      } catch (e: any) {
        console.error('Erro ao carregar parcerias:', e);
        toast.error(e.message || 'Erro ao carregar parcerias');
        setPartnerships([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPartnerships();
  }, []);

  const handleAddPartnership = async (partnership: Omit<Partnership, "id">) => {
    try {
      const resp = await fetch('http://localhost:4000/parcerias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: partnership.name,
          cnpj_cpf: partnership.cnpj,
          telefone: partnership.phone || null,
          endereco: partnership.address || null,
          data_parceria: partnership.partnershipDate,
        })
      });
      if (!resp.ok) throw new Error('Erro ao adicionar parceria');
      const p = await resp.json();
      setPartnerships([...partnerships, {
        id: p.id,
        name: p.nome,
        cnpj: p.cnpj_cpf,
        phone: p.telefone || '',
        address: p.endereco || '',
        partnershipDate: p.data_parceria,
      }]);
      toast.success("Parceria adicionada com sucesso!");
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar parceria:', error);
      toast.error('Erro ao adicionar parceria');
    }
  };

  const handleEditClick = (partnership: Partnership) => {
    setSelectedPartnership(partnership);
    setIsEditDialogOpen(true);
  };

  const handleEditPartnership = async (updatedPartnership: Partnership) => {
    try {
      const resp = await fetch(`http://localhost:4000/parcerias/${updatedPartnership.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: updatedPartnership.name,
          cnpj_cpf: updatedPartnership.cnpj,
          telefone: updatedPartnership.phone || null,
          endereco: updatedPartnership.address || null,
          data_parceria: updatedPartnership.partnershipDate,
        })
      });
      if (!resp.ok) throw new Error('Erro ao atualizar parceria');
      setPartnerships(partnerships.map(p => 
        p.id === updatedPartnership.id ? updatedPartnership : p
      ));
      toast.success("Parceria atualizada com sucesso!");
      setIsEditDialogOpen(false);
      setSelectedPartnership(null);
    } catch (error) {
      console.error('Erro ao atualizar parceria:', error);
      toast.error('Erro ao atualizar parceria');
    }
  };

  const handleDeleteClick = (partnership: Partnership) => {
    setSelectedPartnership(partnership);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPartnership) return;
    try {
      const resp = await fetch(`http://localhost:4000/parcerias/${selectedPartnership.id}`, {
        method: 'DELETE',
      });
      if (!resp.ok) throw new Error('Erro ao remover parceria');
      setPartnerships(partnerships.filter(p => p.id !== selectedPartnership.id));
      toast.success("Parceria removida com sucesso!");
      setDeleteDialogOpen(false);
      setSelectedPartnership(null);
    } catch (error) {
      console.error('Erro ao remover parceria:', error);
      toast.error('Erro ao remover parceria');
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

        {loading ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <p>Carregando parcerias...</p>
            </div>
          </Card>
        ) : (
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
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedPartnership(partnership);
                        setServicesDialogOpen(true);
                      }}
                      title="Gerenciar Serviços"
                    >
                      <Building2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(partnership)}
                      title="Excluir"
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
        )}

        {!loading && partnerships.length === 0 && (
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

      {selectedPartnership && (
        <PartnershipServicesDialog
          open={servicesDialogOpen}
          onOpenChange={setServicesDialogOpen}
          partnershipId={selectedPartnership.id}
          partnershipName={selectedPartnership.name}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminPartnerships;
