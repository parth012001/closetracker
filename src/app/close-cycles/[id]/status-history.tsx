"use client";

import { TaskStatusChange } from "@/types/task";
import { formatDistanceToNow } from "date-fns";

interface StatusHistoryProps {
  history: TaskStatusChange[];
}

export default function StatusHistory({ history }: StatusHistoryProps) {
  const statusColors = {
    NOT_STARTED: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-yellow-100 text-yellow-800",
    DONE: "bg-green-100 text-green-800",
    BLOCKED: "bg-red-100 text-red-800",
  };

  if (history.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No status changes recorded
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900">Status History</h4>
      <div className="space-y-3">
        {history.map((change) => (
          <div key={change.id} className="flex items-start space-x-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[change.fromStatus]}`}>
                  {change.fromStatus.replace("_", " ")}
                </span>
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[change.toStatus]}`}>
                  {change.toStatus.replace("_", " ")}
                </span>
              </div>
              {change.comment && (
                <p className="mt-1 text-sm text-gray-600">{change.comment}</p>
              )}
              <div className="mt-1 flex items-center text-xs text-gray-500">
                <span>Changed by {change.changedByName}</span>
                <span className="mx-2">•</span>
                <span>{formatDistanceToNow(new Date(change.changedAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 