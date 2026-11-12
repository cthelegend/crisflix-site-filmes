import SiteFooter from "@/components/SiteFooter";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1 px-4 pb-12 pt-24 md:px-12 md:pb-20 md:pt-28">
        <header className="mx-auto max-w-4xl text-center">
          <img
            src="/quem-somos-banner.png"
            alt="Cinéfilos de todo o mundo, uni-vos!"
            width={2172}
            height={724}
            decoding="async"
            className="mx-auto block h-auto w-full rounded-xl sm:rounded-2xl"
          />
          <h1 className="mt-8 text-2xl font-bold tracking-tight text-white md:mt-10 md:text-4xl">Quem somos?</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-7 text-primary md:text-xl">
            A cultura é um direito, não um privilégio.
          </p>
        </header>

        <article aria-label="Sobre o Foice e Filme" className="mx-auto mt-7 max-w-3xl space-y-6 hyphens-auto text-justify text-sm leading-7 text-white/90 sm:leading-8 md:mt-9 md:text-[15px] [&_strong]:font-semibold [&_strong]:text-white">
          <p>
            O <strong>Foice e Filme</strong> nasce de uma iniciativa inspirada nos ideais comunistas de democratização do acesso à cultura, fundamentada na convicção de que o conhecimento, a arte e o entretenimento são patrimônios da humanidade e não devem ser privilégios reservados àqueles que podem pagar por eles.
          </p>
          <p>
            Somos uma plataforma gratuita de filmes, séries, animes e esportes, construída sobre um princípio fundamental: <strong>a cultura é fruto do trabalho coletivo e deve servir à sociedade.</strong>
          </p>
          <p>
            <strong>Quando o acesso à cultura depende da capacidade de pagar por múltiplas assinaturas, o entretenimento deixa de ser universal e se transforma em mais um instrumento de exclusão econômica.</strong>
          </p>
          <p>
            Questionamos essa lógica de mercantilização da cultura e a utilização dos direitos autorais como instrumentos de monopólio, concentração de riqueza e controle sobre a circulação do conhecimento. Reconhecemos a importância de valorizar e remunerar artistas, roteiristas, diretores, animadores e todos os trabalhadores envolvidos na produção cultural. Entretanto, entendemos que <strong>proteger o trabalho dos criadores não deve significar restringir indefinidamente o acesso da população às suas obras</strong>, sobretudo quando grande parte dos lucros é apropriada por conglomerados que controlam sua distribuição.
          </p>
          <p>
            Não somos contrários à remuneração dos artistas. Mas a um sistema que transforma a necessidade de remuneração em justificativa para a exploração econômica do público e para a concentração do patrimônio cultural nas mãos de poucos.
          </p>
          <p>
            <strong>Nossa proposta vai além do entretenimento.</strong> Queremos contribuir para uma realidade em que o acesso à cultura deixe de ser determinado pelo poder aquisitivo, em que o conhecimento circule livremente e em que as conquistas da criatividade humana estejam ao alcance de todos.
          </p>
          <p>
            Afinal, uma sociedade verdadeiramente livre não é aquela em que tudo está à venda, mas aquela em que ninguém é excluído daquilo que foi construído coletivamente.
          </p>
          <p className="pt-3 text-base leading-8 md:text-lg">
            <strong>Porque a arte nasce do povo, é produzida pelo povo e é ao povo que deve retornar</strong>
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
