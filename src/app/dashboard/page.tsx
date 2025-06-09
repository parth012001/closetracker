import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard | Close Management Tracker",
  description: "Manage your close tasks and track progress",
};

async function getDashboardData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get all close cycles
  const closeCycles = await prisma.closeCycle.findMany({
    include: {
      checklists: {
        include: {
          tasks: {
            include: {
              assignedTo: true,
            },
          },
        },
      },
    },
    orderBy: {
      startDate: "desc",
    },
  });

  // Calculate metrics
  const totalTasks = closeCycles.reduce(
    (acc, cycle) =>
      acc + cycle.checklists.reduce((acc, list) => acc + list.tasks.length, 0),
    0
  );

  const completedTasks = closeCycles.reduce(
    (acc, cycle) =>
      acc +
      cycle.checklists.reduce(
        (acc, list) =>
          acc + list.tasks.filter((task) => task.status === "DONE").length,
        0
      ),
    0
  );

  const inProgressTasks = closeCycles.reduce(
    (acc, cycle) =>
      acc +
      cycle.checklists.reduce(
        (acc, list) =>
          acc +
          list.tasks.filter((task) => task.status === "IN_PROGRESS").length,
        0
      ),
    0
  );

  const blockedTasks = closeCycles.reduce(
    (acc, cycle) =>
      acc +
      cycle.checklists.reduce(
        (acc, list) =>
          acc + list.tasks.filter((task) => task.status === "BLOCKED").length,
        0
      ),
    0
  );

  // Get recent activity
  const recentActivity = await prisma.taskStatusChange.findMany({
    take: 5,
    orderBy: {
      changedAt: "desc",
    },
    include: {
      task: {
        include: {
          assignedTo: true,
        },
      },
    },
  });

  // Get tasks assigned to the current user
  const myTasks = await prisma.task.findMany({
    where: {
      assignedToId: session.user.id,
    },
    include: {
      assignedTo: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 5,
  });

  return {
    metrics: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      completionRate: totalTasks ? (completedTasks / totalTasks) * 100 : 0,
    },
    recentActivity,
    myTasks,
    closeCycles,
  };
}

export default async function DashboardPage() {
  const { metrics, recentActivity, myTasks, closeCycles } = await getDashboardData();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with Welcome Message */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="mt-2 text-base text-gray-600">
            Here's what's happening with your close cycles
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.totalTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.completedTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.inProgressTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Blocked</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.blockedTasks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-lg bg-gray-50">
                        <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.task.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Status changed from <span className="font-medium">{activity.fromStatus}</span> to <span className="font-medium">{activity.toStatus}</span>
                      </p>
                      {activity.comment && (
                        <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {activity.comment}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-400">
                        {format(new Date(activity.changedAt), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* My Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">My Tasks</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {myTasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-lg ${
                        task.status === "DONE" ? "bg-emerald-50" :
                        task.status === "IN_PROGRESS" ? "bg-amber-50" :
                        task.status === "BLOCKED" ? "bg-rose-50" :
                        "bg-gray-50"
                      }`}>
                        <svg className={`h-5 w-5 ${
                          task.status === "DONE" ? "text-emerald-600" :
                          task.status === "IN_PROGRESS" ? "text-amber-600" :
                          task.status === "BLOCKED" ? "text-rose-600" :
                          "text-gray-600"
                        }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {task.title}
                      </p>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.status === "DONE" ? "bg-emerald-100 text-emerald-800" :
                          task.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-800" :
                          task.status === "BLOCKED" ? "bg-rose-100 text-rose-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {task.status.replace("_", " ")}
                        </span>
                        <span className="text-xs text-gray-400">
                          Updated {format(new Date(task.updatedAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Active Close Cycles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Active Close Cycles</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {closeCycles.map((cycle) => {
                  const totalTasks = cycle.checklists.reduce(
                    (acc, list) => acc + list.tasks.length,
                    0
                  );
                  const completedTasks = cycle.checklists.reduce(
                    (acc, list) =>
                      acc + list.tasks.filter((task) => task.status === "DONE").length,
                    0
                  );
                  const progress = totalTasks ? (completedTasks / totalTasks) * 100 : 0;

                  return (
                    <tr key={cycle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/close-cycles/${cycle.id}`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                        >
                          {cycle.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(cycle.startDate), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(cycle.endDate), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          cycle.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" :
                          cycle.status === "COMPLETED" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {cycle.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 