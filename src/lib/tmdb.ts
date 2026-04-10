const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmZWJiMzZlNzExNDg5MDlhMjNlY2JlNjVkNDViNDVlNyIsIm5iZiI6MTc2OTMwNzE2Mi4yMzgwMDAyLCJzdWIiOiI2OTc1N2MxYTg1ZjcxMzkwZGVhYjk4YmMiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.cniUwAMQXyJ5dsmGYNEEUSmqbGVCan1Q38j1Wj7TdXY";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

export const getImageUrl = (path: string | null, size = "w500") =>
  path ? `${IMG_BASE}/${size}${path}` : "/placeholder.svg";

export const getBackdropUrl = (path: string | null) =>
  path ? `${IMG_BASE}/original${path}` : null;

export const formatDisplayedRating = (voteAverage?: number) =>
  voteAverage && voteAverage > 0 ? voteAverage.toFixed(1) : "N/D";

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("language", "pt-BR");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { headers });
  if (!res.ok) throw new Error(`TMDB Error: ${res.status}`);
  return res.json();
}

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type?: string;
}

export interface TMDBResponse {
  results: Movie[];
  page: number;
  total_pages: number;
}

export interface PersonSummary {
  id: number;
  name: string;
}

export interface Company {
  id: number;
  name: string;
  logo_path?: string | null;
  origin_country?: string;
}

export interface Country {
  iso_3166_1: string;
  name: string;
}

export interface Language {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
  order?: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job?: string;
  department?: string;
  profile_path?: string | null;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime?: number;
  episode_run_time?: number[];
  status?: string;
  original_title?: string;
  original_name?: string;
  original_language?: string;
  homepage?: string;
  vote_count?: number;
  budget?: number;
  revenue?: number;
  created_by?: PersonSummary[];
  production_companies?: Company[];
  production_countries?: Country[];
  spoken_languages?: Language[];
  networks?: Company[];
  credits?: Credits;
  number_of_seasons?: number;
  seasons?: { season_number: number; episode_count: number; name: string }[];
  imdb_id?: string;
  external_ids?: { imdb_id?: string };
  tagline?: string;
  first_air_date?: string;
  last_air_date?: string;
  origin_country?: string[];
}

export interface Season {
  episodes: Episode[];
  season_number: number;
  name: string;
}

export interface Episode {
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  runtime: number | null;
}

export const getTrending = (page = 1) => fetchTMDB<TMDBResponse>("/trending/all/week", { page: String(page) });

export const getPopularMovies = (page = 1) => fetchTMDB<TMDBResponse>("/movie/popular", { page: String(page) });
export const getTopRatedMovies = (page = 1) => fetchTMDB<TMDBResponse>("/movie/top_rated", { page: String(page) });
export const getNowPlayingMovies = (page = 1) => fetchTMDB<TMDBResponse>("/movie/now_playing", { page: String(page) });
export const getUpcomingMovies = (page = 1) => fetchTMDB<TMDBResponse>("/movie/upcoming", { page: String(page) });

export const getPopularTV = (page = 1) => fetchTMDB<TMDBResponse>("/tv/popular", { page: String(page) });
export const getTopRatedTV = (page = 1) => fetchTMDB<TMDBResponse>("/tv/top_rated", { page: String(page) });

export const getMovieDetails = (id: number) =>
  fetchTMDB<MovieDetails>(`/movie/${id}`, { append_to_response: "external_ids,credits" });

export const getTVDetails = (id: number) =>
  fetchTMDB<MovieDetails>(`/tv/${id}`, { append_to_response: "external_ids,credits" });

export const getTVSeason = (tvId: number, seasonNumber: number) =>
  fetchTMDB<Season>(`/tv/${tvId}/season/${seasonNumber}`);

export const getIMDbUrl = (imdbId?: string | null) =>
  imdbId ? `https://www.imdb.com/title/${imdbId}/` : null;

export const searchMulti = (query: string) =>
  fetchTMDB<TMDBResponse>("/search/multi", { query });

export const getMoviesByGenre = (genreId: number, page = 1) =>
  fetchTMDB<TMDBResponse>("/discover/movie", { with_genres: String(genreId), page: String(page) });

export const getTVByGenre = (genreId: number, page = 1) =>
  fetchTMDB<TMDBResponse>("/discover/tv", { with_genres: String(genreId), page: String(page) });

export const MOVIE_GENRES: { id: number; name: string }[] = [
  { id: 28, name: "Ação" },
  { id: 12, name: "Aventura" },
  { id: 16, name: "Animação" },
  { id: 35, name: "Comédia" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 14, name: "Fantasia" },
  { id: 27, name: "Terror" },
  { id: 9648, name: "Mistério" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Ficção Científica" },
  { id: 53, name: "Suspense" },
];

export const TV_GENRES: { id: number; name: string }[] = [
  { id: 10759, name: "Ação & Aventura" },
  { id: 16, name: "Animação" },
  { id: 35, name: "Comédia" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentário" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Família" },
  { id: 9648, name: "Mistério" },
  { id: 10765, name: "Sci-Fi & Fantasia" },
  { id: 10766, name: "Novela" },
];
