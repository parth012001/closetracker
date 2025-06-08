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
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const handleAssignmentChange = (task: string, userId: string) => {
    const newAssignments = { ...taskAssignments, [task]: userId };
    setTaskAssignments(newAssignments);
    onTaskAssignmentsChange(newAssignments);
  };

  const handleTaskSelection = (task: string) => {
    setSelectedTasks(prev => 
      prev.includes(task) 
        ? prev.filter(t => t !== task)
        : [...prev, task]
    );
  };

  const handleBulkAssignment = (userId: string) => {
    const newAssignments = { ...taskAssignments };
    selectedTasks.forEach(task => {
      newAssignments[task] = userId;
    });
    setTaskAssignments(newAssignments);
    onTaskAssignmentsChange(newAssignments);
    setSelectedTasks([]); // Clear selection after bulk assignment
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Task Assignment</h2>
        
        {/* Bulk Assignment Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Bulk Assignment</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">
                {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
              </p>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => handleBulkAssignment(e.target.value)}
                value=""
              >
                <option value="">Assign selected tasks to...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || "Unnamed User"} ({user.role})
                  </option>
                ))}
              </select>
            </div>
            {selectedTasks.length > 0 && (
              <button
                onClick={() => setSelectedTasks([])}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear Selection
              </button>
            )}
          </div>
        </div>

        {/* Task List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predefinedTasks.map((task) => (
            <div 
              key={task} 
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                selectedTasks.includes(task) ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedTasks.includes(task)}
                  onChange={() => handleTaskSelection(task)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 