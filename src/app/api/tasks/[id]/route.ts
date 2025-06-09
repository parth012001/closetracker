import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { status, comment } = body;

    if (!status) {
      return new NextResponse("Status is required", { status: 400 });
    }

    // Get the current task to check the previous status
    const currentTask = await prisma.task.findUnique({
      where: { id: params.id },
      select: { status: true },
    });

    if (!currentTask) {
      return new NextResponse("Task not found", { status: 404 });
    }

    // Update the task and create a status change record in a transaction
    const updatedTask = await prisma.$transaction(async (tx) => {
      // Update the task
      const task = await tx.task.update({
        where: { id: params.id },
        data: { status },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });

      // Create status change record
      await tx.taskStatusChange.create({
        data: {
          taskId: params.id,
          fromStatus: currentTask.status,
          toStatus: status,
          changedById: session.user.id,
          changedByName: session.user.name || "Unknown User",
          comment,
        },
      });

      return task;
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("[TASK_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 