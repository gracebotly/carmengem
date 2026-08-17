export const SECTIONS = [
  { id: "about", label: "About" },
  { id: "portfolio", label: "Portfolio" },
  { id: "investment", label: "Investment" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];
