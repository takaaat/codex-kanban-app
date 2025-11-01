import { describe, expect, it } from "vitest";
import { DragOverEvent } from "@dnd-kit/core";

import { cloneBoard, moveCard } from "../dnd";
import { Board } from "../../../../lib/types";

const baseBoard: Board = {
  id: "board-1",
  slug: "demo",
  columns: [
    {
      id: "col-todo",
      name: "Todo",
      cards: [
        { id: "card-1", title: "A" },
        { id: "card-2", title: "B" },
      ],
    },
    {
      id: "col-doing",
      name: "Doing",
      cards: [
        { id: "card-3", title: "C" },
        { id: "card-4", title: "D" },
      ],
    },
  ],
};

const clone = <T,>(value: T): T =>
  typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));

describe("dnd utils", () => {
  it("cloneBoard returns a deep copy", () => {
    const copied = cloneBoard(baseBoard);

    expect(copied).not.toBe(baseBoard);
    expect(copied.columns[0]).not.toBe(baseBoard.columns[0]);

    copied.columns[0].name = "Updated";
    expect(baseBoard.columns[0].name).toBe("Todo");
  });

  it("reorders within the same column", () => {
    const board = clone(baseBoard);

    const over =
      {
        id: "card-2",
        data: {
          current: {
            columnId: "col-todo",
            cardId: "card-2",
            sortable: { index: 1 },
          },
        },
      } satisfies DragOverEvent["over"];

    const result = moveCard(board, "card-1", over)!;

    expect(result.columns[0].cards.map((c) => c.id)).toEqual(["card-2", "card-1"]);
    expect(board.columns[0].cards.map((c) => c.id)).toEqual(["card-1", "card-2"]);
  });

  it("moves card to an empty target column", () => {
    const board = clone(baseBoard);
    board.columns.push({ id: "col-done", name: "Done", cards: [] });

    const over =
      {
        id: "col-done",
        data: {
          current: {
            columnId: "col-done",
            sortable: { index: 0 },
          },
        },
      } satisfies DragOverEvent["over"];

    const result = moveCard(board, "card-1", over)!;

    expect(result.columns.find((c) => c.id === "col-todo")!.cards.map((c) => c.id)).toEqual(["card-2"]);
    expect(result.columns.find((c) => c.id === "col-done")!.cards.map((c) => c.id)).toEqual(["card-1"]);
  });

  it("inserts into middle of another column when over a card", () => {
    const board = clone(baseBoard);

    const over =
      {
        id: "card-4",
        data: {
          current: {
            columnId: "col-doing",
            cardId: "card-4",
            sortable: { index: 1 },
          },
        },
      } satisfies DragOverEvent["over"];

    const result = moveCard(board, "card-1", over)!;

    expect(result.columns.find((c) => c.id === "col-todo")!.cards.map((c) => c.id)).toEqual(["card-2"]);
    expect(result.columns.find((c) => c.id === "col-doing")!.cards.map((c) => c.id)).toEqual([
      "card-3",
      "card-1",
      "card-4",
    ]);
  });

  it("returns null when the active card is missing", () => {
    const board = clone(baseBoard);
    const over =
      {
        id: "col-todo",
        data: { current: { columnId: "col-todo", sortable: { index: 0 } } },
      } satisfies DragOverEvent["over"];

    const result = moveCard(board, "unknown", over);
    expect(result).toBeNull();
  });
});
