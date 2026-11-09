export type Movie = {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  genre_ids: number[];
};

export type MoviesResponse = {
  results: Movie[];
  page: number;
  total_pages: number;
  total_results: number;
};

export class TMDBError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "TMDBError";
    this.status = status;
  }
}

export async function tmdbFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;

  if (!token) {
    throw new Error("TMDB token is missing");
  }

  const response = await fetch(`https://api.themoviedb.org/3${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new TMDBError(
      data.status_message || "Failed to fetch data from TMDB",
      response.status,
    );
  }

  return data as T;
}

export async function getMovies(
  query: string,
  page: number,
): Promise<MoviesResponse> {
  const searchParams = new URLSearchParams({
    query,
    include_adult: "false",
    language: "en-US",
    page: String(page),
  });

  return tmdbFetch<MoviesResponse>(`/search/movie?${searchParams.toString()}`);
}
