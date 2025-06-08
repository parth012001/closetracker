import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { notFound } from "next/navigation";

export default async function CloseCycleDetailsPage({ params }: { params: { id: string } }) {
  const closeCycle = await prisma.closeCycle.findUnique({
    where: { id: params.id },
    include: { checklists: { include: { tasks: true } } },
  });

  if (!closeCycle) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{closeCycle.name}</h1>
      <div className="mb-4">
        <p><strong>Start Date:</strong> {format(new Date(closeCycle.startDate), "MMM d, yyyy")}</p>
        <p><strong>End Date:</strong> {format(new Date(closeCycle.endDate), "MMM d, yyyy")}</p>
        <p><strong>Status:</strong> {closeCycle.status}</p>
      </div>
      <h2 className="text-xl font-semibold mb-2">Checklist of Tasks</h2>
      <ul className="list-disc pl-5">
        {closeCycle.checklists.map((checklist) => (
          <li key={checklist.id} className="mb-2">
            <strong>{checklist.name}</strong>
            <ul className="list-disc pl-5">
              {checklist.tasks.map((task) => (
                <li key={task.id} className="mb-1">
                  {task.title} - {task.status}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
} 