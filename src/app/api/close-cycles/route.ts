import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { predefinedTasks } from "@/data/predefined-tasks";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const { name, startDate, endDate, description, status, taskAssignments } = body;

    if (!name || !startDate || !endDate || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create the close cycle with checklist and predefined tasks
    const closeCycle = await prisma.closeCycle.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description: description || null,
        status,
        checklists: {
          create: [
            {
              name: "Month-End Close Tasks",
              tasks: {
                create: predefinedTasks.map((title) => ({
                  title,
                  assignedToId: taskAssignments[title] || userId,
                  createdById: userId,
                })),
              },
            },
          ],
        },
      },
      include: {
        checklists: {
          include: { tasks: true },
        },
      },
    });

    return NextResponse.json(closeCycle, { status: 201 });
  } catch (error) {
    console.error("Error creating close cycle:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 