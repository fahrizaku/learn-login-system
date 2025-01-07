"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user data
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4">Welcome, {user.name || user.email}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
            {/* Dashboard content here */}
            <h2 className="text-2xl font-bold mb-4">Your Dashboard</h2>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="mb-4">
                <p className="text-gray-600">Email: {user.email}</p>
                <p className="text-gray-600">
                  Member since: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Add more dashboard content as needed */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-blue-100 p-4 rounded-lg">
                  <h3 className="font-semibold">Statistics</h3>
                  <p>Your activity stats will appear here</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                  <h3 className="font-semibold">Recent Activity</h3>
                  <p>Your recent actions will appear here</p>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg">
                  <h3 className="font-semibold">Notifications</h3>
                  <p>Your notifications will appear here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
