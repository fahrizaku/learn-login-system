// src/app/login/page.jsx

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          phone: formData.get("phone"),
          password: formData.get("password"),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.verificationNeeded) {
          setPendingVerification(true);
          if (data.code) setVerificationCode(data.code); // For development only
          return;
        }
        throw new Error(data.error);
      }

      router.push(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6">Login</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {pendingVerification && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Your account is pending verification. Please contact an
            administrator.
            {verificationCode && (
              <div className="mt-2">
                <p className="text-xs">
                  Development Note: Your verification code is:
                </p>
                <p className="text-center font-bold">{verificationCode}</p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="phone">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="+1234567890"
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
