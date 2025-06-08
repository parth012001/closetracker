"use client";

import { useState } from "react";
import { predefinedTasks } from "@/data/predefined-tasks";
import { User } from "@/types/user";

interface TaskAssignmentProps {
  users: User[];
  currentUserId: string;
  onTaskAssignmentsChange: (assignments: { [key: string]: string }) => void;
}

export default function TaskAssignment({ users, currentUserId, onTaskAssignmentsChange }: TaskAssignmentProps) {
  const [taskAssignments, setTaskAssignments] = useState<{ [key: string]: string }>({});

  const handleAssignmentChange = (task: string, userId: string) => {
    const newAssignments = { ...taskAssignments, [task]: userId };
    setTaskAssignments(newAssignments);
    onTaskAssignmentsChange(newAssignments);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Task Assignment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predefinedTasks.map((task) => (
            <div key={task} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-medium text-gray-900 mb-2">{task}</h3>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={taskAssignments[task] || ""}
                onChange={(e) => handleAssignmentChange(task, e.target.value)}
              >
                <option value="">Select Assignee</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || "Unnamed User"} ({user.role})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 