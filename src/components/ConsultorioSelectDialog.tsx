import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Building2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/utils";
import { toast } from "sonner";

interface Consultorio {
  id: string;
  nome: string;
  descricao?: string;
}

interface ConsultorioSelectDialogProps {
  open: boolean;
  usuarioId: string;
  onSelect: (consultorio: Consultorio) => void;
  onClose?: () => void;
  obrigatorio?: boolean;
}

const ConsultorioSelectDialog = ({ open, usuarioId, onSelect, onClose, obrigatorio = false }: ConsultorioSelectDialogProps) => {
  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchConsultorios();
    }
  }, [open]);

  const fetchConsultorios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/consultorios`);
      if (!response.ok) throw new Error('Erro ao buscar consultórios');
      const data = await response.json();
      setConsultorios(data || []);
    } catch (error) {
      console.error('Erro ao buscar consultórios:', error);
      toast.error('Erro ao carregar consultórios');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedId) {
      toast.error('Selecione um consultório');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/consultorios/sessao/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuarioId,
          consultorio_id: selectedId,
        }),
      });

      if (!response.ok) throw new Error('Erro ao iniciar sessão no consultório');

      const data = await response.json();
      const consultorioSelecionado = consultorios.find(c => c.id === selectedId);
      
      if (consultorioSelecionado) {
        // Passar o consultório completo para o callback
        onSelect({
          id: consultorioSelecionado.id,
          nome: consultorioSelecionado.nome,
          descricao: consultorioSelecionado.descricao,
        });
        toast.success(`Consultório ${consultorioSelecionado.nome} selecionado`);
      }
    } catch (error) {
      console.error('Erro ao selecionar consultório:', error);
      toast.error('Erro ao selecionar consultório');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!obrigatorio && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && !obrigatorio && onClose) {
        onClose();
      }
    }}>
      <DialogContent 
        className="sm:max-w-md" 
        onPointerDownOutside={(e) => {
          if (obrigatorio) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (obrigatorio) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Selecionar Consultório
          </DialogTitle>
          <DialogDescription>
            Selecione o consultório onde você está trabalhando hoje
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : consultorios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum consultório cadastrado
            </div>
          ) : (
            <div className="space-y-2">
              {consultorios.map((consultorio) => (
                <button
                  key={consultorio.id}
                  onClick={() => setSelectedId(consultorio.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedId === consultorio.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold">{consultorio.nome}</div>
                  {consultorio.descricao && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {consultorio.descricao}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleConfirm}
            disabled={!selectedId || saving || loading}
            className="w-full"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirmando...
              </>
            ) : (
              'Confirmar'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultorioSelectDialog;

