import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard | Close Management Tracker",
  description: "Manage your close tasks and track progress",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {session.user?.name || "User"}!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your close tasks and track progress from your dashboard.
          </p>
          
          {/* Dashboard content will be added here */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder for dashboard cards */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">Active Close Cycles</h3>
                <p className="mt-1 text-sm text-gray-500">No active close cycles</p>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">My Tasks</h3>
                <p className="mt-1 text-sm text-gray-500">No tasks assigned</p>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                <p className="mt-1 text-sm text-gray-500">No recent activity</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 