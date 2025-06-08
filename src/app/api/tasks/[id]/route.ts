import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, comment } = body;

    if (!status && !comment) {
      return NextResponse.json(
        { error: "Status or comment is required" },
        { status: 400 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: { comments: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Update task status if provided
    if (status) {
      await prisma.task.update({
        where: { id: params.id },
        data: { status },
      });
    }

    // Add comment if provided
    if (comment) {
      await prisma.comment.create({
        data: {
          content: comment,
          userId: session.user.id,
          taskId: params.id,
        },
      });
    }

    // Fetch updated task with comments
    const updatedTask = await prisma.task.findUnique({
      where: { id: params.id },
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
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 