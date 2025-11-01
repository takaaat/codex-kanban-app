"use client";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useRef, useState } from "react";
import { Board } from "../../../../lib/types";
import ColumnView from "./ColumnView";
import useBoardState from "../hooks/useBoardState";
import { cloneBoard, moveCard } from "../utils/dnd";
import Button from "../../../components/ui/Button";
import useIsMobile from "../hooks/useIsMobile";
import { cn } from "../../../../lib/utils/cn";

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
    moveCardToColumn,
    updateBoard,
  } = useBoardState(slug);

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const initialBoardRef = useRef<Board | null>(null);
  const isMobile = useIsMobile();
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

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

  function onDragCancel() {
    if (initialBoardRef.current) {
      updateBoard(() => initialBoardRef.current!);
    }
    setActiveCardId(null);
    initialBoardRef.current = null;
  }

  const fallbackColumnId = board.columns[0]?.id ?? null;
  const currentColumnId =
    activeColumnId && board.columns.some((column) => column.id === activeColumnId)
      ? activeColumnId
      : fallbackColumnId;

  const activeCard = activeCardId
    ? (() => {
        for (const column of board.columns) {
          const card = column.cards.find((item) => item.id === activeCardId);
          if (card) {
            return { card, columnId: column.id };
          }
        }
        return null;
      })()
    : null;

  const visibleColumns = isMobile
    ? board.columns.filter((column) => column.id === currentColumnId)
    : board.columns;

  return (
    <div className="min-h-screen bg-transparent px-4 py-8 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Personal Kanban</p>
            <h1 className="text-2xl font-semibold text-slate-800">
              Board
              <span className="ml-2 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                {board.slug}
              </span>
            </h1>
          </div>
          <Button variant="primary" size="md" className="shadow-sm" onClick={addColumn}>
            + Add column
          </Button>
        </header>

        {isMobile && board.columns.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {board.columns.map((column) => {
              const isActive = column.id === currentColumnId;
              return (
                <button
                  key={column.id}
                  type="button"
                  onClick={() => setActiveColumnId(column.id)}
                  className={cn(
                    "flex-shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
                    isActive
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-600"
                  )}
                  aria-pressed={isActive}
                >
                  {column.name}
                </button>
              );
            })}
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
        >
          <div
            className={cn(
              "pb-4",
              isMobile ? "flex flex-col gap-4" : "flex gap-5 overflow-x-auto"
            )}
          >
            {visibleColumns.map((column) => (
              <div key={column.id} className={cn(isMobile ? "w-full" : "w-72 flex-shrink-0")}>
                <SortableContext items={column.cards.map((card) => card.id)} strategy={rectSortingStrategy}>
                  <ColumnView
                    column={column}
                    addCard={addCard}
                    renameColumn={renameColumn}
                    deleteColumn={deleteColumn}
                    editCard={editCard}
                    deleteCard={deleteCard}
                    moveCard={moveCardToColumn}
                    allColumns={board.columns}
                    isMobile={isMobile}
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
