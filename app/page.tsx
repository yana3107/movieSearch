import { getMovies } from "@/lib/tmdb";
import MovieList from "./components/MovieList";

export default async function Home() {
  const movies = await getMovies();

  return (
    <main>
      <h1>Movie Search</h1>

      <MovieList movies={movies} />
    </main>
  );
}
