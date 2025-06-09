import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import TaskCard from "./task-card";
import StatusSelector from "./status-selector";

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>Progress</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default async function CloseCycleDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    notFound();
  }

  const closeCycle = await prisma.closeCycle.findUnique({
    where: { id: params.id },
    include: {
      checklists: {
        include: {
          tasks: {
            include: {
              comments: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      role: true,
                    },
                  },
                },
                orderBy: {
                  createdAt: "desc",
                },
              },
              assignedTo: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!closeCycle) {
    notFound();
  }

  // Group tasks by assigned user
  const tasksByAssignee = closeCycle.checklists.reduce((acc, checklist) => {
    checklist.tasks.forEach((task) => {
      const assigneeId = task.assignedTo.id;
      if (!acc[assigneeId]) {
        acc[assigneeId] = {
          user: task.assignedTo,
          tasks: [],
        };
      }
      acc[assigneeId].tasks.push(task);
    });
    return acc;
  }, {} as Record<string, { user: typeof closeCycle.checklists[0]["tasks"][0]["assignedTo"]; tasks: typeof closeCycle.checklists[0]["tasks"] }>);

  // Sort assignees by name, handling null names
  const sortedAssignees = Object.values(tasksByAssignee).sort((a, b) => {
    const nameA = a.user.name || "Unnamed User";
    const nameB = b.user.name || "Unnamed User";
    return nameA.localeCompare(nameB);
  });

  // Calculate overall progress
  const allTasks = sortedAssignees.flatMap(({ tasks }) => tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(task => task.status === "DONE").length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold mb-4">{closeCycle.name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium">{format(new Date(closeCycle.startDate), "MMM d, yyyy")}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="font-medium">{format(new Date(closeCycle.endDate), "MMM d, yyyy")}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <StatusSelector initialStatus={closeCycle.status} closeCycleId={closeCycle.id} />
            </div>
          </div>
          {closeCycle.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Description</p>
              <p className="mt-1">{closeCycle.description}</p>
            </div>
          )}
        </div>

        {/* Overall Progress Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Overall Progress</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {completedTasks} of {totalTasks} tasks completed
              </span>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                  {allTasks.filter(t => t.status === "DONE").length} Done
                </span>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                  {allTasks.filter(t => t.status === "IN_PROGRESS").length} In Progress
                </span>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">
                  {allTasks.filter(t => t.status === "BLOCKED").length} Blocked
                </span>
              </div>
            </div>
          </div>
          <ProgressBar completed={completedTasks} total={totalTasks} />
        </div>

        <div className="space-y-8">
          {sortedAssignees.map(({ user, tasks }) => {
            const completedTasks = tasks.filter(t => t.status === "DONE").length;
            const totalTasks = tasks.length;
            
            return (
              <div key={user.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{user.name || "Unnamed User"}</h2>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                        {tasks.filter(t => t.status === "DONE").length} Done
                      </span>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                        {tasks.filter(t => t.status === "IN_PROGRESS").length} In Progress
                      </span>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">
                        {tasks.filter(t => t.status === "BLOCKED").length} Blocked
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <ProgressBar completed={completedTasks} total={totalTasks} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      assignedTo={task.assignedTo}
                      currentUserId={session.user.id}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 