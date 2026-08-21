export type Service = {
  id: string;
  duration: string;
  price: string;
};

export const SERVICES: Service[] = [
  { id: "1-hour", duration: "1 hour", price: "$600" },
  { id: "2-hour", duration: "2 hours", price: "$1,200" },
  { id: "3-hour", duration: "3 hours", price: "$1,800" },
  { id: "4-hour", duration: "4 hours", price: "$2,400" },
];

export type Modality = {
  id: string;
  label: string;
};

/**
 * Modality list — intentionally empty pending Carmen's final list.
 * Adding entries here populates the contact form select with no other changes.
 */
export const MODALITIES: Modality[] = [];
