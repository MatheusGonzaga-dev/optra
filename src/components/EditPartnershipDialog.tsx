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
import { Loader2 } from "lucide-react";

interface Partnership {
  id: string;
  name: string;
  cnpj: string;
  phone: string;
  address: string;
  partnershipDate: string;
}

interface EditPartnershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnership: Partnership;
  onEdit: (partnership: Partnership) => void;
}

const EditPartnershipDialog = ({ open, onOpenChange, partnership, onEdit }: EditPartnershipDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partnership>(partnership);

  useEffect(() => {
    setFormData(partnership);
  }, [partnership]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Aqui será integrado com Supabase
      await new Promise(resolve => setTimeout(resolve, 500));
      onEdit(formData);
    } catch (error) {
      console.error("Erro ao editar parceria:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Parceria</DialogTitle>
          <DialogDescription>
            Atualize as informações da parceria
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome da Ótica / Profissional *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Ótica Visão Clara"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-cnpj">CNPJ / CPF *</Label>
              <Input
                id="edit-cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefone *</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">Endereço Completo *</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua, número, bairro, cidade/estado"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-partnershipDate">Data da Parceria *</Label>
              <Input
                id="edit-partnershipDate"
                type="date"
                value={formData.partnershipDate}
                onChange={(e) => setFormData({ ...formData, partnershipDate: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPartnershipDialog;
