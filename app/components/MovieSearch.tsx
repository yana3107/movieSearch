"use client";

import { useState, useEffect } from "react";
import debounce from "lodash/debounce";
import { Tabs } from "antd";

import type { Movie } from "@/lib/tmdb";
import { useGuestSession } from "../hooks/useGuestSession";
import { useRatedMovies } from "../hooks/useRatedMovies";
import SearchTab from "./SearchTab";
import RatedTab from "./RatedTab";

type MoviesResponse = {
  results: Movie[];
  total_results: number;
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

  const { guestSessionId } = useGuestSession();

  const [activeTab, setActiveTab] = useState("search");

  const {
    ratedMovies,
    userRatings,
    loading: ratedLoading,
    error: ratedError,
    currentPage: ratedCurrentPage,
    setCurrentPage: setRatedCurrentPage,
    totalResults: ratedTotalResults,
    updateUserRating,
  } = useRatedMovies(guestSessionId, activeTab === "rated");

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

  function handleQueryChange(value: string) {
    setQuery(value);

    if (!value.trim()) {
      setMovies([]);
      setTotalResults(0);
      setError("");
      setLoading(false);
    }
  }

  function handleRated(movie: Movie, rating: number) {
    updateUserRating(movie, rating);
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
              <SearchTab
                query={query}
                setQuery={handleQueryChange}
                movies={movies}
                loading={loading}
                error={error}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalResults={totalResults}
                guestSessionId={guestSessionId}
                userRatings={userRatings}
                onRated={handleRated}
              />
            ),
          },
          {
            key: "rated",
            label: "Rated",
            children: (
              <RatedTab
                ratedMovies={ratedMovies}
                loading={ratedLoading}
                error={ratedError}
                currentPage={ratedCurrentPage}
                setCurrentPage={setRatedCurrentPage}
                totalResults={ratedTotalResults}
                guestSessionId={guestSessionId}
                userRatings={userRatings}
                onRated={handleRated}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

export default MovieSearch;
