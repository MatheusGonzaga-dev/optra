import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Service } from "@/pages/admin/AdminServices";

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (service: Omit<Service, "id">) => void;
}

const AddServiceDialog = ({ open, onOpenChange, onAdd }: AddServiceDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    cost: "",
    returnPrice: "",
    description: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simular criação - será substituído por integração com Supabase
    setTimeout(() => {
      onAdd({
        name: formData.name,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        returnPrice: formData.returnPrice ? parseFloat(formData.returnPrice) : undefined,
        description: formData.description || undefined
      });
      
      setFormData({
        name: "",
        price: "",
        cost: "",
        returnPrice: "",
        description: ""
      });
      setLoading(false);
      onOpenChange(false);
    }, 500);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Serviço</DialogTitle>
          <DialogDescription>
            Adicione um novo serviço ou exame oferecido pela clínica
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Serviço *</Label>
              <Input
                id="name"
                placeholder="Ex: Consulta Completa"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição breve do serviço"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Valor (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="180.00"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Custo (R$) *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="50.00"
                  value={formData.cost}
                  onChange={(e) => handleChange("cost", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="returnPrice">Valor de Retorno (R$)</Label>
              <Input
                id="returnPrice"
                type="number"
                step="0.01"
                placeholder="80.00"
                value={formData.returnPrice}
                onChange={(e) => handleChange("returnPrice", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceDialog;
