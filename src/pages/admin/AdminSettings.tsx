import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Lock, Database, Mail, FileText } from "lucide-react";
import { toast } from "sonner";

const AdminSettings = () => {
  const handleSaveSettings = () => {
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Gerencie as configurações gerais do sistema</p>
        </div>

        {/* Configurações da Clínica */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Informações da Clínica</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clinic-name">Nome da Clínica</Label>
                <Input id="clinic-name" defaultValue="Optra System" />
              </div>
              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" defaultValue="00.000.000/0001-00" />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" defaultValue="Av. Paulista, 1000 - São Paulo, SP" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" defaultValue="(11) 3456-7890" />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" defaultValue="contato@optrasystem.com" />
              </div>
            </div>
          </div>
        </Card>

        {/* Notificações */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Notificações</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Lembretes de Consulta</p>
                <p className="text-sm text-muted-foreground">Enviar lembretes automáticos aos pacientes</p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mensagens de Aniversário</p>
                <p className="text-sm text-muted-foreground">Enviar mensagens de aniversário aos pacientes</p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações de Pagamento</p>
                <p className="text-sm text-muted-foreground">Notificar sobre pagamentos recebidos</p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Relatórios Automáticos</p>
                <p className="text-sm text-muted-foreground">Receber relatórios diários por e-mail</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        {/* Configurações de E-mail */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Configurações de E-mail</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp-host">Servidor SMTP</Label>
                <Input id="smtp-host" placeholder="smtp.gmail.com" />
              </div>
              <div>
                <Label htmlFor="smtp-port">Porta</Label>
                <Input id="smtp-port" placeholder="587" />
              </div>
            </div>

            <div>
              <Label htmlFor="smtp-user">Usuário</Label>
              <Input id="smtp-user" type="email" placeholder="seu-email@gmail.com" />
            </div>

            <div>
              <Label htmlFor="smtp-pass">Senha</Label>
              <Input id="smtp-pass" type="password" placeholder="••••••••" />
            </div>
          </div>
        </Card>

        {/* Backup e Segurança */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Backup e Segurança</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Backup Automático</p>
                <p className="text-sm text-muted-foreground">Realizar backup diário do banco de dados</p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Autenticação de Dois Fatores</p>
                <p className="text-sm text-muted-foreground">Requer 2FA para todos os usuários</p>
              </div>
              <Switch />
            </div>

            <Separator />

            <div className="pt-2">
              <Button variant="outline">
                <Database className="w-4 h-4 mr-2" />
                Fazer Backup Manual
              </Button>
            </div>
          </div>
        </Card>

        {/* Botão de Salvar */}
        <div className="flex justify-end">
          <Button size="lg" onClick={handleSaveSettings}>
            <Settings className="w-4 h-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
