import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, User, Briefcase, Lock } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  address: string;
  role: "secretary" | "optometrist";
  groupId?: string;
  groupName?: string;
}

interface EditStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffMember | null;
  onEdit: (staff: StaffMember) => void;
}

interface Group {
  id: string;
  nome: string;
  descricao: string | null;
}

const EditStaffDialog = ({ open, onOpenChange, staff, onEdit }: EditStaffDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    dataNascimento: "",
    estadoCivil: "",
    cpf: "",
    rg: "",
    phone: "",
    address: "",
    cep: "",
    cidade: "",
    estado: "",
    email: "",
    role: "secretary" as "secretary" | "optometrist",
    dataAdmissao: "",
    cargo: "",
    salario: "",
    crm: "",
    estadoCrm: "",
    groupId: "",
  });

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name,
        dataNascimento: staff.dataNascimento || "",
        estadoCivil: staff.estadoCivil || "",
        cpf: staff.cpf || "",
        rg: staff.rg || "",
        phone: staff.phone || "",
        address: staff.address || "",
        cep: staff.cep || "",
        cidade: staff.cidade || "",
        estado: staff.estado || "",
        email: staff.email,
        role: staff.role,
        dataAdmissao: staff.dataAdmissao || "",
        cargo: staff.cargo || "",
        salario: staff.salario || "",
        crm: staff.crm || "",
        estadoCrm: staff.estadoCrm || "",
        groupId: staff.groupId ?? "",
      });
    }
  }, [staff]);

  useEffect(() => {
    if (!open) return;

    const fetchGroups = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/grupos`);
        if (!response.ok) throw new Error("Erro ao carregar grupos");
        const data = await response.json();
        setGroups(data);
      } catch (error) {
        console.error("Erro ao carregar grupos:", error);
        toast.error("Não foi possível carregar os grupos de acesso");
        setGroups([]);
      }
    };

    void fetchGroups();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;

    if (!formData.name || !formData.email) {
      toast.error("Nome e e-mail são obrigatórios");
      return;
    }

    if (formData.role === "optometrist" && (!formData.crm || !formData.estadoCrm)) {
      toast.error("CRM e Estado do CRM são obrigatórios para Optometrista");
      return;
    }

    setLoading(true);
    try {
      const perfilMap: Record<string, string> = {
        secretary: "SECRETARIA",
        optometrist: "OPTOMETRISTA",
      };

      const payload: Record<string, any> = {
        nome_completo: formData.name,
        email: formData.email,
        telefone: formData.phone || null,
        perfil: perfilMap[formData.role],
        grupo_acesso_id: formData.groupId || null,
        cpf: formData.cpf || null,
        rg: formData.rg || null,
        data_nascimento: formData.dataNascimento || null,
        estado_civil: formData.estadoCivil || null,
        endereco: formData.address || null,
        cep: formData.cep || null,
        cidade: formData.cidade || null,
        estado: formData.estado || null,
        data_admissao: formData.dataAdmissao || null,
        cargo: formData.cargo || null,
        salario: formData.salario ? Number(formData.salario) : null,
      };

      if (formData.role === "optometrist") {
        payload.crm = formData.crm || null;
        payload.estado_crm = formData.estadoCrm || null;
      } else {
        payload.crm = null;
        payload.estado_crm = null;
      }

      const response = await fetch(`${API_BASE_URL}/usuarios/${staff.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Erro ao atualizar profissional");
      }

      const updatedStaff: StaffMember = {
        id: staff.id,
        name: formData.name,
        email: formData.email,
        cpf: formData.cpf ? formData.cpf : "—",
        phone: formData.phone ? formData.phone : "—",
        address: formData.address ? formData.address : "—",
        role: formData.role,
        groupId: formData.groupId || undefined,
        groupName: formData.groupId
          ? groups.find((group) => group.id === formData.groupId)?.nome
          : undefined,
      };

      onEdit(updatedStaff);

      toast.success("Profissional atualizado com sucesso!");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao atualizar profissional:", error);
      toast.error(error.message || "Não foi possível atualizar o profissional");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Editar Profissional</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="pessoais" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pessoais">
                <User className="mr-2 h-4 w-4" />
                Dados Pessoais
              </TabsTrigger>
              <TabsTrigger value="profissionais">
                <Briefcase className="mr-2 h-4 w-4" />
                Dados Profissionais
              </TabsTrigger>
              <TabsTrigger value="acesso">
                <Lock className="mr-2 h-4 w-4" />
                Acesso ao Sistema
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pessoais" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome Completo *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Nome completo do funcionário"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={(e) => handleChange("dataNascimento", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleChange("cpf", e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    value={formData.rg}
                    onChange={(e) => handleChange("rg", e.target.value)}
                    placeholder="00.000.000-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estadoCivil">Estado Civil</Label>
                  <Select
                    value={formData.estadoCivil}
                    onValueChange={(value) => handleChange("estadoCivil", value)}
                  >
                    <SelectTrigger id="estadoCivil">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SOLTEIRO">Solteiro(a)</SelectItem>
                      <SelectItem value="CASADO">Casado(a)</SelectItem>
                      <SelectItem value="DIVORCIADO">Divorciado(a)</SelectItem>
                      <SelectItem value="VIUVO">Viúvo(a)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Telefone</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-address">Endereço Completo</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Rua, número, bairro"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => handleChange("cep", e.target.value)}
                    placeholder="00000-000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => handleChange("cidade", e.target.value)}
                    placeholder="Nome da cidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => handleChange("estado", e.target.value.toUpperCase())}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="profissionais" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Função *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "secretary" | "optometrist") =>
                      handleChange("role", value)
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Selecione a função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="secretary">Secretária</SelectItem>
                      <SelectItem value="optometrist">Optometrista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataAdmissao">Data de Admissão</Label>
                  <Input
                    id="dataAdmissao"
                    type="date"
                    value={formData.dataAdmissao}
                    onChange={(e) => handleChange("dataAdmissao", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={formData.cargo}
                    onChange={(e) => handleChange("cargo", e.target.value)}
                    placeholder="Ex.: Recepcionista"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salario">Salário</Label>
                  <Input
                    id="salario"
                    type="number"
                    step="0.01"
                    value={formData.salario}
                    onChange={(e) => handleChange("salario", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {formData.role === "optometrist" && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-3 text-blue-600">
                    Dados do Conselho (Obrigatório para Optometrista)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="crm">CRM *</Label>
                      <Input
                        id="crm"
                        value={formData.crm}
                        onChange={(e) => handleChange("crm", e.target.value)}
                        placeholder="Número do CRM"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estadoCrm">Estado do CRM *</Label>
                      <Input
                        id="estadoCrm"
                        value={formData.estadoCrm}
                        onChange={(e) =>
                          handleChange("estadoCrm", e.target.value.toUpperCase())
                        }
                        placeholder="Ex.: SP"
                        maxLength={2}
                      />
                      <p className="text-xs text-muted-foreground">
                        Sigla do estado (2 letras)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="acesso" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail de Login *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="email@clinica.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="group">Grupo de Permissões</Label>
                <Select
                  value={formData.groupId || "none"}
                  onValueChange={(value) =>
                    handleChange("groupId", value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger id="group">
                    <SelectValue placeholder="Selecione um grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum grupo definido</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{group.nome}</span>
                          {group.descricao && (
                            <span className="text-xs text-muted-foreground">
                              {group.descricao}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
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

export default EditStaffDialog;
