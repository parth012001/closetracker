import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Filters from "./filters";
import { Prisma } from "@/generated/prisma";

export const metadata: Metadata = {
  title: "Close Cycles | Close Management Tracker",
  description: "View and manage your close cycles",
};

async function getCloseCycles(searchParams: { [key: string]: string | string[] | undefined }) {
  // Await the searchParams to be resolved
  const params = await Promise.resolve(searchParams);
  
  const search = params.search as string | undefined;
  const status = params.status as "ACTIVE" | "COMPLETED" | "ARCHIVED" | undefined;
  const sortBy = (params.sortBy as string) || "startDate";
  const sortOrder = (params.sortOrder as string) || "desc";

  const where: Prisma.CloseCycleWhereInput = {
    AND: [
      search
        ? {
            OR: [
              { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {},
      status ? { status: { equals: status } } : {},
    ],
  };

  const closeCycles = await prisma.closeCycle.findMany({
    where,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      _count: {
        select: {
          checklists: true,
        },
      },
    },
  });

  return closeCycles;
}

export default async function CloseCyclesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const closeCycles = await getCloseCycles(searchParams);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold text-gray-900">Close Cycles</h1>
            <p className="mt-2 text-sm text-gray-600">
              A list of all close cycles in your organization.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              href="/close-cycles/new"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Add Close Cycle
            </Link>
          </div>
        </div>

        <Filters />

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Start Date
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        End Date
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Checklists
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">View</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {closeCycles.map((cycle) => (
                      <tr key={cycle.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {cycle.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              cycle.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : cycle.status === "COMPLETED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {cycle.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {format(new Date(cycle.startDate), "MMM d, yyyy")}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {format(new Date(cycle.endDate), "MMM d, yyyy")}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {cycle._count.checklists}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                            href={`/close-cycles/${cycle.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 