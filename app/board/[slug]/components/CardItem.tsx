"use client";
import { useRef, useState } from "react";
import { Card } from "../../../../lib/types";
import Button from "../../../components/ui/Button";

function PencilIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m18 2 4 4" />
      <path d="m3 21 1-4 11-11 3 3-11 11-4 1Z" />
      <path d="m12 6 3 3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="m19 6-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export default function CardItem({
  card,
  columnId,
  onEdit,
  onDelete,
}: {
  card: Card;
  columnId: string;
  onEdit: (cardId: string, columnId: string, title: string) => void;
  onDelete: (cardId: string, columnId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const containerRef = useRef<HTMLDivElement>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (t) onEdit(card.id, columnId, t);
    setEditing(false);
    // Return focus to the card after editing
    requestAnimationFrame(() => containerRef.current?.focus());
  }

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="border border-slate-200 bg-white p-3 shadow-sm outline-none transition focus:ring-2 focus:ring-blue-400 hover:shadow-md"
    >
      {editing ? (
        <form onSubmit={onSubmit} className="flex w-full flex-wrap items-center gap-2">
          <input
            autoFocus
            className="min-w-0 flex-1 border border-slate-200 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setTitle(card.title);
                setEditing(false);
              }
            }}
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="px-0 py-0 shadow-sm"
            aria-label="Save changes"
          >
            <CheckIcon />
            <span className="sr-only">Save</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="px-0 py-0"
            onClick={() => {
              setTitle(card.title);
              setEditing(false);
            }}
            aria-label="Cancel editing"
          >
            <XIcon />
            <span className="sr-only">Cancel</span>
          </Button>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div className="whitespace-pre-wrap break-words text-slate-700">{card.title}</div>
          <div className="flex gap-1">
            <Button
              variant="secondary"
              size="sm"
              className="p-1 text-blue-600 hover:bg-blue-50"
              onClick={() => setEditing(true)}
              aria-label="Edit"
            >
              <PencilIcon />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="p-1"
              onClick={() => onDelete(card.id, columnId)}
              aria-label="Delete"
            >
              <TrashIcon />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
