export type LibraryCategory = "filmes" | "livros";

export interface LibraryEntry {
  id: string;
  title: string;
  href: string;
  author?: string;
  year?: number | string;
  description?: string;
  image?: string;
  sourceRank?: number;
  aliases?: string[];
  parts?: { title: string; href: string }[];
}

export const leftLibrarySources = {
  filmes: { label: "Seleção do Vermelho", href: "https://vermelho.org.br/2014/01/13/os-50-melhores-filmes-da-esquerda/" },
  livros: null,
};

// Movie identities were checked against TMDB. The books section is coming soon.
export const leftLibraryCatalog: Record<LibraryCategory, LibraryEntry[]> = {
  "filmes": [
    {
      "id": "film-3870",
      "title": "1900",
      "href": "/details/movie/3870",
      "author": "Bernardo Bertolucci",
      "year": 1976,
      "sourceRank": 1,
      "description": "Uma retrospectiva histórica da Itália do início do século XX até o fim da Segunda Guerra Mundial a partir das vidas de Olmo, filho bastardo de camponeses, e Alfredo, herdeiro de uma rica família de latifundiários. O pano de fundo é o intenso cenário político da época, com o fortalecimento do…",
      "image": "https://image.tmdb.org/t/p/w342/22UeAuG3wahe6EwkH3slr0ibWJj.jpg"
    },
    {
      "id": "film-643",
      "title": "O Encouraçado Potemkin",
      "href": "/details/movie/643",
      "author": "Serguei Eisenstein",
      "year": 1925,
      "sourceRank": 2,
      "description": "Em 1905, na Rússia czarista, aconteceu um levante que pressagiou a Revolução de 1917. Tudo começou no navio de guerra Potemkin quando os marinheiros estavam cansados de serem maltratados, sendo que até carne estragada lhes era dada com o médico de bordo insistindo que ela era perfeitamente…",
      "image": "https://image.tmdb.org/t/p/w342/a1AvYpBbEixfNK6KgG5bpowsm7X.jpg"
    },
    {
      "id": "film-17295",
      "title": "A Batalha de Argel",
      "href": "/details/movie/17295",
      "author": "Gillo Pontecorvo",
      "year": 1966,
      "sourceRank": 3,
      "description": "Os eventos decisivos da guerra pela independência da Argélia, marco do processo de libertação das colônias européias na África. Entre 1954 e 1957 é mostrado o modo de agir dos dois lados do conflito, a Frente de Libertação Nacional e o exército francês. Enquanto que o exército usava técnicas de…",
      "image": "https://image.tmdb.org/t/p/w342/egAZJTyIBDWeI9xlmx4sZwvZ2I.jpg"
    },
    {
      "id": "film-23620",
      "title": "O Sal da Terra",
      "href": "/details/movie/23620",
      "author": "Herbert J. Biberman",
      "year": 1954,
      "sourceRank": 4,
      "description": "Baseado em fatos reais, o filme retrata uma greve dos mineiros de origem mexicana, no Novo México. Com exceção de cinco atores, o elenco é composto por não-profissionais, a maioria participantes na greve real. O filme é profético ao descrever a participação das esposas dos trabalhadores oprimidos,…",
      "image": "https://image.tmdb.org/t/p/w342/vYOH8TLzXq15alUDM5DDZXMb1LN.jpg"
    },
    {
      "id": "film-33324",
      "title": "Harlan County U.S.A.",
      "href": "/details/movie/33324",
      "author": "Barbara Kopple",
      "year": 1976,
      "sourceRank": 5,
      "image": "https://image.tmdb.org/t/p/w342/4TQwyqULcE87BHCOIt7NvCEzfQi.jpg"
    },
    {
      "id": "film-406",
      "title": "O Ódio",
      "href": "/details/movie/406",
      "author": "Mathieu Kassovitz",
      "year": 1995,
      "sourceRank": 6,
      "description": "Um dia na vida de três jovens delinquentes, um árabe, um judeu e um negro que moram num conjunto habitacional pobre de Paris, mostra a que ponto pode chegar a discriminação racial de policiais hostis.",
      "image": "https://image.tmdb.org/t/p/w342/75WjFRiElQaEGRqNKJdTSB47rMR.jpg"
    },
    {
      "id": "film-975",
      "title": "Glória Feita de Sangue",
      "href": "/details/movie/975",
      "author": "Stanley Kubrick",
      "year": 1957,
      "sourceRank": 7,
      "description": "Depois de se recusar a atacar uma posição inimiga, um general acusa os soldados da covardia e seu comandante deve defendê-los.",
      "image": "https://image.tmdb.org/t/p/w342/3tn73tCktCnZ9CkiUms2cJC4BKt.jpg"
    },
    {
      "id": "film-3082",
      "title": "Tempos Modernos",
      "href": "/details/movie/3082",
      "author": "Charlie Chaplin",
      "year": 1936,
      "sourceRank": 8,
      "description": "Sujeito ao ritmo de produção infernal da fábrica, o Vagabundo tem um súbito colapso nervoso. Do hospital, ele vai para a prisão e fica desempregado, sempre cercado pela industrialização moderna. Certo dia, ele se depara com uma menina órfã.",
      "image": "https://image.tmdb.org/t/p/w342/zQJto2v1hYzm54lHlTZp8d7vRwS.jpg"
    },
    {
      "id": "film-54580",
      "title": "Segunda-Feira ao Sol",
      "href": "/details/movie/54580",
      "author": "Fernando León de Aranoa",
      "year": 2002,
      "sourceRank": 9,
      "description": "Uma cidade costeira no norte da Espanha sofre com seu isolamento quando seus estaleiros começam a ser fechados, deixando vários trabalhadores desempregados à mercê de pequenas ocupações temporárias. Entre eles está Santa (Javier Bardem), um machão rebelde e auto-suficiente que se recusa a admitir o…",
      "image": "https://image.tmdb.org/t/p/w342/zQ5i3LDn25k2HhLOm3fjaXcjkux.jpg",
      "aliases": [
        "Às Segundas ao Sol"
      ]
    },
    {
      "id": "film-18254",
      "title": "Reds",
      "href": "/details/movie/18254",
      "author": "Warren Beatty",
      "year": 1981,
      "sourceRank": 10,
      "description": "A vida de John Reed, jornalista e escritor socialista estadunidense que retratou a Revolução Russa em seu livro \"Dez Dias que Abalaram o Mundo\".",
      "image": "https://image.tmdb.org/t/p/w342/AeiKdVVM93fwfQG1m3N0cgVZgHl.jpg"
    },
    {
      "id": "film-1040",
      "title": "O Leopardo",
      "href": "/details/movie/1040",
      "author": "Luchino Visconti",
      "year": 1963,
      "sourceRank": 11,
      "description": "Durante o conturbado processo de unificação italiana na Sicília, o príncipe Don Fabrizio passa a simpatizar com os ideais socialistas, mas não gosta da ideia de perder seu prestígio e privilégios.",
      "image": "https://image.tmdb.org/t/p/w342/a3zvKpjkI1sInsjCdVx7yZ5iZFE.jpg"
    },
    {
      "id": "film-32015",
      "title": "Eu Sou Cuba",
      "href": "/details/movie/32015",
      "author": "Mikhail Kalatozov",
      "year": 1964,
      "sourceRank": 12,
      "description": "Quatro histórias independentes traçam um painel de Cuba entre a derrubada do regime de Batista e a revolução comunista. Em Havana, Maria envergonha-se quando o homem de quem gosta descobre como ela ganha a vida. Pedro, um camponês idoso, descobre que a terra que cultiva foi vendida a uma empresa.…",
      "image": "https://image.tmdb.org/t/p/w342/9Zyi1oRd9PpqXvezFNfhXVRHH1S.jpg"
    },
    {
      "id": "film-697",
      "title": "Outubro",
      "href": "/details/movie/697",
      "author": "Serguei Eisenstein, Grigoriy Aleksandrov",
      "year": 1928,
      "sourceRank": 13,
      "description": "Em tom de documentário, o filme recria acontecimentos em Petrogrado, na Rússia, desde o fim da monarquia, em fevereiro de 1917, até o fim do governo provisório em novembro do mesmo ano.",
      "image": "https://image.tmdb.org/t/p/w342/4PEqJS7kc5YH4MZPn9vLIszse65.jpg"
    },
    {
      "id": "film-5156",
      "title": "Ladrões de Bicicleta",
      "href": "/details/movie/5156",
      "author": "Vittorio De Sica",
      "year": 1948,
      "sourceRank": 14,
      "description": "Desempregado Antonio Ricci (Lamberto Maggiorani) está eufórico quando finalmente encontra trabalho colocando cartazes pela cidade de Roma, destruída pela guerra. Sua esposa Maria (Lianella Carell), vende os lençóis da família para resgatar a bicicleta de Antonio da loja de penhor, para que ele…",
      "image": "https://image.tmdb.org/t/p/w342/8hpVv2G8cXXEBp67dkcLNqrjNUs.jpg"
    },
    {
      "id": "film-28",
      "title": "Apocalypse Now",
      "href": "/details/movie/28",
      "author": "Francis Ford Coppola",
      "year": 1979,
      "sourceRank": 15,
      "description": "Durante a guerra do Vietnã, o Capitão Willard recebe como missão ir ao Camboja para assassinar um Boina Verde renegado, o Coronel Kurtz. Este vive no meio de uma tribo local e é venerado como um deus. Mas, chegado ao seu destino, o Capitão Willard descobre que a sua missão é bem diferente do que…",
      "image": "https://image.tmdb.org/t/p/w342/veXttPnNe8EZulvmeGTyDUrG9T4.jpg"
    },
    {
      "id": "film-44967",
      "title": "A Greve",
      "href": "/details/movie/44967",
      "author": "Serguei Eisenstein",
      "year": 1925,
      "sourceRank": 16,
      "description": "Em \"A Greve\" (1925), Sergei Eisenstein apresenta um drama visual e político que retrata a revolta dos trabalhadores de uma fábrica russa, desencadeada pelo suicídio de um operário injustamente acusado de roubo. Esse trágico ato acende a chama da revolta, reunindo os operários em uma greve que…",
      "image": "https://image.tmdb.org/t/p/w342/rC3V5KT0UIpzOtt6Px1ot1dJ4sE.jpg"
    },
    {
      "id": "film-1116",
      "title": "Ventos da Liberdade",
      "href": "/details/movie/1116",
      "author": "Ken Loach",
      "year": 2006,
      "sourceRank": 17,
      "description": "Irlanda, 1920. O povo se une para formar exércitos de guerrilha voluntários e enfrentar a cruel Polícia Real Irlandesa vinda da Grã-Bretanha para impedir o movimento independentista. Damien abandona sua carreira promissora como médico e se junta ao irmão Teddy na violenta luta pela liberdade.",
      "image": "https://image.tmdb.org/t/p/w342/3HJFoQ99VZ7OA1lBS3e5qLSXr1P.jpg",
      "aliases": [
        "Brisa de Mudança"
      ]
    },
    {
      "id": "film-91487",
      "title": "Estado de Sítio",
      "href": "/details/movie/91487",
      "author": "Costa-Gavras",
      "year": 1972,
      "sourceRank": 18,
      "description": "No Uruguai, no início dos anos 1970, um funcionário da Agência para o Desenvolvimento Internacional (um grupo usado como uma frente para a formação policial estrangeira ) é seqüestrado por um grupo de guerrilha urbana. Usando seu interrogatório como um pano de fundo, o filme explora as…",
      "image": "https://image.tmdb.org/t/p/w342/34My0QIHXvvwaFpntfRCLkkLEX2.jpg"
    },
    {
      "id": "film-42449",
      "title": "Corações e Mentes",
      "href": "/details/movie/42449",
      "author": "Peter Davis",
      "year": 1974,
      "sourceRank": 19,
      "description": "Documentário analisa as razões da Guerra do Vietnã, mostrando imagens de bombardeios, destruição de aldeias, depoimentos de ex-soldados, políticos e generais responsáveis pelas operações militares. Contrapondo versões contra e a favor do conflito, o filme criou condições para uma dolorosa…",
      "image": "https://image.tmdb.org/t/p/w342/qYjcQW8CkLhEHsJ6Tm97gybzVe9.jpg"
    },
    {
      "id": "film-8881",
      "title": "Che",
      "href": "/details/movie/8881",
      "author": "Steven Soderbergh",
      "year": 2008,
      "sourceRank": 20,
      "description": "Filme em duas partes.",
      "image": "https://image.tmdb.org/t/p/w342/ekUpkM5tStkZuzpIzg77PbkG6SM.jpg",
      "parts": [
        {
          "title": "Parte 1 · Che: O Argentino",
          "href": "/details/movie/8881"
        },
        {
          "title": "Parte 2 · Che 2: A Guerrilha",
          "href": "/details/movie/8880"
        }
      ]
    },
    {
      "id": "film-11659",
      "title": "O Melhor da Juventude",
      "href": "/details/movie/11659",
      "author": "Marco Tullio Giordana",
      "year": 2003,
      "sourceRank": 21,
      "description": "Após um encontro fatídico no verão de 1966, os caminhos de vida de dois irmãos de uma família romana de classe média divergem, cruzando-se com alguns dos eventos mais significativos da história italiana do pós-guerra nas décadas seguintes.",
      "image": "https://image.tmdb.org/t/p/w342/2G3KYzngpi8rxQJCIXW9OL0ZCHx.jpg",
      "aliases": [
        "A Melhor Juventude"
      ]
    },
    {
      "id": "film-967",
      "title": "Spartacus",
      "href": "/details/movie/967",
      "author": "Stanley Kubrick",
      "year": 1960,
      "sourceRank": 22,
      "description": "Spartacus, um homem que nasceu escravo, labuta para o Império Romano enquanto sonha com o fim da escravidão. Ele foi condenado à morte por morder um guarda em uma mina na Líbia. Mas seu destino foi mudado por um lanista (negociante e treinador de gladiadores), que o comprou para ser treinado nas…",
      "image": "https://image.tmdb.org/t/p/w342/7Ia2ziy1juSFsl3ZCaaRn15Yo2A.jpg"
    },
    {
      "id": "film-46831",
      "title": "Recursos Humanos",
      "href": "/details/movie/46831",
      "author": "Laurent Cantet",
      "year": 2000,
      "sourceRank": 23,
      "image": "https://image.tmdb.org/t/p/w342/9wrXwrEquxm8k5Bfos9nB5UgkIW.jpg",
      "aliases": [
        "Recursos Humanos"
      ]
    },
    {
      "id": "film-86732",
      "title": "Salmo Vermelho",
      "href": "/details/movie/86732",
      "author": "Miklós Jancsó",
      "year": 1972,
      "sourceRank": 24,
      "image": "https://image.tmdb.org/t/p/w342/zPnUnJDC26brcSpDCEit1OeSx6s.jpg"
    },
    {
      "id": "film-1653",
      "title": "Diários de Motocicleta",
      "href": "/details/movie/1653",
      "author": "Walter Salles",
      "year": 2004,
      "sourceRank": 25,
      "description": "Che Guevara (Gael García Bernal) era um jovem estudante de Medicina que, em 1952, decide viajar pela América do Sul com seu amigo Alberto Granado (Rodrigo de la Serna). A viagem é realizada em uma moto, que acaba quebrando após 8 meses. Eles passam a seguir viagem através de caronas e caminhadas,…",
      "image": "https://image.tmdb.org/t/p/w342/eIuOax8vLiRmmOfOkqYENzVDO2J.jpg"
    },
    {
      "id": "film-53596",
      "title": "Conflito das Águas",
      "href": "/details/movie/53596",
      "author": "Icíar Bollaín",
      "year": 2011,
      "sourceRank": 26,
      "description": "Uma equipe de filmagem espanhola, de baixo orçamento, chega em Cochabamba, Bolívia, para rodar um filme sobre a chegada de Cristóvão Colombo, e a relação dos conquistadores espanhóis, que praticamente dizimaram a civilização indigena que ali habitava, explorando-os comercialmente, e matando os…",
      "image": "https://image.tmdb.org/t/p/w342/844Rf5ln8QjRdf5ZEgt9dbHP9Mp.jpg",
      "aliases": [
        "Também a Chuva"
      ]
    },
    {
      "id": "film-24276",
      "title": "Matewan - A Luta Final",
      "href": "/details/movie/24276",
      "author": "John Sayles",
      "year": 1987,
      "sourceRank": 27,
      "description": "Filmado na cidade de Matewam, a terra do carvão na Virgínia Ocidental, este filme celebra a organização dos trabalhadores no contexto de uma greve na década de 1920. O membro do sindicato, Joe Kenehan, um 'fura greve' chamado 'Poucas Roupas' Johnson e um prefeito e chefe de polícia simpáticos lutam…",
      "image": "https://image.tmdb.org/t/p/w342/kdQ2MCsrsC39Ta9x05sWOb9wi5B.jpg",
      "aliases": [
        "Matewan"
      ]
    },
    {
      "id": "film-42617",
      "title": "Queimada",
      "href": "/details/movie/42617",
      "author": "Gillo Pontecorvo",
      "year": 1969,
      "sourceRank": 28,
      "description": "O mercenário profissional Sir William Walker instiga uma revolta de escravos na ilha caribenha de Queimada para ajudar a melhorar o comércio de açúcar britânico. Anos depois, ele é enviado novamente para lidar com os mesmos rebeldes que ele havia forjado, pois eles haviam tomado muito poder, o que…",
      "image": "https://image.tmdb.org/t/p/w342/l5xbeVX339OOLHqkgDh4JeEPWHI.jpg"
    },
    {
      "id": "film-21253",
      "title": "O Que é Isso, Companheiro?",
      "href": "/details/movie/21253",
      "author": "Bruno Barreto",
      "year": 1997,
      "sourceRank": 29,
      "description": "O jornalista Fernando e seu amigo César abraçam a luta armada contra a ditadura militar no final da década de 60. Os dois se alistam num grupo guerrilheiro de esquerda. Em uma das ações do grupo militante, César é ferido e capturado pelos militares. Fernando então planeja o sequestro do embaixador…",
      "image": "https://image.tmdb.org/t/p/w342/kQq5RPqMQd9eHhlBMncWkovDmHE.jpg"
    },
    {
      "id": "film-75877",
      "title": "Os Santos Inocentes",
      "href": "/details/movie/75877",
      "author": "Mario Camus",
      "year": 1984,
      "sourceRank": 30,
      "description": "Em algum lugar do interior da Espanha, nos anos 60. Paco e sua esposa Régula são muito pobres. Eles trabalham como arrendatários para um proprietário de terras muito rico. Eles têm três filhos. Um deles é deficiente mental. Os outros não podem ir à escola porque o patrão “precisa” do trabalho…",
      "image": "https://image.tmdb.org/t/p/w342/qBMxs5nAf2MXH3GjH9hnpayWZ4M.jpg"
    },
    {
      "id": "film-106254",
      "title": "O Fim de São Petersburgo",
      "href": "/details/movie/106254",
      "author": "Vsevolod Pudovkin",
      "year": 1927,
      "sourceRank": 31,
      "image": "https://image.tmdb.org/t/p/w342/dILDTasB6ET7VPNm0cY7SM4SLHA.jpg"
    },
    {
      "id": "film-71785",
      "title": "Cinco Dias, Cinco Noites",
      "href": "/details/movie/71785",
      "author": "José Fonseca e Costa",
      "year": 1996,
      "sourceRank": 32,
      "image": "https://image.tmdb.org/t/p/w342/mQPMIXiPbhLYi3yYcczrW50ohlq.jpg"
    },
    {
      "id": "film-40842",
      "title": "Norma Rae",
      "href": "/details/movie/40842",
      "author": "Martin Ritt",
      "year": 1979,
      "sourceRank": 33,
      "description": "Norma Rae é uma trabalhadora têxtil do sul, empregada em uma fábrica com intoleráveis condições de trabalho. Essa preocupação com a situação dá a ela o bom senso de ser a principal associada a um organizador sindical visitante. Juntos, eles empreendem a difícil e possivelmente perigosa luta para…",
      "image": "https://image.tmdb.org/t/p/w342/6au7WBVYoKhV1jORyFSIRszb46S.jpg"
    },
    {
      "id": "film-6968",
      "title": "O Grupo Baader Meinhof",
      "href": "/details/movie/6968",
      "author": "Uli Edel",
      "year": 2008,
      "sourceRank": 34,
      "description": "A ascensão e o declínio do notório grupo terrorista alemão, a Fração do Exército Vermelho – um grupo de radicais que organizou bombardeios, roubos, sequestros e assassinatos no final dos anos 1960 e 1970, trazendo o caos à Alemanha do pós-guerra.",
      "image": "https://image.tmdb.org/t/p/w342/ttp1qePFyjtTNzltv9kTMuMm3pH.jpg",
      "aliases": [
        "O Complexo Baader Meinhof"
      ]
    },
    {
      "id": "film-132144",
      "title": "A Batalha do Chile",
      "href": "/details/movie/132144",
      "author": "Patricio Guzmán",
      "year": "1975–1979",
      "sourceRank": 35,
      "description": "Documentário em três partes.",
      "image": "https://image.tmdb.org/t/p/w342/iZMeh5TxvLPQ2aYF4ZyvhvkJDPh.jpg",
      "parts": [
        {
          "title": "Parte 1 · A Batalha do Chile - Primeira Parte: A Insurreição da Burguesia",
          "href": "/details/movie/132144"
        },
        {
          "title": "Parte 2 · A Batalha do Chile - Segunda Parte: O Golpe de Estado",
          "href": "/details/movie/1752899"
        },
        {
          "title": "Parte 3 · A Batalha do Chile - Terceira Parte: O Poder Popular",
          "href": "/details/movie/132150"
        }
      ]
    },
    {
      "id": "film-44639",
      "title": "Trabalho Interno",
      "href": "/details/movie/44639",
      "author": "Charles Ferguson",
      "year": 2010,
      "sourceRank": 36,
      "description": "A crise financeira mundial que aconteceu em 2008, causou a perda de milhões de empregos e casas e mergulhou os Estados Unidos em uma profunda recessão econômica. Matt Damon narra um documentário que fornece uma análise detalhada dos elementos que levaram ao colapso e identifica peças-chave do mundo…",
      "image": "https://image.tmdb.org/t/p/w342/uRQYWque6nh9qO12w3rdfd8OSN6.jpg",
      "aliases": [
        "Inside Job – A Verdade da Crise"
      ]
    },
    {
      "id": "film-935",
      "title": "Dr. Fantástico",
      "href": "/details/movie/935",
      "author": "Stanley Kubrick",
      "year": 1964,
      "sourceRank": 37,
      "description": "Depois que o insano General Jack D. Ripper ordena um ataque nuclear contra a União Soviética, uma sala de guerra cheia de políticos, generais e um diplomata russo tentam freneticamente impedir o ataque de se concretizar.",
      "image": "https://image.tmdb.org/t/p/w342/lFcwVewzDwmJjIIjNIWwST4ctaC.jpg",
      "aliases": [
        "Dr. Strangelove"
      ]
    },
    {
      "id": "film-550",
      "title": "Clube da Luta",
      "href": "/details/movie/550",
      "author": "David Fincher",
      "year": 1999,
      "sourceRank": 38,
      "description": "Um homem deprimido que sofre de insônia conhece um estranho vendedor de sabonetes chamado Tyler Durden. Eles formam um clube clandestino com regras rígidas onde lutam com outros homens cansados de suas vidas mundanas. Mas sua parceria perfeita é comprometida quando Marla chama a atenção de Tyler.",
      "image": "https://image.tmdb.org/t/p/w342/mCICnh7QBH0gzYaTQChBDDVIKdm.jpg"
    },
    {
      "id": "film-48211",
      "title": "Sacco e Vanzetti",
      "href": "/details/movie/48211",
      "author": "Giuliano Montaldo",
      "year": 1971,
      "sourceRank": 39,
      "description": "Boston, início dos anos 20. Nicola Sacco (Riccardo Cucciolla) e Bartolomeo Vanzetti (Gian Maria Volonté) são dois imigrantes italianos, sendo o primeiro um sapateiro e o outro um peixeiro, que são detidos pela polícia. Ninguém negava que eram anarquistas, na verdade eles mesmo admitiam, pois…",
      "image": "https://image.tmdb.org/t/p/w342/f6TmHh1TGL39saDjCWaPUZhfwYC.jpg"
    },
    {
      "id": "film-87392",
      "title": "Sambizanga",
      "href": "/details/movie/87392",
      "author": "Sarah Maldoror",
      "year": 1973,
      "sourceRank": 40,
      "description": "Angola, 1961. Domingos Xavier, militante anticolonialista e membro do Movimento Popular de Libertação de Angola, é detido pela polícia secreta portuguesa e levado para um local desconhecido. Sua esposa Maria embarca em uma marcha pelo país em busca do marido.",
      "image": "https://image.tmdb.org/t/p/w342/kdJeSJ7lzcxuB7la7gkwpwmIVEQ.jpg"
    },
    {
      "id": "film-17460",
      "title": "A Culpa é do Fidel",
      "href": "/details/movie/17460",
      "author": "Julie Gavras",
      "year": 2006,
      "sourceRank": 41,
      "description": "Uma menina de 9 anos sofre grandes mudanças em sua casa enquanto seus pais se tornam ativistas políticos radicais em 1970-71 em Paris.",
      "image": "https://image.tmdb.org/t/p/w342/nFdYY6crD1xU9SmDMUytumEC2Uu.jpg",
      "aliases": [
        "A Culpa é de Fidel"
      ]
    },
    {
      "id": "film-11040",
      "title": "O Pequeno Grande Homem",
      "href": "/details/movie/11040",
      "author": "Arthur Penn",
      "year": 1970,
      "sourceRank": 42,
      "description": "Jack Crabb, de 121 anos, conta sua vida, desde sua captura pelos Cheyenne aos 10 anos, passando por sua criação, passando por viver com brancos novamente e, por fim, por estar presente na Última Resistência de Custer em Little Bighorn, com muitas aventuras, personagens interessantes, fases da vida…",
      "image": "https://image.tmdb.org/t/p/w342/boGU9wr66y20Lr6z8vQDmaozqgU.jpg"
    },
    {
      "id": "film-51092",
      "title": "Os Companheiros",
      "href": "/details/movie/51092",
      "author": "Mario Monicelli",
      "year": 1963,
      "sourceRank": 43,
      "description": "O professor Sinigaglia (Marcello Mastroianni) é o personagem-título deste drama italiano sombrio e cômico sobre trabalhadores de fábrica maltratados na cidade de Turim. Trabalhando em condições pavorosas em uma fábrica de têxteis, esses funcionários não têm ninguém para defendê-los até Sinigaglia…",
      "image": "https://image.tmdb.org/t/p/w342/2h1xolV3VwbQkOH38kkS9Gx4Qq6.jpg"
    },
    {
      "id": "film-596",
      "title": "As Vinhas da Ira",
      "href": "/details/movie/596",
      "author": "John Ford",
      "year": 1940,
      "sourceRank": 44,
      "description": "Tom, filho mais velho de uma pobre família de trabalhadores rurais, retorna para casa após cumprir pena por homicídio involuntário. Ele planeja levar os parentes até a Califórnia, onde dizem que trabalho não falta. Durante a viagem eles passam por diversos tipos de provações e quando finalmente…",
      "image": "https://image.tmdb.org/t/p/w342/xg2lYQ05OJ0t7pI6ESV8d3zrydU.jpg"
    },
    {
      "id": "film-276",
      "title": "Os Edukadores",
      "href": "/details/movie/276",
      "author": "Hans Weingartner",
      "year": 2004,
      "sourceRank": 45,
      "image": "https://image.tmdb.org/t/p/w342/54EKT1fuuKpE7OQHaN5QRtr9O0l.jpg"
    },
    {
      "id": "film-199889",
      "title": "Cabra-Cega",
      "href": "/details/movie/199889",
      "author": "Toni Venturi",
      "year": 2004,
      "sourceRank": 46,
      "description": "Os anos de chumbo da ditadura norteiam a vida de dois estudantes que vivem o sonho da revolução. Comandante de um grupo de ação, Tiago é ferido em uma emboscada da polícia e precisa se esconder em um apartamento. A militante de base Rosa torna-se, então, sua enfermeira e único contato com o mundo.",
      "image": "https://image.tmdb.org/t/p/w342/q2hKSdxwTlvUQHKDQQY3zdbeSDt.jpg"
    },
    {
      "id": "film-75000",
      "title": "The Black Power Mixtape 1967-1975",
      "href": "/details/movie/75000",
      "author": "Göran Olsson",
      "year": 2011,
      "sourceRank": 47,
      "image": "https://image.tmdb.org/t/p/w342/z3LVY25oZCoJ3kjWylF9Jht4E4T.jpg"
    },
    {
      "id": "film-198518",
      "title": "Atas de Marusia",
      "href": "/details/movie/198518",
      "author": "Miguel Littín",
      "year": 1975,
      "sourceRank": 48,
      "image": "https://image.tmdb.org/t/p/w342/n1fWfhRV8ULKNzVxQ5ZDTbbuNhY.jpg",
      "aliases": [
        "Actas de Marusia"
      ]
    },
    {
      "id": "film-12086",
      "title": "Machuca",
      "href": "/details/movie/12086",
      "author": "Andrés Wood",
      "year": 2004,
      "sourceRank": 49,
      "description": "Em um país dividido, dois jovens de mundos opostos fazem amizade e enfrentam os desafios da adolescência no Chile de 1973.",
      "image": "https://image.tmdb.org/t/p/w342/cqjvviF4N6f2NQNWZjUeAwYUGGM.jpg"
    },
    {
      "id": "film-22074",
      "title": "Capitalismo: Uma História de Amor",
      "href": "/details/movie/22074",
      "author": "Michael Moore",
      "year": 2009,
      "sourceRank": 50,
      "description": "Na sequência do colapso da economia mundial, em 2008, a classe média americana enfrenta atualmente a maior taxa de desemprego dos últimos 26 anos, tendo atingido os dois dígitos (Out/2009). Decidido a encontrar respostas que todos anseiam, Michael Moore entra em ação pedindo explicações ao poder…",
      "image": "https://image.tmdb.org/t/p/w342/h3z5MwNsFcx1vQy2FSxQHEKGq22.jpg"
    }
  ],
  "livros": []
};
