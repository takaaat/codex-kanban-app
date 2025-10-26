"use client";
import { Board, Column } from "./types";
import { nanoid } from "nanoid";

const version = "v1";
const keyOf = (slug: string) => `kanban:board:${slug}:${version}`;

export function createInitialBoard(slug: string): Board {
  const nowId = nanoid();
  const columns: Column[] = [
    { id: nanoid(), name: "Todo", cards: [] },
    { id: nanoid(), name: "In Progress", cards: [] },
    { id: nanoid(), name: "Done", cards: [] },
  ];
  return { id: nowId, slug, columns };
}

export function loadBoard(slug: string): Board {
  const key = keyOf(slug);
  if (typeof window === "undefined") {
    return createInitialBoard(slug);
  }
  const raw = localStorage.getItem(key);
  if (!raw) {
    const board = createInitialBoard(slug);
    localStorage.setItem(key, JSON.stringify(board));
    return board;
  }
  try {
    const parsed = JSON.parse(raw) as Board;
    return parsed;
  } catch {
    const board = createInitialBoard(slug);
    localStorage.setItem(key, JSON.stringify(board));
    return board;
  }
}

export function saveBoard(board: Board) {
  if (typeof window === "undefined") return;
  const key = keyOf(board.slug);
  localStorage.setItem(key, JSON.stringify(board));
}

