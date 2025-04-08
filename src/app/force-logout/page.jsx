"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ForceLogout() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Clear the cookie by setting it to empty with past expiration
        document.cookie =
          "user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Also try the API route as backup
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
          });
        } catch (e) {
          // Ignore errors from the API call
          console.log("API logout failed, but cookie was cleared manually");
        }

        // Redirect to login
        router.push("/login");
      } catch (error) {
        console.error("Error during force logout:", error);
      }
    };

    handleLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Logging you out...</h1>
      <p>
        If you are not redirected,{" "}
        <button
          onClick={() => {
            document.cookie =
              "user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = "/login";
          }}
          className="text-blue-500 underline"
        >
          click here
        </button>
      </p>
    </div>
  );
}
