import { NextRequest, NextResponse } from "next/server";
import { tmdbFetch } from "@/lib/tmdb";

type RatedMovie = {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  genre_ids: number[];
  rating: number;
};

type RatedMoviesResponse = {
  results: RatedMovie[];
  page: number;
  total_pages: number;
  total_results: number;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const guestSessionId = searchParams.get("guest_session_id");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    if (!guestSessionId) {
      return NextResponse.json(
        { message: "Guest session ID is required" },
        { status: 400 },
      );
    }

    const params = new URLSearchParams({
      language: "en-US",
      page: String(page),
      sort_by: "created_at.desc",
    });

    const data = await tmdbFetch<RatedMoviesResponse>(
      `/guest_session/${encodeURIComponent(guestSessionId)}/rated/movies?${params}`,
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Rated movies route error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch rated movies",
      },
      { status: 500 },
    );
  }
}
