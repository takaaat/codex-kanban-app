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
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useMemo, useRef, useState } from "react";
import { Board } from "../../../../lib/types";
import ColumnView from "./ColumnView";
import useBoardState from "../hooks/useBoardState";
import { cloneBoard, moveCard } from "../utils/dnd";
import Button from "../../../components/ui/Button";

type Props = { slug: string };

export default function BoardView({ slug }: Props) {
  const {
    board,
    addColumn,
    renameColumn,
    deleteColumn,
    addCard,
    editCard,
    deleteCard,
    updateBoard,
  } = useBoardState(slug);

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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function onDragStart(event: DragStartEvent) {
    const activeId = String(event.active.id);
    setActiveCardId(activeId);
    initialBoardRef.current = cloneBoard(board);
  }

  function onDragOver(event: DragOverEvent) {
    const activeId = String(event.active.id);
    setActiveCardId((prev) => prev ?? activeId);
    updateBoard((current) => moveCard(current, activeId, event.over) ?? current);
  }

  function onDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    updateBoard((current) => moveCard(current, activeId, event.over) ?? current);
    setActiveCardId(null);
    initialBoardRef.current = null;
  }

  function onDragCancel(_event: DragCancelEvent) {
    if (initialBoardRef.current) {
      updateBoard(() => initialBoardRef.current!);
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
          <Button variant="primary" size="md" className="shadow-sm" onClick={addColumn}>
            + 列を追加
          </Button>
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
