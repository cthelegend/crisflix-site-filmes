# Painel editorial — /cris

A rota `/cris` fica em branco enquanto não há sessão administrativa. Digite
`cris` no teclado para revelar o campo discreto de senha no canto inferior
direito; Enter envia e Esc fecha. A sequência aceita maiúsculas/minúsculas e
não é acionada dentro de campos editáveis.

O painel usa autenticação administrativa independente das contas de visitantes.
A senha é comparada no servidor por **scrypt** (salt aleatório, N=32768, r=8,
p=1); o navegador nunca recebe a senha ou seu hash. O hash solicitado foi gerado
somente no `.env.local` ignorado pelo Git. Para trocar a senha, execute
`node scripts/set-admin-password.mjs` em um terminal interativo.

## Ativar em produção

1. Execute [a migração](supabase/migrations/20261115_site_editor.sql) no SQL Editor
   do Supabase. Ela cria apenas tabelas editoriais/administrativas e não altera
   contas, filmes, listas, perfis ou players.
2. Em **Vercel → Project → Settings → Environment Variables**, adicione:
   - `ADMIN_PASSWORD_HASH`: copie o valor inteiro da linha de mesmo nome em
     `.env.local`, incluindo `scrypt:...`, sem aspas. Não use a senha em texto puro.
   - `SUPABASE_URL`: a URL do projeto Supabase.
   - `SUPABASE_SERVICE_ROLE_KEY`: a chave secreta (`sb_secret_...`) ou a antiga
     `service_role`, disponível nas configurações de API do Supabase.
3. Use o ambiente correto (Production e Preview, se necessário) e faça redeploy.
   A chave administrativa **não pode** usar prefixo `VITE_`.
4. Abra `/cris`, entre e publique. A publicação local não é transferida sozinha:
   exporte o rascunho local, importe no painel publicado e clique em Publicar.

Sem chave privada, o desenvolvimento via Vite salva em `.admin-local/content.json`
(ignorado pelo Git). Esse modo **nunca** é usado nas funções de produção. Não é
uma gravação em localStorage: outro navegador no mesmo servidor vê a publicação.
Sessões locais e limites locais reiniciam com o processo. Ao usar o Supabase,
sessões, limites e conteúdo são persistidos no banco.

## O que pode editar

- **Destaques:** busca TMDB, ordem, ativação e descrição alternativa, até 12 itens.
  Sem seleção ativa, volta à seleção automática; falhas de consulta não apagam a
  configuração publicada.
- **Avisos:** título, mensagem, link, ordem e agendamento por horário local.
- **Temas especiais:** cor de destaque, fundo, nome, prioridade e agendamento.
  O primeiro tema ativo vence. Cores alteram os tokens da interface; a identidade
  original e algumas decorações vermelhas permanecem. Prefira fundos escuros.
- **Categorias:** fileiras editoriais com filmes/séries selecionados e ordenados.
- **Biblioteca:** importar os filmes atuais, adicionar/editar/remover/reordenar
  títulos, cadastrar links HTTPS e ativar livros quando o acervo estiver pronto.
  Desativar o acervo personalizado restaura o catálogo original sem apagá-lo.
- **Personalização:** slogan, nota de rodapé, intervalo de banners, intensidade
  do fundo e categorias automáticas do início. Não altera metadados SEO.
- **Publicações:** backup JSON, importação validada e até 10 versões anteriores.

Salvar rascunho não modifica o site. Publicar altera todos os visitantes (até
60 segundos para uma aba já aberta). Há controle de revisão para impedir que
duas abas sobrescrevam a edição uma da outra. Na restauração de uma versão,
revise o rascunho e publique novamente. Não há HTML ou CSS arbitrário.

## Segurança e operação

- API privada exige sessão em cookie HttpOnly, SameSite=Strict, Secure em HTTPS,
  com validade de 8 horas. Logout revoga a sessão no servidor.
- Banco guarda só o hash SHA-256 do token aleatório; o token não é acessível a JS.
- Todas as gravações verificam origem e JSON, tamanho e estrutura permitida.
- Limite persistente: 8 logins por origem/IP em 15 minutos e 200 no total; a
  chave do limite é derivada criptograficamente, sem guardar o IP bruto.
- RLS ativa e nenhum acesso para `anon`/`authenticated` às tabelas/RPCs do painel.
  Só funções do backend, após autenticação, usam a chave secreta.
- `/api/site-content` retorna apenas conteúdo publicado, nunca rascunhos,
  histórico, sessões, senha ou hash. Falhas mantêm o catálogo original no cliente.
- A build verifica se chaves privilegiadas/hash foram incluídos em arquivos públicos.
- Ao trocar a senha em produção, revogue sessões anteriores com
  `delete from public.admin_sessions;` no SQL Editor e faça redeploy.
- A conta administrativa compartilha uma senha; não oferece MFA ou permissões
  por editor. Não compartilhe as variáveis privadas nem os arquivos locais.

Validação do banco após migração: com papéis `anon` e `authenticated`, tentar
SELECT/UPDATE nas três tabelas e executar as duas RPCs deve falhar por permissão.
Confira login, logout, publicação e limite de tentativas em um ambiente de teste
antes de disponibilizar o painel.
