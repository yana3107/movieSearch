import type { Movie } from "@/lib/tmdb";
import { format, parseISO, isValid } from "date-fns";
import { Card, Tag } from "antd";
import { truncateText } from "@/lib/utils";
import Image from "next/image";
type MovieCardProps = {
  movie: Movie;
};

export default function MovieCard({ movie }: MovieCardProps) {
  const releaseDate = movie.release_date ? parseISO(movie.release_date) : null;

  const formattedDate =
    releaseDate && isValid(releaseDate)
      ? format(releaseDate, "MMMM d, yyyy")
      : "Release date unknown";

  return (
    <Card className="movie-card" styles={{ body: { padding: 0 } }}>
      <div className="movie-card-content">
        {movie.poster_path && (
          <Image
            className="movie-poster"
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            width={120}
            height={190}
          />
        )}

        <div className="movie-info">
          <h2 className="movie-title">{movie.title}</h2>

          <p className="movie-date">{formattedDate}</p>

          <div className="movie-genres">
            <Tag>Action</Tag>
            <Tag>Adventure</Tag>
            <Tag>Drama</Tag>
          </div>

          <p className="movie-description">
            {truncateText(movie.overview, 200)}
          </p>
        </div>
      </div>
    </Card>
  );
}
