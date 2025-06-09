import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

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
    const { status } = body;

    if (!status) {
      return new NextResponse("Status is required", { status: 400 });
    }

    // Validate status
    const validStatuses = ["ACTIVE", "COMPLETED", "ARCHIVED"];
    if (!validStatuses.includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    const closeCycle = await prisma.closeCycle.update({
      where: {
        id: params.id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(closeCycle);
  } catch (error) {
    console.error("[CLOSE_CYCLE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 