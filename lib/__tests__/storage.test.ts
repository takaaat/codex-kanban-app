import { describe, expect, beforeEach, it, vi } from "vitest";

vi.mock("nanoid", () => {
  let counter = 0;
  return {
    nanoid: () => `test-id-${++counter}`,
  };
});

import { Board } from "../types";
import { loadBoard, saveBoard } from "../storage";

const keyFor = (slug: string) => `kanban:board:${slug}:v1`;

describe("storage", () => {
  const slug = "demo";

  beforeEach(() => {
    localStorage.clear();
  });

  it("creates an initial board when none exists", () => {
    const board = loadBoard(slug);

    expect(board.slug).toBe(slug);
    expect(board.columns).toHaveLength(3);
    expect(board.columns.map((c) => c.name)).toEqual([
      "Todo",
      "In Progress",
      "Done",
    ]);

    const stored = localStorage.getItem(keyFor(slug));
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.columns).toHaveLength(3);
  });

  it("saves board updates to localStorage", () => {
    const board: Board = {
      id: "board-1",
      slug,
      columns: [
        {
          id: "col-1",
          name: "Todo",
          cards: [
            { id: "card-1", title: "Task A" },
            { id: "card-2", title: "Task B" },
          ],
        },
      ],
    };

    saveBoard(board);

    const stored = localStorage.getItem(keyFor(slug));
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toEqual(board);
  });

  it("recovers from corrupted data", () => {
    localStorage.setItem(keyFor(slug), "not-json");

    const board = loadBoard(slug);

    expect(board.columns).toHaveLength(3);
    const stored = localStorage.getItem(keyFor(slug));
    expect(() => JSON.parse(stored!)).not.toThrow();
  });
});
