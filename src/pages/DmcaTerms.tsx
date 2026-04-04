import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";

const sections = [
  {
    title: "Política DMCA",
    body:
      "Respeitamos direitos autorais e atendemos notificações válidas de remoção. Se você acredita que algum material exibido viola seus direitos, envie uma notificação com identificação da obra, URL exata do conteúdo, seus dados de contato, declaração de boa-fé e assinatura eletrônica.",
  },
  {
    title: "Como solicitar remoção",
    body:
      "As solicitações devem incluir provas razoáveis de titularidade ou representação legal, descrição clara da infração alegada e o link específico que deseja remover. Pedidos incompletos podem exigir confirmação adicional antes da análise.",
  },
  {
    title: "Contranotificação",
    body:
      "Caso conteúdo removido tenha sido retirado por engano ou identificação incorreta, o responsável pode apresentar contranotificação com justificativa objetiva, dados completos e consentimento para jurisdição aplicável conforme legislação local.",
  },
  {
    title: "Termos de uso",
    body:
      "Ao acessar a plataforma, você concorda em utilizar o site apenas para fins legais, não automatizar abuso de consultas, não tentar contornar mecanismos de segurança e não republicar o conteúdo do catálogo como se fosse seu.",
  },
  {
    title: "Conteúdo e responsabilidade",
    body:
      "As informações de catálogo, imagens, créditos e metadados são exibidos com base em provedores terceiros e podem sofrer alterações. Não garantimos disponibilidade contínua, precisão absoluta ou permanência de qualquer item listado.",
  },
  {
    title: "Privacidade e contato",
    body:
      "Dados enviados via contato legal devem ser usados apenas para análise da solicitação, prevenção de fraude e cumprimento regulatório. Para assuntos de DMCA, termos ou correção cadastral, utilize o e-mail cristhianbarbosap@gmail.com.",
  },
  {
    title: "Cookies e tecnologias semelhantes",
    body:
      "Utilizamos cookies e armazenamento local para lembrar preferências, manter funções essenciais do site, entender padrões de navegação e melhorar a experiência. Ao continuar navegando, você concorda com essa coleta para fins operacionais, analíticos e de personalização, respeitando as configurações do seu navegador.",
  },
];

const DmcaTerms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-4 pb-16 pt-24 md:px-12 md:pt-28">
        <section className="mx-auto max-w-5xl rounded-[2rem] border border-border bg-card/50 p-5 sm:p-7 md:p-12">
          <p className="text-[11px] uppercase tracking-[0.34em] text-primary/80 md:text-sm md:tracking-[0.35em]">Legal</p>
          <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">DMCA, termos e políticas</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
            Esta página reúne os termos essenciais da plataforma, o fluxo de notificação DMCA e as regras gerais de uso do catálogo.
          </p>

          <div className="mt-8 grid gap-4 md:mt-10 md:gap-5">
            {sections.map((section) => (
              <article key={section.title} className="rounded-[1.7rem] border border-border bg-background/40 p-5 md:rounded-3xl md:p-6">
                <h2 className="text-lg font-semibold text-foreground md:text-xl">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{section.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[1.7rem] border border-primary/30 bg-primary/10 p-5 md:mt-10 md:rounded-3xl md:p-6">
            <h2 className="text-lg font-semibold text-foreground md:text-xl">Canal de contato</h2>
            <p className="mt-3 text-sm leading-7 text-foreground/80">
              E-mail jurídico: <span className="font-medium">cristhianbarbosap@gmail.com</span>
            </p>
            <p className="mt-2 text-sm leading-7 text-foreground/80">
              Prazo de resposta inicial: até 7 dias úteis após recebimento de uma solicitação suficientemente detalhada.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default DmcaTerms;
