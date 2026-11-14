# Segurança do banco

Para uma instalação nova, execute `schema.sql` e depois
`migrations/20261114_security_hardening.sql` e
`migrations/20261115_multiple_profiles.sql`, nessa ordem, no SQL Editor do Supabase.
Para uma instalação existente, execute as migrações, primeiro em staging.
Elas são idempotentes e não apagam contas, históricos nem objetos antigos.

Depois execute `security-verification.sql`. Revise também eventuais políticas
adicionais que não estejam neste repositório: políticas permissivas se combinam
com OR e podem anular uma política mais restritiva.

As constraints criadas com `NOT VALID` protegem novas gravações. Para validar
dados históricos, revise os registros incompatíveis e só então use
`ALTER TABLE ... VALIDATE CONSTRAINT ...`. Não remova registros automaticamente.

O cliente grava `<user-id>/<profile-id>.png`, como PNG e com até 2 MB, depois da
migração de múltiplos perfis. Cada perfil tem seu próprio objeto de avatar.
Publique o cliente e a migração de forma coordenada; clientes antigos que tentem
criar nomes de arquivos aleatórios deixarão de conseguir enviar avatares.
Objetos antigos continuam públicos por URL e não são removidos pela migração.
A listagem do diretório fica limitada ao dono autenticado; acesso público ao
bucket não exige uma política SELECT anônima para todas as linhas.
O limite de MIME do Storage não substitui inspeção binária no servidor; para
aceitar arquivos de clientes arbitrários com garantia de re-encoding, será
necessário um serviço de upload com decodificação e re-encoding no backend.

No painel de Auth, habilite confirmação de e-mail, configure SMTP, limites de
tentativas, senha mínima de 12 caracteres e proteção contra senhas vazadas.
Para ativar CAPTCHA, integre primeiro o widget/token correspondente ao formulário;
o cliente atual ainda não envia `captchaToken`.
As validações do formulário não substituem essas regras no servidor.

Nunca coloque `service_role`, `sb_secret_*` ou senhas de banco em variáveis
`VITE_*`. A chave `anon`/publishable é pública por projeto e depende de RLS.

## Até três perfis por conta

`viewing_profiles` usa três slots exclusivos por conta. O limite é imposto por
CHECK + UNIQUE no PostgreSQL, inclusive para chamadas diretas e simultâneas.
O perfil original mantém o ID da conta; os dados anteriores em `user_media_state`
são atribuídos a esse primeiro perfil sem perda de lista ou progresso.

A chave da tabela de mídia passa a incluir `profile_id`, com uma chave estrangeira
composta que garante que perfil e conta pertençam ao mesmo dono. As consultas do
cliente sempre filtram conta e perfil; um mesmo filme pode ter estados diferentes
em cada perfil. Os novos perfis começam sem lista nem histórico.

A criação usa `create_viewing_profile`, uma função com privilégios do chamador,
RLS e checagem da identidade esperada da sessão. Cada conta continua sendo a
fronteira de autenticação: os perfis não têm senhas ou PINs separados.
O cliente oferece criação e edição; exclusão de perfis não está habilitada.

Publique o cliente junto das migrações e recarregue abas antigas. O cliente antigo
não conhece a nova chave de mídia. Não execute novamente apenas a migração de
hardening depois da de perfis, pois ela contém a política de avatar anterior.
