import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Trash2, Mail, Phone, MapPin, FileText, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AddStaffDialog from "@/components/AddStaffDialog";
import EditStaffDialog from "@/components/EditStaffDialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { API_BASE_URL } from "@/lib/utils";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  estadoCivil: string;
  phone: string;
  address: string;
  cep: string;
  cidade: string;
  estado: string;
  dataAdmissao: string;
  cargo: string;
  salario: string;
  role: "secretary" | "optometrist";
  crm?: string;
  estadoCrm?: string;
  groupId?: string;
  groupName?: string;
}

interface ApiUser {
  id: string;
  nome_completo: string;
  email: string;
  telefone?: string | null;
  cpf?: string | null;
  rg?: string | null;
  data_nascimento?: string | null;
  estado_civil?: string | null;
  endereco?: string | null;
  cep?: string | null;
  cidade?: string | null;
  estado?: string | null;
  data_admissao?: string | null;
  cargo?: string | null;
  salario?: number | null;
  perfil: "ADMINISTRADOR" | "SECRETARIA" | "OPTOMETRISTA";
  grupo_acesso_id?: string | null;
  crm?: string | null;
  estado_crm?: string | null;
}

interface Group {
  id: string;
  nome: string;
  descricao: string | null;
}

const AdminAccess = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  const groupNameById = useMemo(() => {
    const map = new Map<string, string>();
    groups.forEach((group) => {
      map.set(group.id, group.nome);
    });
    return map;
  }, [groups]);

  const fetchGroups = async (): Promise<Group[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/grupos`);
      if (!response.ok) throw new Error("Erro ao carregar grupos");
      const data = await response.json();
      setGroups(data);
      return data;
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
      toast.error("Não foi possível carregar os grupos de acesso");
      setGroups([]);
      return [];
    }
  };

  const mapApiUserToStaff = (user: ApiUser, map?: Map<string, string>): StaffMember => {
    const perfilMap: Record<ApiUser["perfil"], StaffMember["role"] | "admin"> = {
      ADMINISTRADOR: "secretary", // fallback, admin não aparece aqui
      SECRETARIA: "secretary",
      OPTOMETRISTA: "optometrist",
    };

    const role = perfilMap[user.perfil] === "secretary" || perfilMap[user.perfil] === "optometrist"
      ? perfilMap[user.perfil]
      : "secretary";

    return {
      id: user.id,
      name: user.nome_completo,
      email: user.email,
      cpf: user.cpf ?? "",
      rg: user.rg ?? "",
      dataNascimento: user.data_nascimento ? user.data_nascimento.split("T")[0] : "",
      estadoCivil: user.estado_civil ?? "",
      phone: user.telefone ?? "",
      address: user.endereco ?? "",
      cep: user.cep ?? "",
      cidade: user.cidade ?? "",
      estado: user.estado ?? "",
      dataAdmissao: user.data_admissao ? user.data_admissao.split("T")[0] : "",
      cargo: user.cargo ?? "",
      salario: user.salario !== null && user.salario !== undefined ? String(user.salario) : "",
      role,
      crm: user.crm ?? undefined,
      estadoCrm: user.estado_crm ?? undefined,
      groupId: user.grupo_acesso_id ?? undefined,
      groupName: user.grupo_acesso_id ? (map ?? groupNameById).get(user.grupo_acesso_id) : undefined,
    };
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const [groupsData, usersResponse] = await Promise.all([
        fetchGroups(),
        fetch(`${API_BASE_URL}/usuarios`),
      ]);
      if (!usersResponse.ok) throw new Error("Erro ao buscar usuários");
      const data: ApiUser[] = await usersResponse.json();

      const map = new Map<string, string>();
      groupsData.forEach((group) => map.set(group.id, group.nome));

      setGroups(groupsData);

      setStaffMembers(
        data
          .filter((user) => user.perfil === "SECRETARIA" || user.perfil === "OPTOMETRISTA")
          .map((user) => mapApiUserToStaff(user, map))
      );
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Erro ao carregar profissionais");
      setStaffMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStaff();
  }, []);

  useEffect(() => {
    setStaffMembers((prev) =>
      prev.map((staff) => ({
        ...staff,
        groupName: staff.groupId ? groupNameById.get(staff.groupId) : undefined,
      }))
    );
  }, [groupNameById]);

  const handleAddStaff = () => {
    void fetchStaff();
    toast.success("Profissional cadastrado com sucesso!");
  };
  const handleEditClick = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsEditDialogOpen(true);
  };

  const handleEditStaff = (updatedStaff: StaffMember) => {
    setStaffMembers((prev) =>
      prev.map((staff) => (staff.id === updatedStaff.id ? updatedStaff : staff))
    );
    toast.success("Cadastro atualizado com sucesso!");
    void fetchStaff();
  };

  const handleDeleteClick = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedStaff) {
      try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${selectedStaff.id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Erro ao excluir profissional");

        toast.success("Cadastro excluído com sucesso!");
        setDeleteDialogOpen(false);
        setSelectedStaff(null);
        void fetchStaff();
      } catch (error) {
        console.error("Erro ao excluir profissional:", error);
        toast.error("Não foi possível excluir o profissional");
      }
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === "secretary") {
      return <Badge variant="secondary">Secretária</Badge>;
    }
    return <Badge className="bg-primary">Optometrista</Badge>;
  };

  const renderGroupBadge = (groupName?: string) => {
    if (!groupName) return null;
    return (
      <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
        {groupName}
      </Badge>
    );
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Acessos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os cadastros e acessos dos profissionais da clínica
            </p>
          </div>
          <Button size="lg" onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="mr-2 h-5 w-5" />
            Adicionar Profissional
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                Carregando profissionais...
              </div>
            </Card>
          ) : staffMembers.length === 0 ? (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhum profissional cadastrado</p>
                <p className="mt-1">Clique em "Adicionar Profissional" para começar</p>
              </div>
            </Card>
          ) : (
            staffMembers.map((staff) => (
            <Card key={staff.id} className="relative cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleEditClick(staff)}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{staff.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(staff);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(staff);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {getRoleBadge(staff.role)}
                  {renderGroupBadge(staff.groupName)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{staff.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{staff.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{staff.cpf || "—"}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">{staff.address || "—"}</span>
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>
      </div>

      <AddStaffDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddStaff}
      />

      <EditStaffDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        staff={selectedStaff}
        onEdit={handleEditStaff}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cadastro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cadastro de <strong>{selectedStaff?.name}</strong>?
              Esta ação não pode ser desfeita e o acesso ao sistema será removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminAccess;
