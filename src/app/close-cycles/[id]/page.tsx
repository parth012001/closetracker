import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import TaskCard from "./task-card";

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
              <p className="font-medium">{closeCycle.status}</p>
            </div>
          </div>
          {closeCycle.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Description</p>
              <p className="mt-1">{closeCycle.description}</p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {closeCycle.checklists.map((checklist) => (
            <div key={checklist.id}>
              <h2 className="text-xl font-semibold mb-4">{checklist.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {checklist.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    assignedTo={task.assignedTo}
                    currentUserId={session.user.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 