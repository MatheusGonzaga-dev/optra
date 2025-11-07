import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Plus, Edit, Trash2, DollarSign, TrendingDown } from "lucide-react";
import AddServiceDialog from "@/components/AddServiceDialog";
import EditServiceDialog from "@/components/EditServiceDialog";
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

export interface Service {
  id: string;
  name: string;
  price: number;
  cost: number;
  returnPrice?: number;
  description?: string;
}

const AdminServices = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const resp = await fetch('http://localhost:4000/servicos');
        const data = await resp.json();
        setServices((data || []).map((s: any) => ({
          id: s.id,
          name: s.nome,
          price: Number(s.valor),
          cost: Number(s.custo),
          returnPrice: s.valor_retorno ? Number(s.valor_retorno) : undefined,
          description: s.descricao || undefined,
        })));
      } catch (e) {
        // ignore
      }
    };
    fetchServices();
  }, []);

  const handleAddService = async (service: Omit<Service, "id">) => {
    try {
      const resp = await fetch('http://localhost:4000/servicos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: service.name,
          valor: service.price,
          custo: service.cost,
          valor_retorno: service.returnPrice,
          descricao: service.description,
        })
      });
      if (!resp.ok) throw new Error();
      const s = await resp.json();
      setServices([...services, {
        id: s.id,
        name: s.nome,
        price: Number(s.valor),
        cost: Number(s.custo),
        returnPrice: s.valor_retorno ? Number(s.valor_retorno) : undefined,
        description: s.descricao || undefined,
      }]);
      toast.success("Serviço adicionado com sucesso!");
    } catch {
      toast.error('Erro ao adicionar serviço');
    }
  };

  const handleEditClick = (service: Service) => {
    setSelectedService(service);
    setIsEditDialogOpen(true);
  };

  const handleEditService = async (updatedService: Service) => {
    try {
      const resp = await fetch(`http://localhost:4000/servicos/${updatedService.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: updatedService.name,
          valor: updatedService.price,
          custo: updatedService.cost,
          valor_retorno: updatedService.returnPrice,
          descricao: updatedService.description,
        })
      });
      if (!resp.ok) throw new Error();
      setServices(services.map(s => s.id === updatedService.id ? updatedService : s));
      toast.success("Serviço atualizado com sucesso!");
    } catch {
      toast.error('Erro ao atualizar serviço');
    }
  };

  const handleDeleteClick = (service: Service) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedService) return;
    try {
      const resp = await fetch(`http://localhost:4000/servicos/${selectedService.id}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error();
      setServices(services.filter(s => s.id !== selectedService.id));
      toast.success("Serviço excluído com sucesso!");
      setDeleteDialogOpen(false);
      setSelectedService(null);
    } catch {
      toast.error('Erro ao excluir serviço');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateProfit = (price: number, cost: number) => {
    return price - cost;
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Serviços</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os serviços e exames oferecidos pela clínica
            </p>
          </div>
          <Button size="lg" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-5 w-5" />
            Adicionar Serviço
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="relative hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditClick(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteClick(service)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-medium">Valor:</span>
                  </div>
                  <span className="font-bold text-lg text-primary">
                    {formatCurrency(service.price)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Custo:</span>
                  </div>
                  <span className="text-muted-foreground">
                    {formatCurrency(service.cost)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-medium">Lucro:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(calculateProfit(service.price, service.cost))}
                  </span>
                </div>

                {service.returnPrice && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Retorno:</span>
                    <span className="font-semibold">
                      {formatCurrency(service.returnPrice)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {services.length === 0 && (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum serviço cadastrado</p>
              <p className="mt-1">Clique em "Adicionar Serviço" para começar</p>
            </div>
          </Card>
        )}
      </div>

      <AddServiceDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddService}
      />

      <EditServiceDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        service={selectedService}
        onEdit={handleEditService}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o serviço <strong>{selectedService?.name}</strong>?
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

export default AdminServices;
