"use client";
import { useRef, useState } from "react";

export default function AddCardForm({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    const t = title.trim();
    if (!t) return;
    onAdd(t);
    setTitle("");
    // 追加後も入力にフォーカスを維持
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border border-dashed border-slate-300 bg-white/80 px-3 py-2 shadow-sm">
      <input
        ref={inputRef}
        placeholder="カードタイトル"
        className="min-w-0 flex-1 border border-transparent bg-transparent px-2 py-1 text-sm placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") {
            setTitle("");
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
      <button className="bg-blue-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-blue-500" onClick={submit}>
        追加
      </button>
    </div>
  );
}
