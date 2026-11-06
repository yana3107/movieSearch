import { NextResponse } from "next/server";
import { tmdbFetch } from "@/lib/tmdb";

type GuestSessionResponse = {
  success: boolean;
  guest_session_id: string;
  expires_at: string;
};

export async function GET() {
  try {
    const data = await tmdbFetch<GuestSessionResponse>(
      "/authentication/guest_session/new",
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Guest session route error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create guest session",
      },
      { status: 500 },
    );
  }
}
