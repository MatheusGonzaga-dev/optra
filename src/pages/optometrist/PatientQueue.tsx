import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, Search, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/utils";

interface QueueItem {
  id: string;
  posicao: number;
  tipo_atendimento: string;
  status: string;
  prioridade: string;
  sintomas?: string;
  usa_medicamentos: boolean;
  medicamentos_lista?: string;
  hora_chegada: string;
  pacientes: {
    id: string;
    nome_completo: string;
    cpf?: string;
    telefone?: string;
    data_nascimento?: string;
  };
}

const PatientQueue = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar fila do backend (tanto AGUARDANDO quanto EM_ATENDIMENTO)
  const fetchQueue = async () => {
    try {
      setLoading(true);
      // Buscar AGUARDANDO
      const responseAguardando = await fetch(`${API_BASE_URL}/fila?status=AGUARDANDO`);
      // Buscar EM_ATENDIMENTO
      const responseEmAtendimento = await fetch(`${API_BASE_URL}/fila?status=EM_ATENDIMENTO`);
      
      if (!responseAguardando.ok || !responseEmAtendimento.ok) throw new Error('Erro ao buscar fila');
      
      const dataAguardando = await responseAguardando.json();
      const dataEmAtendimento = await responseEmAtendimento.json();
      
      // Combinar ambos os arrays
      setQueue([...dataAguardando, ...dataEmAtendimento]);
    } catch (error: any) {
      console.error('Erro ao carregar fila:', error);
      toast.error('Erro ao carregar fila de atendimento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  // Separar fila por status
  const aguardandoQueue = queue.filter(item => item.status === 'AGUARDANDO');
  const emAtendimentoQueue = queue.filter(item => item.status === 'EM_ATENDIMENTO');

  // Aplicar filtro de busca
  const filteredAguardando = aguardandoQueue.filter((patient) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      patient.pacientes.nome_completo.toLowerCase().includes(query) ||
      (patient.pacientes.cpf?.replace(/\D/g, "").includes(query.replace(/\D/g, "")) || false)
    );
  });

  const filteredEmAtendimento = emAtendimentoQueue.filter((patient) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      patient.pacientes.nome_completo.toLowerCase().includes(query) ||
      (patient.pacientes.cpf?.replace(/\D/g, "").includes(query.replace(/\D/g, "")) || false)
    );
  });

  const handleCallPatient = async (patientId: string) => {
    try {
      // Atualizar status para EM_ATENDIMENTO
      const response = await fetch(`${API_BASE_URL}/fila/${patientId}/chamar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optometrista_id: usuario?.id }),
      });

      if (!response.ok) throw new Error('Erro ao chamar paciente');

      toast.success("Paciente chamado com sucesso!");
      
      // Recarregar fila
      await fetchQueue();
      
      // Navegar para o atendimento com o ID da fila
      navigate(`/optometrist/attendance/${patientId}`);
    } catch (error) {
      console.error('Erro ao chamar paciente:', error);
      toast.error('Erro ao chamar paciente');
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTipoAtendimento = (tipo: string) => {
    const tipos: Record<string, string> = {
      'CONSULTA_COMPLETA': 'Consulta Completa',
      'REFRACAO': 'Refração',
      'RETORNO': 'Retorno',
      'EXAME_LENTE_CONTATO': 'Exame Lente de Contato',
    };
    return tipos[tipo] || tipo;
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const colors: Record<string, string> = {
      'URGENTE': 'bg-red-500 text-white',
      'ALTA': 'bg-orange-500 text-white',
      'NORMAL': 'bg-blue-500 text-white',
    };
    return colors[prioridade] || 'bg-gray-500 text-white';
  };

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

  return (
    <DashboardLayout role="optometrist">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/optometrist/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Fila de Atendimento</h1>
            <p className="text-muted-foreground">
              Pacientes aguardando atendimento
            </p>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">
                Pacientes na Fila
              </h3>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-[300px]"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Carregando fila...</p>
            </div>
          ) : (
            <Tabs defaultValue="aguardando" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="aguardando">
                  Aguardando ({filteredAguardando.length})
                </TabsTrigger>
                <TabsTrigger value="em-atendimento">
                  Em Atendimento ({filteredEmAtendimento.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="aguardando" className="space-y-4">
                {filteredAguardando.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                      {searchQuery ? "Nenhum paciente encontrado" : "Nenhum paciente aguardando"}
              </p>
            </div>
          ) : (
                  filteredAguardando.map((patient) => {
                const age = patient.pacientes.data_nascimento 
                  ? calculateAge(patient.pacientes.data_nascimento) 
                  : null;

                return (
                  <div
                    key={patient.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                          {patient.posicao}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {patient.pacientes.nome_completo}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            {patient.pacientes.cpf && (
                              <span className="font-mono">{patient.pacientes.cpf}</span>
                            )}
                            {age && <span>{age} anos</span>}
                          </div>
                        </div>
                      </div>
                      <Badge className={getPrioridadeBadge(patient.prioridade)}>
                        {patient.prioridade}
                      </Badge>
                    </div>

                    {/* Conteúdo */}
                    <div className="p-6 space-y-4">
                      {/* Informações do Atendimento */}
                      <div>
                        <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-3">
                          INFORMAÇÕES DO ATENDIMENTO
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Tipo</span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatTipoAtendimento(patient.tipo_atendimento)}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Chegada</span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatTime(patient.hora_chegada)}
                            </p>
                          </div>
                          {patient.pacientes.telefone && (
                            <div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Telefone</span>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {patient.pacientes.telefone}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Anamnese */}
                      {(patient.sintomas || patient.usa_medicamentos !== undefined) && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-3">
                            ANAMNESE
                          </h4>
                          <div className="space-y-3">
                            {patient.sintomas && (
                              <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Sintomas Relatados</span>
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {patient.sintomas}
                                </p>
                              </div>
                            )}
                            <div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Medicamentos em Uso</span>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {patient.usa_medicamentos && patient.medicamentos_lista 
                                  ? patient.medicamentos_lista 
                                  : "Nenhum"
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Botão Chamar */}
                      <div className="flex justify-end pt-4 border-t">
                        <Button onClick={() => handleCallPatient(patient.id)}>
                          Chamar Paciente
                        </Button>
                      </div>
                    </div>
                  </div>
                );
                  })
                )}
              </TabsContent>

              <TabsContent value="em-atendimento" className="space-y-4">
                {filteredEmAtendimento.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      {searchQuery ? "Nenhum paciente encontrado" : "Nenhum paciente em atendimento no momento"}
                    </p>
                  </div>
                ) : (
                  filteredEmAtendimento.map((patient) => {
                    const age = patient.pacientes.data_nascimento 
                      ? calculateAge(patient.pacientes.data_nascimento) 
                      : null;

                    return (
                      <div
                        key={patient.id}
                        className="border rounded-lg overflow-hidden"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">
                              {patient.posicao}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                {patient.pacientes.nome_completo}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                {patient.pacientes.cpf && (
                                  <span className="font-mono">{patient.pacientes.cpf}</span>
                                )}
                                {age && <span>{age} anos</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPrioridadeBadge(patient.prioridade)}>
                              {patient.prioridade}
                            </Badge>
                            <Badge className="bg-green-600 text-white">
                              EM ATENDIMENTO
                            </Badge>
                          </div>
                        </div>

                        {/* Conteúdo */}
                        <div className="p-6 space-y-4">
                          {/* Informações do Atendimento */}
                          <div>
                            <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-3">
                              INFORMAÇÕES DO ATENDIMENTO
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Tipo</span>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatTipoAtendimento(patient.tipo_atendimento)}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Chegada</span>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatTime(patient.hora_chegada)}
                                </p>
                              </div>
                              {patient.pacientes.telefone && (
                                <div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Telefone</span>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {patient.pacientes.telefone}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Anamnese */}
                          {(patient.sintomas || patient.usa_medicamentos !== undefined) && (
                            <div>
                              <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-3">
                                ANAMNESE
                              </h4>
                              <div className="space-y-3">
                                {patient.sintomas && (
                                  <div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Sintomas Relatados</span>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                      {patient.sintomas}
                                    </p>
                                  </div>
                                )}
                                <div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Medicamentos em Uso</span>
                                  <p className="text-sm text-gray-900 dark:text-white">
                                    {patient.usa_medicamentos && patient.medicamentos_lista 
                                      ? patient.medicamentos_lista 
                                      : "Nenhum"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Botões de Ação */}
                          <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button
                              variant="outline"
                              onClick={() => {
                                // Navegar para página de detalhes do paciente (onde tem o prontuário)
                                navigate(`/optometrist/patient/${patient.pacientes.id}`);
                              }}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Abrir Prontuário
                            </Button>
                            <Button
                              onClick={() => navigate(`/optometrist/attendance/${patient.id}`)}
                            >
                              Continuar Atendimento
                            </Button>
                          </div>
                        </div>
            </div>
                    );
                  })
                )}
              </TabsContent>
            </Tabs>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientQueue;
