// src/app/register/page.jsx

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1); // Step 1: Register, Step 2: Verify
  const [userId, setUserId] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.target);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          phone: formData.get("phone"),
          password: formData.get("password"),
          name: formData.get("name"),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      if (data.needVerification) {
        setMessage(data.message);
        setUserId(data.userId);
        setStep(2); // Move to verification step
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({
          userId: userId,
          code: verificationCode,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      if (data.success) {
        setMessage("Account verified successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        {step === 1 ? (
          <>
            <h1 className="text-2xl font-bold mb-6">Register</h1>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>

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
                Register
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6">Verify Your Phone</h1>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                {message}
              </div>
            )}

            <form onSubmit={handleVerify}>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="code">
                  Enter 4-digit Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="1234"
                  maxLength={4}
                  required
                  className="w-full p-2 border rounded text-center text-2xl tracking-widest"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Please enter the verification code sent to your WhatsApp
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Verify
              </button>

              <button
                type="button"
                onClick={() => router.push("/register")}
                className="w-full mt-2 bg-gray-200 text-gray-800 p-2 rounded hover:bg-gray-300"
              >
                Start Over
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
