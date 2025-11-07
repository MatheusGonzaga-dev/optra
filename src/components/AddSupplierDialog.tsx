import { useState } from "react";
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
import { Loader2, Building2, FileText, Phone, Mail, MapPin, FileEdit, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (supplier: {
    nome: string;
    cnpj?: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    observacoes?: string;
    ativo?: boolean;
  }) => void;
}

const AddSupplierDialog = ({ open, onOpenChange, onAdd }: AddSupplierDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [loadingCNPJ, setLoadingCNPJ] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    observacoes: "",
    ativo: true,
  });

  // Função para buscar dados do CNPJ
  const buscarDadosCNPJ = async (cnpj: string) => {
    // Remove caracteres não numéricos
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    // Valida se tem 14 dígitos
    if (cnpjLimpo.length !== 14) {
      return;
    }

    setLoadingCNPJ(true);
    try {
      // Tenta API CNPJá primeiro (gratuita, sem token)
      let data: any = null;
      
      try {
        const response = await fetch(`https://www.cnpja.com/api/open/${cnpjLimpo}`, {
          headers: {
            'Accept': 'application/json',
          }
        });

        if (response.ok) {
          data = await response.json();
        }
      } catch (e) {
        console.log('CNPJá não disponível, tentando alternativa...');
      }

      // Se a primeira API não funcionou, tenta OpenCNPJ
      if (!data) {
        try {
          const altResponse = await fetch(`https://opencnpj.com/api/v1/company/${cnpjLimpo}`, {
            headers: {
              'Accept': 'application/json',
            }
          });

          if (altResponse.ok) {
            data = await altResponse.json();
          }
        } catch (e) {
          console.log('OpenCNPJ não disponível, tentando API Brasil...');
        }
      }

      // Se ainda não funcionou, tenta API Brasil (pode precisar de token, mas vamos tentar)
      if (!data) {
        try {
          const brasilResponse = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`, {
            headers: {
              'Accept': 'application/json',
            }
          });

          if (brasilResponse.ok) {
            data = await brasilResponse.json();
          }
        } catch (e) {
          console.log('API Brasil não disponível');
        }
      }

      if (!data) {
        toast.error('Não foi possível buscar os dados do CNPJ. Verifique se o CNPJ está correto.');
        return;
      }

      // Extrai os dados de diferentes formatos de resposta
      const nome = data.name || data.razao_social || data.nome || data.razaoSocial || '';
      const logradouro = data.address?.street || data.logradouro || data.endereco?.logradouro || '';
      const numero = data.address?.number || data.numero || data.endereco?.numero || '';
      const municipio = data.address?.city || data.municipio || data.cidade || data.endereco?.municipio || '';
      const uf = data.address?.state || data.uf || data.estado || data.endereco?.uf || '';
      const cepData = data.address?.zipcode || data.cep || data.endereco?.cep || '';
      const telefoneData = data.phone || data.telefone || data.telefone1 || data.contato?.telefone || '';
      const emailData = data.email || data.email || '';
      
      // Monta o endereço completo
      const enderecoCompleto = logradouro && numero 
        ? `${logradouro}, ${numero}`.trim()
        : logradouro || '';
      
      // Preenche os campos com os dados da API
      setFormData(prev => ({
        ...prev,
        nome: nome || prev.nome,
        endereco: enderecoCompleto || prev.endereco,
        cidade: municipio || prev.cidade,
        estado: uf || prev.estado,
        cep: cepData ? cepData.replace(/\D/g, '') : prev.cep,
        telefone: telefoneData || prev.telefone,
        email: emailData || prev.email,
      }));
      
      toast.success('Dados do CNPJ preenchidos automaticamente!');
    } catch (error: any) {
      console.error('Erro ao buscar CNPJ:', error);
      toast.error('Erro ao buscar dados do CNPJ. Você pode preencher manualmente.');
    } finally {
      setLoadingCNPJ(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supplierData = {
        nome: formData.nome,
        cnpj: formData.cnpj || undefined,
        telefone: formData.telefone || undefined,
        email: formData.email || undefined,
        endereco: formData.endereco || undefined,
        cidade: formData.cidade || undefined,
        estado: formData.estado || undefined,
        cep: formData.cep || undefined,
        observacoes: formData.observacoes || undefined,
        ativo: formData.ativo,
      };
      
      onAdd(supplierData);
      
      // Reset form
      setFormData({
        nome: "",
        cnpj: "",
        telefone: "",
        email: "",
        endereco: "",
        cidade: "",
        estado: "",
        cep: "",
        observacoes: "",
        ativo: true,
      });
    } catch (error) {
      console.error("Erro ao adicionar fornecedor:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[95vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl shadow-lg">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-bold">Adicionar Fornecedor</DialogTitle>
              <DialogDescription className="text-base mt-2">
                Registre um novo fornecedor da clínica
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 py-4">
            {/* Informações Básicas */}
            <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50/50 to-white rounded-xl border-2 border-blue-100">
              <h3 className="text-xl font-bold flex items-center gap-3 text-primary pb-2 border-b">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                Informações Básicas
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="flex items-center gap-2 text-sm font-semibold">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    Nome do Fornecedor *
                  </Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome completo do fornecedor"
                    className="border-2 h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj" className="flex items-center gap-2 text-sm font-semibold">
                    <FileEdit className="h-4 w-4 text-purple-500" />
                    CNPJ
                    {loadingCNPJ && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                  </Label>
                  <div className="relative">
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        // Formata CNPJ: 00.000.000/0000-00
                        if (value.length <= 14) {
                          value = value.replace(/^(\d{2})(\d)/, '$1.$2');
                          value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                          value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
                          value = value.replace(/(\d{4})(\d)/, '$1-$2');
                        }
                        setFormData({ ...formData, cnpj: value });
                      }}
                      onBlur={(e) => {
                        const cnpjLimpo = e.target.value.replace(/\D/g, '');
                        if (cnpjLimpo.length === 14) {
                          buscarDadosCNPJ(e.target.value);
                        }
                      }}
                      placeholder="00.000.000/0000-00"
                      className="border-2 h-11 pr-10"
                      maxLength={18}
                    />
                    {formData.cnpj.replace(/\D/g, '').length === 14 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => buscarDadosCNPJ(formData.cnpj)}
                        disabled={loadingCNPJ}
                      >
                        <Search className="h-4 w-4 text-primary" />
                      </Button>
                    )}
                  </div>
                  {formData.cnpj.replace(/\D/g, '').length === 14 && !loadingCNPJ && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Search className="h-3 w-3" />
                      Clique no ícone ou saia do campo para buscar dados
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="space-y-6 p-6 bg-gradient-to-br from-green-50/50 to-white rounded-xl border-2 border-green-100">
              <h3 className="text-xl font-bold flex items-center gap-3 text-primary pb-2 border-b">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                Informações de Contato
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="telefone" className="flex items-center gap-2 text-sm font-semibold">
                    <Phone className="h-4 w-4 text-green-500" />
                    Telefone
                  </Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="border-2 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold">
                    <Mail className="h-4 w-4 text-blue-500" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@fornecedor.com"
                    className="border-2 h-11"
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-6 p-6 bg-gradient-to-br from-purple-50/50 to-white rounded-xl border-2 border-purple-100">
              <h3 className="text-xl font-bold flex items-center gap-3 text-primary pb-2 border-b">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                Endereço
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cep" className="flex items-center gap-2 text-sm font-semibold">
                    <MapPin className="h-4 w-4 text-purple-500" />
                    CEP
                  </Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    placeholder="00000-000"
                    className="border-2 h-11"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="endereco" className="flex items-center gap-2 text-sm font-semibold">
                    <MapPin className="h-4 w-4 text-purple-500" />
                    Endereço
                  </Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Rua, Avenida, etc."
                    className="border-2 h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cidade" className="flex items-center gap-2 text-sm font-semibold">
                    <MapPin className="h-4 w-4 text-purple-500" />
                    Cidade
                  </Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    placeholder="Nome da cidade"
                    className="border-2 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado" className="flex items-center gap-2 text-sm font-semibold">
                    <MapPin className="h-4 w-4 text-purple-500" />
                    Estado
                  </Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    placeholder="SP, RJ, MG..."
                    className="border-2 h-11"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>

            {/* Status e Observações */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50/50 to-white rounded-xl border-2 border-slate-100">
                <h3 className="text-xl font-bold flex items-center gap-3 text-primary pb-2 border-b">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <FileText className="h-6 w-6 text-slate-600" />
                  </div>
                  Status
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="ativo" className="flex items-center gap-2 text-sm font-semibold">
                    Status do Fornecedor
                  </Label>
                  <Select
                    value={formData.ativo ? "ativo" : "inativo"}
                    onValueChange={(value) => setFormData({ ...formData, ativo: value === "ativo" })}
                  >
                    <SelectTrigger className="border-2 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">✅ Ativo</SelectItem>
                      <SelectItem value="inativo">❌ Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50/50 to-white rounded-xl border-2 border-slate-100">
                <h3 className="text-xl font-bold flex items-center gap-3 text-primary pb-2 border-b">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <FileText className="h-6 w-6 text-slate-600" />
                  </div>
                  Observações
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="observacoes" className="flex items-center gap-2 text-sm font-semibold">
                    <FileText className="h-4 w-4 text-slate-500" />
                    Observações Adicionais
                  </Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Digite aqui observações adicionais sobre o fornecedor..."
                    className="border-2 min-h-[120px] resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t pt-4 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Building2 className="mr-2 h-4 w-4" />
              Adicionar Fornecedor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSupplierDialog;

