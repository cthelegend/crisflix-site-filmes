import { Link } from "react-router-dom";
import LegalLayout from "@/components/LegalLayout";
import { openCookieChoices } from "@/lib/cookieConsent";
import { LEGAL_CONTACT_EMAIL } from "@/lib/legal";

export default function PrivacyPage() {
  return <LegalLayout title="Privacidade e cookies">
    <p>O Foice & Filme utiliza dados para oferecer autenticação, perfis, listas, histórico e recursos locais do navegador. Esta página descreve essas finalidades e as escolhas disponíveis.</p>
    <h2>1. Armazenamento necessário</h2>
    <p>A autenticação utiliza armazenamento para manter sua sessão quando você entra na conta. A seleção do perfil e a sua decisão sobre cookies também precisam ser lembradas para operar o serviço e respeitar suas escolhas. Recusar armazenamento opcional não encerra uma sessão já autenticada.</p>
    <p>O painel editorial possui uma sessão administrativa separada, com cookie necessário protegido e validade de até oito horas. O registro no servidor usa um hash do token de sessão, com revogação ao sair. Limites de tentativas de acesso usam uma chave derivada do endereço de conexão, sem guardar o IP bruto nessa tabela, e registros antigos são limpos durante novas tentativas.</p>
    <h2>2. Armazenamento opcional neste navegador</h2>
    <p>Com sua autorização, usamos armazenamento local para lembrar preferências de navegação, lembretes da interface e o “Continuar assistindo” de visitantes. Trata-se principalmente de <strong>localStorage</strong>, não de um cookie de publicidade criado por este aviso.</p>
    <p>Novos registros locais opcionais só são persistidos após sua autorização. Antes da escolha ou após a recusa, as informações desta visita ficam apenas em memória. As preferências continuam funcionando durante a visita. Ao recusar depois de aceitar, removemos os registros locais opcionais sob nosso controle; isso não apaga os dados da conta.</p>
    <p>A escolha de consentimento é guardada por até 180 dias, sem criar um identificador publicitário. Os registros locais opcionais podem ser removidos pela revogação, pela limpeza do navegador ou quando o consentimento expirar e for reavaliado em uma nova visita. Este mecanismo não habilita publicidade ou análise de audiência próprias.</p>
    <button type="button" onClick={openCookieChoices} className="min-h-11 rounded-full border border-white/30 px-5 text-xs font-semibold text-white hover:bg-white/5">Gerenciar cookies</button>
    <h2>3. Dados associados à conta</h2>
    <p>Ao criar ou usar uma conta, são tratados e-mail e dados de autenticação, nomes e avatares de perfis, lista e progresso de reprodução. A autenticação e os registros de conta são operados com o Supabase. A versão dos termos e o momento da aceitação no cadastro também são registrados nos metadados da conta.</p>
    <p>O histórico de uma conta pode ser salvo no serviço para retomar a reprodução em outros acessos. Essa função não é um cookie opcional de visitante. Avatares enviados ficam em URLs públicas de imagem; não envie uma foto que considere privada.</p>
    <p>Esses dados são utilizados para fornecer a conta e os recursos solicitados. A escolha de cookies opcionais é separada desse funcionamento. A manutenção e eventual eliminação dos dados da conta dependem das finalidades do serviço, de solicitações do titular e de obrigações legais aplicáveis.</p>
    <h2>4. Infraestrutura e provedores externos</h2>
    <p>A hospedagem na Vercel, a autenticação e armazenamento no Supabase e as integrações de catálogo, imagens, players e doações envolvem serviços externos. Ao solicitar esses recursos, seu navegador e a infraestrutura podem transmitir ou registrar informações operacionais, como IP, data, horário, navegador e URLs requisitadas.</p>
    <p>Players, imagens e widgets externos podem adotar cookies e outras tecnologias próprias. A escolha feita neste banner controla o armazenamento opcional implementado pelo Foice & Filme e <strong>não controla as tecnologias internas desses terceiros</strong>. Consulte suas políticas ao utilizá-los. Recusar cookies locais não implica que um player externo deixe de receber a conexão necessária para reproduzir um conteúdo solicitado.</p>
    <h2>5. Seus direitos e contato</h2>
    <p>Para solicitar informações, acesso, correção ou eliminação de dados, ou revogar uma autorização quando aplicável, entre em contato com a equipe pelo e-mail <a href={`mailto:${LEGAL_CONTACT_EMAIL}?subject=Privacidade%20e%20dados%20pessoais`}>{LEGAL_CONTACT_EMAIL}</a>. Podemos precisar confirmar sua relação com a conta, sem solicitar documentos excessivos.</p>
    <p>As solicitações serão avaliadas conforme a legislação, incluindo hipóteses em que algum registro precise ser mantido. Limpar o navegador remove armazenamento local, mas não substitui uma solicitação sobre dados de conta mantidos no serviço.</p>
    <p>Leia também os <Link to="/termos">Termos de Serviço</Link>. Informações oficiais sobre proteção de dados estão disponíveis na <a href="https://www.gov.br/anpd/pt-br" target="_blank" rel="noopener noreferrer">ANPD</a> e na <a href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709compilado.htm" target="_blank" rel="noopener noreferrer">LGPD</a>.</p>
  </LegalLayout>;
}
