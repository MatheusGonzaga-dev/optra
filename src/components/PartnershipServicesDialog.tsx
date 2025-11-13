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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/utils";

interface Service {
  id: string;
  nome: string;
  valor: number;
}

interface PartnershipService {
  id?: string;
  servico_id: string;
  servico?: Service;
  desconto_percentual: number;
  desconto_valor: number;
  acrescimo_percentual: number;
  acrescimo_valor: number;
}

interface PartnershipServicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnershipId: string;
  partnershipName: string;
}

const PartnershipServicesDialog = ({
  open,
  onOpenChange,
  partnershipId,
  partnershipName,
}: PartnershipServicesDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [partnershipServices, setPartnershipServices] = useState<PartnershipService[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newService, setNewService] = useState<Omit<PartnershipService, 'id'>>({
    servico_id: "",
    desconto_percentual: 0,
    desconto_valor: 0,
    acrescimo_percentual: 0,
    acrescimo_valor: 0,
  });

  useEffect(() => {
    if (open && partnershipId) {
      fetchServices();
      fetchPartnershipServices();
    }
  }, [open, partnershipId]);

  const fetchServices = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/servicos');
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({ error: 'Erro ao carregar serviços' }));
        throw new Error(errorData.error || 'Erro ao carregar serviços');
      }
      const data = await resp.json();
      if (!Array.isArray(data)) {
        console.error('Resposta não é um array:', data);
        setServices([]);
        return;
      }
      setServices(data.map((s: any) => ({ id: s.id, nome: s.nome, valor: Number(s.valor) })));
    } catch (error: any) {
      console.error('Erro ao carregar serviços:', error);
      toast.error(error.message || 'Erro ao carregar serviços');
      setServices([]);
    }
  };

  const fetchPartnershipServices = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_BASE_URL}/parcerias/${partnershipId}/servicos`);
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({ error: 'Erro ao carregar serviços da parceria' }));
        throw new Error(errorData.error || 'Erro ao carregar serviços da parceria');
      }
      const data = await resp.json();
      // Garantir que data é um array
      if (!Array.isArray(data)) {
        console.error('Resposta não é um array:', data);
        setPartnershipServices([]);
        return;
      }
      setPartnershipServices(data.map((ps: any) => ({
        id: ps.id,
        servico_id: ps.servico_id || ps.servicos?.id,
        servico: ps.servicos,
        desconto_percentual: Number(ps.desconto_percentual || 0),
        desconto_valor: Number(ps.desconto_valor || 0),
        acrescimo_percentual: Number(ps.acrescimo_percentual || 0),
        acrescimo_valor: Number(ps.acrescimo_valor || 0),
      })));
    } catch (error: any) {
      console.error('Erro ao carregar serviços da parceria:', error);
      toast.error(error.message || 'Erro ao carregar serviços da parceria');
      setPartnershipServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!newService.servico_id) {
      toast.error('Selecione um serviço');
      return;
    }

    try {
      const resp = await fetch(`${API_BASE_URL}/parcerias/${partnershipId}/servicos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servico_id: newService.servico_id,
          desconto_percentual: newService.desconto_percentual,
          desconto_valor: newService.desconto_valor,
          acrescimo_percentual: newService.acrescimo_percentual,
          acrescimo_valor: newService.acrescimo_valor,
        })
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({ error: 'Erro ao vincular serviço' }));
        throw new Error(errorData.error || 'Erro ao vincular serviço');
      }
      
      toast.success('Serviço vinculado com sucesso!');
      setNewService({
        servico_id: "",
        desconto_percentual: 0,
        desconto_valor: 0,
        acrescimo_percentual: 0,
        acrescimo_valor: 0,
      });
      setIsAdding(false);
      fetchPartnershipServices();
    } catch (error: any) {
      console.error('Erro ao vincular serviço:', error);
      toast.error(error.message || 'Erro ao vincular serviço');
    }
  };

  const handleRemoveService = async (servicoId: string) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/parcerias/${partnershipId}/servicos/${servicoId}`, {
        method: 'DELETE',
      });

      if (!resp.ok) throw new Error('Erro ao remover vínculo');
      
      toast.success('Vínculo removido com sucesso!');
      fetchPartnershipServices();
    } catch (error) {
      console.error('Erro ao remover vínculo:', error);
      toast.error('Erro ao remover vínculo');
    }
  };

  const availableServices = services.filter(
    s => !partnershipServices.find(ps => (ps.servico_id || ps.servico?.id) === s.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Serviços - {partnershipName}</DialogTitle>
          <DialogDescription>
            Configure descontos e acréscimos por serviço para esta parceria
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lista de serviços vinculados */}
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : partnershipServices.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum serviço vinculado ainda</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {partnershipServices.map((ps) => {
                const servico = ps.servico || services.find(s => s.id === ps.servico_id);
                return (
                  <Card key={ps.id || ps.servico_id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{servico?.nome || 'Serviço'}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Valor base: R$ {servico?.valor?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveService(ps.servico_id || ps.servico?.id || '')}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Desconto: </span>
                          {ps.desconto_percentual > 0 && (
                            <span className="font-medium">{ps.desconto_percentual}%</span>
                          )}
                          {ps.desconto_valor > 0 && (
                            <span className="font-medium"> + R$ {ps.desconto_valor.toFixed(2)}</span>
                          )}
                          {ps.desconto_percentual === 0 && ps.desconto_valor === 0 && (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Acréscimo: </span>
                          {ps.acrescimo_percentual > 0 && (
                            <span className="font-medium">{ps.acrescimo_percentual}%</span>
                          )}
                          {ps.acrescimo_valor > 0 && (
                            <span className="font-medium"> + R$ {ps.acrescimo_valor.toFixed(2)}</span>
                          )}
                          {ps.acrescimo_percentual === 0 && ps.acrescimo_valor === 0 && (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Adicionar novo serviço */}
          {!isAdding ? (
            <Button
              variant="outline"
              onClick={() => setIsAdding(true)}
              className="w-full"
              disabled={availableServices.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Serviço
              {availableServices.length === 0 && (
                <span className="ml-2 text-xs text-muted-foreground">(Todos os serviços já estão vinculados)</span>
              )}
            </Button>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Novo Serviço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Serviço</Label>
                  <Select
                    value={newService.servico_id}
                    onValueChange={(value) => setNewService({ ...newService, servico_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableServices.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.nome} - R$ {s.valor.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Desconto Percentual (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={newService.desconto_percentual}
                      onChange={(e) => setNewService({ ...newService, desconto_percentual: Number(e.target.value || 0) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Desconto Valor (R$)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={newService.desconto_valor}
                      onChange={(e) => setNewService({ ...newService, desconto_valor: Number(e.target.value || 0) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Acréscimo Percentual (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={newService.acrescimo_percentual}
                      onChange={(e) => setNewService({ ...newService, acrescimo_percentual: Number(e.target.value || 0) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Acréscimo Valor (R$)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={newService.acrescimo_valor}
                      onChange={(e) => setNewService({ ...newService, acrescimo_valor: Number(e.target.value || 0) })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddService} className="flex-1">
                    Adicionar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false);
                      setNewService({
                        servico_id: "",
                        desconto_percentual: 0,
                        desconto_valor: 0,
                        acrescimo_percentual: 0,
                        acrescimo_valor: 0,
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PartnershipServicesDialog;

