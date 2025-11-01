"use client";
import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column } from "../../../../lib/types";
import AddCardForm from "./AddCardForm";
import CardItem from "./CardItem";
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

type Props = {
  column: Column;
  addCard: (columnId: string, title: string) => void;
  renameColumn: (id: string, name: string) => void;
  deleteColumn: (id: string) => void;
  editCard: (cardId: string, columnId: string, title: string) => void;
  deleteCard: (cardId: string, columnId: string) => void;
  moveCard: (cardId: string, fromColumnId: string, toColumnId: string) => void;
  allColumns: Array<{ id: string; name: string }>;
  isMobile: boolean;
};

export default function ColumnView({
  column,
  addCard,
  renameColumn,
  deleteColumn,
  editCard,
  deleteCard,
  moveCard,
  allColumns,
  isMobile,
}: Props) {
  const { setNodeRef } = useDroppable({ id: column.id, data: { columnId: column.id } });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(column.name);

  function onSubmitName(e: React.FormEvent) {
    e.preventDefault();
    renameColumn(column.id, name.trim() || column.name);
    setEditing(false);
  }

  return (
    <div className="flex h-full flex-col gap-3 border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        {editing ? (
          <form onSubmit={onSubmitName} className="flex w-full flex-wrap items-center gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setName(column.name);
                  setEditing(false);
                }
              }}
              className="min-w-0 flex-1 border border-slate-200 px-2 py-1 text-sm shadow-sm focus:border-blue-400 focus:outline-none"
            />
            <Button type="submit" variant="primary" size="sm" className="shadow-sm">
              Save
            </Button>
          </form>
        ) : (
          <h2 className="flex-1 truncate text-base font-semibold text-slate-700">{column.name}</h2>
        )}
        {!editing && (
          <div className="flex gap-1">
            <Button
              variant="secondary"
              size="sm"
              className="p-1 text-blue-600 hover:bg-blue-50"
              onClick={() => setEditing(true)}
              aria-label="Rename column"
            >
              <PencilIcon />
              <span className="sr-only">Rename column</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="p-1"
              onClick={() => deleteColumn(column.id)}
              aria-label="Delete column"
            >
              <TrashIcon />
              <span className="sr-only">Delete column</span>
            </Button>
          </div>
        )}
      </div>

      <div ref={setNodeRef} className="flex flex-1 flex-col gap-2 border border-slate-200 bg-slate-50/80 p-2">
        {column.cards.map((card, idx) => (
          <SortableCard key={card.id} cardId={card.id} columnId={column.id} index={idx}>
            <CardItem
              card={card}
              columnId={column.id}
              onEdit={editCard}
              onDelete={deleteCard}
              onMove={moveCard}
              columns={allColumns}
              isMobile={isMobile}
            />
          </SortableCard>
        ))}
      </div>

      <div className="pt-1">
        <AddCardForm onAdd={(title) => addCard(column.id, title)} />
      </div>
    </div>
  );
}

function SortableCard({
  children,
  cardId,
  columnId,
  index,
}: {
  children: React.ReactNode;
  cardId: string;
  columnId: string;
  index: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cardId,
    data: { columnId, cardId, index },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  // Drag over calculations are handled at the board level.

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
