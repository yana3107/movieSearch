"use client";

import type { Movie } from "@/lib/tmdb";
import MovieCard from "./MovieCard";

type MovieListProps = {
  movies: Movie[];
  guestSessionId: string | null;
  userRatings: Record<number, number>;
  onRated: (movie: Movie, rating: number) => void;
};

export default function MovieList({
  movies,
  guestSessionId,
  userRatings,
  onRated,
}: MovieListProps) {
  return (
    <div className="movie-list">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          guestSessionId={guestSessionId}
          userRating={userRatings[movie.id]}
          onRated={onRated}
        />
      ))}
    </div>
  );
}
