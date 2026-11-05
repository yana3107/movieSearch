import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const token = process.env.TMDB_READ_ACCESS_TOKEN;

    if (!token) {
      throw new Error("TMDB token is missing");
    }

    const body = await request.json();

    const { movieId, guestSessionId, rating } = body;

    if (!movieId || !guestSessionId || typeof rating !== "number") {
      return NextResponse.json(
        { message: "Movie ID, guest session ID and rating are required" },
        { status: 400 },
      );
    }

    if (rating < 0.5 || rating > 10 || rating * 2 !== Math.round(rating * 2)) {
      return NextResponse.json(
        { message: "Rating must be between 0.5 and 10 in 0.5 increments" },
        { status: 400 },
      );
    }

    const url = new URL(
      `https://api.themoviedb.org/3/movie/${encodeURIComponent(String(movieId))}/rating`,
    );

    url.searchParams.set("guest_session_id", guestSessionId);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value: rating }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("TMDB rating error:", data);

      return NextResponse.json(data, {
        status: response.status,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Rate movie route error:", error);

    return NextResponse.json(
      { message: "Failed to rate movie" },
      { status: 500 },
    );
  }
}
