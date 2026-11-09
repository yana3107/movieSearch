"use client";

import { Alert, Input, Pagination, Spin } from "antd";

import type { Movie } from "@/lib/tmdb";
import MovieList from "./MovieList";

type SearchTabProps = {
  query: string;
  setQuery: (value: string) => void;
  movies: Movie[];
  loading: boolean;
  error: string;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalResults: number;
  guestSessionId: string | null;
  userRatings: Record<number, number>;
  onRated: (movie: Movie, rating: number) => void;
};

function SearchTab({
  query,
  setQuery,
  movies,
  loading,
  error,
  currentPage,
  setCurrentPage,
  totalResults,
  guestSessionId,
  userRatings,
  onRated,
}: SearchTabProps) {
  return (
    <>
      <Input
        placeholder="Search movies..."
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setCurrentPage(1);
        }}
      />

      {error && (
        <Alert title="Error" description={error} type="error" showIcon />
      )}

      <Spin spinning={loading}>
        {query.trim() && !loading && !error && movies.length === 0 && (
          <p>No movies found.</p>
        )}

        {movies.length > 0 && (
          <MovieList
            movies={movies}
            guestSessionId={guestSessionId}
            userRatings={userRatings}
            onRated={onRated}
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
  );
}

export default SearchTab;
