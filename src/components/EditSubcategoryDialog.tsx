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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Tag } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Categoria {
  id: string;
  nome: string;
}

interface Subcategoria {
  id: string;
  categoria_id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

interface EditSubcategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subcategory: Subcategoria | null;
  category: Categoria | null;
  onEdit: (subcategory: Subcategoria) => void;
}

const EditSubcategoryDialog = ({ open, onOpenChange, subcategory, category, onEdit }: EditSubcategoryDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    ativo: true,
  });

  useEffect(() => {
    if (subcategory && open) {
      setFormData({
        nome: subcategory.nome,
        descricao: subcategory.descricao || "",
        ativo: subcategory.ativo,
      });
    }
  }, [subcategory, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subcategory) return;
    setLoading(true);

    try {
      onEdit({
        ...subcategory,
        ...formData,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao editar subcategoria:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!subcategory || !category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Editar Subcategoria
          </DialogTitle>
          <DialogDescription>
            Atualize as informações da subcategoria em <strong>{category.nome}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-subcategoria-nome">Nome da Subcategoria *</Label>
              <Input
                id="edit-subcategoria-nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Fornecedor de Lentes"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-subcategoria-descricao">Descrição</Label>
              <Textarea
                id="edit-subcategoria-descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição da subcategoria"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="edit-subcategoria-ativo">Subcategoria ativa</Label>
                <p className="text-xs text-muted-foreground">
                  Subcategorias inativas não aparecem nos formulários
                </p>
              </div>
              <Switch
                id="edit-subcategoria-ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
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

export default EditSubcategoryDialog;
