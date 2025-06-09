"use client";

import { motion } from "framer-motion";

type TaskStatus = "completed" | "in-progress" | "pending";

interface Task {
  id: number;
  name: string;
  status: TaskStatus;
  assignee: string;
}

const tasks: Task[] = [
  { id: 1, name: "Review Revenue Recognition", status: "completed", assignee: "Sarah" },
  { id: 2, name: "Reconcile Bank Statements", status: "in-progress", assignee: "Mike" },
  { id: 3, name: "Prepare Financial Statements", status: "pending", assignee: "John" },
  { id: 4, name: "Review Accruals", status: "pending", assignee: "Lisa" },
];

const statusColors: Record<TaskStatus, string> = {
  completed: "bg-green-500",
  "in-progress": "bg-blue-500",
  pending: "bg-gray-300",
};

export default function AnimatedDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-indigo-600 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Q1 2024 Close Cycle</h3>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="bg-white/20 px-3 py-1 rounded-full"
          >
            <span className="text-white text-sm">75% Complete</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "75%" }}
        transition={{ delay: 0.6, duration: 1 }}
        className="h-1 bg-indigo-500"
      />

      {/* Task List */}
      <div className="p-6">
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + index * 0.1, type: "spring" }}
                  className={`w-3 h-3 rounded-full ${statusColors[task.status]}`}
                />
                <div>
                  <h4 className="font-medium text-gray-900">{task.name}</h4>
                  <p className="text-sm text-gray-500">Assigned to {task.assignee}</p>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                className="text-sm text-gray-500"
              >
                {task.status === "completed" ? "✓ Completed" : 
                 task.status === "in-progress" ? "⟳ In Progress" : "⏳ Pending"}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-8"
        >
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h4>
          <div className="space-y-3">
            {[
              { user: "Sarah", action: "completed Revenue Recognition review", time: "2h ago" },
              { user: "Mike", action: "started Bank Reconciliation", time: "4h ago" },
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6 + index * 0.1 }}
                className="flex items-center space-x-3 text-sm"
              >
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-gray-600">
                  <span className="font-medium text-gray-900">{activity.user}</span> {activity.action}
                </span>
                <span className="text-gray-400">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 