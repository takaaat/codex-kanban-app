import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("nanoid", () => {
  let counter = 0;
  return {
    nanoid: () => `mock-id-${++counter}`,
  };
});

import useBoardState from "../useBoardState";

const slug = "demo";
const keyFor = (slug: string) => `kanban:board:${slug}:v1`;

describe("useBoardState", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("provides an initial board with 3 columns", () => {
    const { result } = renderHook(() => useBoardState(slug));

    expect(result.current.board.columns).toHaveLength(3);
    expect(result.current.board.columns.map((c) => c.name)).toEqual([
      "Todo",
      "In Progress",
      "Done",
    ]);
  });

  it("supports column and card CRUD operations", async () => {
    const { result } = renderHook(() => useBoardState(slug));

    const firstColumnId = result.current.board.columns[0].id;

    act(() => {
      result.current.renameColumn(firstColumnId, "Backlog");
    });
    expect(result.current.board.columns[0].name).toBe("Backlog");

    act(() => {
      result.current.addColumn();
    });
    expect(result.current.board.columns).toHaveLength(4);
    expect(result.current.board.columns.at(-1)?.name).toBe("New Column");

    act(() => {
      result.current.addCard(firstColumnId, "Write tests");
    });
    expect(result.current.board.columns[0].cards.map((c) => c.title)).toContain("Write tests");

    act(() => {
      const cardId = result.current.board.columns[0].cards[0].id;
      result.current.editCard(cardId, firstColumnId, "Refine tests");
    });
    expect(result.current.board.columns[0].cards[0].title).toBe("Refine tests");

    act(() => {
      const cardId = result.current.board.columns[0].cards[0].id;
      result.current.deleteCard(cardId, firstColumnId);
    });
    expect(result.current.board.columns[0].cards).toHaveLength(0);

    act(() => {
      result.current.deleteColumn(firstColumnId);
    });
    expect(result.current.board.columns.map((c) => c.name)).not.toContain("Backlog");

    await waitFor(() => {
      const stored = localStorage.getItem(keyFor(slug));
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(result.current.board);
    });
  });
});

