import { NextResponse } from "next/server";
import { tmdbFetch } from "@/lib/tmdb";

type GenresResponse = {
  genres: {
    id: number;
    name: string;
  }[];
};

export async function GET() {
  try {
    const data = await tmdbFetch<GenresResponse>(
      "/genre/movie/list?language=en",
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Genres route error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to fetch genres",
      },
      { status: 500 },
    );
  }
}
