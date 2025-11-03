import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Payment, mockPatients, mockPayments } from "@/data/mockData";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCard, DollarSign, Calendar, Clock, User, Phone, FileText } from "lucide-react";

interface PaymentDetailsDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDetailsDialog({
  payment,
  open,
  onOpenChange,
}: PaymentDetailsDialogProps) {
  if (!payment) return null;

  const patient = mockPatients.find((p) => p.id === payment.patientId);
  const patientHistory = mockPayments.filter((p) => p.patientId === payment.patientId);
  const totalPaid = patientHistory.reduce((sum, p) => sum + p.amount, 0);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "PIX":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "Dinheiro":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "Cartão de Crédito":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "Cartão de Débito":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalhes do Recebimento</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Paciente */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Paciente
            </h3>
            <div className="bg-accent/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-lg">{payment.patient}</p>
                  <p className="text-sm text-muted-foreground">CPF: {payment.cpf}</p>
                </div>
                {patient && (
                  <Badge variant="outline">{calculateAge(patient.birthDate)} anos</Badge>
                )}
              </div>
              {patient && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {patient.address}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Detalhes do Pagamento */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Detalhes do Pagamento
            </h3>
            <div className="bg-accent/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Serviço Realizado</span>
                <span className="font-medium">{payment.service}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Valor</span>
                <span className="text-2xl font-bold text-success">
                  R$ {payment.amount.toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Forma de Pagamento</span>
                <Badge className={getMethodColor(payment.method)}>
                  <CreditCard className="h-3 w-3 mr-1" />
                  {payment.method}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Data
                </span>
                <span className="font-medium">
                  {new Date(payment.date).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Horário
                </span>
                <span className="font-medium">{payment.time}</span>
              </div>
              {payment.observations && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Observações
                    </span>
                    <p className="text-sm">{payment.observations}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Histórico de Pagamentos */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Histórico de Pagamentos</h3>
            <div className="bg-accent/50 rounded-lg p-4 space-y-3">
              <div className="space-y-2">
                {patientHistory.slice(0, 5).map((hist) => (
                  <div key={hist.id} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium">{hist.service}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(hist.date).toLocaleDateString("pt-BR")} • {hist.time}
                      </p>
                    </div>
                    <span className="font-medium text-success">
                      R$ {hist.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold">Total Pago pelo Paciente</span>
                <span className="text-xl font-bold text-success">
                  R$ {totalPaid.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
