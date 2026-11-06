import { NextRequest, NextResponse } from "next/server";
import { tmdbFetch } from "@/lib/tmdb";

type RatingResponse = {
  success: boolean;
  status_code: number;
  status_message?: string;
};

export async function POST(request: NextRequest) {
  try {
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

    const params = new URLSearchParams({
      guest_session_id: guestSessionId,
    });

    const data = await tmdbFetch<RatingResponse>(
      `/movie/${encodeURIComponent(String(movieId))}/rating?${params}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: rating }),
      },
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Rate movie route error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to rate movie",
      },
      { status: 500 },
    );
  }
}
