"use client";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DragCancelEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { useEffect, useMemo, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { Board } from "../../../../lib/types";
import { loadBoard, saveBoard } from "../../../../lib/storage";
import ColumnView from "./ColumnView";

function cloneBoard(board: Board): Board {
  return {
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      cards: column.cards.map((card) => ({ ...card })),
    })),
  };
}

function moveCard(board: Board, activeId: string, over: DragOverEvent["over"]): Board | null {
  if (!over) return null;

  const overId = String(over.id);
  const overData = (over.data?.current as Record<string, any> | undefined) ?? {};

  const columns = board.columns.map((column) => ({
    ...column,
    cards: column.cards.map((card) => ({ ...card })),
  }));

  const getColumnById = (id?: string) => (id ? columns.find((column) => column.id === id) : undefined);
  const getColumnByCard = (cardId: string) => columns.find((column) => column.cards.some((card) => card.id === cardId));
  const isCardId = (id: string) => !!getColumnByCard(id);

  const fromColumn = getColumnByCard(activeId);
  if (!fromColumn) return null;

  let toColumn = getColumnById(overData.columnId);
  let targetIndex: number | undefined = overData.sortable?.index;
  let overCardId: string | undefined = overData.cardId;

  if (!toColumn && isCardId(overId)) {
    toColumn = getColumnByCard(overId);
    overCardId = overCardId ?? overId;
    if (targetIndex === undefined && toColumn) {
      targetIndex = toColumn.cards.findIndex((card) => card.id === overCardId);
    }
  }

  if (!toColumn) {
    toColumn = getColumnById(overId);
  }

  if (!toColumn) return null;

  const fromIndex = fromColumn.cards.findIndex((card) => card.id === activeId);
  if (fromIndex === -1) return null;

  if (targetIndex === undefined || targetIndex < 0) {
    if (overCardId) {
      const idx = toColumn.cards.findIndex((card) => card.id === overCardId);
      if (idx !== -1) targetIndex = idx;
    }
  }

  if (targetIndex === undefined || targetIndex < 0) {
    targetIndex = toColumn.cards.length;
  }

  if (fromColumn.id === toColumn.id) {
    if (targetIndex >= toColumn.cards.length) {
      targetIndex = toColumn.cards.length - 1;
    }
    if (targetIndex < 0) targetIndex = 0;
    if (fromIndex === targetIndex) return null;
    const nextCards = arrayMove(toColumn.cards, fromIndex, targetIndex);
    toColumn.cards = nextCards;
  } else {
    const [moving] = fromColumn.cards.splice(fromIndex, 1);
    if (!moving) return null;

    const existingIndex = toColumn.cards.findIndex((card) => card.id === activeId);
    if (existingIndex !== -1) {
      toColumn.cards.splice(existingIndex, 1);
      if (existingIndex < targetIndex) targetIndex -= 1;
    }

    if (targetIndex > toColumn.cards.length) targetIndex = toColumn.cards.length;
    toColumn.cards.splice(targetIndex, 0, moving);
  }

  return { ...board, columns };
}

type Props = { slug: string };

export default function BoardView({ slug }: Props) {
  const [board, setBoard] = useState<Board>(() => loadBoard(slug));
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const initialBoardRef = useRef<Board | null>(null);

  const activeCard = useMemo(() => {
    if (!activeCardId) return null;
    for (const column of board.columns) {
      const card = column.cards.find((item) => item.id === activeCardId);
      if (card) {
        return { card, columnId: column.id };
      }
    }
    return null;
  }, [activeCardId, board]);

  // 初回マウント時および slug 変更時にロード
  useEffect(() => {
    setBoard(loadBoard(slug));
  }, [slug]);

  // 永続化
  useEffect(() => {
    saveBoard(board);
  }, [board]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function addColumn() {
    const name = "New Column";
    setBoard((b) => ({ ...b, columns: [...b.columns, { id: nanoid(), name, cards: [] }] }));
  }

  function renameColumn(id: string, name: string) {
    setBoard((b) => ({
      ...b,
      columns: b.columns.map((c) => (c.id === id ? { ...c, name } : c)),
    }));
  }

  function deleteColumn(id: string) {
    setBoard((b) => ({ ...b, columns: b.columns.filter((c) => c.id !== id) }));
  }

  function addCard(columnId: string, title: string) {
    setBoard((b) => ({
      ...b,
      columns: b.columns.map((c) =>
        c.id === columnId ? { ...c, cards: [...c.cards, { id: nanoid(), title }] } : c
      ),
    }));
  }

  function editCard(cardId: string, columnId: string, title: string) {
    setBoard((b) => ({
      ...b,
      columns: b.columns.map((c) =>
        c.id === columnId
          ? { ...c, cards: c.cards.map((card) => (card.id === cardId ? { ...card, title } : card)) }
          : c
      ),
    }));
  }

  function deleteCard(cardId: string, columnId: string) {
    setBoard((b) => ({
      ...b,
      columns: b.columns.map((c) =>
        c.id === columnId ? { ...c, cards: c.cards.filter((card) => card.id !== cardId) } : c
      ),
    }));
  }

  function onDragStart(event: DragStartEvent) {
    const activeId = String(event.active.id);
    setActiveCardId(activeId);
    initialBoardRef.current = cloneBoard(board);
  }

  function onDragOver(event: DragOverEvent) {
    const activeId = String(event.active.id);
    setActiveCardId((prev) => prev ?? activeId);
    setBoard((current) => {
      const next = moveCard(current, activeId, event.over);
      return next ?? current;
    });
  }

  function onDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    setBoard((current) => {
      const next = moveCard(current, activeId, event.over);
      return next ?? current;
    });
    setActiveCardId(null);
    initialBoardRef.current = null;
  }

  function onDragCancel(_event: DragCancelEvent) {
    if (initialBoardRef.current) {
      setBoard(initialBoardRef.current);
    }
    setActiveCardId(null);
    initialBoardRef.current = null;
  }

  return (
    <div className="min-h-screen bg-transparent px-4 py-8 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Personal Kanban</p>
            <h1 className="text-2xl font-semibold text-slate-800">
              ボード
              <span
                className="ml-2 inline-flex items-center border border-blue-200 bg-accent-soft px-3 py-1 text-sm font-medium text-accent"
              >
                {board.slug}
              </span>
            </h1>
          </div>
          <button
            className="bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500"
            onClick={addColumn}
          >
            + 列を追加
          </button>
        </header>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
        >
          <div className="flex gap-5 overflow-x-auto pb-4">
            {board.columns.map((col) => (
              <div key={col.id} className="w-72 flex-shrink-0">
                <SortableContext items={col.cards.map((c) => c.id)} strategy={rectSortingStrategy}>
                  <ColumnView
                    column={col}
                    addCard={addCard}
                    renameColumn={renameColumn}
                    deleteColumn={deleteColumn}
                    editCard={editCard}
                    deleteCard={deleteCard}
                  />
                </SortableContext>
              </div>
            ))}
          </div>
          <DragOverlay>
            {activeCard ? (
              <div className="w-72 border border-slate-200 bg-white p-3 shadow-lg">
                <div className="whitespace-pre-wrap break-words text-slate-700">{activeCard.card.title}</div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
