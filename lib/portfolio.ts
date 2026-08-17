export type PortfolioItem = {
  id: string;
  caption: string;
  src: string | null;
  span: "wide" | "tall" | "square";
};

export const PORTFOLIO: PortfolioItem[] = [
  { id: "room", caption: "The treatment room", src: null, span: "wide" },
  { id: "hands", caption: "Deep tissue work", src: null, span: "square" },
  { id: "linens", caption: "Linens and oils", src: null, span: "square" },
  { id: "light", caption: "Afternoon light", src: null, span: "tall" },
  { id: "detail", caption: "Hot stone setup", src: null, span: "square" },
];
