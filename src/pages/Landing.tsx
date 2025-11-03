import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Shield, BarChart3, Users, CalendarDays, ClipboardList, Activity, Quote, ShieldCheck, Clock, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const features = [
  {
    icon: <Users className="h-5 w-5" />, 
    title: "Gestão completa de pacientes",
    desc: "Cadastros, histórico clínico, exames e prescrições em um só lugar.",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />, 
    title: "Agendamentos e fila",
    desc: "Agenda inteligente, confirmação e fila de atendimento em tempo real.",
  },
  {
    icon: <Shield className="h-5 w-5" />, 
    title: "Segurança e conformidade",
    desc: "Autenticação segura, controles de acesso e registros auditáveis.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "R$ 79/mês",
    highlight: false,
    items: [
      "1 usuário",
      "Agenda básica",
      "Cadastro de pacientes",
      "Relatórios simples",
    ],
  },
  {
    name: "Professional",
    price: "R$ 199/mês",
    highlight: true,
    items: [
      "Até 5 usuários",
      "Agendamentos + Fila",
      "Histórico clínico e exames",
      "Financeiro básico",
      "Suporte prioritário",
    ],
  },
  {
    name: "Enterprise",
    price: "Fale com a gente",
    highlight: false,
    items: [
      "Usuários ilimitados",
      "BI e relatórios avançados",
      "Integrações e SSO",
      "SLA dedicado",
    ],
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const [openLogin, setOpenLogin] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800">
      <header className="mx-auto max-w-7xl px-4 py-6 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <span className="text-lg font-bold">OV</span>
          </div>
          <span className="text-lg font-semibold">Optra Vision</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setOpenLogin(true)}>Entrar</Button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pt-10 pb-16 text-white">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">Gestão optométrica completa, moderna e segura</h1>
            <p className="mt-4 text-white/90 text-lg">Organize sua clínica com agenda inteligente, fila de atendimento, prontuário eletrônico e financeiro — tudo em um só sistema.</p>
            <div className="mt-6 flex gap-3">
              <Button size="lg" onClick={() => setOpenLogin(true)}>Começar agora</Button>
              <Button size="lg" variant="secondary" onClick={() => {
                const el = document.getElementById("plans");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}>Ver planos</Button>
            </div>
          </div>
          <Card className="bg-white/10 border-white/20 backdrop-blur p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title} className="rounded-lg bg-white/5 p-4">
                  <div className="text-white mb-2">{f.icon}</div>
                  <div className="font-semibold">{f.title}</div>
                  <div className="text-sm text-white/80">{f.desc}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <section id="plans" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold text-center">Planos que crescem com sua clínica</h2>
          <p className="text-center text-muted-foreground mt-2">Escolha o plano ideal para o seu momento e mude quando precisar.</p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {plans.map((p) => (
              <Card key={p.name} className={`${p.highlight ? "ring-2 ring-blue-600" : ""} p-6`}> 
                <div className="flex items-baseline justify-between">
                  <div className="text-xl font-semibold">{p.name}</div>
                  {p.highlight && (
                    <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">Mais popular</span>
                  )}
                </div>
                <div className="mt-2 text-2xl font-bold">{p.price}</div>
                <ul className="mt-4 space-y-2 text-sm">
                  {p.items.map((it) => (
                    <li key={it} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-6 w-full" onClick={() => setOpenLogin(true)}>Começar</Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <section className="bg-white pt-10 pb-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold text-center">Como funciona</h2>
          <p className="text-center text-muted-foreground mt-2">Veja como entrar em produção em poucos minutos.</p>
        </div>
        <div className="mx-auto max-w-7xl px-2 sm:px-4 mt-8 grid gap-6 md:gap-8 md:grid-cols-3">
          <Card className="p-7 min-h-[220px] border-blue-100 shadow-sm">
            <div className="mt-2 flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold">1. Cadastre sua equipe</h3>
                <p className="text-muted-foreground mt-2">Convide administradores, secretárias e optometristas. Defina permissões e comece em minutos.</p>
              </div>
            </div>
          </Card>
          <Card className="p-7 min-h-[220px] border-blue-100 shadow-sm">
            <div className="mt-2 flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold">2. Organize sua agenda</h3>
                <p className="text-muted-foreground mt-2">Configure serviços, horários e confirmação automática. Reduza faltas e otimize o fluxo.</p>
              </div>
            </div>
          </Card>
          <Card className="p-7 min-h-[220px] border-blue-100 shadow-sm">
            <div className="mt-2 flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold">3. Atenda com eficiência</h3>
                <p className="text-muted-foreground mt-2">Fila em tempo real, prontuário eletrônico, exames e prescrições — tudo integrado.</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="mx-auto max-w-7xl px-2 sm:px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center">O que nossos clientes dizem</h2>
          <p className="text-center text-muted-foreground mt-2">Resultados reais de clínicas como a sua.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3 auto-rows-fr">
            <Card className="p-7 h-full">
              <div className="flex items-start gap-3 text-blue-700">
                <Quote className="h-5 w-5" />
                <div className="text-sm text-muted-foreground">“Reduzimos o tempo médio de espera em 35% com a fila inteligente.”</div>
              </div>
              <div className="mt-5 flex items-center gap-3 text-sm">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span className="font-semibold">Clínica Alfa • Recife</span>
              </div>
            </Card>
            <Card className="p-7 h-full">
              <div className="flex items-start gap-3 text-blue-700">
                <Quote className="h-5 w-5" />
                <div className="text-sm text-muted-foreground">“O prontuário eletrônico nos trouxe organização e segurança clínica.”</div>
              </div>
              <div className="mt-5 flex items-center gap-3 text-sm">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span className="font-semibold">Instituto Visão • São Paulo</span>
              </div>
            </Card>
            <Card className="p-7 h-full">
              <div className="flex items-start gap-3 text-blue-700">
                <Quote className="h-5 w-5" />
                <div className="text-sm text-muted-foreground">“A visão financeira ficou clara — recebi e paguei sob controle.”</div>
              </div>
              <div className="mt-5 flex items-center gap-3 text-sm">
                <Wallet className="h-4 w-4 text-amber-600" />
                <span className="font-semibold">Centro Ocular • Curitiba</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-3xl font-bold text-center">Perguntas frequentes</h2>
          <Accordion type="single" collapsible className="mt-6">
            <AccordionItem value="item-1">
              <AccordionTrigger>Posso testar antes de contratar?</AccordionTrigger>
              <AccordionContent>
                Sim. Oferecemos período de avaliação. Clique em “Começar agora” e converse com nosso time para liberar o acesso.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Meus dados estão seguros?</AccordionTrigger>
              <AccordionContent>
                Utilizamos autenticação segura, criptografia em trânsito e políticas de acesso por perfil. Banco de dados gerenciado pelo Supabase (PostgreSQL).
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Consigo migrar de outro sistema?</AccordionTrigger>
              <AccordionContent>
                Sim. Ajudamos na importação de pacientes, agendamentos e histórico quando disponível.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-blue-500 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold">Pronto para elevar o padrão da sua clínica?</h3>
            <p className="text-white/90 mt-1">Comece agora e tenha sua operação organizada em poucos minutos.</p>
          </div>
          <div className="flex gap-3">
            <Button size="lg" variant="secondary" onClick={() => setOpenLogin(true)}>Entrar</Button>
            <Button size="lg" onClick={() => setOpenLogin(true)}>Começar agora</Button>
          </div>
        </div>
      </section>

      <footer className="bg-white/5 text-white/80">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm flex items-center justify-center">
          <span>© {new Date().getFullYear()} Optra Vision</span>
        </div>
      </footer>

      <Dialog open={openLogin} onOpenChange={setOpenLogin}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 text-white">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <span className="text-base font-bold">OV</span>
                </div>
                <div>
                  <DialogTitle className="text-white">Entrar no Optra Vision</DialogTitle>
                  <p className="text-white/90 text-sm">Acesse sua conta para continuar</p>
                </div>
              </div>
            </DialogHeader>
          </div>
          <div className="px-6 py-6">
            <LoginForm onSuccess={() => setOpenLogin(false)} />
            <div className="mt-6 text-center text-xs text-muted-foreground">
              Protegido por autenticação segura • Seus dados estão criptografados
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Landing;


