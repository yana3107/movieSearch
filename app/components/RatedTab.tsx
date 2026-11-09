"use client";

import { Alert, Pagination, Spin } from "antd";

import type { Movie } from "@/lib/tmdb";
import type { RatedMovie } from "../hooks/useRatedMovies";
import MovieList from "./MovieList";

type RatedTabProps = {
  ratedMovies: RatedMovie[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalResults: number;
  guestSessionId: string | null;
  userRatings: Record<number, number>;
  onRated: (movie: Movie, rating: number) => void;
};

function RatedTab({
  ratedMovies,
  loading,
  error,
  currentPage,
  setCurrentPage,
  totalResults,
  guestSessionId,
  userRatings,
  onRated,
}: RatedTabProps) {
  return (
    <>
      {error && (
        <Alert title="Error" description={error} type="error" showIcon />
      )}

      <Spin spinning={loading}>
        {!loading && !error && ratedMovies.length === 0 && (
          <p>No rated movies yet.</p>
        )}

        {ratedMovies.length > 0 && (
          <MovieList
            movies={ratedMovies}
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

export default RatedTab;
