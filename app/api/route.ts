import { NextRequest, NextResponse } from "next/server";
import { getMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const query = searchParams.get("query") || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    const data = await getMovies(query, page);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Movies route error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to fetch movies",
      },
      { status: 500 },
    );
  }
}
