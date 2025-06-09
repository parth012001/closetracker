import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export default async function CloseCycleLogsPage({ params }: { params: { id: string } }) {
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
              statusHistory: {
                orderBy: {
                  changedAt: "desc",
                },
              },
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
            },
          },
        },
      },
    },
  });

  if (!closeCycle) {
    notFound();
  }

  // Combine and sort all activities (status changes and comments)
  const allActivities = closeCycle.checklists.flatMap((checklist) =>
    checklist.tasks.flatMap((task) => [
      ...task.statusHistory.map((change) => ({
        type: "status_change" as const,
        task,
        data: change,
        timestamp: change.changedAt,
      })),
      ...task.comments.map((comment) => ({
        type: "comment" as const,
        task,
        data: comment,
        timestamp: comment.createdAt,
      })),
    ])
  ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="mt-1 text-sm text-gray-500">
          View all status changes and comments for {closeCycle.name}
        </p>
      </div>

      <div className="space-y-6">
        {allActivities.map((activity, index) => (
          <div
            key={`${activity.type}-${activity.data.id}`}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {activity.task.title}
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">
                      {activity.type === "status_change"
                        ? "Status changed"
                        : "Comment added"}
                    </span>
                  </div>

                  {activity.type === "status_change" ? (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                          {activity.data.fromStatus.replace("_", " ")}
                        </span>
                        <svg
                          className="h-4 w-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                          {activity.data.toStatus.replace("_", " ")}
                        </span>
                      </div>
                      {activity.data.comment && (
                        <p className="mt-2 text-sm text-gray-600">
                          {activity.data.comment}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">
                      {activity.data.content}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex flex-col items-end">
                  <span className="text-sm text-gray-500">
                    {activity.type === "status_change"
                      ? activity.data.changedByName
                      : activity.data.user.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {format(new Date(activity.timestamp), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 