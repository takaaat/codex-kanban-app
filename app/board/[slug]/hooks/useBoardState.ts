"use client";
import { useCallback, useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { Board } from "../../../../lib/types";
import { loadBoard, saveBoard } from "../../../../lib/storage";

type UseBoardStateResult = {
  board: Board;
  addColumn: () => void;
  renameColumn: (columnId: string, name: string) => void;
  deleteColumn: (columnId: string) => void;
  addCard: (columnId: string, title: string) => void;
  editCard: (cardId: string, columnId: string, title: string) => void;
  deleteCard: (cardId: string, columnId: string) => void;
  moveCardToColumn: (cardId: string, fromColumnId: string, toColumnId: string) => void;
  updateBoard: (updater: (draft: Board) => Board) => void;
};

export default function useBoardState(slug: string): UseBoardStateResult {
  const [board, setBoard] = useState<Board>(() => loadBoard(slug));

  useEffect(() => {
    setBoard(loadBoard(slug));
  }, [slug]);

  useEffect(() => {
    saveBoard(board);
  }, [board]);

  const updateBoard = useCallback((updater: (draft: Board) => Board) => {
    setBoard((prev) => updater(prev));
  }, []);

  const addColumn = useCallback(() => {
    updateBoard((prev) => ({
      ...prev,
      columns: [...prev.columns, { id: nanoid(), name: "New Column", cards: [] }],
    }));
  }, [updateBoard]);

  const renameColumn = useCallback(
    (columnId: string, name: string) => {
      updateBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((column) =>
          column.id === columnId ? { ...column, name } : column
        ),
      }));
    },
    [updateBoard]
  );

  const deleteColumn = useCallback(
    (columnId: string) => {
      updateBoard((prev) => ({
        ...prev,
        columns: prev.columns.filter((column) => column.id !== columnId),
      }));
    },
    [updateBoard]
  );

  const addCard = useCallback(
    (columnId: string, title: string) => {
      updateBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((column) =>
          column.id === columnId
            ? { ...column, cards: [...column.cards, { id: nanoid(), title }] }
            : column
        ),
      }));
    },
    [updateBoard]
  );

  const editCard = useCallback(
    (cardId: string, columnId: string, title: string) => {
      updateBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((column) =>
          column.id === columnId
            ? {
                ...column,
                cards: column.cards.map((card) =>
                  card.id === cardId ? { ...card, title } : card
                ),
              }
            : column
        ),
      }));
    },
    [updateBoard]
  );

  const deleteCard = useCallback(
    (cardId: string, columnId: string) => {
      updateBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((column) =>
          column.id === columnId
            ? {
                ...column,
                cards: column.cards.filter((card) => card.id !== cardId),
              }
            : column
        ),
      }));
    },
    [updateBoard]
  );

  const moveCardToColumn = useCallback(
    (cardId: string, fromColumnId: string, toColumnId: string) => {
      if (fromColumnId === toColumnId) return;

      updateBoard((prev) => {
        const fromColumn = prev.columns.find((column) => column.id === fromColumnId);
        const toColumn = prev.columns.find((column) => column.id === toColumnId);
        if (!fromColumn || !toColumn) return prev;
        const movingCard = fromColumn.cards.find((card) => card.id === cardId);
        if (!movingCard) return prev;

        return {
          ...prev,
          columns: prev.columns.map((column) => {
            if (column.id === fromColumnId) {
              return {
                ...column,
                cards: column.cards.filter((card) => card.id !== cardId),
              };
            }
            if (column.id === toColumnId) {
              return {
                ...column,
                cards: [...column.cards, { ...movingCard }],
              };
            }
            return column;
          }),
        };
      });
    },
    [updateBoard]
  );

  return {
    board,
    addColumn,
    renameColumn,
    deleteColumn,
    addCard,
    editCard,
    deleteCard,
    moveCardToColumn,
    updateBoard,
  };
}
