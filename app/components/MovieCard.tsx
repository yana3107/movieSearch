"use client";

import { useState } from "react";
import type { Movie } from "@/lib/tmdb";
import { format, parseISO, isValid } from "date-fns";
import { Alert, Card, Rate, Tag, Spin } from "antd";
import Image from "next/image";
import { truncateText } from "@/lib/utils";
import { useGenres } from "../context/GenreContext";

type MovieCardProps = {
  movie: Movie;
  guestSessionId: string | null;
  userRating?: number;
  onRated: (movie: Movie, rating: number) => void;
};

function getRatingColor(rating: number) {
  if (rating <= 3) return "#E90000";
  if (rating <= 5) return "#E97E00";
  if (rating <= 7) return "#E9D100";

  return "#66E900";
}

export default function MovieCard({
  movie,
  guestSessionId,
  userRating,
  onRated,
}: MovieCardProps) {
  const { genres } = useGenres();

  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState("");

  const releaseDate = movie.release_date ? parseISO(movie.release_date) : null;

  const formattedDate =
    releaseDate && isValid(releaseDate)
      ? format(releaseDate, "MMMM d, yyyy")
      : "Release date unknown";

  async function handleRatingChange(value: number) {
    if (!guestSessionId || value === 0) {
      return;
    }

    const rating = value * 2;

    setRatingLoading(true);
    setRatingError("");

    try {
      const response = await fetch("/api/rate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId: movie.id,
          guestSessionId,
          rating,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.status_message || data.message || "Failed to rate movie",
        );
      }

      onRated(movie, rating);
    } catch (error) {
      setRatingError(
        error instanceof Error ? error.message : "Unable to save rating",
      );
    } finally {
      setRatingLoading(false);
    }
  }

  return (
    <Card className="movie-card" styles={{ body: { padding: 0 } }}>
      <div className="movie-card-content">
        <div className="movie-poster-wrapper">
          {movie.poster_path ? (
            <Image
              className="movie-poster"
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              width={120}
              height={190}
            />
          ) : (
            <div className="movie-poster-placeholder">No poster available</div>
          )}
        </div>

        <div className="movie-info">
          <div className="movie-title-row">
            <h2 className="movie-title">{movie.title}</h2>

            <div
              className="movie-rating-circle"
              style={{
                borderColor: getRatingColor(movie.vote_average),
              }}
              title={`TMDB rating: ${movie.vote_average.toFixed(1)}`}
            >
              {movie.vote_average.toFixed(1)}
            </div>
          </div>

          <p className="movie-date">{formattedDate}</p>

          <div className="movie-genres">
            {movie.genre_ids.map((genreId) => {
              const genre = genres.find((item) => item.id === genreId);

              return genre ? <Tag key={genre.id}>{genre.name}</Tag> : null;
            })}
          </div>

          <p className="movie-description">
            {truncateText(movie.overview, 200)}
          </p>

          <div className="movie-user-rating">
            <span>Your rating:</span>

            <Spin spinning={ratingLoading} size="small">
              <Rate
                allowHalf
                disabled={!guestSessionId || ratingLoading}
                value={userRating ? userRating / 2 : 0}
                onChange={handleRatingChange}
              />
            </Spin>
          </div>

          {ratingError && (
            <Alert
              type="error"
              title="Rating error"
              description={ratingError}
              showIcon
            />
          )}
        </div>
      </div>
    </Card>
  );
}
