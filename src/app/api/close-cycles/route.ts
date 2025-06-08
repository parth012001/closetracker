import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, startDate, endDate, description, status } = body;

    if (!name || !startDate || !endDate || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const closeCycle = await prisma.closeCycle.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description: description || null,
        status,
      },
    });

    return NextResponse.json(closeCycle, { status: 201 });
  } catch (error) {
    console.error("Error creating close cycle:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 