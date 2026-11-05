"use client";

import { useState, useEffect } from "react";
import debounce from "lodash/debounce";
import { Alert, Input, Pagination, Spin, Tabs } from "antd";

import type { Movie } from "@/lib/tmdb";
import MovieList from "./MovieList";

type RatedMovie = Movie & {
  rating: number;
};

type MoviesResponse = {
  results: Movie[];
  total_results: number;
};

type RatedMoviesResponse = {
  results: RatedMovie[];
  total_results: number;
};

type GuestSessionResponse = {
  success: boolean;
  guest_session_id: string;
  expires_at: string;
};

type ApiError = {
  message?: string;
  status_message?: string;
};

function MovieSearch() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("search");

  const [ratedMovies, setRatedMovies] = useState<RatedMovie[]>([]);
  const [ratedLoading, setRatedLoading] = useState(false);
  const [ratedError, setRatedError] = useState("");
  const [ratedCurrentPage, setRatedCurrentPage] = useState(1);
  const [ratedTotalResults, setRatedTotalResults] = useState(0);

  const [userRatings, setUserRatings] = useState<Record<number, number>>({});
  const [ratingsVersion, setRatingsVersion] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function createGuestSession() {
      try {
        const savedSessionId = sessionStorage.getItem("guest_session_id");

        if (savedSessionId) {
          if (!ignore) {
            setGuestSessionId(savedSessionId);
          }

          return;
        }

        const response = await fetch("/api/guest-session");
        const data: GuestSessionResponse | ApiError = await response.json();

        if (!response.ok) {
          throw new Error(
            ("message" in data && data.message) ||
              "Failed to create guest session",
          );
        }

        if (!("guest_session_id" in data) || !data.guest_session_id) {
          throw new Error("Guest session ID is missing");
        }

        if (!ignore) {
          sessionStorage.setItem("guest_session_id", data.guest_session_id);
          setGuestSessionId(data.guest_session_id);
        }
      } catch (error) {
        console.error("Guest session error:", error);
      }
    }

    createGuestSession();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    if (!query.trim()) {
      return;
    }

    const debouncedSearch = debounce(async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api?query=${encodeURIComponent(query)}&page=${currentPage}`,
        );

        const data: MoviesResponse | ApiError = await response.json();

        if (!response.ok) {
          throw new Error(
            ("message" in data && data.message) || "Failed to fetch movies",
          );
        }

        if (!ignore && "results" in data) {
          setMovies(data.results);
          setTotalResults(data.total_results);
        }
      } catch (error) {
        if (!ignore) {
          setError(
            error instanceof Error ? error.message : "Unable to load movies",
          );

          setMovies([]);
          setTotalResults(0);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }, 500);

    debouncedSearch();

    return () => {
      ignore = true;
      debouncedSearch.cancel();
    };
  }, [query, currentPage]);

  useEffect(() => {
    if (!guestSessionId) {
      return;
    }

    let ignore = false;

    async function fetchRatedMovies() {
      if (!guestSessionId) {
        return;
      }

      if (activeTab === "rated") {
        setRatedLoading(true);
      }

      setRatedError("");

      try {
        const response = await fetch(
          `/api/rated?guest_session_id=${encodeURIComponent(guestSessionId)}&page=${ratedCurrentPage}`,
        );

        const data: RatedMoviesResponse | ApiError = await response.json();

        if (!response.ok) {
          throw new Error(
            ("status_message" in data && data.status_message) ||
              ("message" in data && data.message) ||
              "Failed to fetch rated movies",
          );
        }

        if (!ignore && "results" in data) {
          setRatedMovies(data.results);
          setRatedTotalResults(data.total_results);

          setUserRatings((previousRatings) => {
            const updatedRatings = { ...previousRatings };

            data.results.forEach((movie) => {
              updatedRatings[movie.id] = movie.rating;
            });

            return updatedRatings;
          });
        }
      } catch (error) {
        if (!ignore) {
          console.error("Rated movies error:", error);

          setRatedError(
            error instanceof Error
              ? error.message
              : "Unable to load rated movies",
          );

          setRatedMovies([]);
          setRatedTotalResults(0);
        }
      } finally {
        if (!ignore && activeTab === "rated") {
          setRatedLoading(false);
        }
      }
    }

    fetchRatedMovies();

    return () => {
      ignore = true;
    };
  }, [guestSessionId, activeTab, ratedCurrentPage, ratingsVersion]);

  function handleRated(movieId: number, rating: number) {
    setUserRatings((previousRatings) => ({
      ...previousRatings,
      [movieId]: rating,
    }));

    setRatingsVersion((version) => version + 1);
  }

  return (
    <div>
      <h1>Movie Search</h1>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);

          if (key === "rated") {
            setRatedCurrentPage(1);
          }
        }}
        items={[
          {
            key: "search",
            label: "Search",
            children: (
              <>
                <Input
                  placeholder="Search movies..."
                  value={query}
                  onChange={(event) => {
                    const value = event.target.value;

                    setQuery(value);
                    setCurrentPage(1);

                    if (!value.trim()) {
                      setMovies([]);
                      setTotalResults(0);
                      setError("");
                    }
                  }}
                />

                {error && (
                  <Alert
                    title="Error"
                    description={error}
                    type="error"
                    showIcon
                  />
                )}

                <Spin spinning={loading}>
                  {query.trim() &&
                    !loading &&
                    !error &&
                    movies.length === 0 && <p>No movies found.</p>}

                  {movies.length > 0 && (
                    <MovieList
                      movies={movies}
                      guestSessionId={guestSessionId}
                      userRatings={userRatings}
                      onRated={handleRated}
                    />
                  )}
                </Spin>

                {totalResults > 0 && (
                  <Pagination
                    current={currentPage}
                    total={totalResults}
                    pageSize={20}
                    onChange={setCurrentPage}
                  />
                )}
              </>
            ),
          },
          {
            key: "rated",
            label: "Rated",
            children: (
              <>
                {ratedError && (
                  <Alert
                    title="Error"
                    description={ratedError}
                    type="error"
                    showIcon
                  />
                )}

                <Spin spinning={ratedLoading}>
                  {!ratedLoading && !ratedError && ratedMovies.length === 0 && (
                    <p>No rated movies yet.</p>
                  )}

                  {ratedMovies.length > 0 && (
                    <MovieList
                      movies={ratedMovies}
                      guestSessionId={guestSessionId}
                      userRatings={userRatings}
                      onRated={handleRated}
                    />
                  )}
                </Spin>

                {ratedTotalResults > 0 && (
                  <Pagination
                    current={ratedCurrentPage}
                    total={ratedTotalResults}
                    pageSize={20}
                    onChange={setRatedCurrentPage}
                  />
                )}
              </>
            ),
          },
        ]}
      />
    </div>
  );
}

export default MovieSearch;
