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
import { Loader2, Tag, TrendingUp, TrendingDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Categoria {
  id: string;
  nome: string;
  tipo: "RECEITA" | "DESPESA";
  cor?: string;
  icone?: string;
  descricao?: string;
  ativo: boolean;
}

interface EditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Categoria | null;
  onEdit: (category: Categoria) => void;
}

const EditCategoryDialog = ({ open, onOpenChange, category, onEdit }: EditCategoryDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "DESPESA" as "RECEITA" | "DESPESA",
    cor: "#3b82f6",
    icone: "",
    descricao: "",
    ativo: true,
  });

  useEffect(() => {
    if (category && open) {
      setFormData({
        nome: category.nome,
        tipo: category.tipo,
        cor: category.cor || "#3b82f6",
        icone: category.icone || "",
        descricao: category.descricao || "",
        ativo: category.ativo,
      });
    }
  }, [category, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;
    setLoading(true);

    try {
      onEdit({
        ...category,
        ...formData,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao editar categoria:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Editar Categoria
          </DialogTitle>
          <DialogDescription>
            Atualize as informações da categoria
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome da Categoria *</Label>
                <Input
                  id="edit-nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Fornecedores"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: "RECEITA" | "DESPESA") =>
                    setFormData({ ...formData, tipo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DESPESA">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        Despesa
                      </div>
                    </SelectItem>
                    <SelectItem value="RECEITA">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Receita
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cor">Cor</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-cor"
                    type="color"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    className="h-10 w-20 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-icone">Ícone (opcional)</Label>
                <Input
                  id="edit-icone"
                  value={formData.icone}
                  onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                  placeholder="Ex: Building2, DollarSign"
                />
                <p className="text-xs text-muted-foreground">
                  Nome do ícone do lucide-react
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Textarea
                id="edit-descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição da categoria"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="edit-ativo">Categoria ativa</Label>
                <p className="text-xs text-muted-foreground">
                  Categorias inativas não aparecem nos formulários
                </p>
              </div>
              <Switch
                id="edit-ativo"
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

export default EditCategoryDialog;
