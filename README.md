
# 🎬 FOICE & FILME

**Todas as mídias para todo povo**

Plataforma de streaming com identidade visual vermelha inspirada em cartazes e símbolos comunistas, desenvolvida para exibição de filmes, séries e conteúdos em uma interface moderna, rápida e responsiva.

🔗 **Acesse o projeto:**
👉 [Acessar](https://crissflix.vercel.app/)

---

## 🚀 Funcionalidades

* 🎨 Interface estilo Netflix
* 🖼️ Cards com imagens dinâmicas
* ⚡ Alta performance com Vite

---

## 🛠️ Tecnologias utilizadas

* HTML5
* CSS3
* JavaScript
* Vite
* React
* Node.js
* Vercel

---

## ⚙️ Como rodar localmente

```bash
git clone https://github.com/cthelegend/crisflix-site-filmes.git
cd crisflix-site-filmes
npm install
npm run dev
```

## Configuração segura

Use Node.js 24. Copie `.env.example` para `.env.local` e preencha as variáveis.
Arquivos locais de ambiente são ignorados pelo Git.

- `TMDB_READ_ACCESS_TOKEN`: credencial somente do servidor, sem prefixo `VITE_`.
  Cadastre-a também nas Environment Variables da Vercel **antes de publicar**.
  Revogue e substitua a credencial antiga que já esteve no código público.
- `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`: configuração pública do cliente.
  Use apenas a chave anon/publishable; nunca `service_role` ou `sb_secret_*`.
- Os players de filmes e séries usam os endereços e parâmetros configurados,
  sem reescrever o domínio. A incorporação segue a integração original,
  sem sandbox nesses players. A integração de futebol permanece inalterada.

O catálogo e o futebol usam funções em `api/`. Publique o projeto completo na
Vercel: servir apenas `dist/` sem essas funções não fornece as APIs. O servidor
`npm run dev` disponibiliza as mesmas funções localmente e escuta apenas em
`127.0.0.1`. `vite preview` serve somente os arquivos estáticos.

Siga [as instruções do banco](supabase/README.md) para aplicar e verificar a
migração. Habilite confirmação de e-mail no painel de Auth; as validações do
formulário não substituem as regras e os limites de tentativas do Supabase.

O menu do avatar oferece **Trocar perfil**, **Configurações** e **Sair**.
Cada conta pode criar até três perfis com nome, avatar, lista e histórico próprios.
Para ativar isso no banco existente, aplique a migração de hardening e depois
`supabase/migrations/20261115_multiple_profiles.sql` antes de publicar o cliente.

Validação: `npm test`, `npm audit`, `npx tsc --noEmit -p tsconfig.app.json` e
`npm run build`. A build também recusa credenciais privadas no artefato público.

---

## 📌 Roadmap

* 🔐 ~~Autenticação~~
* ❤️ ~~Favoritos~~
---

## 📄 Licença

MIT

---

## 👨‍💻 Autor

Desenvolvido por **cris15k**
🔗 [cris15k](https://github.com/cthelegend)

---


## Preferências do site

Em Configurações, o visitante autenticado pode escolher animações completas,
reduzidas ou conforme o sistema, pausar os destaques, ajustar cards e texto,
ativar economia de dados e selecionar Início, Minha lista ou Biblioteca como
página inicial. As opções anteriores de atalhos foram substituídas.

Com o armazenamento opcional aceito, as escolhas são salvas neste navegador e
sincronizadas entre suas abas. Sem autorização, valem apenas durante a visita.
As opções podem ser restauradas aos padrões. O destino inicial é aplicado só ao entrar pela
raiz ou escolher um perfil; links diretos e o botão Início continuam disponíveis.
Minha lista como entrada exige uma sessão autenticada.

Economia de dados reduz os tamanhos das imagens TMDB, evita antecipar banners
não visitados, troca o GIF de loading pela imagem estática e reduz páginas e
itens carregados no catálogo inicial. A preferência não modifica a integração
ou a qualidade de vídeo dos players externos.


## Cookies, privacidade e termos

As páginas `/termos` e `/privacidade` e o gerenciador de cookies estão no rodapé.
O aviso oferece aceitar ou recusar o armazenamento opcional, sem seleção prévia,
e permite rever a escolha. A decisão dura até 180 dias. Preferências, lembretes
da interface e progresso de visitantes só recebem novos registros persistentes
após autorização; sem ela, funcionam em memória durante a visita. Revogar remove
esses registros locais, preservando autenticação e dados associados à conta.

O cadastro exige aceitação separada dos termos e registra versão e instante
nos metadados da conta Supabase. Isso não é um registro de auditoria imutável.
Não é necessária nova migração SQL para esta alteração. O contato institucional
é foiceefilme@gmail.com; a versão dos documentos fica em `src/lib/legal.ts`.

A política descreve os dados efetivamente utilizados: contas, perfis, listas,
histórico, avatares e infraestrutura externa. O gerenciador controla somente o
armazenamento opcional implementado pelo site, sem controlar cookies internos
dos players externos. Os termos descrevem a agregação de links/APIs, a ausência
de hospedagem dos arquivos audiovisuais e pedidos de revisão de referências.
O texto deve acompanhar mudanças reais no serviço e não garante imunidade
jurídica ou substitui revisão profissional.


## Painel editorial

A rota `/cris` administra destaques, avisos agendados, temas especiais, categorias
editoriais, biblioteca e personalização. Inclui rascunhos, publicação, histórico
e backup JSON. Consulte [ADMIN.md](ADMIN.md) para ativar a migração e as variáveis
privadas na Vercel. Senhas e chaves administrativas nunca devem ter prefixo
`VITE_`. O modo local via Vite funciona sem a chave secreta do banco.
