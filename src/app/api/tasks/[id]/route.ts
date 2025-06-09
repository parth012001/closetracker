import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const { status, comment, isStatusChange } = body;

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        assignedTo: true,
      },
    });

    if (!task) {
      return new NextResponse("Task not found", { status: 404 });
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // If this is a status change, create a status change record
      if (isStatusChange && status) {
        await tx.taskStatusChange.create({
          data: {
            taskId: task.id,
            fromStatus: task.status,
            toStatus: status,
            changedById: session.user.id,
            changedByName: session.user.name || "Unknown User",
            comment: comment || null,
          },
        });
      } 
      // Only create a separate comment record if it's not part of a status change
      else if (comment && !isStatusChange) {
        await tx.comment.create({
          data: {
            content: comment,
            taskId: task.id,
            userId: session.user.id,
          },
        });
      }

      // Update the task status if provided
      if (status) {
        await tx.task.update({
          where: { id: task.id },
          data: { status },
        });
      }

      // Return the updated task with all related data
      return await tx.task.findUnique({
        where: { id: task.id },
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
          statusHistory: {
            orderBy: {
              changedAt: "desc",
            },
          },
        },
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[TASK_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 