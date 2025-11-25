import { useState, useEffect, useMemo, Fragment } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2 } from "lucide-react";
import { permissionMatrix, actionColumns } from "@/config/permissionMatrix";
import { API_BASE_URL } from "@/lib/utils";

interface Group {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  is_admin?: boolean;
  criado_em: string;
}

interface Permission {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  modulo?: string;
}

interface GroupPermission {
  grupo_id: string;
  permissao_id: string;
}

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupPermissions, setGroupPermissions] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    ativo: true,
    is_admin: false,
  });

  const permissionIdByCode = useMemo(() => {
    const map = new Map<string, string>();
    permissions.forEach((permission) => {
      if (permission.codigo) {
        map.set(permission.codigo, permission.id);
      }
    });
    return map;
  }, [permissions]);

  useEffect(() => {
    fetchGroups();
    fetchPermissions();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/grupos`);
      if (!response.ok) throw new Error("Erro ao buscar grupos");
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao carregar grupos");
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/grupos/permissoes`);
      if (!response.ok) throw new Error("Erro ao buscar permissões");
      const data = await response.json();
      setPermissions(data);
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao carregar permissões");
    }
  };

  const fetchGroupPermissions = async (groupId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/grupos/${groupId}/permissoes`
      );
      if (!response.ok) throw new Error("Erro ao buscar permissões do grupo");
      const data = await response.json();
      // data já retorna array de permissões com id
      const permissionIds = data.map((p: any) => p.id);
      setGroupPermissions(permissionIds);
      console.log('Permissões carregadas do grupo:', permissionIds);
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao carregar permissões do grupo");
    }
  };

  const handleAddGroup = async () => {
    if (!formData.nome.trim()) {
      toast.error("Nome do grupo é obrigatório");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/grupos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Erro ao criar grupo");

      toast.success("Grupo criado com sucesso");
      setIsAddDialogOpen(false);
      setFormData({ nome: "", descricao: "", ativo: true, is_admin: false });
      fetchGroups();
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao criar grupo");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroup = async () => {
    if (!selectedGroup || !formData.nome.trim()) {
      toast.error("Nome do grupo é obrigatório");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/grupos/${selectedGroup.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Erro ao atualizar grupo");

      toast.success("Grupo atualizado com sucesso");
      setIsEditDialogOpen(false);
      setSelectedGroup(null);
      setFormData({ nome: "", descricao: "", ativo: true, is_admin: false });
      fetchGroups();
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao atualizar grupo");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este grupo?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/grupos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir grupo");

      toast.success("Grupo excluído com sucesso");
      fetchGroups();
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao excluir grupo");
    }
  };

  const openEditDialog = (group: Group) => {
    setSelectedGroup(group);
    setFormData({
      nome: group.nome,
      descricao: group.descricao || "",
      ativo: group.ativo,
      is_admin: group.is_admin || false,
    });
    setIsEditDialogOpen(true);
  };

  const openPermissionsDialog = async (group: Group) => {
    setSelectedGroup(group);
    await fetchGroupPermissions(group.id);
    setIsPermissionsDialogOpen(true);
  };

  const handleTogglePermission = (permissionId: string) => {
    if (!selectedGroup) return;

    const hasPermission = groupPermissions.includes(permissionId);

    if (hasPermission) {
      // Remover permissão do estado local
      setGroupPermissions(groupPermissions.filter((id) => id !== permissionId));
    } else {
      // Adicionar permissão ao estado local
      setGroupPermissions([...groupPermissions, permissionId]);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedGroup) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/grupos/${selectedGroup.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            is_admin: selectedGroup.is_admin || false,
            permissoes: groupPermissions,
          }),
        }
      );

      if (!response.ok) throw new Error("Erro ao salvar permissões");

      toast.success("Permissões salvas com sucesso");
      setIsPermissionsDialogOpen(false);
      fetchGroups();
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao salvar permissões");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermissionByCode = (permissionCode: string) => {
    const permissionId = permissionIdByCode.get(permissionCode);
    if (!permissionId) {
      toast.error("Permissão não encontrada no sistema");
      return;
    }
    handleTogglePermission(permissionId);
  };

  const isPermissionChecked = (permissionCode?: string) => {
    if (!permissionCode) return false;
    const permissionId = permissionIdByCode.get(permissionCode);
    if (!permissionId) return false;
    return groupPermissions.includes(permissionId);
  };

  // Função para coletar todos os códigos de permissão do permissionMatrix
  const getAllPermissionCodes = useMemo(() => {
    const codes: string[] = [];
    Object.values(permissionMatrix).forEach((menus) => {
      Object.values(menus).forEach((menu) => {
        // Adicionar permissões das ações principais
        Object.values(menu.actions).forEach((action) => {
          if (action?.permission) {
            codes.push(action.permission);
          }
        });
        // Adicionar permissões extras
        menu.extraActions?.forEach((extra) => {
          if (extra.permission) {
            codes.push(extra.permission);
          }
        });
      });
    });
    return codes;
  }, []);

  // Função para marcar/desmarcar todas as permissões quando admin é alterado
  const handleAdminToggle = (checked: boolean) => {
    if (!selectedGroup) return;

    setSelectedGroup({ ...selectedGroup, is_admin: checked });

    if (checked) {
      // Se marcou como admin, marcar todas as permissões
      const allPermissionIds = getAllPermissionCodes
        .map((code) => permissionIdByCode.get(code))
        .filter((id): id is string => id !== undefined);
      
      // Combinar com as permissões já existentes (usar Set para evitar duplicatas)
      const allIds = new Set([...groupPermissions, ...allPermissionIds]);
      setGroupPermissions(Array.from(allIds));
    }
    // Se desmarcou, manter as permissões como estão (não desmarcar automaticamente)
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Grupos de Acesso</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Grupo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Grupo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    placeholder="Ex: Financeiro"
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                    placeholder="Descrição do grupo de acesso"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, ativo: checked as boolean })
                    }
                  />
                  <Label htmlFor="ativo">Ativo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_admin"
                    checked={formData.is_admin}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_admin: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_admin">Administrador (Acesso total a todas as telas)</Label>
                </div>
                <Button onClick={handleAddGroup} disabled={loading} className="w-full">
                  {loading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum grupo cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.nome}</TableCell>
                    <TableCell>{group.descricao || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          group.ativo
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {group.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(group.criado_em).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPermissionsDialog(group)}
                      >
                        Permissões
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(group)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteGroup(group.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Grupo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-nome">Nome *</Label>
                <Input
                  id="edit-nome"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-descricao">Descrição</Label>
                <Textarea
                  id="edit-descricao"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, ativo: checked as boolean })
                  }
                />
                <Label htmlFor="edit-ativo">Ativo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-is_admin"
                  checked={formData.is_admin}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_admin: checked as boolean })
                  }
                />
                <Label htmlFor="edit-is_admin">Administrador (Acesso total a todas as telas)</Label>
              </div>
              <Button
                onClick={handleUpdateGroup}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Salvando..." : "Atualizar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Permissões */}
        <Dialog
          open={isPermissionsDialogOpen}
          onOpenChange={setIsPermissionsDialogOpen}
        >
          <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Permissões - {selectedGroup?.nome}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg border">
                <Checkbox
                  id="perm-is_admin"
                  checked={selectedGroup?.is_admin || false}
                  onCheckedChange={(checked) => handleAdminToggle(checked as boolean)}
                />
                <Label htmlFor="perm-is_admin" className="text-base font-semibold cursor-pointer">
                  Administrador - Acesso total a todas as telas (ignora todas as permissões abaixo)
                </Label>
              </div>
              <Accordion type="multiple" defaultValue={Object.keys(permissionMatrix)}>
                {Object.entries(permissionMatrix).map(([moduleName, menus]) => {
                  const moduleColumns = actionColumns.filter((column) =>
                    Object.values(menus).some((menu) => menu.actions[column.key])
                  );
                  const hasAnyExtra = Object.values(menus).some(
                    (menu) => menu.extraActions?.length
                  );

                  if (moduleColumns.length === 0 && !hasAnyExtra) {
                    return null;
                  }

                  return (
                    <AccordionItem key={moduleName} value={moduleName}>
                      <AccordionTrigger className="text-left text-base font-semibold">
                        {moduleName}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-56 rounded-tl-xl bg-muted/60 text-left text-muted-foreground">Menu</TableHead>
                                {moduleColumns.map((column) => (
                                  <TableHead
                                    key={column.key}
                                    className="w-28 bg-muted/60 text-center text-muted-foreground"
                                  >
                                    {column.label}
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Object.entries(menus).map(([menuKey, menuDefinition]) => (
                                <Fragment key={menuKey}>
                                  <TableRow className="border-b last:border-b-0">
                                    <TableCell className="w-56 whitespace-normal px-4 py-3 font-medium text-foreground">
                                      {menuDefinition.label}
                                    </TableCell>
                                    {moduleColumns.map((column) => {
                                      const actionDefinition =
                                        menuDefinition.actions[column.key];

                                      if (!actionDefinition) {
                                        return (
                                          <TableCell
                                            key={`${menuKey}-${column.key}`}
                                            className="text-center text-xs text-muted-foreground"
                                          >
                                            —
                                          </TableCell>
                                        );
                                      }

                                      const permissionPresent = permissionIdByCode.has(
                                        actionDefinition.permission
                                      );

                                      return (
                                        <TableCell
                                          key={`${menuKey}-${column.key}`}
                                          className="px-2 py-3 text-center"
                                        >
                                          <div className="flex items-center justify-center gap-2">
                                            <Checkbox
                                              id={`perm-${menuKey}-${column.key}`}
                                              checked={isPermissionChecked(
                                                actionDefinition.permission
                                              )}
                                              disabled={!permissionPresent}
                                              onCheckedChange={() =>
                                                handleTogglePermissionByCode(
                                                  actionDefinition.permission
                                                )
                                              }
                                            />
                                          </div>
                                        </TableCell>
                                      );
                                    })}
                                  </TableRow>
                                  {menuDefinition.extraActions?.length ? (
                                    <TableRow className="border-b last:border-b-0">
                                      <TableCell
                                        colSpan={moduleColumns.length + 1}
                                        className="bg-muted/20"
                                      >
                                        <div className="flex flex-wrap gap-4 pl-6">
                                          {menuDefinition.extraActions.map((extra) => {
                                            const permissionPresent =
                                              permissionIdByCode.has(extra.permission);

                                            return (
                                              <div
                                                key={extra.permission}
                                                className="flex items-center gap-2 rounded-md border bg-background/80 px-3 py-2 text-sm shadow-sm"
                                              >
                                                <Checkbox
                                                  id={`perm-extra-${extra.permission}`}
                                                  checked={isPermissionChecked(extra.permission)}
                                                  disabled={!permissionPresent}
                                                  onCheckedChange={() =>
                                                    handleTogglePermissionByCode(
                                                      extra.permission
                                                    )
                                                  }
                                                />
                                                <span className="text-sm">{extra.label}</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ) : null}
                                </Fragment>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
              {permissions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma permissão encontrada no banco. Execute o script
                  `permissoes_iniciais.sql` para popular as permissões padrões.
                </p>
              )}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsPermissionsDialogOpen(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSavePermissions}
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Salvar Permissões"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

