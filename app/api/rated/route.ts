import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = process.env.TMDB_READ_ACCESS_TOKEN;

    if (!token) {
      throw new Error("TMDB token is missing");
    }

    const searchParams = request.nextUrl.searchParams;
    const guestSessionId = searchParams.get("guest_session_id");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    if (!guestSessionId) {
      return NextResponse.json(
        { message: "Guest session ID is required" },
        { status: 400 },
      );
    }

    const url = new URL(
      `https://api.themoviedb.org/3/guest_session/${encodeURIComponent(guestSessionId)}/rated/movies`,
    );

    url.searchParams.set("language", "en-US");
    url.searchParams.set("page", String(page));
    url.searchParams.set("sort_by", "created_at.desc");

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Rated HTTP status:", response.status);
      console.error("Rated TMDB response:", data);

      return NextResponse.json(data, {
        status: response.status,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Rated movies route error:", error);

    return NextResponse.json(
      { message: "Failed to fetch rated movies" },
      { status: 500 },
    );
  }
}
