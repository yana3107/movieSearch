import type { Movie } from "@/lib/tmdb";
import MovieCard from "./MovieCard";

type MovieListProps = {
  movies: Movie[];
};

export default function MovieList({ movies }: MovieListProps) {
  if (movies.length === 0) {
    return <p>No movies found.</p>;
  }

  return (
    <div className="movie-list">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
