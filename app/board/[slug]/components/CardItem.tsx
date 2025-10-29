"use client";
import { useRef, useState } from "react";
import { Card } from "../../../../lib/types";
import Button from "../../../components/ui/Button";

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
    // 編集確定後にカード本体へフォーカスを戻す
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
          <Button variant="primary" size="sm" className="shadow-sm">
            保存
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setTitle(card.title);
              setEditing(false);
            }}
          >
            キャンセル
          </Button>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div className="whitespace-pre-wrap break-words text-slate-700">{card.title}</div>
          <div className="flex gap-1">
            <Button variant="secondary" size="sm" className="text-blue-600 hover:bg-blue-50" onClick={() => setEditing(true)}>
              編集
            </Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(card.id, columnId)}>
              削除
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
