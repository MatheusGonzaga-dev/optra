import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Users, Clock, DollarSign, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockPayments, mockAppointments, Payment } from "@/data/mockData";
import { PaymentDetailsDialog } from "@/components/PaymentDetailsDialog";

const SecretaryDashboard = () => {
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const todayPayments = mockPayments.filter(
    (p) => p.date === "2024-01-27"
  );
  const totalToday = todayPayments.reduce((sum, p) => sum + p.amount, 0);
  const todayAppointments = mockAppointments.filter(
    (a) => a.date === "2024-01-27"
  );

  const stats = [
    {
      title: "Pacientes Hoje",
      value: todayAppointments.length.toString(),
      icon: Users,
      description: `${todayPayments.length} já atendidos`,
      onClick: () => navigate("/secretary/patients"),
    },
    {
      title: "Na Fila",
      value: "3",
      icon: Clock,
      description: "Aguardando atendimento",
      onClick: () => navigate("/secretary/queue"),
    },
    {
      title: "Agendamentos Hoje",
      value: todayAppointments.length.toString(),
      icon: Calendar,
      description: "Consultas marcadas",
      onClick: () => navigate("/secretary/schedule"),
    },
    {
      title: "Recebimentos Hoje",
      value: `R$ ${(totalToday / 1000).toFixed(1)}k`,
      icon: DollarSign,
      description: `${todayPayments.length} pagamentos`,
      onClick: () => {
        document.getElementById("payments-section")?.scrollIntoView({ 
          behavior: "smooth",
          block: "start"
        });
      },
    },
  ];

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

  const handlePaymentClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setDialogOpen(true);
  };

  return (
    <DashboardLayout role="secretary">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard - Recepção</h1>
          <p className="text-muted-foreground">
            Gerencie cadastros, pagamentos e fila de atendimento
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Recebimentos de Hoje */}
        <Card id="payments-section" className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Recebimentos de Hoje</h3>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-success">
                R$ {totalToday.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Horário</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead className="hidden md:table-cell">CPF</TableHead>
                  <TableHead className="hidden lg:table-cell">Serviço</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayPayments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handlePaymentClick(payment)}
                  >
                    <TableCell className="font-medium">{payment.time}</TableCell>
                    <TableCell>{payment.patient}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {payment.cpf}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {payment.service}
                    </TableCell>
                    <TableCell>
                      <Badge className={getMethodColor(payment.method)} variant="outline">
                        {payment.method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-success">
                      R$ {payment.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Agendamentos do Dia */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Agendamentos do Dia</h3>
          <div className="space-y-3">
            {todayAppointments.slice(0, 6).map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {appointment.patientName.split(" ")[0][0]}
                      {appointment.patientName.split(" ")[1]?.[0] || ""}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{appointment.patientName}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{appointment.type}</span>
                      <span>•</span>
                      <span>CPF: {appointment.patientCPF}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {appointment.startTime} - {appointment.endTime}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {appointment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <PaymentDetailsDialog
        payment={selectedPayment}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </DashboardLayout>
  );
};

export default SecretaryDashboard;
