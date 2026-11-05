import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = process.env.TMDB_READ_ACCESS_TOKEN;

    if (!token) {
      throw new Error("TMDB token is missing");
    }

    const response = await fetch(
      "https://api.themoviedb.org/3/genre/movie/list?language=en",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json",
        },
        cache: "no-store",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("TMDB genres error:", data);

      return NextResponse.json(data, {
        status: response.status,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Genres route error:", error);

    return NextResponse.json(
      { message: "Failed to fetch genres" },
      { status: 500 },
    );
  }
}
