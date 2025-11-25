import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import ConsultorioSelectDialog from "@/components/ConsultorioSelectDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/utils";

interface Consultorio {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
  em_uso?: boolean;
  profissional_nome?: string | null;
  profissional_id?: string | null;
}

const AdminConsultorios = () => {
  const { usuario, consultorioAtivo, precisaSelecionarConsultorio, selecionarConsultorio, liberarConsultorio } = useAuth();
  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedConsultorio, setSelectedConsultorio] = useState<Consultorio | null>(null);
  const [showSelectDialog, setShowSelectDialog] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    ativo: true,
  });

  useEffect(() => {
    fetchConsultorios();
    // Atualizar a lista a cada 5 segundos para refletir mudanças em tempo real
    const interval = setInterval(() => {
      fetchConsultorios();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Verificar consultório ativo ao montar o componente e quando consultorioAtivo mudar
  useEffect(() => {
    if (usuario) {
      // Se não tem consultório ativo, mostrar dialog para selecionar
      if (!consultorioAtivo) {
        setShowSelectDialog(true);
      }
    }
  }, [usuario, consultorioAtivo]);

  const fetchConsultorios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/consultorios`);
      if (!response.ok) throw new Error("Erro ao buscar consultórios");
      const data = await response.json();
      console.log('📋 Consultórios recebidos do backend:', data);
      setConsultorios(data || []);
    } catch (error) {
      console.error("Erro ao carregar consultórios:", error);
      toast.error("Erro ao carregar consultórios");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (consultorio?: Consultorio) => {
    if (consultorio) {
      setSelectedConsultorio(consultorio);
      setFormData({
        nome: consultorio.nome,
        descricao: consultorio.descricao || "",
        ativo: consultorio.ativo,
      });
      setIsEditMode(true);
    } else {
      setSelectedConsultorio(null);
      setFormData({
        nome: "",
        descricao: "",
        ativo: true,
      });
      setIsEditMode(false);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedConsultorio(null);
    setFormData({
      nome: "",
      descricao: "",
      ativo: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    try {
      setLoading(true);
      const url = isEditMode && selectedConsultorio
        ? `${API_BASE_URL}/consultorios/${selectedConsultorio.id}`
        : `${API_BASE_URL}/consultorios`;
      
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Erro ao salvar consultório");

      toast.success(`Consultório ${isEditMode ? "atualizado" : "criado"} com sucesso!`);
      handleCloseDialog();
      fetchConsultorios();
    } catch (error) {
      console.error("Erro ao salvar consultório:", error);
      toast.error("Erro ao salvar consultório");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este consultório?")) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/consultorios/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir consultório");

      toast.success("Consultório excluído com sucesso!");
      fetchConsultorios();
    } catch (error) {
      console.error("Erro ao excluir consultório:", error);
      toast.error("Erro ao excluir consultório");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConsultorio = async (consultorio: Consultorio) => {
    await selecionarConsultorio(consultorio);
    setShowSelectDialog(false);
    // Atualizar a lista para refletir o novo status
    setTimeout(() => {
      fetchConsultorios();
    }, 500);
  };

  const handleTrocarConsultorio = () => {
    setShowSelectDialog(true);
  };

  const handleLiberarConsultorio = async () => {
    if (confirm(`Tem certeza que deseja liberar o consultório ${consultorioAtivo?.nome}?`)) {
      await liberarConsultorio();
      // Atualizar a lista após liberar
      setTimeout(() => {
        fetchConsultorios();
      }, 500);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Consultórios</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os consultórios da clínica
            </p>
            {consultorioAtivo && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Consultório atual:</span>
                <span className="text-sm font-semibold text-primary">{consultorioAtivo.nome}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTrocarConsultorio}
                  className="ml-2"
                >
                  Trocar Consultório
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLiberarConsultorio}
                  className="ml-2"
                >
                  Liberar Consultório
                </Button>
              </div>
            )}
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-5 w-5" />
                Novo Consultório
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? "Editar Consultório" : "Novo Consultório"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      placeholder="Ex: Consultório 1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) =>
                        setFormData({ ...formData, descricao: e.target.value })
                      }
                      placeholder="Descrição do consultório"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? "Atualizar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Consultórios</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && consultorios.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : consultorios.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhum consultório cadastrado</p>
                <p className="text-sm mt-2">
                  Clique em "Novo Consultório" para começar
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Em Uso Por</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultorios.map((consultorio) => (
                    <TableRow key={consultorio.id}>
                      <TableCell className="font-medium">
                        {consultorio.nome}
                      </TableCell>
                      <TableCell>
                        {consultorio.descricao || "-"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            consultorio.em_uso
                              ? "bg-blue-100 text-blue-800"
                              : consultorio.ativo
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {consultorio.em_uso ? "Em Uso" : consultorio.ativo ? "Disponível" : "Inativo"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {consultorio.profissional_nome ? (
                          <span className="font-medium text-primary">
                            {consultorio.profissional_nome}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(consultorio.criado_em).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(consultorio)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(consultorio.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de seleção de consultório */}
      {usuario && (
        <ConsultorioSelectDialog
          open={showSelectDialog || precisaSelecionarConsultorio}
          usuarioId={usuario.id}
          onSelect={handleSelectConsultorio}
          onClose={() => setShowSelectDialog(false)}
          obrigatorio={precisaSelecionarConsultorio}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminConsultorios;

