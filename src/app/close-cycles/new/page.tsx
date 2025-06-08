import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import NewCloseCycleForm from "./new-close-cycle-form";

export const metadata: Metadata = {
  title: "New Close Cycle | Close Management Tracker",
  description: "Create a new close cycle",
};

export default async function NewCloseCyclePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch all users except the current user
  const users = await prisma.user.findMany({
    where: {
      id: {
        not: session.user.id,
      },
    },
    select: {
      id: true,
      name: true,
      role: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Close Cycle</h1>
        <NewCloseCycleForm users={users} currentUserId={session.user.id} />
      </div>
    </div>
  );
} 