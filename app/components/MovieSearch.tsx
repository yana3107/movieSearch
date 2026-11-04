"use client";

import { useState, useEffect } from "react";
import debounce from "lodash/debounce";

import type { Movie } from "@/lib/tmdb";
import MovieList from "./MovieList";
import { Spin, Alert, Pagination } from "antd";
function MovieSearch() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

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

        if (!response.ok) {
          throw new Error("Failed to fetch movies");
        }

        const data: {
          results: Movie[];
          total_results: number;
        } = await response.json();

        if (!ignore) {
          setMovies(data.results);
          setTotalResults(data.total_results);
        }
      } catch (error) {
        console.error(error);

        if (!ignore) {
          setError("Unable to load movies. Please try again.");
          setMovies([]);
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

  return (
    <div>
      <h1>Movie Search</h1>

      <input
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setCurrentPage(1);
        }}
      />

      {error && (
        <Alert message="Error" description={error} type="error" showIcon />
      )}

      <Spin spinning={loading}>
        {query.trim() && !loading && !error && movies.length === 0 && (
          <p>No movies found.</p>
        )}

        {movies.length > 0 && <MovieList movies={movies} />}
      </Spin>
      {totalResults > 0 && (
        <Pagination
          current={currentPage}
          total={totalResults}
          pageSize={20}
          onChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
}

export default MovieSearch;
