import { useState } from "react";
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

interface AddPartnershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (partnership: {
    name: string;
    cnpj: string;
    phone: string;
    address: string;
    partnershipDate: string;
  }) => void;
}

const AddPartnershipDialog = ({ open, onOpenChange, onAdd }: AddPartnershipDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    phone: "",
    address: "",
    partnershipDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Aqui será integrado com Supabase
      await new Promise(resolve => setTimeout(resolve, 500));
      onAdd(formData);
      setFormData({
        name: "",
        cnpj: "",
        phone: "",
        address: "",
        partnershipDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error("Erro ao adicionar parceria:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Parceria</DialogTitle>
          <DialogDescription>
            Cadastre uma nova ótica ou profissional parceiro
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Ótica / Profissional *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Ótica Visão Clara"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ / CPF *</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço Completo *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua, número, bairro, cidade/estado"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partnershipDate">Data da Parceria *</Label>
              <Input
                id="partnershipDate"
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
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPartnershipDialog;
