"use client";
import { useRef, useState } from "react";
import { Card } from "../../../../lib/types";

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
          <button className="bg-blue-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-blue-500">
            保存
          </button>
          <button
            type="button"
            className="px-3 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100"
            onClick={() => {
              setTitle(card.title);
              setEditing(false);
            }}
          >
            キャンセル
          </button>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div className="whitespace-pre-wrap break-words text-slate-700">{card.title}</div>
          <div className="flex gap-1">
            <button
              className="px-2 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50"
              onClick={() => setEditing(true)}
            >
              編集
            </button>
            <button
              className="px-2 py-1 text-sm font-medium text-red-500 hover:bg-red-50"
              onClick={() => onDelete(card.id, columnId)}
            >
              削除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
