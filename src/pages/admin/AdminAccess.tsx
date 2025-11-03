import { useState } from "react";
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

interface StaffMember {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  address: string;
  role: "secretary" | "optometrist";
}

const AdminAccess = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  
  // Mock data - será substituído por dados reais do Supabase
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: "1",
      name: "Maria Silva",
      email: "maria.silva@clinica.com",
      cpf: "123.456.789-00",
      phone: "(11) 98765-4321",
      address: "Rua das Flores, 123, São Paulo - SP",
      role: "secretary"
    },
    {
      id: "2",
      name: "Dr. João Santos",
      email: "joao.santos@clinica.com",
      cpf: "987.654.321-00",
      phone: "(11) 91234-5678",
      address: "Av. Paulista, 456, São Paulo - SP",
      role: "optometrist"
    }
  ]);

  const handleAddStaff = (staff: Omit<StaffMember, "id">) => {
    const newStaff = {
      ...staff,
      id: Date.now().toString()
    };
    setStaffMembers([...staffMembers, newStaff]);
    toast.success("Profissional cadastrado com sucesso!");
  };

  const handleEditClick = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsEditDialogOpen(true);
  };

  const handleEditStaff = (updatedStaff: StaffMember) => {
    setStaffMembers(staffMembers.map(s => s.id === updatedStaff.id ? updatedStaff : s));
    toast.success("Cadastro atualizado com sucesso!");
  };

  const handleDeleteClick = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedStaff) {
      setStaffMembers(staffMembers.filter(s => s.id !== selectedStaff.id));
      toast.success("Cadastro excluído com sucesso!");
      setDeleteDialogOpen(false);
      setSelectedStaff(null);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === "secretary") {
      return <Badge variant="secondary">Secretária</Badge>;
    }
    return <Badge className="bg-primary">Optometrista</Badge>;
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
          {staffMembers.map((staff) => (
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
                <div className="mt-2">{getRoleBadge(staff.role)}</div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{staff.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{staff.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{staff.cpf}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">{staff.address}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {staffMembers.length === 0 && (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum profissional cadastrado</p>
              <p className="mt-1">Clique em "Adicionar Profissional" para começar</p>
            </div>
          </Card>
        )}
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
