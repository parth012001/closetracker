"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface StatusSelectorProps {
  initialStatus: string;
  closeCycleId: string;
}

const statusOptions = [
  { value: "ACTIVE", label: "Active", color: "bg-green-100 text-green-800" },
  { value: "COMPLETED", label: "Completed", color: "bg-blue-100 text-blue-800" },
  { value: "ARCHIVED", label: "Archived", color: "bg-gray-100 text-gray-800" },
];

export default function StatusSelector({ initialStatus, closeCycleId }: StatusSelectorProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [comment, setComment] = useState("");
  const router = useRouter();

  const currentStatus = statusOptions.find((option) => option.value === status);

  const updateStatus = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/close-cycles/${closeCycleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus, comment }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setStatus(newStatus);
      setComment("");
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating status:", error);
      // You might want to show an error toast here
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
          currentStatus?.color || "bg-gray-100 text-gray-800"
        } hover:opacity-80 transition-opacity`}
      >
        {isUpdating ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Updating...
          </span>
        ) : (
          currentStatus?.label || status
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="p-4">
            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                Add a comment (optional)
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Why are you changing the status?"
              />
            </div>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateStatus(option.value)}
                  className={`${
                    option.color
                  } w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity rounded-md`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 