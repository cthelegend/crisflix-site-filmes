import { Link } from "react-router-dom";
import LegalLayout from "@/components/LegalLayout";
import { LEGAL_CONTACT_EMAIL } from "@/lib/legal";

export default function TermsPage() {
  return <LegalLayout title="Termos de Serviço">
    <p className="text-base font-semibold text-primary">A cultura é um direito, não um privilégio.</p>
    <p>O Foice & Filme é uma iniciativa gratuita inspirada na democratização do acesso à cultura e na valorização dos trabalhadores que produzem arte, conhecimento e entretenimento. Nossa posição editorial está apresentada em <Link to="/quem-somos">Quem somos?</Link>. Esses princípios orientam o projeto e não substituem as obrigações legais aplicáveis.</p>
    <h2>1. Natureza do serviço</h2>
    <p>O site atua como <strong>agregador de links, referências, metadados e integrações com APIs e players de provedores externos</strong>, reunindo recursos de descoberta de filmes, séries, animes e esportes em uma interface.</p>
    <p><strong>Não hospedamos os arquivos audiovisuais de filmes, episódios ou transmissões exibidos pelos players.</strong> A reprodução desses arquivos ocorre nos serviços dos respectivos provedores. A interface, os textos institucionais e os recursos de conta pertencem ao funcionamento do próprio site.</p>
    <h2>2. Conteúdos e serviços externos</h2>
    <p>Disponibilidade, fontes de reprodução, qualidade, áudio, legendas, publicidade e verificações de acesso podem variar conforme o provedor. Cada serviço externo possui suas condições e práticas de privacidade. A integração técnica não atribui ao Foice & Filme a autoria ou titularidade das obras nem significa representação dos provedores ou titulares.</p>
    <p>Uma referência ou um link não constitui licença de uso de uma obra. A condição de agregador não afasta obrigações legais aplicáveis ao projeto, e estes termos não autorizam a violação de direitos de terceiros.</p>
    <h2>3. Contas e uso responsável</h2>
    <p>A conta permite criar até três perfis com nome, avatar, lista e histórico próprios. Os perfis compartilham a autenticação da conta. Mantenha suas credenciais protegidas e utilize apenas imagens que tenha direito de enviar como avatar.</p>
    <p>Não utilize o serviço para fraudar contas, prejudicar sua segurança, explorar falhas ou violar direitos de outras pessoas. Dados de autenticação, perfis e progresso são tratados conforme a <Link to="/privacidade">Política de Privacidade e Cookies</Link>.</p>
    <h2>4. Direitos autorais e revisão de referências</h2>
    <p>Reconhecemos a importância de artistas, roteiristas, diretores, animadores e demais trabalhadores da produção cultural. A defesa do acesso à cultura não dispensa o respeito aos direitos previstos na legislação.</p>
    <p>Titulares ou representantes podem solicitar revisão de uma referência pelo e-mail <a href={`mailto:${LEGAL_CONTACT_EMAIL}?subject=Revis%C3%A3o%20de%20refer%C3%AAncia`}>{LEGAL_CONTACT_EMAIL}</a>. Informe seu vínculo com a obra, as URLs específicas e uma descrição objetiva do motivo. Evite enviar documentos sensíveis no primeiro contato.</p>
    <p>As solicitações serão analisadas de boa-fé. Referências sob controle do projeto poderão ser corrigidas, suspensas ou removidas quando cabível, sem prejuízo das providências exigidas pela legislação. A remoção de uma referência no site não remove arquivos mantidos por um provedor externo.</p>
    <h2>5. Disponibilidade e responsabilidades</h2>
    <p>O catálogo e as integrações podem mudar, ficar indisponíveis ou apresentar falhas. Não asseguramos a permanência de uma obra ou transmissão em serviços externos. Essa informação não exclui direitos do usuário nem responsabilidades que sejam impostas por lei.</p>
    <h2>6. Aceitação e alterações</h2>
    <p>No cadastro, a aceitação destes termos é solicitada separadamente da escolha sobre armazenamento opcional. Alterações serão identificadas pela data de atualização desta página. Mudanças relevantes poderão exigir nova ciência ou aceitação, conforme sua natureza e a legislação aplicável.</p>
    <p>Dúvidas sobre o serviço e estes termos podem ser enviadas ao contato indicado abaixo.</p>
  </LegalLayout>;
}
