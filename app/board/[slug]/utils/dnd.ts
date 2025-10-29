import { arrayMove } from "@dnd-kit/sortable";
import { DragOverEvent } from "@dnd-kit/core";
import { Board, Column } from "../../../../lib/types";

export function cloneBoard(board: Board): Board {
  return {
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      cards: column.cards.map((card) => ({ ...card })),
    })),
  };
}

export function moveCard(board: Board, activeId: string, over: DragOverEvent["over"]): Board | null {
  if (!over) return null;

  const overId = String(over.id);
  const overData = (over.data?.current as Record<string, unknown> | undefined) ?? {};

  const columns = board.columns.map((column) => ({
    ...column,
    cards: column.cards.map((card) => ({ ...card })),
  }));

  const getColumnById = (id?: string): Column | undefined =>
    id ? columns.find((column) => column.id === id) : undefined;

  const getColumnByCard = (cardId: string): Column | undefined =>
    columns.find((column) => column.cards.some((card) => card.id === cardId));

  const fromColumn = getColumnByCard(activeId);
  if (!fromColumn) return null;

  let toColumn = getColumnById(overData.columnId as string | undefined);
  let targetIndex = (overData.sortable as { index?: number } | undefined)?.index;
  let overCardId = overData.cardId as string | undefined;

  if (!toColumn) {
    const columnByOverId = getColumnById(overId);
    if (columnByOverId) {
      toColumn = columnByOverId;
    } else {
      const overCardColumn = getColumnByCard(overId);
      if (overCardColumn) {
        toColumn = overCardColumn;
        overCardId = overCardId ?? overId;
        if (targetIndex === undefined) {
          targetIndex = overCardColumn.cards.findIndex((card) => card.id === overCardId);
        }
      }
    }
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

    toColumn.cards = arrayMove(toColumn.cards, fromIndex, targetIndex);
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

