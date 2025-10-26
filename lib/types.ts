export type Card = {
  id: string;
  title: string;
};

export type Column = {
  id: string;
  name: string;
  cards: Card[];
};

export type Board = {
  id: string;
  slug: string;
  columns: Column[];
};

