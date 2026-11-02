export type Movie = {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  genre_ids: number[];
};

type MoviesResponse = {
  results: Movie[];
};

export async function getMovies(): Promise<Movie[]> {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;

  if (!token) {
    throw new Error("TMDB token is missing");
  }

  const response = await fetch(
    "https://api.themoviedb.org/3/search/movie?query=return&include_adult=false&language=en-US&page=1",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch movies from TMDB");
  }

  const data: MoviesResponse = await response.json();

  return data.results;
}
