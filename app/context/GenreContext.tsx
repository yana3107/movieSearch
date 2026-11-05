"use client";

import { createContext, useContext, useEffect, useState } from "react";

import type { ReactNode } from "react";

export type Genre = {
  id: number;
  name: string;
};

type GenreContextType = {
  genres: Genre[];
};

const GenreContext = createContext<GenreContextType | null>(null);

export function GenreProvider({ children }: { children: ReactNode }) {
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    async function fetchGenres() {
      try {
        const response = await fetch("/api/genres");

        if (!response.ok) {
          throw new Error("Failed to fetch genres");
        }

        const data: { genres: Genre[] } = await response.json();

        setGenres(data.genres);
      } catch (error) {
        console.error("Genres error:", error);
      }
    }

    fetchGenres();
  }, []);

  return (
    <GenreContext.Provider value={{ genres }}>{children}</GenreContext.Provider>
  );
}

export function useGenres() {
  const context = useContext(GenreContext);

  if (!context) {
    throw new Error("useGenres must be used within GenreProvider");
  }

  return context;
}
