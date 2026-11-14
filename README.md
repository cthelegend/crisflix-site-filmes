
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
- As URLs dos players aceitam HTTPS dos domínios conhecidos SuperFlix
  (`superflixapi.rest`, `.monster`, `.fun` e `.boats`); os domínios antigos são
  direcionados ao destino atual `.boats`. As transmissões de
  futebol aceitam `embedtv.cc` e seus subdomínios. Para trocar de provedor, atualize
  a lista de origens permitidas e a CSP em `vercel.json` de forma coordenada.

O player externo pode exigir verificação própria do navegador. Se essa página
for recusada dentro do iframe pelo provedor, o botão **Abrir player** permite
acessá-la em outra aba. O site não remove proteções do provedor nem garante que
uma transmissão externa estará disponível.

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

