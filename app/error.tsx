"use client";

import { Alert } from "antd";
import { useEffect, useState } from "react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateOnlineStatus();

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  return (
    <main>
      <h1>Movie Search</h1>

      <Alert
        message={
          isOnline === false ? "No internet connection" : "Something went wrong"
        }
        description={
          isOnline === false
            ? "Please check your internet."
            : "Unable to load movies. Please try again."
        }
        type="error"
        showIcon
      />

      <button onClick={() => reset()}>Try again</button>
    </main>
  );
}
