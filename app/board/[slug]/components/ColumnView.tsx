"use client";
import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column } from "../../../../lib/types";
import AddCardForm from "./AddCardForm";
import CardItem from "./CardItem";
import Button from "../../../components/ui/Button";

type Props = {
  column: Column;
  addCard: (columnId: string, title: string) => void;
  renameColumn: (id: string, name: string) => void;
  deleteColumn: (id: string) => void;
  editCard: (cardId: string, columnId: string, title: string) => void;
  deleteCard: (cardId: string, columnId: string) => void;
};

export default function ColumnView({
  column,
  addCard,
  renameColumn,
  deleteColumn,
  editCard,
  deleteCard,
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
            <Button variant="primary" size="sm" className="shadow-sm">
              保存
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
              className="hover:text-blue-600"
              onClick={() => setEditing(true)}
            >
              名称変更
            </Button>
            <Button variant="danger" size="sm" onClick={() => deleteColumn(column.id)}>
              削除
            </Button>
          </div>
        )}
      </div>

      <div ref={setNodeRef} className="flex flex-1 flex-col gap-2 border border-slate-200 bg-slate-50/80 p-2">
        {column.cards.map((card, idx) => (
          <SortableCard
            key={card.id}
            cardId={card.id}
            columnId={column.id}
            index={idx}
          >
            <CardItem
              card={card}
              columnId={column.id}
              onEdit={editCard}
              onDelete={deleteCard}
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

  // dnd-kitで厳密なインデックスを取得するにはセンサーや dragOver の計算が必要だが、
  // ここでは同一リスト内のドラッグ終了時に近似での並び替えは BoardView 側で処理済み。

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
