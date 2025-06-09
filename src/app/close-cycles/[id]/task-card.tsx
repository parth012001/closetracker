"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Task, TaskStatus, Comment } from "@/types/task";
import { User } from "@/types/user";

interface TaskCardProps {
  task: Task;
  assignedTo: Pick<User, "id" | "name" | "role">;
  currentUserId: string;
}

export default function TaskCard({ task, assignedTo, currentUserId }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCommentPrompt, setShowCommentPrompt] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<TaskStatus | null>(null);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === task.status) return;
    
    setPendingStatusChange(newStatus);
    setShowCommentPrompt(true);
  };

  const handleStatusUpdate = async (withComment: boolean = false) => {
    if (!pendingStatusChange) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: pendingStatusChange,
          comment: withComment ? newComment : undefined,
          isStatusChange: true
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      setShowCommentPrompt(false);
      setPendingStatusChange(null);
      setNewComment("");
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      setError("Failed to update task status. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          comment: newComment,
          isStatusChange: false
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      setNewComment("");
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      setError("Failed to add comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "NOT_STARTED":
        return "bg-gray-100 text-gray-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "DONE":
        return "bg-green-100 text-green-800";
      case "BLOCKED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
              <p className="text-sm text-gray-500">
                Assigned to: {assignedTo.name} ({assignedTo.role})
              </p>
            </div>
            <div className="ml-4">
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                disabled={isSubmitting}
                className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                  task.status
                )}`}
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-2 text-sm text-red-600">{error}</div>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-900"
          >
            {isExpanded ? "Hide Comments" : " write a comment"}
          </button>

          {isExpanded && (
            <div className="mt-4 space-y-4">
              {/* Comments List */}
              <div className="space-y-4">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {comment.user.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({comment.user.role})
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(comment.createdAt), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mt-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Adding..." : "Add Comment"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Comment Prompt Modal */}
      {showCommentPrompt && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add a Comment ("None" if Nothing to add)
            </h3>
            <p className="text-sm text-gray-500 mb-4">            </p>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment explaining the status change..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              rows={3}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCommentPrompt(false);
                  setPendingStatusChange(null);
                  setNewComment("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
              <button
                onClick={() => handleStatusUpdate(true)}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Updating..." : "Update with Comment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 