import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Edit2, Search, User, UserPlus, Loader2, Clock, DollarSign, Stethoscope, AlertCircle, Pill, FileText, Activity, Phone } from "lucide-react";
import { toast } from "sonner";
import AddToQueueDialog from "@/components/AddToQueueDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

interface QueueItem {
  id: string;
  posicao: number;
  tipo_atendimento: string;
  status: string;
  prioridade: string;
  sintomas?: string;
  usa_medicamentos: boolean;
  medicamentos_lista?: string;
  hora_chegada: string;
  tempo_espera_minutos?: number;
  valor_consulta?: number;
  forma_pagamento?: string;
  observacoes?: string;
  pacientes: {
    id: string;
    nome_completo: string;
    cpf?: string;
    telefone?: string;
    convenio?: string;
  };
  usuarios?: {
    id: string;
    nome_completo: string;
  } | null;
}

const SecretaryQueue = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPatient, setEditingPatient] = useState<QueueItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Determinar o role baseado no perfil do usuário
  const getUserRole = () => {
    if (usuario?.perfil === 'ADMINISTRADOR') return 'admin';
    if (usuario?.perfil === 'SECRETARIA') return 'secretary';
    return 'secretary'; // default
  };
  
  // Verificar se é admin
  const isAdmin = usuario?.perfil === 'ADMINISTRADOR';

  // Carregar fila do backend
  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/fila');
      if (!response.ok) throw new Error('Erro ao buscar fila');
      const data = await response.json();
      setQueue(data);
    } catch (error: any) {
      console.error('Erro ao carregar fila:', error);
      toast.error('Erro ao carregar fila de atendimento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredQueue = queue.filter(
    (item) =>
      item.pacientes.nome_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.pacientes.cpf?.replace(/\D/g, "").includes(searchQuery.replace(/\D/g, "")) || false)
  );

  const moveUp = async (id: string) => {
    const index = queue.findIndex((p) => p.id === id);
    if (index <= 0) return;

    const currentItem = queue[index];
    const newPosition = currentItem.posicao - 1;

    try {
      const response = await fetch(`http://localhost:4000/fila/${id}/posicao`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nova_posicao: newPosition }),
      });

      if (!response.ok) throw new Error('Erro ao alterar posição');
      
      toast.success("Posição na fila alterada");
      await fetchQueue();
    } catch (error) {
      console.error('Erro ao mover na fila:', error);
      toast.error('Erro ao alterar posição');
    }
  };

  const moveDown = async (id: string) => {
    const index = queue.findIndex((p) => p.id === id);
    if (index < 0 || index >= queue.length - 1) return;

    const currentItem = queue[index];
    const newPosition = currentItem.posicao + 1;

    try {
      const response = await fetch(`http://localhost:4000/fila/${id}/posicao`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nova_posicao: newPosition }),
      });

      if (!response.ok) throw new Error('Erro ao alterar posição');
      
      toast.success("Posição na fila alterada");
      await fetchQueue();
    } catch (error) {
      console.error('Erro ao mover na fila:', error);
      toast.error('Erro ao alterar posição');
    }
  };

  const handleEdit = (item: QueueItem) => {
    setEditingPatient(item);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPatient) return;

    try {
      const response = await fetch(`http://localhost:4000/fila/${editingPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editingPatient.status,
          prioridade: editingPatient.prioridade,
          observacoes: editingPatient.observacoes,
        }),
      });

      if (!response.ok) throw new Error('Erro ao atualizar');

      toast.success("Informações atualizadas com sucesso!");
      setIsEditDialogOpen(false);
      await fetchQueue();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error('Erro ao atualizar informações');
    }
  };

  const handleAddToQueue = async (data: any) => {
    // Essa função será chamada pelo AddToQueueDialog
    toast.success("Paciente adicionado à fila!");
    await fetchQueue();
  };

  const handleRemoveFromQueue = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este paciente da fila?')) return;

    try {
      const response = await fetch(`http://localhost:4000/fila/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao remover');

      toast.success("Paciente removido da fila");
      await fetchQueue();
    } catch (error) {
      console.error('Erro ao remover:', error);
      toast.error('Erro ao remover da fila');
    }
  };

  const handleCallPatient = async (patientId: string) => {
    try {
      // Atualizar status para EM_ATENDIMENTO
      const response = await fetch(`http://localhost:4000/fila/${patientId}/chamar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optometrista_id: usuario?.id }),
      });

      if (!response.ok) throw new Error('Erro ao chamar paciente');

      toast.success("Paciente chamado com sucesso!");
      
      // Recarregar fila
      await fetchQueue();
      
      // Navegar para o atendimento com o ID da fila
      navigate(`/admin/attendance/${patientId}`);
    } catch (error) {
      console.error('Erro ao chamar paciente:', error);
      toast.error('Erro ao chamar paciente');
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTipoAtendimento = (tipo: string) => {
    const tipos: Record<string, string> = {
      'CONSULTA_COMPLETA': 'Consulta Completa',
      'REFRACAO': 'Refração',
      'RETORNO': 'Retorno',
      'EXAME_LENTE_CONTATO': 'Exame Lente de Contato',
    };
    return tipos[tipo] || tipo;
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const colors: Record<string, string> = {
      'URGENTE': 'bg-red-500 text-white',
      'ALTA': 'bg-orange-500 text-white',
      'NORMAL': 'bg-blue-500 text-white',
    };
    return colors[prioridade] || 'bg-gray-500 text-white';
  };

  return (
    <DashboardLayout role={getUserRole()}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Fila de Atendimento</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie a ordem e prioridade dos atendimentos
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchQueue} variant="outline" size="sm">
              <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
            Adicionar à Fila
          </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                {filteredQueue.length} {filteredQueue.length === 1 ? 'paciente' : 'pacientes'} na fila
              </h2>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Carregando fila...</p>
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "Nenhum paciente encontrado" : "Nenhum paciente na fila no momento"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQueue.map((item, index) => (
                <div
                  key={item.id}
                  className="border rounded-lg bg-white dark:bg-gray-900 overflow-hidden"
                >
                  {/* Header com Posição e Badge */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                        {item.posicao}
                  </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                          {item.pacientes.nome_completo}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          {item.pacientes.cpf && (
                            <span className="font-mono">{item.pacientes.cpf}</span>
                          )}
                          {item.pacientes.telefone && (
                            <span>{item.pacientes.telefone}</span>
                          )}
                  </div>
                </div>
                    </div>
                    <Badge className={getPrioridadeBadge(item.prioridade)}>
                      {item.prioridade}
                    </Badge>
                  </div>

                  {/* Conteúdo Principal */}
                  <div className="p-6 space-y-6">
                    {/* Seção: Informações do Atendimento */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-3">
                        INFORMAÇÕES DO ATENDIMENTO
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Tipo</span>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatTipoAtendimento(item.tipo_atendimento)}
                          </p>
                    </div>
                    <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Chegada</span>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatTime(item.hora_chegada)}
                          </p>
                        </div>
                        {item.valor_consulta && (
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Valor</span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              R$ {item.valor_consulta.toFixed(2)}
                      </p>
                    </div>
                        )}
                        {item.pacientes.convenio && (
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Convênio</span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.pacientes.convenio}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Seção: Anamnese */}
                    {(item.sintomas || item.usa_medicamentos !== undefined) && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-3">
                          ANAMNESE
                        </h4>
                        <div className="space-y-3">
                          {item.sintomas && (
                            <div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Sintomas Relatados</span>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {item.sintomas}
                              </p>
                            </div>
                          )}
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Medicamentos em Uso</span>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {item.usa_medicamentos && item.medicamentos_lista 
                                ? item.medicamentos_lista 
                                : "Nenhum"
                              }
                            </p>
                          </div>
                          {item.observacoes && (
                            <div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Observações</span>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {item.observacoes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t">
                      {isAdmin && (
                        <Button
                          onClick={() => handleCallPatient(item.id)}
                          className="mr-auto"
                        >
                          Chamar Paciente
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveUp(item.id)}
                        disabled={index === 0}
                        title="Mover para cima"
                      >
                        <ArrowUp className="h-4 w-4 mr-2" />
                        Subir
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveDown(item.id)}
                        disabled={index === filteredQueue.length - 1}
                        title="Mover para baixo"
                      >
                        <ArrowDown className="h-4 w-4 mr-2" />
                        Descer
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromQueue(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Remover da fila"
                      >
                        Remover
                      </Button>
                    </div>
                </div>
              </div>
            ))}
              </div>
            )}
        </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
          <DialogHeader>
              <DialogTitle>Editar Paciente na Fila</DialogTitle>
          </DialogHeader>
          {editingPatient && (
            <div className="space-y-4">
                <div>
                  <Label>Paciente</Label>
                  <Input value={editingPatient.pacientes.nome_completo} disabled />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={editingPatient.status}
                      onValueChange={(value) =>
                        setEditingPatient({ ...editingPatient, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AGUARDANDO">Aguardando</SelectItem>
                        <SelectItem value="EM_ATENDIMENTO">Em Atendimento</SelectItem>
                        <SelectItem value="ATENDIDO">Atendido</SelectItem>
                        <SelectItem value="CANCELADO">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
              </div>

                  <div>
                    <Label>Prioridade</Label>
                    <Select
                      value={editingPatient.prioridade}
                      onValueChange={(value) =>
                        setEditingPatient({ ...editingPatient, prioridade: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="ALTA">Alta</SelectItem>
                        <SelectItem value="URGENTE">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              </div>

                <div>
                  <Label>Tipo de Atendimento</Label>
                  <Input value={formatTipoAtendimento(editingPatient.tipo_atendimento)} disabled />
              </div>

                <div>
                  <Label>Observações</Label>
                <Textarea
                    value={editingPatient.observacoes || ""}
                  onChange={(e) =>
                    setEditingPatient({
                      ...editingPatient,
                        observacoes: e.target.value,
                    })
                  }
                    placeholder="Adicione observações importantes sobre este atendimento..."
                    rows={3}
                />
              </div>

                <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                    className="flex-1"
                >
                  Cancelar
                </Button>
                  <Button onClick={handleSaveEdit} className="flex-1">
                    Salvar Alterações
                  </Button>
                </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

        {/* Dialog de Adicionar */}
        <AddToQueueDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAdd={handleAddToQueue}
        />
      </div>
    </DashboardLayout>
  );
};

export default SecretaryQueue;
