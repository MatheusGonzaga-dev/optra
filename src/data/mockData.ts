// Dados fictícios centralizados para o sistema

export interface Patient {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  phone2?: string;
  address: string;
  lastVisit: string;
  partnerOptic?: string;
  doctorId?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientCPF: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  status: "agendado" | "em-andamento" | "concluido" | "cancelado";
  doctorId: string;
  partnerOpticId?: string;
}

export interface Payment {
  id: string;
  patientId: string;
  patient: string;
  cpf: string;
  service: string;
  amount: number;
  method: "PIX" | "Dinheiro" | "Cartão de Crédito" | "Cartão de Débito";
  time: string;
  date: string;
  observations?: string;
}

export interface PartnerOptic {
  id: string;
  name: string;
  contact: string;
  address: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  crm: string;
}

// Doutores
export const mockDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Carlos Alberto Mendes",
    specialty: "Oftalmologista",
    crm: "CRM/SP 123.456",
  },
  {
    id: "2",
    name: "Dra. Ana Paula Silva",
    specialty: "Oftalmologista",
    crm: "CRM/SP 234.567",
  },
  {
    id: "3",
    name: "Dr. Roberto Ferreira",
    specialty: "Oftalmologista",
    crm: "CRM/SP 345.678",
  },
];

// Óticas Parceiras
export const partnerOptics: PartnerOptic[] = [
  {
    id: "1",
    name: "Ótica Visão Clara",
    contact: "(11) 3456-7890",
    address: "Rua das Flores, 123 - Centro",
  },
  {
    id: "2",
    name: "Ótica Nova Visão",
    contact: "(11) 3789-0123",
    address: "Av. Paulista, 456 - Bela Vista",
  },
  {
    id: "3",
    name: "Ótica Luz & Estilo",
    contact: "(11) 3234-5678",
    address: "Rua Augusta, 789 - Consolação",
  },
  {
    id: "4",
    name: "Ótica Moderna",
    contact: "(11) 3567-8901",
    address: "Av. Brasil, 321 - Jardins",
  },
];

// Pacientes
export const mockPatients: Patient[] = [
  {
    id: "1",
    name: "João Silva Santos",
    cpf: "123.456.789-00",
    birthDate: "1985-03-15",
    phone: "(11) 98765-4321",
    address: "Rua das Palmeiras, 100 - Vila Mariana",
    lastVisit: "2024-01-15",
    partnerOptic: "1",
    doctorId: "1",
  },
  {
    id: "2",
    name: "Maria Oliveira Costa",
    cpf: "987.654.321-00",
    birthDate: "1990-07-22",
    phone: "(11) 91234-5678",
    address: "Av. Ibirapuera, 234 - Moema",
    lastVisit: "2024-01-20",
    partnerOptic: "2",
    doctorId: "2",
  },
  {
    id: "3",
    name: "Pedro Henrique Alves",
    cpf: "456.789.123-00",
    birthDate: "1978-11-30",
    phone: "(11) 99876-5432",
    address: "Rua Vergueiro, 567 - Paraíso",
    lastVisit: "2024-01-18",
    doctorId: "1",
  },
  {
    id: "4",
    name: "Ana Paula Ferreira",
    cpf: "321.654.987-00",
    birthDate: "1995-05-10",
    phone: "(11) 97654-3210",
    address: "Rua da Consolação, 890 - Consolação",
    lastVisit: "2024-01-22",
    partnerOptic: "3",
    doctorId: "3",
  },
  {
    id: "5",
    name: "Carlos Eduardo Lima",
    cpf: "789.123.456-00",
    birthDate: "1982-09-05",
    phone: "(11) 96543-2109",
    address: "Av. Rebouças, 1234 - Pinheiros",
    lastVisit: "2024-01-19",
    doctorId: "2",
  },
  {
    id: "6",
    name: "Fernanda Souza Santos",
    cpf: "654.321.987-00",
    birthDate: "1988-12-18",
    phone: "(11) 95432-1098",
    address: "Rua Frei Caneca, 456 - Bela Vista",
    lastVisit: "2024-01-21",
    partnerOptic: "1",
    doctorId: "1",
  },
  {
    id: "7",
    name: "Roberto Carlos Mendes",
    cpf: "147.258.369-00",
    birthDate: "1975-04-25",
    phone: "(11) 94321-0987",
    address: "Av. Brigadeiro Luís Antônio, 789 - Bela Vista",
    lastVisit: "2024-01-17",
    doctorId: "3",
  },
  {
    id: "8",
    name: "Juliana Martins Silva",
    cpf: "258.369.147-00",
    birthDate: "1993-08-14",
    phone: "(11) 93210-9876",
    address: "Rua Oscar Freire, 321 - Jardins",
    lastVisit: "2024-01-23",
    partnerOptic: "4",
    doctorId: "2",
  },
  {
    id: "9",
    name: "Ricardo Souza Pereira",
    cpf: "369.147.258-00",
    birthDate: "1980-06-30",
    phone: "(11) 92109-8765",
    address: "Rua Estados Unidos, 654 - Jardim América",
    lastVisit: "2024-01-16",
    doctorId: "1",
  },
  {
    id: "10",
    name: "Patricia Lima Oliveira",
    cpf: "741.852.963-00",
    birthDate: "1992-11-08",
    phone: "(11) 91098-7654",
    address: "Av. Ipiranga, 987 - República",
    lastVisit: "2024-01-24",
    partnerOptic: "2",
    doctorId: "3",
  },
];

// Agendamentos
export const mockAppointments: Appointment[] = [
  {
    id: "1",
    patientId: "1",
    patientName: "João Silva Santos",
    patientCPF: "123.456.789-00",
    date: "2024-01-27",
    startTime: "08:00",
    endTime: "08:40",
    type: "Consulta Completa",
    status: "agendado",
    doctorId: "1",
    partnerOpticId: "1",
  },
  {
    id: "2",
    patientId: "2",
    patientName: "Maria Oliveira Costa",
    patientCPF: "987.654.321-00",
    date: "2024-01-27",
    startTime: "09:00",
    endTime: "09:30",
    type: "Retorno",
    status: "agendado",
    doctorId: "2",
    partnerOpticId: "2",
  },
  {
    id: "3",
    patientId: "3",
    patientName: "Pedro Henrique Alves",
    patientCPF: "456.789.123-00",
    date: "2024-01-27",
    startTime: "10:00",
    endTime: "10:40",
    type: "Exame para Lente de Contato",
    status: "agendado",
    doctorId: "1",
  },
  {
    id: "4",
    patientId: "4",
    patientName: "Ana Paula Ferreira",
    patientCPF: "321.654.987-00",
    date: "2024-01-27",
    startTime: "11:00",
    endTime: "11:30",
    type: "Refração",
    status: "agendado",
    doctorId: "3",
    partnerOpticId: "3",
  },
  {
    id: "5",
    patientId: "5",
    patientName: "Carlos Eduardo Lima",
    patientCPF: "789.123.456-00",
    date: "2024-01-27",
    startTime: "14:00",
    endTime: "14:40",
    type: "Consulta Completa",
    status: "agendado",
    doctorId: "2",
  },
  {
    id: "6",
    patientId: "6",
    patientName: "Fernanda Souza Santos",
    patientCPF: "654.321.987-00",
    date: "2024-01-27",
    startTime: "15:00",
    endTime: "15:30",
    type: "Retorno",
    status: "agendado",
    doctorId: "1",
    partnerOpticId: "1",
  },
  {
    id: "7",
    patientId: "7",
    patientName: "Roberto Carlos Mendes",
    patientCPF: "147.258.369-00",
    date: "2024-01-28",
    startTime: "08:30",
    endTime: "09:10",
    type: "Consulta Completa",
    status: "agendado",
    doctorId: "3",
  },
  {
    id: "8",
    patientId: "8",
    patientName: "Juliana Martins Silva",
    patientCPF: "258.369.147-00",
    date: "2024-01-28",
    startTime: "10:00",
    endTime: "10:40",
    type: "Exame para Lente de Contato",
    status: "agendado",
    doctorId: "2",
    partnerOpticId: "4",
  },
  {
    id: "9",
    patientId: "9",
    patientName: "Ricardo Souza Pereira",
    patientCPF: "369.147.258-00",
    date: "2024-01-28",
    startTime: "14:00",
    endTime: "14:30",
    type: "Refração",
    status: "agendado",
    doctorId: "1",
  },
  {
    id: "10",
    patientId: "10",
    patientName: "Patricia Lima Oliveira",
    patientCPF: "741.852.963-00",
    date: "2024-01-29",
    startTime: "09:00",
    endTime: "09:40",
    type: "Consulta Completa",
    status: "agendado",
    doctorId: "3",
    partnerOpticId: "2",
  },
];

// Pagamentos
export const mockPayments: Payment[] = [
  {
    id: "1",
    patientId: "1",
    patient: "João Silva Santos",
    cpf: "123.456.789-00",
    service: "Consulta Completa",
    amount: 180.0,
    method: "PIX",
    time: "08:30",
    date: "2024-01-27",
    observations: "Primeira consulta",
  },
  {
    id: "2",
    patientId: "2",
    patient: "Maria Oliveira Costa",
    cpf: "987.654.321-00",
    service: "Retorno",
    amount: 80.0,
    method: "Dinheiro",
    time: "09:15",
    date: "2024-01-27",
  },
  {
    id: "3",
    patientId: "3",
    patient: "Pedro Henrique Alves",
    cpf: "456.789.123-00",
    service: "Exame para Lente de Contato",
    amount: 220.0,
    method: "Cartão de Crédito",
    time: "10:00",
    date: "2024-01-27",
    observations: "Parcelado em 3x",
  },
  {
    id: "4",
    patientId: "4",
    patient: "Ana Paula Ferreira",
    cpf: "321.654.987-00",
    service: "Refração",
    amount: 150.0,
    method: "Cartão de Débito",
    time: "11:30",
    date: "2024-01-27",
  },
  {
    id: "5",
    patientId: "5",
    patient: "Carlos Eduardo Lima",
    cpf: "789.123.456-00",
    service: "Consulta Completa",
    amount: 180.0,
    method: "PIX",
    time: "14:00",
    date: "2024-01-27",
  },
  {
    id: "6",
    patientId: "6",
    patient: "Fernanda Souza Santos",
    cpf: "654.321.987-00",
    service: "Retorno",
    amount: 80.0,
    method: "PIX",
    time: "15:30",
    date: "2024-01-27",
  },
  {
    id: "7",
    patientId: "7",
    patient: "Roberto Carlos Mendes",
    cpf: "147.258.369-00",
    service: "Consulta Completa",
    amount: 180.0,
    method: "Dinheiro",
    time: "16:00",
    date: "2024-01-27",
  },
];
