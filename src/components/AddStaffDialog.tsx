import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Briefcase, Lock } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/utils";

interface AddStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (staff?: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
    address: string;
    role?: "secretary" | "optometrist";
    groupId?: string;
    groupName?: string;
  }) => void;
}

interface Group {
  id: string;
  nome: string;
  descricao: string | null;
}

const AddStaffDialog = ({ open, onOpenChange, onAdd }: AddStaffDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [formData, setFormData] = useState({
    // Dados pessoais
    name: "",
    cpf: "",
    rg: "",
    dataNascimento: "",
    estadoCivil: "",
    phone: "",
    address: "",
    cep: "",
    cidade: "",
    estado: "",
    // Dados profissionais
    dataAdmissao: new Date().toISOString().split('T')[0],
    cargo: "",
    salario: "",
    crm: "",
    estadoCrm: "",
    // Credenciais
    email: "",
    password: "",
    grupoAcessoId: "",
  });

  useEffect(() => {
    if (open) {
      fetchGroups();
    }
  }, [open]);

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/grupos`);
      if (!response.ok) throw new Error("Erro ao buscar grupos");
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("Erro ao buscar grupos:", error);
      toast.error("Erro ao carregar grupos de acesso");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.name || !formData.cpf || !formData.email || !formData.password || !formData.grupoAcessoId) {
      toast.error("Preencha todos os campos obrigatórios (*)");
      return;
    }

    setLoading(true);
    
    try {
      const payload: any = {
        nome_completo: formData.name,
        email: formData.email,
        senha: formData.password,
        telefone: formData.phone || null,
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
        grupo_acesso_id: formData.grupoAcessoId,
      };

      // Adicionar CRM se fornecido
      if (formData.crm && formData.estadoCrm) {
        payload.crm = formData.crm;
        payload.estado_crm = formData.estadoCrm;
      }

      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar usuário');
      }

      toast.success('Funcionário cadastrado com sucesso!');
      
      onAdd?.({
        name: formData.name,
        email: formData.email,
        cpf: formData.cpf,
        phone: formData.phone,
        address: formData.address,
        role: "secretary" as "secretary" | "optometrist", // Mantido para compatibilidade
        groupId: formData.grupoAcessoId || undefined,
        groupName: formData.grupoAcessoId ? groups.find(g => g.id === formData.grupoAcessoId)?.nome : undefined,
      });
      
      // Resetar formulário
      setFormData({
        name: "",
        cpf: "",
        rg: "",
        dataNascimento: "",
        estadoCivil: "",
        phone: "",
        address: "",
        cep: "",
        cidade: "",
        estado: "",
        dataAdmissao: new Date().toISOString().split('T')[0],
        cargo: "",
        salario: "",
        crm: "",
        estadoCrm: "",
        email: "",
        password: "",
        grupoAcessoId: "",
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast.error(error.message || 'Erro ao cadastrar funcionário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Cadastrar Novo Funcionário</DialogTitle>
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

            {/* Aba: Dados Pessoais */}
            <TabsContent value="pessoais" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    value={formData.rg}
                    onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                    placeholder="00.000.000-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estadoCivil">Estado Civil</Label>
                  <Select
                    value={formData.estadoCivil}
                    onValueChange={(value) => setFormData({ ...formData, estadoCivil: value })}
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
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço Completo</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua, número, bairro"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    placeholder="00000-000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    placeholder="Nome da cidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Aba: Dados Profissionais */}
            <TabsContent value="profissionais" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    placeholder="Ex: Recepcionista, Auxiliar"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataAdmissao">Data de Admissão</Label>
                  <Input
                    id="dataAdmissao"
                    type="date"
                    value={formData.dataAdmissao}
                    onChange={(e) => setFormData({ ...formData, dataAdmissao: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salario">Salário</Label>
                  <Input
                    id="salario"
                    type="number"
                    step="0.01"
                    value={formData.salario}
                    onChange={(e) => setFormData({ ...formData, salario: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Campos opcionais para CRM */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3 text-blue-600">Dados do Conselho (Opcional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="crm">CRM</Label>
                    <Input
                      id="crm"
                      value={formData.crm}
                      onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
                      placeholder="Número do CRM"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estadoCrm">Estado do CRM</Label>
                    <Input
                      id="estadoCrm"
                      value={formData.estadoCrm}
                      onChange={(e) => setFormData({ ...formData, estadoCrm: e.target.value.toUpperCase() })}
                      placeholder="Ex: SP"
                      maxLength={2}
                    />
                    <p className="text-xs text-muted-foreground">
                      Sigla do estado (2 letras)
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Aba: Acesso ao Sistema */}
            <TabsContent value="acesso" className="space-y-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Configure as credenciais de acesso ao sistema e selecione o grupo de permissões do funcionário.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email de Acesso *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@clinica.com"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Email usado para login no sistema
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha Inicial *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    O funcionário poderá alterar depois
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grupoAcesso">Grupo de Permissões *</Label>
                <Select
                  value={formData.grupoAcessoId || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      grupoAcessoId: value,
                    })
                  }
                  required
                >
                  <SelectTrigger id="grupoAcesso">
                    <SelectValue placeholder="Selecione um grupo" />
                  </SelectTrigger>
                  <SelectContent>
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
                <p className="text-xs text-muted-foreground">
                  Define as permissões de acesso do funcionário no sistema
                </p>
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
              Cadastrar Funcionário
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStaffDialog;
