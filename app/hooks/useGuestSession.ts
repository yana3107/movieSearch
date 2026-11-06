"use client";

import { useEffect, useState } from "react";

type GuestSessionResponse = {
  success: boolean;
  guest_session_id: string;
  expires_at: string;
};

type ApiError = {
  message?: string;
  status_message?: string;
};

export function useGuestSession() {
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function createGuestSession() {
      try {
        const savedSessionId = sessionStorage.getItem("guest_session_id");

        if (savedSessionId) {
          if (!ignore) {
            setGuestSessionId(savedSessionId);
          }

          return;
        }

        const response = await fetch("/api/guest-session");

        const data: GuestSessionResponse | ApiError = await response.json();

        if (!response.ok) {
          throw new Error(
            ("message" in data && data.message) ||
              "Failed to create guest session",
          );
        }

        if (!("guest_session_id" in data) || !data.guest_session_id) {
          throw new Error("Guest session ID is missing");
        }

        if (!ignore) {
          sessionStorage.setItem("guest_session_id", data.guest_session_id);

          setGuestSessionId(data.guest_session_id);
        }
      } catch (error) {
        console.error("Guest session error:", error);
      }
    }

    createGuestSession();

    return () => {
      ignore = true;
    };
  }, []);

  return { guestSessionId };
}
