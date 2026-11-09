"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Movie } from "@/lib/tmdb";

export type RatedMovie = Movie & {
  rating: number;
};

type RatedMoviesResponse = {
  results: RatedMovie[];
  total_results: number;
  total_pages: number;
};

type ApiError = {
  message?: string;
  status_message?: string;
};

const PAGE_SIZE = 20;

export function useRatedMovies(
  guestSessionId: string | null,
  enabled: boolean,
) {
  const [allRatedMovies, setAllRatedMovies] = useState<RatedMovie[]>([]);
  const [userRatings, setUserRatings] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (!guestSessionId || !enabled) {
      return;
    }

    const sessionId = guestSessionId;
    let ignore = false;

    async function fetchRatedMovies() {
      try {
        setLoading(true);
        setError(null);

        const firstResponse = await fetch(
          `/api/rated?guest_session_id=${encodeURIComponent(sessionId)}&page=1`,
        );

        const firstData: RatedMoviesResponse | ApiError =
          await firstResponse.json();

        if (!firstResponse.ok) {
          throw new Error(
            ("message" in firstData && firstData.message) ||
              ("status_message" in firstData && firstData.status_message) ||
              "Failed to fetch rated movies",
          );
        }

        if (!("results" in firstData)) {
          throw new Error("Invalid rated movies response");
        }

        const allPages: RatedMovie[][] = [firstData.results];

        for (
          let startPage = 2;
          startPage <= firstData.total_pages;
          startPage += 5
        ) {
          const pageNumbers = Array.from(
            {
              length: Math.min(5, firstData.total_pages - startPage + 1),
            },
            (_, index) => startPage + index,
          );

          const pageResults = await Promise.all(
            pageNumbers.map(async (page) => {
              const response = await fetch(
                `/api/rated?guest_session_id=${encodeURIComponent(sessionId)}&page=${page}`,
              );

              const data: RatedMoviesResponse | ApiError =
                await response.json();

              if (!response.ok || !("results" in data)) {
                throw new Error(
                  ("message" in data && data.message) ||
                    ("status_message" in data && data.status_message) ||
                    "Failed to fetch rated movies",
                );
              }

              return data.results;
            }),
          );

          allPages.push(...pageResults);
        }

        if (ignore) {
          return;
        }

        const movies = allPages.flat();

        const ratings: Record<number, number> = {};

        movies.forEach((movie) => {
          ratings[movie.id] = movie.rating;
        });

        setAllRatedMovies(movies);
        setUserRatings(ratings);
        setTotalResults(firstData.total_results);
        setCurrentPage(1);
      } catch (error) {
        if (!ignore) {
          setError(
            error instanceof Error ? error.message : "Something went wrong",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchRatedMovies();

    return () => {
      ignore = true;
    };
  }, [guestSessionId, enabled]);

  const ratedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return allRatedMovies.slice(startIndex, startIndex + PAGE_SIZE);
  }, [allRatedMovies, currentPage]);

  const updateUserRating = useCallback(
    (movie: Movie, rating: number) => {
      setUserRatings((previousRatings) => ({
        ...previousRatings,
        [movie.id]: rating,
      }));

      const movieExists = allRatedMovies.some((item) => item.id === movie.id);

      const updatedMovie: RatedMovie = {
        ...movie,
        rating,
      };

      setAllRatedMovies((previousMovies) => {
        if (movieExists) {
          return previousMovies.map((item) =>
            item.id === movie.id ? updatedMovie : item,
          );
        }

        return [updatedMovie, ...previousMovies];
      });

      if (!movieExists) {
        setTotalResults((previousTotal) => previousTotal + 1);
      }

      setCurrentPage(1);
    },
    [allRatedMovies],
  );

  return {
    ratedMovies,
    userRatings,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalResults,
    updateUserRating,
  };
}
