import { NextRequest, NextResponse } from "next/server";
import { getMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const query = searchParams.get("query") || "";
    const page = Number(searchParams.get("page")) || 1;

    const data = await getMovies(query, page);

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch movies" },
      { status: 500 },
    );
  }
}
